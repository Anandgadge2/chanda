import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { invalidateUserCache } from '../middleware/authMiddleware.js';
import { invalidateRegistrationOptionsCache } from './authController.js';
import {
  ensureRbacSeeded,
  buildUserAuthContext,
  loadUserWithRbac,
  slugifyRoleName,
  userHasPermission,
  normalizeMobileNumber,
} from '../services/rbacService.js';
import { ALL_PERMISSION_KEYS, VALID_JURISDICTION_SCOPES, CHANDRAPUR_SUBDIVISIONS } from '../config/permissions.js';

const RBAC_CACHE_TTL_MS = 5 * 60 * 1000;
const rbacCache = {
  permissions: null,
  permissionsTs: 0,
  roles: null,
  rolesTs: 0,
  users: null,
  usersTs: 0,
};

export const invalidateRbacCaches = (includeRegistration = true) => {
  rbacCache.permissions = null;
  rbacCache.permissionsTs = 0;
  rbacCache.roles = null;
  rbacCache.rolesTs = 0;
  rbacCache.users = null;
  rbacCache.usersTs = 0;
  if (includeRegistration) {
    invalidateRegistrationOptionsCache();
  }
};

async function fetchFormattedPermissions(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && rbacCache.permissions && now - rbacCache.permissionsTs < RBAC_CACHE_TTL_MS) {
    return { data: rbacCache.permissions, hit: true };
  }
  await ensureRbacSeeded();
  const permissions = await prisma.permission.findMany({
    orderBy: [{ sortOrder: 'asc' }, { key: 'asc' }],
  });
  rbacCache.permissions = permissions;
  rbacCache.permissionsTs = Date.now();
  return { data: permissions, hit: false };
}

async function fetchFormattedRoles(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && rbacCache.roles && now - rbacCache.rolesTs < RBAC_CACHE_TTL_MS) {
    return { data: rbacCache.roles, hit: true };
  }
  await ensureRbacSeeded();
  const roles = await prisma.role.findMany({
    orderBy: [{ hierarchyLevel: 'desc' }, { createdAt: 'asc' }],
    include: {
      rolePermissions: {
        include: {
          permission: {
            select: { key: true },
          },
        },
      },
      _count: {
        select: { users: true },
      },
    },
  });

  const formatted = roles.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    nameMr: r.nameMr,
    description: r.description,
    hierarchyLevel: r.hierarchyLevel,
    jurisdictionScope: r.jurisdictionScope || 'TALUKA',
    isSystem: r.isSystem,
    isWildcard: r.isWildcard,
    isActive: r.isActive,
    userCount: r._count.users,
    permissions: r.isWildcard
      ? [...ALL_PERMISSION_KEYS]
      : r.rolePermissions.map((rp) => rp.permission.key),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  rbacCache.roles = formatted;
  rbacCache.rolesTs = Date.now();
  return { data: formatted, hit: false };
}

async function fetchFormattedUsers(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && rbacCache.users && now - rbacCache.usersTs < RBAC_CACHE_TTL_MS) {
    return { data: rbacCache.users, hit: true };
  }
  await ensureRbacSeeded();
  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: {
      roleRef: {
        include: {
          rolePermissions: { include: { permission: { select: { key: true } } } },
        },
      },
      permissionOverrides: {
        include: { permission: { select: { key: true } } },
      },
    },
  });

  const formatted = users.map((u) => {
    const ctx = buildUserAuthContext(u);
    return {
      ...ctx,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      overrides: (u.permissionOverrides || []).map((ov) => ({
        key: ov.permission.key,
        effect: ov.effect,
      })),
    };
  });

  rbacCache.users = formatted;
  rbacCache.usersTs = Date.now();
  return { data: formatted, hit: false };
}

export async function warmRbacCache() {
  try {
    await ensureRbacSeeded();
    await Promise.all([
      fetchFormattedPermissions(true),
      fetchFormattedRoles(true),
      fetchFormattedUsers(true),
    ]);
  } catch (err) {
    console.warn('warmRbacCache error:', err.message);
  }
}

/**
 * GET /api/rbac/bootstrap
 * Single fast endpoint returning permissions, roles, and (if permitted) users in parallel.
 */
export const getRbacBootstrap = async (req, res) => {
  try {
    const force = req.query.refresh === 'true';
    const canUsers = userHasPermission(req.user, 'user.view') || userHasPermission(req.user, 'user.manage');
    const [permRes, roleRes, userRes] = await Promise.all([
      fetchFormattedPermissions(force),
      fetchFormattedRoles(force),
      canUsers ? fetchFormattedUsers(force) : Promise.resolve({ data: [], hit: true }),
    ]);

    const allHit = permRes.hit && roleRes.hit && userRes.hit;
    res.setHeader('X-Cache-Status', allHit ? 'HIT' : 'MISS');
    return res.json({
      success: true,
      permissions: permRes.data,
      roles: roleRes.data,
      users: userRes.data,
    });
  } catch (err) {
    console.error('getRbacBootstrap error:', err);
    return res.status(500).json({ success: false, error: 'RBAC माहिती लोड करताना त्रुटी.' });
  }
};

/**
 * GET /api/rbac/permissions
 * Return full grouped permission catalog
 */
export const getPermissionsCatalog = async (req, res) => {
  try {
    const { data, hit } = await fetchFormattedPermissions(req.query.refresh === 'true');
    res.setHeader('X-Cache-Status', hit ? 'HIT' : 'MISS');
    return res.json({
      success: true,
      permissions: data,
    });
  } catch (err) {
    console.error('getPermissionsCatalog error:', err);
    return res.status(500).json({ success: false, error: 'अधिकार सूची लोड करताना त्रुटी.' });
  }
};

/**
 * GET /api/rbac/roles
 * List all dynamic roles with assigned permission keys and user counts
 */
export const listRoles = async (req, res) => {
  try {
    const { data, hit } = await fetchFormattedRoles(req.query.refresh === 'true');
    res.setHeader('X-Cache-Status', hit ? 'HIT' : 'MISS');
    return res.json({
      success: true,
      roles: data,
    });
  } catch (err) {
    console.error('listRoles error:', err);
    return res.status(500).json({ success: false, error: 'भूमिका यादी लोड करताना त्रुटी.' });
  }
};

/**
 * POST /api/rbac/roles
 * Create a new custom role with editable EN/MR names and custom permission keys
 */
export const createRole = async (req, res) => {
  try {
    await ensureRbacSeeded();
    const {
      name,
      nameMr,
      description = '',
      hierarchyLevel = 40,
      jurisdictionScope = 'TALUKA',
      permissionKeys = [],
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        error: 'भूमिकेचे नाव (Role Name) आवश्यक आहे.',
      });
    }

    const level = Math.min(99, Math.max(1, parseInt(hierarchyLevel, 10) || 40));
    if (!req.user.isWildcard && level >= req.user.hierarchyLevel) {
      return res.status(403).json({
        success: false,
        error: 'आपण आपल्यापेक्षा उच्च किंवा समकक्ष श्रेणीची भूमिका तयार करू शकत नाही. (Hierarchy level must be below your own role)',
      });
    }

    // Prevent granting permissions the actor does not hold
    const validKeys = Array.isArray(permissionKeys)
      ? permissionKeys.filter((k) => ALL_PERMISSION_KEYS.includes(k))
      : [];

    if (!req.user.isWildcard) {
      const unauthorizedPerms = validKeys.filter((k) => !userHasPermission(req.user, k));
      if (unauthorizedPerms.length > 0) {
        return res.status(403).json({
          success: false,
          error: `आपल्याकडे नसलेले अधिकार आपण देऊ शकत नाही: ${unauthorizedPerms.join(', ')}`,
        });
      }
    }

    // Generate unique slug
    let baseSlug = slugifyRoleName(name);
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.role.findUnique({ where: { slug } })) {
      slug = `${baseSlug}_${suffix++}`;
    }

    const permissions = await prisma.permission.findMany({
      where: { key: { in: validKeys } },
    });

    const created = await prisma.role.create({
      data: {
        slug,
        name: String(name).trim(),
        nameMr: nameMr ? String(nameMr).trim() : String(name).trim(),
        description: description ? String(description).trim() : null,
        hierarchyLevel: level,
        jurisdictionScope: VALID_JURISDICTION_SCOPES.includes(jurisdictionScope) ? jurisdictionScope : 'TALUKA',
        isSystem: false,
        isWildcard: false,
        isActive: true,
        ...(permissions.length > 0
          ? {
              rolePermissions: {
                create: permissions.map((p) => ({ permissionId: p.id })),
              },
            }
          : {}),
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'ROLE_CREATED',
      entityType: 'Role',
      entityId: created.id,
      newData: { slug: created.slug, name: created.name, nameMr: created.nameMr, hierarchyLevel: level, permissionKeys: validKeys },
      req,
    });

    invalidateRbacCaches(true);

    return res.status(201).json({
      success: true,
      message: `नवीन भूमिका '${created.name}' यशस्वीरीत्या तयार करण्यात आली.`,
      role: {
        ...created,
        userCount: 0,
        permissions: validKeys,
      },
    });
  } catch (err) {
    console.error('createRole error:', err);
    return res.status(500).json({ success: false, error: 'भूमिका तयार करताना त्रुटी: ' + err.message });
  }
};

/**
 * PATCH /api/rbac/roles/:id
 * Edit role display names (name, nameMr), description, hierarchy, active status, and permissions
 */
export const updateRole = async (req, res) => {
  try {
    await ensureRbacSeeded();
    const { id } = req.params;
    const { name, nameMr, description, hierarchyLevel, jurisdictionScope, isActive, permissionKeys } = req.body;

    const existing = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'भूमिका सापडली नाही. (Role not found)' });
    }

    // Protect higher-tier / wildcard roles from non-Superadmin edits
    if (!req.user.isWildcard && (existing.isWildcard || existing.hierarchyLevel >= req.user.hierarchyLevel)) {
      return res.status(403).json({
        success: false,
        error: 'उच्च श्रेणीची भूमिका संपादित करण्याचे अधिकार आपणास नाहीत. (Cannot modify equal or higher role)',
      });
    }

    const updateData = {};
    if (name !== undefined && String(name).trim()) {
      updateData.name = String(name).trim();
    }
    if (nameMr !== undefined) {
      updateData.nameMr = String(nameMr).trim() || updateData.name || existing.name;
    }
    if (description !== undefined) {
      updateData.description = description ? String(description).trim() : null;
    }

    if (hierarchyLevel !== undefined && !existing.isWildcard) {
      const parsedLevel = Math.min(99, Math.max(1, parseInt(hierarchyLevel, 10) || existing.hierarchyLevel));
      if (!req.user.isWildcard && parsedLevel >= req.user.hierarchyLevel) {
        return res.status(403).json({
          success: false,
          error: 'श्रेणी पातळी आपल्या स्वतःच्या भूमिकेपेक्षा कमी असणे आवश्यक आहे.',
        });
      }
      updateData.hierarchyLevel = parsedLevel;
    }

    if (isActive !== undefined && existing.slug !== 'superadmin') {
      updateData.isActive = Boolean(isActive);
    }
    if (jurisdictionScope !== undefined && !existing.isWildcard && VALID_JURISDICTION_SCOPES.includes(jurisdictionScope)) {
      updateData.jurisdictionScope = jurisdictionScope;
    }

    let nextKeys = existing.rolePermissions.map((rp) => rp.permission.key);
    let updatePerms = false;

    if (Array.isArray(permissionKeys) && !existing.isWildcard) {
      const validKeys = permissionKeys.filter((k) => ALL_PERMISSION_KEYS.includes(k));
      if (!req.user.isWildcard) {
        const unauthorizedPerms = validKeys.filter((k) => !userHasPermission(req.user, k));
        if (unauthorizedPerms.length > 0) {
          return res.status(403).json({
            success: false,
            error: `आपल्याकडे नसलेले अधिकार आपण देऊ शकत नाही: ${unauthorizedPerms.join(', ')}`,
          });
        }
      }
      nextKeys = validKeys;
      updatePerms = true;
    }

    const permsToAssign = updatePerms && nextKeys.length > 0
      ? await prisma.permission.findMany({ where: { key: { in: nextKeys } } })
      : [];

    const ops = [
      prisma.role.update({
        where: { id },
        data: updateData,
      }),
    ];

    if (updatePerms) {
      ops.push(prisma.rolePermission.deleteMany({ where: { roleId: id } }));
      if (permsToAssign.length > 0) {
        ops.push(
          prisma.rolePermission.createMany({
            data: permsToAssign.map((p) => ({ roleId: id, permissionId: p.id })),
            skipDuplicates: true,
          })
        );
      }
    }

    const [updatedRole] = await prisma.$transaction(ops);

    // Invalidate cached permissions for all active users immediately
    invalidateUserCache();

    await logAudit({
      userId: req.user.id,
      action: 'ROLE_UPDATED',
      entityType: 'Role',
      entityId: id,
      previousData: {
        name: existing.name,
        nameMr: existing.nameMr,
        isActive: existing.isActive,
        permissions: existing.rolePermissions.map((rp) => rp.permission.key),
      },
      newData: {
        name: updatedRole.name,
        nameMr: updatedRole.nameMr,
        isActive: updatedRole.isActive,
        jurisdictionScope: updatedRole.jurisdictionScope,
        permissions: existing.isWildcard ? ALL_PERMISSION_KEYS : nextKeys,
      },
      req,
    });

    invalidateRbacCaches(true);

    return res.json({
      success: true,
      message: `भूमिका '${updatedRole.name}' यशस्वीरीत्या अद्यतनित केली.`,
      role: {
        ...updatedRole,
        permissions: updatedRole.isWildcard ? [...ALL_PERMISSION_KEYS] : nextKeys,
      },
    });
  } catch (err) {
    console.error('updateRole error:', err);
    return res.status(500).json({ success: false, error: 'भूमिका अद्यतन करताना त्रुटी: ' + err.message });
  }
};

/**
 * DELETE /api/rbac/roles/:id
 * Delete a non-system custom role (only if 0 users assigned)
 */
export const deleteRole = async (req, res) => {
  try {
    await ensureRbacSeeded();
    const { id } = req.params;

    const existing = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'भूमिका सापडली नाही.' });
    }

    if (existing.isSystem) {
      return res.status(400).json({
        success: false,
        error: 'मूलभूत प्रणाली भूमिका हटवता येत नाही. आपण तिचे नाव किंवा अधिकार बदलू शकता. (System role cannot be deleted; you can rename it or adjust permissions)',
      });
    }

    if (!req.user.isWildcard && existing.hierarchyLevel >= req.user.hierarchyLevel) {
      return res.status(403).json({ success: false, error: 'ही भूमिका हटवण्याचे अधिकार आपणास नाहीत.' });
    }

    if (existing._count.users > 0) {
      return res.status(400).json({
        success: false,
        error: `या भूमिकेवर ${existing._count.users} वापरकर्ते नियुक्त आहेत. कृपया प्रथम त्यांना दुसरी भूमिका द्या.`,
      });
    }

    await prisma.role.delete({ where: { id } });
    invalidateRbacCaches(true);
    invalidateUserCache();

    await logAudit({
      userId: req.user.id,
      action: 'ROLE_DELETED',
      entityType: 'Role',
      entityId: id,
      previousData: { slug: existing.slug, name: existing.name },
      req,
    });

    invalidateRbacCaches(true);

    return res.json({
      success: true,
      message: `भूमिका '${existing.name}' हटवण्यात आली.`,
    });
  } catch (err) {
    console.error('deleteRole error:', err);
    return res.status(500).json({ success: false, error: 'भूमिका हटवताना त्रुटी: ' + err.message });
  }
};

/**
 * GET /api/rbac/users
 * List all portal users with role details and custom per-user permission overrides
 */
export const listUsers = async (req, res) => {
  try {
    const { data, hit } = await fetchFormattedUsers(req.query.refresh === 'true');
    res.setHeader('X-Cache-Status', hit ? 'HIT' : 'MISS');
    return res.json({
      success: true,
      users: data,
    });
  } catch (err) {
    console.error('listUsers error:', err);
    return res.status(500).json({ success: false, error: 'वापरकर्ता यादी लोड करताना त्रुटी.' });
  }
};

/**
 * POST /api/rbac/users
 * Create a new portal user with dynamic role, Taluka scope, and custom overrides
 */
export const createUser = async (req, res) => {
  try {
    await ensureRbacSeeded();
    const {
      fullName,
      email,
      mobile,
      password,
      roleId,
      taluka,
      subdivision,
      assignedTalukas,
      assignedCircles,
      assignedVillages,
      designation,
      overrides = [],
    } = req.body;

    if (!fullName || !email || !password || !roleId) {
      return res.status(400).json({
        success: false,
        error: 'नाव, ईमेल, संकेतशब्द आणि भूमिका अनिवार्य आहेत. (Name, email, password and role are required)',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        error: 'संकेतशब्द किमान ६ अक्षरांचा असावा.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'हा ईमेल आधीपासून नोंदणीकृत आहे. (Email already registered)',
      });
    }

    const normalizedMobile = normalizeMobileNumber(mobile);
    if (normalizedMobile) {
      const existingMobile = await prisma.user.findUnique({ where: { mobile: normalizedMobile } });
      if (existingMobile) {
        return res.status(409).json({
          success: false,
          error: 'हा मोबाईल क्रमांक आधीपासून नोंदणीकृत आहे. (Mobile number already registered)',
        });
      }
    }

    const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!targetRole || !targetRole.isActive) {
      return res.status(400).json({ success: false, error: 'निवडलेली भूमिका अवैध किंवा निष्क्रिय आहे.' });
    }

    if (!req.user.isWildcard && (targetRole.isWildcard || targetRole.hierarchyLevel >= req.user.hierarchyLevel)) {
      return res.status(403).json({
        success: false,
        error: 'आपण आपल्यापेक्षा उच्च किंवा समकक्ष भूमिकेचे खाते तयार करू शकत नाही.',
      });
    }

    // Validate overrides
    const validOverrides = Array.isArray(overrides)
      ? overrides.filter(
          (o) =>
            o &&
            ALL_PERMISSION_KEYS.includes(o.key) &&
            ['GRANT', 'REVOKE'].includes(o.effect)
        )
      : [];

    if (!req.user.isWildcard) {
      const illegalGrant = validOverrides.find(
        (o) => o.effect === 'GRANT' && !userHasPermission(req.user, o.key)
      );
      if (illegalGrant) {
        return res.status(403).json({
          success: false,
          error: `आपल्याकडे नसलेला अधिकार देऊ शकत नाही: ${illegalGrant.key}`,
        });
      }
    }

    const legacyEnumMap = {
      superadmin: 'COLLECTOR',
      admin: 'SUB_COLLECTOR',
      sdo: 'SDO',
      officer: 'TEHSILDAR',
      naib_tahasildar: 'NAIB_TEHSILDAR',
      circle_officer: 'CIRCLE_OFFICER',
      talathi: 'TALATHI',
      data_operator: 'TALATHI',
      viewer: 'CITIZEN',
    };

    let talukasList = Array.isArray(assignedTalukas)
      ? [...new Set(assignedTalukas.map((t) => String(t).trim()).filter(Boolean))]
      : (taluka ? [String(taluka).trim()] : []);
    if (targetRole.jurisdictionScope === 'SUBDIVISION' && subdivision && talukasList.length === 0) {
      const subObj = CHANDRAPUR_SUBDIVISIONS.find((s) => s.id.toLowerCase() === String(subdivision).trim().toLowerCase());
      if (subObj) talukasList = [...subObj.talukas];
    }
    const circlesList = Array.isArray(assignedCircles)
      ? [...new Set(assignedCircles.map((c) => String(c).trim()).filter(Boolean))]
      : [];
    const villagesList = Array.isArray(assignedVillages)
      ? [...new Set(assignedVillages.map((v) => String(v).trim()).filter(Boolean))]
      : [];

    const passwordHash = await bcrypt.hash(password, 12);
    const permsInDb = validOverrides.length > 0
      ? await prisma.permission.findMany({ where: { key: { in: validOverrides.map((o) => o.key) } } })
      : [];
    const permByKey = new Map(permsInDb.map((p) => [p.key, p]));

    const overrideCreateRows = validOverrides
      .map((ov) => {
        const p = permByKey.get(ov.key);
        return p ? { permissionId: p.id, effect: ov.effect } : null;
      })
      .filter(Boolean);

    const createdUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        mobile: normalizedMobile,
        passwordHash,
        role: legacyEnumMap[targetRole.slug] || 'TEHSILDAR',
        roleId: targetRole.id,
        taluka: talukasList[0] || (taluka ? String(taluka).trim() : null),
        subdivision: subdivision ? String(subdivision).trim() : null,
        assignedTalukas: talukasList,
        assignedCircles: circlesList,
        assignedVillages: villagesList,
        designation: designation ? String(designation).trim() : (targetRole.nameMr || targetRole.name),
        isActive: true,
        approvalStatus: 'APPROVED',
        approvedById: req.user.id,
        approvedAt: new Date(),
        consentGiven: true,
        consentAt: new Date(),
        consentVersion: '1.0',
        ...(overrideCreateRows.length > 0
          ? {
              permissionOverrides: {
                create: overrideCreateRows,
              },
            }
          : {}),
      },
    });

    const fullUser = await loadUserWithRbac({ id: createdUser.id });
    const ctx = buildUserAuthContext(fullUser);

    await logAudit({
      userId: req.user.id,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: createdUser.id,
      newData: {
        email: createdUser.email,
        roleSlug: targetRole.slug,
        taluka: createdUser.taluka,
        overrides: validOverrides,
      },
      req,
    });

    invalidateRbacCaches(true);

    return res.status(201).json({
      success: true,
      message: `वापरकर्ता '${createdUser.fullName}' यशस्वीरीत्या तयार करण्यात आला.`,
      user: {
        ...ctx,
        overrides: validOverrides,
      },
    });
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ success: false, error: 'वापरकर्ता तयार करताना त्रुटी: ' + err.message });
  }
};

/**
 * PATCH /api/rbac/users/:id
 * Update user role, profile fields, taluka scope, active status, password reset, and custom overrides
 */
export const updateUser = async (req, res) => {
  try {
    await ensureRbacSeeded();
    const { id } = req.params;
    const {
      fullName,
      mobile,
      designation,
      taluka,
      subdivision,
      assignedTalukas,
      assignedCircles,
      assignedVillages,
      roleId,
      isActive,
      approvalStatus,
      rejectionReason,
      newPassword,
      overrides,
    } = req.body;

    const existing = await loadUserWithRbac({ id });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'वापरकर्ता सापडला नाही.' });
    }

    const existingLevel = existing.roleRef?.hierarchyLevel ?? 50;
    if (!req.user.isWildcard && existing.id !== req.user.id && (existing.roleRef?.isWildcard || existingLevel >= req.user.hierarchyLevel)) {
      return res.status(403).json({
        success: false,
        error: 'आपण आपल्यापेक्षा उच्च किंवा समकक्ष अधिकाऱ्याचे खाते बदलू शकत नाही.',
      });
    }

    // Only Superadmin can approve/reject pending users or edit jurisdiction mappings
    if (
      !req.user.isWildcard &&
      (existing.approvalStatus === 'PENDING' ||
        approvalStatus !== undefined ||
        subdivision !== undefined ||
        assignedTalukas !== undefined ||
        assignedCircles !== undefined ||
        assignedVillages !== undefined)
    ) {
      return res.status(403).json({
        success: false,
        error: 'नोंदणी मंजुरी व तालुका/मंडळ/गाव मॅपिंग केवळ सुपरअॅडमिन (जिल्हाधिकारी) करू शकतात. (Only Superadmin can approve accounts and edit jurisdiction mappings)',
      });
    }

    if (id === req.user.id && isActive === false) {
      return res.status(400).json({
        success: false,
        error: 'आपण स्वतःचे खाते निष्क्रिय करू शकत नाही. (Cannot deactivate your own account)',
      });
    }

    const updateData = {};
    let shouldRevokeToken = false;

    if (fullName !== undefined && String(fullName).trim()) updateData.fullName = String(fullName).trim();
    if (mobile !== undefined) {
      const normMob = normalizeMobileNumber(mobile);
      if (normMob) {
        const dupMob = await prisma.user.findFirst({ where: { mobile: normMob, id: { not: id } } });
        if (dupMob) {
          return res.status(409).json({
            success: false,
            error: 'हा मोबाईल क्रमांक आधीपासून दुसऱ्या खात्याशी जोडलेला आहे. (Mobile number already registered)',
          });
        }
      }
      updateData.mobile = normMob;
    }
    if (designation !== undefined) updateData.designation = designation ? String(designation).trim() : null;
    if (subdivision !== undefined) {
      updateData.subdivision = subdivision ? String(subdivision).trim() : null;
      shouldRevokeToken = true;
    }
    if (Array.isArray(assignedTalukas)) {
      const cleanT = [...new Set(assignedTalukas.map((t) => String(t).trim()).filter(Boolean))];
      updateData.assignedTalukas = cleanT;
      updateData.taluka = cleanT[0] || null;
      shouldRevokeToken = true;
    } else if (taluka !== undefined) {
      const cleanOne = taluka ? String(taluka).trim() : null;
      updateData.taluka = cleanOne;
      updateData.assignedTalukas = cleanOne ? [cleanOne] : [];
      shouldRevokeToken = true;
    }
    if (Array.isArray(assignedCircles)) {
      updateData.assignedCircles = [...new Set(assignedCircles.map((c) => String(c).trim()).filter(Boolean))];
      shouldRevokeToken = true;
    }
    if (Array.isArray(assignedVillages)) {
      updateData.assignedVillages = [...new Set(assignedVillages.map((v) => String(v).trim()).filter(Boolean))];
      shouldRevokeToken = true;
    }

    if (approvalStatus && ['PENDING', 'APPROVED', 'REJECTED'].includes(approvalStatus)) {
      updateData.approvalStatus = approvalStatus;
      if (approvalStatus === 'APPROVED') {
        updateData.isActive = true;
        updateData.approvedById = req.user.id;
        updateData.approvedAt = new Date();
        updateData.rejectionReason = null;
      } else if (approvalStatus === 'REJECTED') {
        updateData.isActive = false;
        updateData.rejectionReason = rejectionReason ? String(rejectionReason).trim() : null;
      }
      shouldRevokeToken = true;
    }

    if (roleId !== undefined && roleId !== existing.roleId) {
      const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
      if (!targetRole || !targetRole.isActive) {
        return res.status(400).json({ success: false, error: 'निवडलेली भूमिका अवैध किंवा निष्क्रिय आहे.' });
      }
      if (!req.user.isWildcard && (targetRole.isWildcard || targetRole.hierarchyLevel >= req.user.hierarchyLevel)) {
        return res.status(403).json({
          success: false,
          error: 'आपण उच्च किंवा समकक्ष भूमिका नियुक्त करू शकत नाही.',
        });
      }
      // Prevent removing the last active superadmin
      if (existing.roleRef?.isWildcard && !targetRole.isWildcard) {
        const superadminCount = await prisma.user.count({
          where: { isActive: true, roleRef: { isWildcard: true } },
        });
        if (superadminCount <= 1) {
          return res.status(400).json({
            success: false,
            error: 'किमान एक सक्रिय जिल्हाधिकारी (Superadmin) खाते प्रणालीत असणे आवश्यक आहे.',
          });
        }
      }
      updateData.roleId = targetRole.id;
      const legacyEnumMap = {
        superadmin: 'COLLECTOR',
        admin: 'SUB_COLLECTOR',
        sdo: 'SDO',
        officer: 'TEHSILDAR',
        naib_tahasildar: 'NAIB_TEHSILDAR',
        circle_officer: 'CIRCLE_OFFICER',
        talathi: 'TALATHI',
        data_operator: 'TALATHI',
        viewer: 'CITIZEN',
      };
      updateData.role = legacyEnumMap[targetRole.slug] || existing.role;
      shouldRevokeToken = true;
    }

    if (isActive !== undefined && Boolean(isActive) !== existing.isActive) {
      if (!Boolean(isActive) && existing.roleRef?.isWildcard) {
        const superadminCount = await prisma.user.count({
          where: { isActive: true, roleRef: { isWildcard: true } },
        });
        if (superadminCount <= 1) {
          return res.status(400).json({
            success: false,
            error: 'शेवटचे सक्रिय Superadmin खाते निष्क्रिय करता येत नाही.',
          });
        }
      }
      updateData.isActive = Boolean(isActive);
      shouldRevokeToken = true;
    }

    if (newPassword && String(newPassword).trim()) {
      if (String(newPassword).trim().length < 8) {
        return res.status(400).json({
          success: false,
          error: 'नवीन संकेतशब्द किमान ८ अक्षरांचा असावा.',
        });
      }
      updateData.passwordHash = await bcrypt.hash(String(newPassword).trim(), 12);
      shouldRevokeToken = true;
    }

    let validOverrides = null;
    if (Array.isArray(overrides)) {
      validOverrides = overrides.filter(
        (o) =>
          o &&
          ALL_PERMISSION_KEYS.includes(o.key) &&
          ['GRANT', 'REVOKE'].includes(o.effect)
      );

      if (!req.user.isWildcard) {
        const illegalGrant = validOverrides.find(
          (o) => o.effect === 'GRANT' && !userHasPermission(req.user, o.key)
        );
        if (illegalGrant) {
          return res.status(403).json({
            success: false,
            error: `आपल्याकडे नसलेला अधिकार देऊ शकत नाही: ${illegalGrant.key}`,
          });
        }
      }
      shouldRevokeToken = true;
    }

    if (shouldRevokeToken) {
      updateData.tokenVersion = (existing.tokenVersion || 1) + 1;
    }

    const overrideRowsToCreate = [];
    if (validOverrides !== null && validOverrides.length > 0) {
      const perms = await prisma.permission.findMany({
        where: { key: { in: validOverrides.map((o) => o.key) } },
      });
      const permByKey = new Map(perms.map((p) => [p.key, p]));
      for (const o of validOverrides) {
        const p = permByKey.get(o.key);
        if (p) overrideRowsToCreate.push({ userId: id, permissionId: p.id, effect: o.effect });
      }
    }

    const txOps = [];
    if (Object.keys(updateData).length > 0) {
      txOps.push(
        prisma.user.update({
          where: { id },
          data: updateData,
        })
      );
    }
    if (validOverrides !== null) {
      txOps.push(prisma.userPermissionOverride.deleteMany({ where: { userId: id } }));
      if (overrideRowsToCreate.length > 0) {
        txOps.push(
          prisma.userPermissionOverride.createMany({
            data: overrideRowsToCreate,
            skipDuplicates: true,
          })
        );
      }
    }
    if (txOps.length > 0) {
      await prisma.$transaction(txOps);
    }

    invalidateUserCache(id);
    const refreshedDb = await loadUserWithRbac({ id });
    const ctx = buildUserAuthContext(refreshedDb);

    await logAudit({
      userId: req.user.id,
      action: 'USER_RBAC_UPDATED',
      entityType: 'User',
      entityId: id,
      previousData: {
        roleId: existing.roleId,
        roleSlug: existing.roleRef?.slug,
        taluka: existing.taluka,
        isActive: existing.isActive,
      },
      newData: {
        roleId: ctx.roleId,
        roleSlug: ctx.roleSlug,
        taluka: ctx.taluka,
        isActive: ctx.isActive,
        overrides: validOverrides,
      },
      req,
    });

    invalidateRbacCaches(true);

    return res.json({
      success: true,
      message: `वापरकर्ता '${ctx.fullName}' ची माहिती व अधिकार यशस्वीरीत्या अद्यतनित केले.`,
      user: {
        ...ctx,
        lastLoginAt: refreshedDb.lastLoginAt,
        overrides: (refreshedDb.permissionOverrides || []).map((ov) => ({
          key: ov.permission.key,
          effect: ov.effect,
        })),
      },
    });
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({ success: false, error: 'वापरकर्ता अद्यतन करताना त्रुटी: ' + err.message });
  }
};

/**
 * POST /api/rbac/users/:id/approve
 * Superadmin-only: Approve & activate a pending user registration (optionally adjusting role & jurisdiction mapping)
 */
export const approveUser = async (req, res) => {
  try {
    await ensureRbacSeeded();
    if (!req.user?.isWildcard) {
      return res.status(403).json({
        success: false,
        error: 'केवळ सुपरअॅडमिन (जिल्हाधिकारी) नोंदणी मंजूर करू शकतात. (Only Superadmin can approve registrations)',
      });
    }

    const { id } = req.params;
    const {
      roleId,
      designation,
      subdivision,
      assignedTalukas,
      assignedCircles,
      assignedVillages,
    } = req.body || {};

    const existing = await loadUserWithRbac({ id });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'वापरकर्ता सापडला नाही.' });
    }

    const updateData = {
      isActive: true,
      approvalStatus: 'APPROVED',
      approvedById: req.user.id,
      approvedAt: new Date(),
      rejectionReason: null,
      tokenVersion: (existing.tokenVersion || 1) + 1,
    };

    if (designation !== undefined) updateData.designation = designation ? String(designation).trim() : null;
    if (subdivision !== undefined) updateData.subdivision = subdivision ? String(subdivision).trim() : null;
    if (Array.isArray(assignedTalukas)) {
      const cleanT = [...new Set(assignedTalukas.map((t) => String(t).trim()).filter(Boolean))];
      updateData.assignedTalukas = cleanT;
      updateData.taluka = cleanT[0] || null;
    }
    if (Array.isArray(assignedCircles)) {
      updateData.assignedCircles = [...new Set(assignedCircles.map((c) => String(c).trim()).filter(Boolean))];
    }
    if (Array.isArray(assignedVillages)) {
      updateData.assignedVillages = [...new Set(assignedVillages.map((v) => String(v).trim()).filter(Boolean))];
    }

    if (roleId && roleId !== existing.roleId) {
      const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
      if (!targetRole || !targetRole.isActive) {
        return res.status(400).json({ success: false, error: 'निवडलेली भूमिका अवैध किंवा निष्क्रिय आहे.' });
      }
      updateData.roleId = targetRole.id;
    }

    await prisma.user.update({ where: { id }, data: updateData });
    invalidateUserCache(id);

    const refreshed = await loadUserWithRbac({ id });
    const ctx = buildUserAuthContext(refreshed);

    await logAudit({
      userId: req.user.id,
      action: 'USER_APPROVED',
      entityType: 'User',
      entityId: id,
      newData: {
        email: ctx.email,
        roleSlug: ctx.roleSlug,
        subdivision: ctx.subdivision,
        assignedTalukas: ctx.assignedTalukas,
        assignedCircles: ctx.assignedCircles,
        assignedVillages: ctx.assignedVillages,
      },
      req,
    });

    invalidateRbacCaches(true);

    return res.json({
      success: true,
      message: `वापरकर्ता '${ctx.fullName}' ची नोंदणी मंजूर करून खाते सक्रिय करण्यात आले.`,
      user: ctx,
    });
  } catch (err) {
    console.error('approveUser error:', err);
    return res.status(500).json({ success: false, error: 'नोंदणी मंजूर करताना त्रुटी: ' + err.message });
  }
};

/**
 * POST /api/rbac/users/:id/reject
 * Superadmin-only: Reject a pending user registration
 */
export const rejectUser = async (req, res) => {
  try {
    if (!req.user?.isWildcard) {
      return res.status(403).json({
        success: false,
        error: 'केवळ सुपरअॅडमिन नोंदणी नाकारू शकतात. (Only Superadmin can reject registrations)',
      });
    }

    const { id } = req.params;
    const { reason = '' } = req.body || {};

    const existing = await loadUserWithRbac({ id });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'वापरकर्ता सापडला नाही.' });
    }
    if (existing.roleRef?.isWildcard) {
      return res.status(400).json({ success: false, error: 'Superadmin खाते नाकारता येत नाही.' });
    }

    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        approvalStatus: 'REJECTED',
        rejectionReason: reason ? String(reason).trim() : null,
        approvedById: req.user.id,
        approvedAt: new Date(),
        tokenVersion: (existing.tokenVersion || 1) + 1,
      },
    });
    invalidateUserCache(id);

    await logAudit({
      userId: req.user.id,
      action: 'USER_REJECTED',
      entityType: 'User',
      entityId: id,
      newData: { email: existing.email, reason: reason || null },
      req,
    });

    invalidateRbacCaches(true);

    return res.json({
      success: true,
      message: `वापरकर्ता '${existing.fullName}' ची नोंदणी नाकारण्यात आली.`,
    });
  } catch (err) {
    console.error('rejectUser error:', err);
    return res.status(500).json({ success: false, error: 'नोंदणी नाकारताना त्रुटी: ' + err.message });
  }
};

/**
 * GET /api/rbac/audit-logs
 * View recent RBAC & data mutation audit logs
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 30, action, entityType } = req.query;
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const skip = (pageNum - 1) * take;

    const where = {};
    if (action) where.action = { contains: String(action), mode: 'insensitive' };
    if (entityType) where.entityType = String(entityType);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              roleRef: { select: { slug: true, name: true, nameMr: true } },
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    return res.status(500).json({ success: false, error: 'ऑडिट नोंदी लोड करताना त्रुटी.' });
  }
};

import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { invalidateUserCache } from '../middleware/authMiddleware.js';
import {
  ensureRbacSeeded,
  buildUserAuthContext,
  loadUserWithRbac,
  slugifyRoleName,
  userHasPermission,
} from '../services/rbacService.js';
import { ALL_PERMISSION_KEYS } from '../config/permissions.js';

/**
 * GET /api/rbac/permissions
 * Return full grouped permission catalog
 */
export const getPermissionsCatalog = async (req, res) => {
  try {
    await ensureRbacSeeded();
    const permissions = await prisma.permission.findMany({
      orderBy: [{ sortOrder: 'asc' }, { key: 'asc' }],
    });

    return res.json({
      success: true,
      permissions,
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
    await ensureRbacSeeded();
    const roles = await prisma.role.findMany({
      orderBy: [{ hierarchyLevel: 'desc' }, { createdAt: 'asc' }],
      include: {
        rolePermissions: {
          include: {
            permission: {
              select: { id: true, key: true, module: true, labelEn: true, labelMr: true },
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

    return res.json({
      success: true,
      roles: formatted,
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
    const { name, nameMr, description, hierarchyLevel, isActive, permissionKeys } = req.body;

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
        permissions: existing.isWildcard ? ALL_PERMISSION_KEYS : nextKeys,
      },
      req,
    });

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
    invalidateUserCache();

    await logAudit({
      userId: req.user.id,
      action: 'ROLE_DELETED',
      entityType: 'Role',
      entityId: id,
      previousData: { slug: existing.slug, name: existing.name },
      req,
    });

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
    await ensureRbacSeeded();
    const users = await prisma.user.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: {
        roleRef: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
        permissionOverrides: {
          include: { permission: true },
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

    return res.json({
      success: true,
      users: formatted,
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
      officer: 'TEHSILDAR',
      data_operator: 'TALATHI',
      viewer: 'CITIZEN',
    };

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
        mobile: mobile ? String(mobile).trim() : null,
        passwordHash,
        role: legacyEnumMap[targetRole.slug] || 'TEHSILDAR',
        roleId: targetRole.id,
        taluka: taluka ? String(taluka).trim() : null,
        designation: designation ? String(designation).trim() : (targetRole.nameMr || targetRole.name),
        isActive: true,
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
      roleId,
      isActive,
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

    if (id === req.user.id && isActive === false) {
      return res.status(400).json({
        success: false,
        error: 'आपण स्वतःचे खाते निष्क्रिय करू शकत नाही. (Cannot deactivate your own account)',
      });
    }

    const updateData = {};
    let shouldRevokeToken = false;

    if (fullName !== undefined && String(fullName).trim()) updateData.fullName = String(fullName).trim();
    if (mobile !== undefined) updateData.mobile = mobile ? String(mobile).trim() : null;
    if (designation !== undefined) updateData.designation = designation ? String(designation).trim() : null;
    if (taluka !== undefined) {
      updateData.taluka = taluka ? String(taluka).trim() : null;
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
        officer: 'TEHSILDAR',
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

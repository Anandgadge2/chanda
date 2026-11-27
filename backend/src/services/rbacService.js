import prisma from '../config/prisma.js';
import {
  PERMISSION_CATALOG,
  ALL_PERMISSION_KEYS,
  DEFAULT_ROLES,
  LEGACY_ROLE_TO_SLUG,
  LEGACY_ROLE_DEFAULT_GRANTS,
} from '../config/permissions.js';

let initializedPromise = null;

/**
 * Synchronize the code-defined permission catalog into PostgreSQL,
 * seed default roles if missing (preserving any customized display names or permissions),
 * and backfill any users missing a roleId.
 */
export async function ensureRbacSeeded() {
  if (initializedPromise) return initializedPromise;

  initializedPromise = (async () => {
    try {
      // 1 & 2 & 3. Run initial reads in parallel to minimize cold-start latency
      const [existingPerms, existingRoles, unlinkedUsers, usersToSyncTaluka] = await Promise.all([
        prisma.permission.findMany(),
        prisma.role.findMany(),
        prisma.user.findMany({
          where: { roleId: null },
          select: { id: true, role: true },
        }),
        prisma.user.findMany({
          where: {
            taluka: { not: null },
            assignedTalukas: { isEmpty: true },
          },
          select: { id: true, taluka: true },
        }),
      ]);

      const permissionMap = new Map(existingPerms.map((p) => [p.key, p]));

      const missingOrOutdated = PERMISSION_CATALOG.filter((p) => {
        const ext = permissionMap.get(p.key);
        return !ext || ext.labelMr !== p.labelMr || ext.module !== p.module;
      });

      if (missingOrOutdated.length > 0) {
        await Promise.all(
          missingOrOutdated.map(async (perm) => {
            const upserted = await prisma.permission.upsert({
              where: { key: perm.key },
              update: {
                module: perm.module,
                labelEn: perm.labelEn,
                labelMr: perm.labelMr,
                description: perm.description,
                sortOrder: perm.sortOrder,
              },
              create: perm,
            });
            permissionMap.set(upserted.key, upserted);
          })
        );
      }

      const roleMap = new Map(existingRoles.map((r) => [r.slug, r]));

      for (const roleDef of DEFAULT_ROLES) {
        let role = roleMap.get(roleDef.slug);
        if (!role) {
          role = await prisma.role.create({
            data: {
              slug: roleDef.slug,
              name: roleDef.name,
              nameMr: roleDef.nameMr,
              description: roleDef.description,
              hierarchyLevel: roleDef.hierarchyLevel,
              jurisdictionScope: roleDef.jurisdictionScope || 'TALUKA',
              isSystem: roleDef.isSystem,
              isWildcard: roleDef.isWildcard,
              isActive: true,
            },
          });

          const rpData = [];
          for (const key of roleDef.permissions) {
            const p = permissionMap.get(key);
            if (p) {
              rpData.push({ roleId: role.id, permissionId: p.id });
            }
          }
          if (rpData.length > 0) {
            await prisma.rolePermission.createMany({
              data: rpData,
              skipDuplicates: true,
            });
          }
          roleMap.set(role.slug, role);
        } else if (role.slug === 'superadmin') {
          if (!role.isWildcard || role.jurisdictionScope !== 'DISTRICT') {
            role = await prisma.role.update({
              where: { id: role.id },
              data: { isWildcard: true, isSystem: true, jurisdictionScope: 'DISTRICT' },
            });
            roleMap.set(role.slug, role);
          }
        } else if (['admin', 'viewer'].includes(role.slug) && role.jurisdictionScope === 'TALUKA' && roleDef.jurisdictionScope === 'DISTRICT') {
          role = await prisma.role.update({
            where: { id: role.id },
            data: { jurisdictionScope: 'DISTRICT' },
          });
          roleMap.set(role.slug, role);
        }
      }

      // 3. Backfill any existing users missing roleId or assignedTalukas (fetched in parallel above)
      for (const u of unlinkedUsers) {
        const targetSlug = LEGACY_ROLE_TO_SLUG[u.role] || 'officer';
        const targetRole = roleMap.get(targetSlug) || roleMap.get('officer');
        if (!targetRole) continue;

        await prisma.user.update({
          where: { id: u.id },
          data: { roleId: targetRole.id },
        });

        const legacyGrants = LEGACY_ROLE_DEFAULT_GRANTS[u.role] || [];
        for (const permKey of legacyGrants) {
          const perm = permissionMap.get(permKey);
          if (!perm) continue;
          await prisma.userPermissionOverride.upsert({
            where: {
              idx_user_permission_override_unique: {
                userId: u.id,
                permissionId: perm.id,
              },
            },
            update: {},
            create: {
              userId: u.id,
              permissionId: perm.id,
              effect: 'GRANT',
            },
          });
        }
      }

      // Backfill assignedTalukas from legacy single taluka field where empty (fetched in parallel above)
      for (const u of usersToSyncTaluka) {
        if (u.taluka && u.taluka.trim()) {
          await prisma.user.update({
            where: { id: u.id },
            data: { assignedTalukas: [u.taluka.trim()] },
          });
        }
      }
    } catch (err) {
      initializedPromise = null;
      throw err;
    }
  })();

  return initializedPromise;
}

/**
 * Reset initialization promise (used after migrations/tests)
 */
export function resetRbacInitState() {
  initializedPromise = null;
}

/**
 * Compute effective permissions array and role metadata for a DB user record
 * loaded with `roleRef.rolePermissions.permission` and `permissionOverrides.permission`.
 */
export function buildUserAuthContext(dbUser) {
  if (!dbUser) return null;

  const roleRef = dbUser.roleRef;
  const isWildcard = Boolean(roleRef?.isWildcard) || (!roleRef && ['SUPERADMIN', 'COLLECTOR'].includes(dbUser.role));

  let effectivePermissions;
  if (isWildcard) {
    effectivePermissions = [...ALL_PERMISSION_KEYS];
  } else {
    const permSet = new Set(
      (roleRef?.rolePermissions || []).map((rp) => rp.permission?.key).filter(Boolean)
    );

    for (const ov of dbUser.permissionOverrides || []) {
      const key = ov.permission?.key;
      if (!key) continue;
      if (ov.effect === 'GRANT') {
        permSet.add(key);
      } else if (ov.effect === 'REVOKE') {
        permSet.delete(key);
      }
    }

    effectivePermissions = Array.from(permSet);
  }

  return {
    id: dbUser.id,
    fullName: dbUser.fullName,
    email: dbUser.email,
    mobile: dbUser.mobile,
    role: dbUser.role, // Legacy enum preserved for compatibility
    roleId: roleRef?.id || dbUser.roleId || null,
    roleSlug: roleRef?.slug || LEGACY_ROLE_TO_SLUG[dbUser.role] || 'officer',
    roleName: roleRef?.name || dbUser.role,
    roleNameMr: roleRef?.nameMr || roleRef?.name || dbUser.role,
    hierarchyLevel: roleRef?.hierarchyLevel ?? 50,
    jurisdictionScope: roleRef?.jurisdictionScope || 'TALUKA',
    isWildcard,
    roleObj: roleRef
      ? {
          id: roleRef.id,
          slug: roleRef.slug,
          name: roleRef.name,
          nameMr: roleRef.nameMr,
          hierarchyLevel: roleRef.hierarchyLevel,
          jurisdictionScope: roleRef.jurisdictionScope || 'TALUKA',
          isSystem: roleRef.isSystem,
          isWildcard: roleRef.isWildcard,
          isActive: roleRef.isActive,
        }
      : null,
    permissions: effectivePermissions,
    taluka: dbUser.taluka || (Array.isArray(dbUser.assignedTalukas) && dbUser.assignedTalukas[0]) || null,
    subdivision: dbUser.subdivision || null,
    assignedTalukas:
      Array.isArray(dbUser.assignedTalukas) && dbUser.assignedTalukas.length > 0
        ? dbUser.assignedTalukas
        : (dbUser.taluka ? [dbUser.taluka] : []),
    assignedCircles: Array.isArray(dbUser.assignedCircles) ? dbUser.assignedCircles : [],
    assignedVillages: Array.isArray(dbUser.assignedVillages) ? dbUser.assignedVillages : [],
    designation: dbUser.designation,
    isActive: dbUser.isActive,
    approvalStatus: dbUser.approvalStatus || 'APPROVED',
    approvedAt: dbUser.approvedAt || null,
    rejectionReason: dbUser.rejectionReason || null,
    tokenVersion: dbUser.tokenVersion ?? 1,
    consentGiven: dbUser.consentGiven,
    consentAt: dbUser.consentAt,
    consentVersion: dbUser.consentVersion,
  };
}

/**
 * Load a user with full RBAC graph from DB
 */
export async function loadUserWithRbac(where) {
  await ensureRbacSeeded();

  return prisma.user.findUnique({
    where,
    include: {
      roleRef: {
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      },
      permissionOverrides: {
        include: { permission: true },
      },
    },
  });
}

/**
 * Check if resolved user holds a specific permission
 */
export function userHasPermission(user, permKey) {
  if (!user) return false;
  if (user.isWildcard) return true;
  return Array.isArray(user.permissions) && user.permissions.includes(permKey);
}

/**
 * Check if resolved user holds ANY of the provided permissions
 */
export function userHasAnyPermission(user, permKeys = []) {
  if (!user) return false;
  if (user.isWildcard) return true;
  if (!permKeys.length) return true;
  return permKeys.some((k) => Array.isArray(user.permissions) && user.permissions.includes(k));
}

/**
 * Normalize Indian mobile phone numbers to 10 digits (or trimmed digits)
 */
export function normalizeMobileNumber(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

/**
 * Resolve the user's effective jurisdiction scope and lists
 */
export function getUserJurisdiction(user) {
  if (!user) {
    return { isDistrictWide: false, scope: 'VILLAGE', talukas: [], circles: [], villages: [] };
  }
  const scope = user.jurisdictionScope || user.roleObj?.jurisdictionScope || 'TALUKA';
  const isDistrictWide =
    Boolean(user.isWildcard) ||
    userHasPermission(user, 'district.all_talukas') ||
    scope === 'DISTRICT';

  const talukas = Array.isArray(user.assignedTalukas) && user.assignedTalukas.length > 0
    ? user.assignedTalukas.filter(Boolean)
    : (user.taluka ? [user.taluka] : []);
  const circles = Array.isArray(user.assignedCircles) ? user.assignedCircles.filter(Boolean) : [];
  const villages = Array.isArray(user.assignedVillages) ? user.assignedVillages.filter(Boolean) : [];

  return { isDistrictWide, scope, talukas, circles, villages };
}

/**
 * Check whether user's jurisdiction permits access to targetTaluka
 */
export function userCanAccessTaluka(user, targetTaluka) {
  if (!user) return false;
  if (!targetTaluka || targetTaluka === 'all' || targetTaluka === 'सर्व तालुके') return true;
  const j = getUserJurisdiction(user);
  if (j.isDistrictWide) return true;
  if (j.talukas.length === 0) return true; // No taluka restriction assigned
  const target = String(targetTaluka).trim().toLowerCase();
  return j.talukas.some((t) => String(t).trim().toLowerCase() === target);
}

/**
 * Check whether user's jurisdiction permits access to a specific LandParcel (Taluka + Circle + Village)
 */
export function userCanAccessParcel(user, parcel) {
  if (!user) return false;
  const j = getUserJurisdiction(user);
  if (j.isDistrictWide) return true;
  if (!parcel) return false;

  if (j.talukas.length > 0 && parcel.taluka) {
    const tMatch = j.talukas.some((t) => String(t).trim().toLowerCase() === String(parcel.taluka).trim().toLowerCase());
    if (!tMatch) return false;
  }

  if (j.circles.length > 0) {
    const pCircle = String(parcel.revenueCircle || '').trim().toLowerCase();
    if (!pCircle || !j.circles.some((c) => String(c).trim().toLowerCase() === pCircle)) {
      return false;
    }
  }

  if (j.villages.length > 0) {
    const pVillage = String(parcel.villageName || '').trim().toLowerCase();
    const pCode = String(parcel.villageCode || '').trim().toLowerCase();
    const vMatch = j.villages.some((v) => {
      const nv = String(v).trim().toLowerCase();
      return nv === pVillage || (pCode && nv === pCode) || pVillage.includes(nv) || nv.includes(pVillage);
    });
    if (!vMatch) return false;
  }

  return true;
}

/**
 * Build a Prisma LandParcel `where` restriction reflecting the user's jurisdiction.
 * Returns null if the user has district-wide access.
 */
export function buildParcelJurisdictionWhere(user) {
  const j = getUserJurisdiction(user);
  if (j.isDistrictWide) return null;

  const clauses = [];
  if (j.talukas.length > 0) {
    clauses.push({
      OR: j.talukas.map((t) => ({ taluka: { equals: t, mode: 'insensitive' } })),
    });
  }
  if (j.circles.length > 0) {
    clauses.push({
      OR: j.circles.map((c) => ({ revenueCircle: { equals: c, mode: 'insensitive' } })),
    });
  }
  if (j.villages.length > 0) {
    clauses.push({
      OR: j.villages.flatMap((v) => [
        { villageName: { equals: v, mode: 'insensitive' } },
        { villageName: { contains: v, mode: 'insensitive' } },
      ]),
    });
  }

  if (clauses.length === 0) return null;
  return clauses.length === 1 ? clauses[0] : { AND: clauses };
}

/**
 * Stable cache key fragment for user jurisdiction (prevents cross-scope cache leakage)
 */
export function getJurisdictionCacheKey(user) {
  const j = getUserJurisdiction(user);
  if (j.isDistrictWide) return 'ALL';
  return `T:${j.talukas.join(',')}|C:${j.circles.join(',')}|V:${j.villages.join(',')}`;
}

/**
 * Slugify a human role name into a safe unique machine slug
 */
export function slugifyRoleName(name) {
  const base = String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
  return base || `custom_role_${Date.now()}`;
}

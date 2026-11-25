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
      // 1. Upsert all canonical permissions from catalog
      const permissionMap = new Map();
      for (const perm of PERMISSION_CATALOG) {
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
      }

      // 2. Seed default roles ONLY if they do not exist yet (never overwrite admin renames/toggles)
      const roleMap = new Map();
      for (const roleDef of DEFAULT_ROLES) {
        let role = await prisma.role.findUnique({ where: { slug: roleDef.slug } });
        if (!role) {
          role = await prisma.role.create({
            data: {
              slug: roleDef.slug,
              name: roleDef.name,
              nameMr: roleDef.nameMr,
              description: roleDef.description,
              hierarchyLevel: roleDef.hierarchyLevel,
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
        } else if (role.slug === 'superadmin') {
          // Ensure superadmin always retains wildcard flag & all permissions
          if (!role.isWildcard) {
            await prisma.role.update({
              where: { id: role.id },
              data: { isWildcard: true, isSystem: true },
            });
          }
        }
        roleMap.set(role.slug, role);
      }

      // 3. Backfill any existing users that do not yet have a roleId assigned
      const unlinkedUsers = await prisma.user.findMany({
        where: { roleId: null },
        select: { id: true, role: true },
      });

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
    isWildcard,
    roleObj: roleRef
      ? {
          id: roleRef.id,
          slug: roleRef.slug,
          name: roleRef.name,
          nameMr: roleRef.nameMr,
          hierarchyLevel: roleRef.hierarchyLevel,
          isSystem: roleRef.isSystem,
          isWildcard: roleRef.isWildcard,
          isActive: roleRef.isActive,
        }
      : null,
    permissions: effectivePermissions,
    taluka: dbUser.taluka,
    designation: dbUser.designation,
    isActive: dbUser.isActive,
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
 * Check whether user's Taluka scope permits access to targetTaluka
 */
export function userCanAccessTaluka(user, targetTaluka) {
  if (!user) return false;
  if (!targetTaluka || targetTaluka === 'all' || targetTaluka === 'सर्व तालुके') return true;
  if (user.isWildcard || userHasPermission(user, 'district.all_talukas')) return true;
  if (!user.taluka) return true; // No taluka restriction assigned
  return user.taluka.trim().toLowerCase() === String(targetTaluka).trim().toLowerCase();
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

import jwt from 'jsonwebtoken';
import {
  loadUserWithRbac,
  buildUserAuthContext,
  userHasPermission,
  userHasAnyPermission,
} from '../services/rbacService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'chandrapur-collectorate-secure-jwt-secret-key-2026';

// High-performance in-memory verified user cache with Stale-While-Revalidate (SWR)
// Eliminates redundant DB auth queries when frontend fires requests or clicks filters
const userCache = new Map();
const inFlightUserLoads = new Map();
const USER_CACHE_FRESH_TTL_MS = 2 * 60 * 1000; // 2 minutes fresh
const USER_CACHE_STALE_TTL_MS = 15 * 60 * 1000; // 15 minutes SWR

const fetchAndCacheUser = (userId) => {
  let pending = inFlightUserLoads.get(userId);
  if (!pending) {
    pending = loadUserWithRbac({ id: userId })
      .then((dbUser) => {
        const ctx = buildUserAuthContext(dbUser);
        if (ctx && ctx.isActive && ctx.roleObj?.isActive !== false) {
          userCache.set(userId, { user: ctx, timestamp: Date.now() });
        } else {
          userCache.delete(userId);
        }
        return ctx;
      })
      .finally(() => {
        inFlightUserLoads.delete(userId);
      });
    inFlightUserLoads.set(userId, pending);
  }
  return pending;
};

export const invalidateUserCache = (userId) => {
  if (userId) {
    userCache.delete(userId);
  } else {
    userCache.clear();
  }
};

/**
 * Middleware: Verify JWT Bearer token and attach enriched RBAC user to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'अनधिकृत प्रवेश. कृपया लॉगिन करा. (Authentication required: Missing or invalid token)',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Check in-memory cache first (fresh or stale-while-revalidate)
    const cached = userCache.get(decoded.id);
    let user = null;

    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < USER_CACHE_FRESH_TTL_MS) {
        user = cached.user;
      } else if (age < USER_CACHE_STALE_TTL_MS) {
        user = cached.user;
        fetchAndCacheUser(decoded.id).catch(() => {});
      }
    }

    if (!user) {
      user = await fetchAndCacheUser(decoded.id);
    }

    if (!user || !user.isActive || user.roleObj?.isActive === false) {
      return res.status(401).json({
        success: false,
        error: 'वापरकर्ता निष्क्रीय किंवा अस्तित्वात नाही. (User inactive or not found)',
      });
    }

    // Immediate revocation check when role/permissions/status were changed
    const tokenVersion = decoded.tokenVersion ?? 1;
    if (tokenVersion !== user.tokenVersion) {
      invalidateUserCache(user.id);
      return res.status(401).json({
        success: false,
        error: 'आपले अधिकार अद्यतनित केले आहेत. कृपया पुन्हा लॉगिन करा. (Session invalidated due to role/permission update. Please login again.)',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'आपले सत्र संपले आहे. कृपया पुन्हा लॉगिन करा. (Session expired. Please login again)',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'अवैध टोकन. (Invalid authentication token)',
    });
  }
};

/**
 * Middleware: Require ALL specified granular permissions
 * @param  {...string} requiredPermissions
 */
export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'अनधिकृत प्रवेश. (Authentication required)',
      });
    }

    const missing = requiredPermissions.filter((perm) => !userHasPermission(req.user, perm));
    if (missing.length > 0) {
      return res.status(403).json({
        success: false,
        error: `या कृतीसाठी आपणास अधिकार नाहीत. (Access forbidden: Missing permission [${missing.join(', ')}])`,
        missingPermissions: missing,
      });
    }

    next();
  };
};

/**
 * Middleware: Require AT LEAST ONE of the specified permissions
 * @param  {...string} allowedPermissions
 */
export const requireAnyPermission = (...allowedPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'अनधिकृत प्रवेश. (Authentication required)',
      });
    }

    if (allowedPermissions.length > 0 && !userHasAnyPermission(req.user, allowedPermissions)) {
      return res.status(403).json({
        success: false,
        error: `या कृतीसाठी आपणास अधिकार नाहीत. (Access forbidden: Requires any of [${allowedPermissions.join(', ')}])`,
        requiredPermissions: allowedPermissions,
      });
    }

    next();
  };
};

/**
 * Backward-compatible Role-based access control middleware.
 * Matches legacy UserRole enum, dynamic roleSlug, or wildcard Superadmin.
 * @param  {...string} roles Allowed UserRoles or role slugs
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'अनधिकृत प्रवेश. (Authentication required)',
      });
    }

    if (req.user.isWildcard) {
      return next();
    }

    const normalized = roles.map((r) => String(r).toLowerCase());
    const matchesLegacy = roles.includes(req.user.role);
    const matchesSlug = req.user.roleSlug && normalized.includes(req.user.roleSlug.toLowerCase());

    if (roles.length > 0 && !matchesLegacy && !matchesSlug) {
      return res.status(403).json({
        success: false,
        error: `या कृतीसाठी आपणास अधिकार नाहीत. (Access forbidden: Requires one of [${roles.join(', ')}], current role is ${req.user.roleName || req.user.role})`,
      });
    }

    next();
  };
};

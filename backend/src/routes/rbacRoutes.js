import express from 'express';
import {
  getRbacBootstrap,
  getPermissionsCatalog,
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  listUsers,
  createUser,
  updateUser,
  approveUser,
  rejectUser,
  getAuditLogs,
} from '../controllers/rbacController.js';
import {
  authenticate,
  requirePermission,
  requireAnyPermission,
  requireSuperadmin,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Single fast bootstrap endpoint (Permissions + Roles + Users)
router.get(
  '/bootstrap',
  authenticate,
  requireAnyPermission('role.view', 'role.manage', 'user.view', 'user.manage'),
  getRbacBootstrap
);

// Permissions catalog
router.get(
  '/permissions',
  authenticate,
  requireAnyPermission('role.view', 'role.manage', 'user.view', 'user.manage'),
  getPermissionsCatalog
);

// Dynamic Roles CRUD (editable role names & permission matrix)
router.get(
  '/roles',
  authenticate,
  requireAnyPermission('role.view', 'role.manage', 'user.view', 'user.manage'),
  listRoles
);
router.post('/roles', authenticate, requirePermission('role.manage'), createRole);
router.patch('/roles/:id', authenticate, requirePermission('role.manage'), updateRole);
router.delete('/roles/:id', authenticate, requirePermission('role.manage'), deleteRole);

// User Accounts & Per-User Custom Permission Overrides
router.get(
  '/users',
  authenticate,
  requireAnyPermission('user.view', 'user.manage'),
  listUsers
);
router.post('/users', authenticate, requirePermission('user.manage'), createUser);
router.patch('/users/:id', authenticate, requirePermission('user.manage'), updateUser);
router.post('/users/:id/approve', authenticate, requireSuperadmin, approveUser);
router.post('/users/:id/reject', authenticate, requireSuperadmin, rejectUser);

// Security & Governance Audit Trail
router.get('/audit-logs', authenticate, requirePermission('audit.view'), getAuditLogs);

export default router;

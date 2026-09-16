import { Router } from 'express';
import {
  login,
  getMe,
  logout,
  register,
  exportMyData,
  requestErasure,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Authenticated routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

// DPDPA 2023 Data Principal Rights routes
router.get('/dpdpa/export', authenticate, exportMyData);
router.post('/dpdpa/erasure-request', authenticate, requestErasure);

export default router;



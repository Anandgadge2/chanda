import { Router } from 'express';
import { login, getMe, logout, register } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Authenticated routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;

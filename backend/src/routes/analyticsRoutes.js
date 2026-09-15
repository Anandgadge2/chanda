import express from 'express';
import { getSummary } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', authenticate, getSummary);

export default router;

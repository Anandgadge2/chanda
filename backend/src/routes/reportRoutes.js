import express from 'express';
import { exportPrapatra3, getPrapatra3Preview } from '../controllers/reportController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/prapatra-3', authenticate, requirePermission('prapatra.export'), exportPrapatra3);
router.get('/prapatra-3/preview', authenticate, requirePermission('prapatra.view'), getPrapatra3Preview);

export default router;

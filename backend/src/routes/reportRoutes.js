import express from 'express';
import { exportPrapatra3, getPrapatra3Preview } from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/prapatra-3', authenticate, authorize('COLLECTOR', 'SDO', 'TEHSILDAR'), exportPrapatra3);
router.get('/prapatra-3/preview', authenticate, getPrapatra3Preview);

export default router;

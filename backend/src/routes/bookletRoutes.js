import express from 'express';
import {
  getBookletPreview,
  exportBookletExcel,
  exportBookletPdf,
  createOrUpdateBookletRecord,
} from '../controllers/bookletController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/preview', authenticate, getBookletPreview);
router.get('/export-excel', authenticate, exportBookletExcel);
router.get('/export-pdf', authenticate, exportBookletPdf);
router.post('/record', authenticate, authorize('COLLECTOR', 'SDO', 'TEHSILDAR', 'NAIB_TEHSILDAR'), createOrUpdateBookletRecord);

export default router;

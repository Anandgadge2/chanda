import express from 'express';
import {
  getBookletPreview,
  exportBookletExcel,
  exportBookletPdf,
  createOrUpdateBookletRecord,
} from '../controllers/bookletController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/preview', authenticate, requirePermission('prapatra.view'), getBookletPreview);
router.get('/export-excel', authenticate, requirePermission('prapatra.export'), exportBookletExcel);
router.get('/export-pdf', authenticate, requirePermission('prapatra.export'), exportBookletPdf);
router.post('/record', authenticate, requirePermission('booklet.edit'), createOrUpdateBookletRecord);

export default router;

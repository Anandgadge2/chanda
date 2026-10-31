import express from 'express';
import {
  bulkUpload,
  getSampleTemplate,
  getParcels,
  getParcelTrace,
  exportParcelDossierPdf,
  createParcel,
  updateParcel,
} from '../controllers/parcelController.js';
import { getTalukaVillages } from '../controllers/prapatraController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/bulk-upload',
  authenticate,
  authorize('SUPERADMIN', 'COLLECTOR', 'SUB_COLLECTOR', 'SDO', 'TEHSILDAR', 'NAIB_TEHSILDAR', 'CIRCLE_OFFICER', 'TALATHI'),
  upload.single('file'),
  bulkUpload
);
router.get('/sample-template', getSampleTemplate); // Publicly accessible template
router.get('/villages', getTalukaVillages);
router.get('/', authenticate, getParcels);
router.post('/', authenticate, authorize('COLLECTOR', 'SDO', 'TEHSILDAR', 'NAIB_TEHSILDAR', 'TALATHI'), createParcel);
router.get('/:upi/trace', authenticate, getParcelTrace);
router.get('/:upi/export-pdf', authenticate, exportParcelDossierPdf);
router.patch('/:upi', authenticate, authorize('SUPERADMIN', 'COLLECTOR', 'SUB_COLLECTOR', 'SDO', 'TEHSILDAR', 'NAIB_TEHSILDAR', 'CIRCLE_OFFICER', 'TALATHI'), updateParcel);
router.put('/:upi', authenticate, authorize('SUPERADMIN', 'COLLECTOR', 'SUB_COLLECTOR', 'SDO', 'TEHSILDAR', 'NAIB_TEHSILDAR', 'CIRCLE_OFFICER', 'TALATHI'), updateParcel);

export default router;

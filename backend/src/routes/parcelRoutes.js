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
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/bulk-upload',
  authenticate,
  requirePermission('prapatra.upload'),
  upload.single('file'),
  bulkUpload
);
router.get('/sample-template', getSampleTemplate); // Publicly accessible template
router.get('/villages', getTalukaVillages);
router.get('/', authenticate, requirePermission('parcel.view'), getParcels);
router.post('/', authenticate, requirePermission('parcel.create'), createParcel);
router.get('/:upi/trace', authenticate, requirePermission('parcel.view'), getParcelTrace);
router.get('/:upi/export-pdf', authenticate, requirePermission('parcel.view'), exportParcelDossierPdf);
router.patch('/:upi', authenticate, requirePermission('parcel.edit'), updateParcel);
router.put('/:upi', authenticate, requirePermission('parcel.edit'), updateParcel);

export default router;

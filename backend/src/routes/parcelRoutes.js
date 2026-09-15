import express from 'express';
import {
  bulkUpload,
  getSampleTemplate,
  getParcels,
  getParcelTrace,
  createParcel,
} from '../controllers/parcelController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/bulk-upload', authenticate, authorize('COLLECTOR', 'SDO', 'TEHSILDAR', 'NAIB_TEHSILDAR', 'TALATHI'), upload.single('file'), bulkUpload);
router.get('/sample-template', getSampleTemplate); // Publicly accessible template
router.get('/', authenticate, getParcels);
router.post('/', authenticate, authorize('COLLECTOR', 'SDO', 'TEHSILDAR', 'NAIB_TEHSILDAR', 'TALATHI'), createParcel);
router.get('/:upi/trace', authenticate, getParcelTrace);

export default router;

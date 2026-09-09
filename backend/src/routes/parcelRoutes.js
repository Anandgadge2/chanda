import express from 'express';
import {
  bulkUpload,
  getSampleTemplate,
  getParcels,
  getParcelTrace,
  createParcel,
} from '../controllers/parcelController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/bulk-upload', upload.single('file'), bulkUpload);
router.get('/sample-template', getSampleTemplate);
router.get('/', getParcels);
router.post('/', createParcel);
router.get('/:upi/trace', getParcelTrace);

export default router;

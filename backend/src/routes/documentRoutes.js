import express from 'express';
import { uploadDocument, getDocuments, getDocumentSignedUrl } from '../controllers/documentController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/upload',
  authenticate,
  authorize('COLLECTOR', 'SDO', 'TEHSILDAR', 'NAIB_TEHSILDAR', 'TALATHI', 'CIRCLE_OFFICER'),
  upload.single('document'),
  uploadDocument
);
router.get('/', authenticate, getDocuments);
router.get('/:id/signed-url', authenticate, getDocumentSignedUrl);

export default router;

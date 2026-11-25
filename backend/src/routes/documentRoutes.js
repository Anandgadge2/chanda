import express from 'express';
import { uploadDocument, getDocuments, getDocumentSignedUrl } from '../controllers/documentController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/upload',
  authenticate,
  requirePermission('document.upload'),
  upload.single('document'),
  uploadDocument
);
router.get('/', authenticate, requirePermission('document.view'), getDocuments);
router.get('/:id/signed-url', authenticate, requirePermission('document.view'), getDocumentSignedUrl);

export default router;

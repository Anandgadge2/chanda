import express from 'express';
import { uploadDocument, getDocuments } from '../controllers/documentController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', upload.single('document'), uploadDocument);
router.get('/', getDocuments);

export default router;

import express from 'express';
import { exportPrapatra3, getPrapatra3Preview } from '../controllers/reportController.js';

const router = express.Router();

router.get('/prapatra-3', exportPrapatra3);
router.get('/prapatra-3/preview', getPrapatra3Preview);

export default router;

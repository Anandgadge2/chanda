import express from 'express';
import { getSummary } from '../controllers/analyticsController.js';

const router = express.Router();

// District Analytics Summary (Public aggregate metrics for landing & dashboard)
router.get('/summary', getSummary);

export default router;

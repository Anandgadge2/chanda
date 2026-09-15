import express from 'express';
import {
  getCases,
  createCase,
  addHearing,
  updateCaseStatus,
} from '../controllers/caseController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getCases);
router.post('/', authenticate, authorize('COLLECTOR', 'SDO', 'TEHSILDAR'), createCase);
router.post('/:id/hearings', authenticate, authorize('COLLECTOR', 'SDO', 'TEHSILDAR', 'NAIB_TEHSILDAR'), addHearing);
router.patch('/:id/status', authenticate, authorize('COLLECTOR', 'SDO'), updateCaseStatus);

export default router;

import express from 'express';
import {
  getCases,
  createCase,
  addHearing,
  updateCaseStatus,
} from '../controllers/caseController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, requirePermission('case.view'), getCases);
router.post('/', authenticate, requirePermission('case.create'), createCase);
router.post('/:id/hearings', authenticate, requirePermission('case.hearing'), addHearing);
router.patch('/:id/status', authenticate, requirePermission('case.order'), updateCaseStatus);

export default router;

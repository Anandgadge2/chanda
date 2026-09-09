import express from 'express';
import {
  getCases,
  createCase,
  addHearing,
  updateCaseStatus,
} from '../controllers/caseController.js';

const router = express.Router();

router.get('/', getCases);
router.post('/', createCase);
router.post('/:id/hearings', addHearing);
router.patch('/:id/status', updateCaseStatus);

export default router;

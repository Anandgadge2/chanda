import express from 'express';
import {
  getDriveStatus,
  scanDrive,
  pullVillage,
  pushVillage,
  addColumn,
  addRow
} from '../controllers/driveSyncController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/status', authenticate, requirePermission('drive.view'), getDriveStatus);
router.get('/scan', authenticate, requirePermission('drive.view'), scanDrive);
router.post('/pull', authenticate, requirePermission('drive.pull'), pullVillage);
router.post('/push', authenticate, requirePermission('drive.push'), pushVillage);
router.post('/add-column', authenticate, requirePermission('drive.edit_sheet'), addColumn);
router.post('/add-row', authenticate, requirePermission('drive.edit_sheet'), addRow);

export default router;

import express from 'express';
import {
  getDriveStatus,
  scanDrive,
  pullVillage,
  pushVillage,
  addColumn,
  addRow
} from '../controllers/driveSyncController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow authenticated officers (Superadmin, Collector, SDO, Tehsildar, Naib Tehsildar, Circle Officer, Talathi)
const driveAccess = [
  authenticate,
  authorize('SUPERADMIN', 'COLLECTOR', 'SUB_COLLECTOR', 'SDO', 'TEHSILDAR', 'NAIB_TEHSILDAR', 'CIRCLE_OFFICER', 'TALATHI')
];

router.get('/status', driveAccess, getDriveStatus);
router.get('/scan', driveAccess, scanDrive);
router.post('/pull', driveAccess, pullVillage);
router.post('/push', driveAccess, pushVillage);
router.post('/add-column', driveAccess, addColumn);
router.post('/add-row', driveAccess, addRow);

export default router;

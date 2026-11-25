import express from 'express';
import multer from 'multer';
import os from 'os';
import path from 'path';
import {
  getPrapatraReport,
  getDistrictSummary,
  getTalukaVillages,
  getBookletCategories,
  updatePrapatraRollup,
  uploadPrapatraExcel,
  inspectPrapatraDiff,
  purgeVillageData,
  getRenumberingParchaData,
  exportRenumberingParchaExcel,
  exportRenumberingParchaPdf,
  exportGoshwaraExcel,
  exportGoshwaraPdf
} from '../controllers/prapatraController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max Excel file
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('फक्त एक्सेल फाईल (.xlsx, .xls) अपलोड करणे अनुज्ञेय आहे.'));
    }
  }
});

/**
 * @route   GET /api/prapatra/summary
 * @desc    Get District-wide summary KPI metrics for Dashboard
 */
router.get('/summary', getDistrictSummary);

/**
 * @route   GET /api/prapatra/villages
 * @desc    Get list of real villages for a selected taluka
 * @query   taluka (e.g. 'Warora', 'all')
 */
router.get('/villages', getTalukaVillages);

/**
 * @route   POST /api/prapatra/inspect-diff
 * @desc    Dry-run pre-flight diff inspection of Excel booklet vs DB records
 */
router.post(
  '/inspect-diff',
  authenticate,
  requirePermission('prapatra.upload'),
  upload.any(),
  inspectPrapatraDiff
);

/**
 * @route   POST /api/prapatra/upload
 * @desc    Upload official 1-45 points Excel inspection workbook(s)
 */
router.post(
  '/upload',
  authenticate,
  requirePermission('prapatra.upload'),
  upload.any(),
  uploadPrapatraExcel
);

/**
 * @route   POST /api/prapatra/village/purge
 * @desc    Safely wipe all previous LandParcel & related case records for a single village
 */
router.post(
  '/village/purge',
  authenticate,
  requirePermission('village.purge'),
  purgeVillageData
);

/**
 * @route   PUT /api/prapatra/rollup/:id
 * @desc    Update / Edit village rollup record
 */
router.put('/rollup/:id', authenticate, requirePermission('prapatra.rollup_edit'), updatePrapatraRollup);

/**
 * @route   GET /api/prapatra/categories
 * @desc    Get the 17 official statutory booklet categories & 46 checklist points
 */
router.get('/categories', getBookletCategories);

/**
 * @route   GET /api/prapatra/:id
 * @desc    Get Prapatra 1-17 or Master Checklist in JSON, Excel, or PDF format
 * @query   taluka, village, search, filterType, format ('json', 'excel', 'pdf')
 */
router.get('/renumbering-parcha/data', authenticate, requirePermission('prapatra.view'), getRenumberingParchaData);
router.post('/renumbering-parcha/export-excel', authenticate, requirePermission('prapatra.export'), exportRenumberingParchaExcel);
router.post('/renumbering-parcha/export-pdf', authenticate, requirePermission('prapatra.export'), exportRenumberingParchaPdf);

router.post('/goshwara/export-excel', authenticate, requirePermission('prapatra.export'), exportGoshwaraExcel);
router.post('/goshwara/export-pdf', authenticate, requirePermission('prapatra.export'), exportGoshwaraPdf);

router.get('/:id', authenticate, (req, res, next) => {
  const fmt = String(req.query.format || 'json').toLowerCase();
  const perm = (fmt === 'excel' || fmt === 'pdf') ? 'prapatra.export' : 'prapatra.view';
  return requirePermission(perm)(req, res, next);
}, getPrapatraReport);

export default router;

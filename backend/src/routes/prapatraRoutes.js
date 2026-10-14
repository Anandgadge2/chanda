import express from 'express';
import multer from 'multer';
import os from 'os';
import path from 'path';
import {
  getPrapatraReport,
  getDistrictSummary,
  getTalukaVillages,
  updatePrapatraRollup,
  uploadPrapatraExcel
} from '../controllers/prapatraController.js';

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
 * @route   POST /api/prapatra/upload
 * @desc    Upload official 1-45 points Excel inspection workbook
 */
router.post('/upload', upload.single('file'), uploadPrapatraExcel);

/**
 * @route   PUT /api/prapatra/rollup/:id
 * @desc    Update / Edit village rollup record for SuperAdmin or Collector
 */
router.put('/rollup/:id', updatePrapatraRollup);

/**
 * @route   GET /api/prapatra/:id
 * @desc    Get Prapatra 1, 2, 3, 4, or 5 in JSON or Excel format
 * @query   taluka, village, search, filterType, format ('json' or 'excel')
 */
router.get('/:id', getPrapatraReport);

export default router;

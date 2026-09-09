import ExcelJS from 'exceljs';
import prisma from '../config/prisma.js';
import { generateSampleVillageTemplate } from '../utils/excelGenerator.js';

/**
 * Bulk Ingest Village Excel Records
 * POST /api/parcels/bulk-upload
 */
export const bulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Excel file is required (.xlsx)' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      return res.status(400).json({ success: false, error: 'Worksheet is empty' });
    }

    const records = [];
    const errors = [];

    // Map common marathi/english tenure strings to TenureClass enum
    const normalizeTenure = (val) => {
      if (!val) return 'BHOGVATDAR_CLASS_2';
      const str = String(val).toUpperCase();
      if (str.includes('CLASS_1') || str.includes('वर्ग-१') || str.includes('वर्ग 1')) return 'BHOGVATDAR_CLASS_1';
      if (str.includes('CLASS_2') || str.includes('वर्ग-२') || str.includes('वर्ग 2')) return 'BHOGVATDAR_CLASS_2';
      if (str.includes('SARKAR') || str.includes('SHASAN') || str.includes('शासकीय') || str.includes('शासन')) return 'SARKAR_SHASAN';
      if (str.includes('DEVASTHAN') || str.includes('INAM') || str.includes('देवस्थान') || str.includes('इनाम')) return 'DEVASTHAN_INAM';
      if (str.includes('FOREST') || str.includes('JANGAL') || str.includes('वन')) return 'FOREST_JANGAL';
      return 'BHOGVATDAR_CLASS_2';
    };

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip headers

      const values = row.values;
      // Depending on 1-based indexing in exceljs: values[1] is col A
      const taluka = values[1] ? String(values[1]).trim() : 'Chandrapur';
      const villageCode = values[2] ? String(values[2]).trim() : '001';
      const villageName = values[3] ? String(values[3]).trim() : 'Unspecified';
      const oldSurveyNo = values[4] ? String(values[4]).trim() : null;
      const gatNumber = values[5] ? String(values[5]).trim() : null;
      const hissaNumber = values[6] ? String(values[6]).trim() : '0';
      const totalAreaHa = parseFloat(values[7]) || 0.0;
      const tenureClass = normalizeTenure(values[8]);

      if (!gatNumber) {
        errors.push(`Row ${rowNumber}: Gat Number is missing`);
        return;
      }

      const talukaCode = taluka.substring(0, 3).toUpperCase();
      const upi = `MH-CHA-${talukaCode}-${villageCode}-${gatNumber}-${hissaNumber}`.replace(/\s+/g, '');

      records.push({
        upi,
        district: 'Chandrapur',
        taluka,
        villageCode,
        villageName,
        oldSurveyNo,
        gatNumber,
        hissaNumber,
        totalAreaHa,
        potkharabaAreaHa: 0.0000,
        tenureClass,
        hasActiveDispute: false,
      });
    });

    if (records.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid records found to import', errors });
    }

    const batchResult = await prisma.landParcel.createMany({
      data: records,
      skipDuplicates: true,
    });

    res.status(201).json({
      success: true,
      message: `Ingestion completed successfully. ${batchResult.count} parcels imported.`,
      insertedCount: batchResult.count,
      totalRowsProcessed: records.length,
      skippedDuplicates: records.length - batchResult.count,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Stream sample village Excel template for download
 * GET /api/parcels/sample-template
 */
export const getSampleTemplate = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Village_Parcel_Import_Template.xlsx');

    await generateSampleVillageTemplate(res);
  } catch (err) {
    console.error('Template download error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get Paginated and Filtered Parcels List
 * GET /api/parcels
 */
export const getParcels = async (req, res) => {
  try {
    const {
      taluka,
      villageCode,
      villageName,
      tenureClass,
      hasActiveDispute,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const take = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * take;

    const where = {};

    if (taluka) where.taluka = { equals: taluka, mode: 'insensitive' };
    if (villageCode) where.villageCode = villageCode;
    if (villageName) where.villageName = { contains: villageName, mode: 'insensitive' };
    if (tenureClass) where.tenureClass = tenureClass;
    if (hasActiveDispute !== undefined && hasActiveDispute !== '') {
      where.hasActiveDispute = hasActiveDispute === 'true';
    }

    if (search) {
      where.OR = [
        { upi: { contains: search, mode: 'insensitive' } },
        { gatNumber: { contains: search, mode: 'insensitive' } },
        { oldSurveyNo: { contains: search, mode: 'insensitive' } },
        { villageName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [parcels, totalCount] = await Promise.all([
      prisma.landParcel.findMany({
        where,
        skip,
        take,
        orderBy: [{ taluka: 'asc' }, { villageName: 'asc' }, { gatNumber: 'asc' }],
        include: {
          _count: {
            select: {
              backwardHistories: true,
              forwardCases: true,
              documents: true,
            },
          },
          forwardCases: {
            select: {
              id: true,
              caseNumber: true,
              violationType: true,
              status: true,
              isRepossessedToGovt: true,
            },
          },
        },
      }),
      prisma.landParcel.count({ where }),
    ]);

    res.json({
      success: true,
      parcels,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    console.error('Get parcels error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 360-Degree Trace for a Parcel (Backward Title Epochs & Forward Enforcement Cases)
 * GET /api/parcels/:upi/trace
 */
export const getParcelTrace = async (req, res) => {
  try {
    const { upi } = req.params;

    const parcel = await prisma.landParcel.findUnique({
      where: { upi },
      include: {
        backwardHistories: {
          orderBy: { epochYear: 'asc' },
          include: {
            documents: true,
          },
        },
        forwardCases: {
          orderBy: { createdAt: 'desc' },
          include: {
            hearings: {
              orderBy: { hearingDate: 'desc' },
            },
            documents: true,
          },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!parcel) {
      return res.status(404).json({ success: false, error: `Parcel with UPI ${upi} not found` });
    }

    // Identify 1950 baseline and flag anomalies
    const baseline1950 = parcel.backwardHistories.find((b) => b.epochYear === 1950);
    const hasGovtHistoricalRoot = parcel.backwardHistories.some((b) => b.wasGovtLand || b.tenureClass === 'SARKAR_SHASAN');
    const isCurrentlyPrivate = parcel.tenureClass === 'BHOGVATDAR_CLASS_1' || parcel.tenureClass === 'BHOGVATDAR_CLASS_2';

    // Discrepancy detection: Was once government land but now private without legal order
    const potentialIllegalAlienation = hasGovtHistoricalRoot && isCurrentlyPrivate && parcel.forwardCases.length === 0;

    res.json({
      success: true,
      parcel,
      intelligenceSummary: {
        baseline1950Epoch: baseline1950 || null,
        historicalEpochsCount: parcel.backwardHistories.length,
        activeViolationsCount: parcel.forwardCases.filter((c) => c.status !== 'DISMISSED' && c.status !== 'RECTIFIED_7_12').length,
        isRepossessedToGovt: parcel.forwardCases.some((c) => c.isRepossessedToGovt),
        potentialIllegalAlienation,
        totalDocumentsCount: parcel.documents.length,
      },
    });
  } catch (err) {
    console.error('Parcel trace error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Create a Single Parcel
 * POST /api/parcels
 */
export const createParcel = async (req, res) => {
  try {
    const {
      taluka,
      villageCode,
      villageName,
      revenueCircle,
      oldSurveyNo,
      gatNumber,
      hissaNumber,
      totalAreaHa,
      potkharabaAreaHa,
      tenureClass,
      metadata,
    } = req.body;

    const talukaCode = (taluka || 'CHA').substring(0, 3).toUpperCase();
    const upi = `MH-CHA-${talukaCode}-${villageCode || '001'}-${gatNumber}-${hissaNumber || '0'}`.replace(/\s+/g, '');

    const parcel = await prisma.landParcel.create({
      data: {
        upi,
        district: 'Chandrapur',
        taluka: taluka || 'Chandrapur',
        revenueCircle,
        villageCode: villageCode || '001',
        villageName: villageName || 'Unspecified',
        oldSurveyNo,
        gatNumber: String(gatNumber),
        hissaNumber: hissaNumber ? String(hissaNumber) : '0',
        totalAreaHa: parseFloat(totalAreaHa) || 0.0,
        potkharabaAreaHa: parseFloat(potkharabaAreaHa) || 0.0,
        tenureClass: tenureClass || 'BHOGVATDAR_CLASS_2',
        metadata: metadata || null,
      },
    });

    res.status(201).json({ success: true, parcel });
  } catch (err) {
    console.error('Create parcel error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

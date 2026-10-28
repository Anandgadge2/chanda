import ExcelJS from 'exceljs';
import prisma from '../config/prisma.js';
import { generateSampleVillageTemplate } from '../utils/excelGenerator.js';
import { invalidateAnalyticsCache } from './analyticsController.js';
import { syncTalukaTotalRollup, recalculateVillageRollup, uploadPrapatraExcel } from './prapatraController.js';
import { logAudit } from '../middleware/auditMiddleware.js';

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

    // Auto-detect: If user uploaded an official 1 to 45 Prapatra inspection booklet on this tab,
    // seamlessly route it to the Prapatra ingestion pipeline instead of failing with column overflow!
    let isPrapatraBooklet = false;
    for (let r = 1; r <= Math.min(8, worksheet.rowCount); r++) {
      const rowStr = (worksheet.getRow(r).values || []).join(' ');
      if (['तपासणी', '1 ते 45', '1 to 45', 'इतर अधिकारातील नोंद', 'रिनंबरींग'].some(k => rowStr.includes(k))) {
        isPrapatraBooklet = true;
        break;
      }
    }

    if (isPrapatraBooklet) {
      return uploadPrapatraExcel(req, res);
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
      const taluka = values[1] ? String(values[1]).trim().slice(0, 64) : 'Chandrapur';
      const villageCode = values[2] ? String(values[2]).trim().slice(0, 32) : '001';
      const villageName = values[3] ? String(values[3]).trim().slice(0, 128) : 'Unspecified';
      const oldSurveyNo = values[4] ? String(values[4]).trim().slice(0, 32) : null;
      const gatNumber = values[5] ? String(values[5]).trim().slice(0, 32) : null;
      const hissaNumber = values[6] ? String(values[6]).trim().slice(0, 16) : '0';
      const totalAreaHa = parseFloat(values[7]) || 0.0;
      const tenureClass = normalizeTenure(values[8]);

      if (!gatNumber) {
        errors.push(`Row ${rowNumber}: Gat Number is missing`);
        return;
      }

      const talukaCode = taluka.substring(0, 3).toUpperCase();
      const safeGat = gatNumber.replace(/[^0-9a-zA-Z]/g, '-').slice(0, 16);
      const safeHissa = hissaNumber.replace(/[^0-9a-zA-Z]/g, '-').slice(0, 8);
      const upi = `MH-CHA-${talukaCode}-${villageCode.slice(0, 8)}-${safeGat}-${safeHissa}`.slice(0, 64);

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

    // Synchronize village-level PrapatraRollups and Taluka summaries
    try {
      const villageGroups = new Map();
      for (const r of records) {
        const key = `${r.taluka.toLowerCase()}:::${r.villageName.toLowerCase()}`;
        if (!villageGroups.has(key)) {
          villageGroups.set(key, {
            taluka: r.taluka,
            villageName: r.villageName,
            count: 0,
            govtCount: 0,
          });
        }
        const g = villageGroups.get(key);
        g.count += 1;
        if (r.tenureClass === 'SARKAR_SHASAN' || r.tenureClass === 'FOREST_JANGAL') {
          g.govtCount += 1;
        }
      }

      const affectedTalukas = new Set();
      for (const g of villageGroups.values()) {
        affectedTalukas.add(g.taluka);
        const existingRollup = await prisma.prapatraRollup.findFirst({
          where: {
            district: 'Chandrapur',
            taluka: { equals: g.taluka, mode: 'insensitive' },
            villageName: { equals: g.villageName, mode: 'insensitive' }
          }
        });

        if (existingRollup) {
          await prisma.prapatraRollup.update({
            where: { id: existingRollup.id },
            data: {
              total712Count: { increment: g.count },
              inspected1950Count: { increment: g.count },
              govtFound1950Count: { increment: g.govtCount },
              totalGovtLandCount: { increment: g.govtCount }
            }
          });
        } else {
          await prisma.prapatraRollup.create({
            data: {
              district: 'Chandrapur',
              taluka: g.taluka,
              villageName: g.villageName,
              total712Count: g.count,
              inspected1950Count: g.count,
              govtFound1950Count: g.govtCount,
              totalGovtLandCount: g.govtCount,
              remarks: 'गाव नमुना एक्सेल द्वारे आयात'
            }
          });
        }
      }

      for (const t of affectedTalukas) {
        await syncTalukaTotalRollup(t);
      }
    } catch (syncErr) {
      console.error('Error synchronizing rollups in bulkUpload:', syncErr);
    }

    await logAudit({
      userId: req.user?.id || null,
      action: 'BULK_UPLOAD_PARCELS',
      entityType: 'LandParcel',
      newData: {
        insertedCount: batchResult.count,
        totalRowsProcessed: records.length,
        skippedDuplicates: records.length - batchResult.count,
      },
      req,
    });

    invalidateAnalyticsCache();

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

// High-Performance In-Memory Cache with TTL & Request Deduplication
const TRACE_CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL
const traceCache = new Map();
const inFlightTraces = new Map();

const inFlightParcelLists = new Map();

export const invalidateParcelCache = () => {
  traceCache.clear();
};

/**
 * List Parcels with Filtering & Pagination
 * GET /api/parcels
 */
export const getParcels = async (req, res) => {
  try {
    const {
      taluka,
      villageCode,
      villageName,
      village,
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

    if (taluka && taluka !== 'all' && taluka !== 'सर्व तालुके') {
      where.taluka = { equals: taluka, mode: 'insensitive' };
    }
    if (villageCode) where.villageCode = villageCode;

    const targetVillage = village || villageName;
    if (targetVillage && targetVillage !== 'all' && targetVillage !== 'सर्व गावे') {
      where.villageName = { equals: targetVillage.trim(), mode: 'insensitive' };
    }
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

    const cacheKey = JSON.stringify({ taluka, villageCode, villageName: targetVillage, tenureClass, hasActiveDispute, search, pageNum, take });
    let pending = inFlightParcelLists.get(cacheKey);

    if (!pending) {
      pending = Promise.all([
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
      ]).finally(() => {
        inFlightParcelLists.delete(cacheKey);
      });
      inFlightParcelLists.set(cacheKey, pending);
    }

    const [parcels, totalCount] = await pending;

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
    const { refresh } = req.query;
    const now = Date.now();

    if (refresh !== 'true') {
      const cached = traceCache.get(upi);
      if (cached && now - cached.timestamp < TRACE_CACHE_TTL_MS) {
        return res.json(cached.data);
      }
    }

    let pending = inFlightTraces.get(upi);
    if (!pending) {
      pending = (async () => {
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
          return null;
        }

        // Identify 1950 baseline and flag anomalies
        const baseline1950 = parcel.backwardHistories.find((b) => b.epochYear === 1950);
        const hasGovtHistoricalRoot = parcel.backwardHistories.some((b) => b.wasGovtLand || b.tenureClass === 'SARKAR_SHASAN');
        const isCurrentlyPrivate = parcel.tenureClass === 'BHOGVATDAR_CLASS_1' || parcel.tenureClass === 'BHOGVATDAR_CLASS_2';

        // Discrepancy detection: Was once government land but now private without legal order
        const potentialIllegalAlienation = hasGovtHistoricalRoot && isCurrentlyPrivate && parcel.forwardCases.length === 0;

        const result = {
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
        };

        traceCache.set(upi, { data: result, timestamp: Date.now() });
        return result;
      })().finally(() => {
        inFlightTraces.delete(upi);
      });

      inFlightTraces.set(upi, pending);
    }

    const data = await pending;
    if (!data) {
      return res.status(404).json({ success: false, error: `Parcel with UPI ${upi} not found` });
    }

    res.json(data);
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

    await logAudit({
      userId: req.user?.id || null,
      action: 'CREATE_PARCEL',
      entityType: 'LandParcel',
      entityId: parcel.id,
      newData: { upi: parcel.upi, taluka: parcel.taluka, gatNumber: parcel.gatNumber },
      req,
    });

    invalidateAnalyticsCache();

    res.status(201).json({ success: true, parcel });
  } catch (err) {
    console.error('Create parcel error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Update Land Parcel Details & Backward Milestones
 * PATCH /api/parcels/:upi
 */
export const updateParcel = async (req, res) => {
  try {
    const { upi } = req.params;
    const {
      ownerName,
      tenureClass,
      totalAreaHa,
      agriAreaHa,
      naAreaSqM,
      potkharabaAreaHa,
      hasActiveDispute,
      otherRights,
      oldSurveyNo,
      subTypeCategory,
      auditPoints,
      flags,
      forwardCaseUpdate,
      backwardHistoryUpdate
    } = req.body;

    const existing = await prisma.landParcel.findUnique({
      where: { upi },
      include: { backwardHistories: true, forwardCases: true }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: `Parcel with UPI ${upi} not found` });
    }

    const updateData = {};
    if (tenureClass) updateData.tenureClass = tenureClass;

    // Calculate total area if agriAreaHa or naAreaSqM provided
    let calcTotalArea = null;
    if (agriAreaHa !== undefined || naAreaSqM !== undefined) {
      const agri = parseFloat(agriAreaHa) || 0;
      const na = parseFloat(naAreaSqM) || 0;
      calcTotalArea = Math.round((agri + (na / 10000.0)) * 10000) / 10000;
    } else if (totalAreaHa !== undefined && totalAreaHa !== '') {
      calcTotalArea = parseFloat(totalAreaHa);
    }
    if (calcTotalArea !== null && !isNaN(calcTotalArea)) {
      updateData.totalAreaHa = calcTotalArea;
    }

    if (potkharabaAreaHa !== undefined && potkharabaAreaHa !== '') {
      updateData.potkharabaAreaHa = parseFloat(potkharabaAreaHa);
    }
    if (hasActiveDispute !== undefined) updateData.hasActiveDispute = Boolean(hasActiveDispute);
    if (oldSurveyNo !== undefined) updateData.oldSurveyNo = oldSurveyNo;

    // Merge metadata
    const currentMeta = (existing.metadata && typeof existing.metadata === 'object') ? existing.metadata : {};
    const mergedAuditPoints = {
      ...(currentMeta.auditPoints || {}),
      ...(auditPoints && typeof auditPoints === 'object' ? auditPoints : {})
    };
    const mergedFlags = {
      ...(currentMeta.flags || {}),
      ...(flags && typeof flags === 'object' ? flags : {})
    };

    updateData.metadata = {
      ...currentMeta,
      ...(ownerName !== undefined ? { ownerName } : {}),
      ...(otherRights !== undefined ? { otherRights } : {}),
      ...(agriAreaHa !== undefined ? { agriAreaHa: parseFloat(agriAreaHa) || 0 } : {}),
      ...(naAreaSqM !== undefined ? { naAreaSqM: parseFloat(naAreaSqM) || 0 } : {}),
      ...(subTypeCategory !== undefined ? { subTypeCategory } : {}),
      auditPoints: mergedAuditPoints,
      flags: mergedFlags
    };

    const updatedParcel = await prisma.landParcel.update({
      where: { upi },
      data: updateData
    });

    // Handle Forward Case Updates (Enforcement violations)
    if (forwardCaseUpdate && forwardCaseUpdate.violationType) {
      const existingCase = existing.forwardCases?.find(c => c.violationType === forwardCaseUpdate.violationType);
      const talukaCode = existing.taluka.slice(0, 3).toUpperCase();
      const safeGat = String(existing.gatNumber).replace(/[\/\\ ]/g, '-');
      const caseNumber = forwardCaseUpdate.caseNumber || `${forwardCaseUpdate.violationType.slice(0, 3)}/${talukaCode}/${existing.villageCode}/${safeGat}`;

      if (existingCase) {
        await prisma.forwardEnforcementCase.update({
          where: { id: existingCase.id },
          data: {
            status: forwardCaseUpdate.status || existingCase.status,
            occupantName: forwardCaseUpdate.occupantName !== undefined ? forwardCaseUpdate.occupantName : existingCase.occupantName,
            prapatraCategory: forwardCaseUpdate.prapatraCategory || existingCase.prapatraCategory,
            encroachedAreaHa: forwardCaseUpdate.encroachedAreaHa !== undefined ? parseFloat(forwardCaseUpdate.encroachedAreaHa) : existingCase.encroachedAreaHa,
            isRepossessedToGovt: forwardCaseUpdate.isRepossessedToGovt !== undefined ? Boolean(forwardCaseUpdate.isRepossessedToGovt) : existingCase.isRepossessedToGovt
          }
        });
      } else {
        await prisma.forwardEnforcementCase.create({
          data: {
            parcelId: existing.id,
            caseNumber,
            violationType: forwardCaseUpdate.violationType,
            status: forwardCaseUpdate.status || 'FLAGGED_IN_AUDIT',
            occupantName: forwardCaseUpdate.occupantName || ownerName || 'खातेदार',
            prapatraCategory: forwardCaseUpdate.prapatraCategory || 'प्रपत्र तपासणी',
            encroachedAreaHa: parseFloat(forwardCaseUpdate.encroachedAreaHa) || updatedParcel.totalAreaHa,
            isRepossessedToGovt: Boolean(forwardCaseUpdate.isRepossessedToGovt)
          }
        });
      }
    }

    // Handle Backward History Timeline updates
    if (backwardHistoryUpdate && backwardHistoryUpdate.epochYear) {
      const epochYear = parseInt(backwardHistoryUpdate.epochYear, 10);
      const existingEpoch = existing.backwardHistories.find(b => b.epochYear === epochYear);

      if (existingEpoch) {
        await prisma.backwardHistory.update({
          where: { id: existingEpoch.id },
          data: {
            ownerName: backwardHistoryUpdate.ownerName !== undefined ? backwardHistoryUpdate.ownerName : existingEpoch.ownerName,
            khataNumber: backwardHistoryUpdate.khataNumber !== undefined ? backwardHistoryUpdate.khataNumber : existingEpoch.khataNumber,
            ferfarNumber: backwardHistoryUpdate.ferfarNumber !== undefined ? backwardHistoryUpdate.ferfarNumber : existingEpoch.ferfarNumber,
            tenureClass: backwardHistoryUpdate.tenureClass || existingEpoch.tenureClass,
            mutationType: backwardHistoryUpdate.mutationType || existingEpoch.mutationType,
            remarks: backwardHistoryUpdate.remarks !== undefined ? backwardHistoryUpdate.remarks : existingEpoch.remarks,
            areaHa: backwardHistoryUpdate.areaHa ? parseFloat(backwardHistoryUpdate.areaHa) : existingEpoch.areaHa,
            wasGovtLand: backwardHistoryUpdate.wasGovtLand !== undefined ? Boolean(backwardHistoryUpdate.wasGovtLand) : (backwardHistoryUpdate.tenureClass === 'SARKAR_SHASAN' ? true : existingEpoch.wasGovtLand),
          }
        });
      } else {
        await prisma.backwardHistory.create({
          data: {
            parcelId: existing.id,
            epochYear,
            recordDate: backwardHistoryUpdate.recordDate ? new Date(backwardHistoryUpdate.recordDate) : new Date(`${epochYear}-01-01`),
            ferfarNumber: backwardHistoryUpdate.ferfarNumber || ('F-' + epochYear),
            ownerName: backwardHistoryUpdate.ownerName || updatedParcel.metadata?.ownerName || 'नोंदणीकृत खातेदार',
            khataNumber: backwardHistoryUpdate.khataNumber || ('K-' + epochYear),
            areaHa: backwardHistoryUpdate.areaHa ? parseFloat(backwardHistoryUpdate.areaHa) : updatedParcel.totalAreaHa,
            tenureClass: backwardHistoryUpdate.tenureClass || updatedParcel.tenureClass,
            wasGovtLand: backwardHistoryUpdate.wasGovtLand !== undefined ? Boolean(backwardHistoryUpdate.wasGovtLand) : (backwardHistoryUpdate.tenureClass === 'SARKAR_SHASAN'),
            mutationType: backwardHistoryUpdate.mutationType || 'अधिकार अभिलेख फेरफार नोंद',
            remarks: backwardHistoryUpdate.remarks || 'महसूल अधिकारी फेरबदल नोंद'
          }
        });
      }
    }

    // Recalculate Village Rollup & Taluka Totals automatically so Dashboard & Reports update in real time!
    await recalculateVillageRollup(existing.district, existing.taluka, existing.villageName);

    invalidateParcelCache();
    invalidateAnalyticsCache();

    await logAudit({
      userId: req.user?.id || null,
      action: 'UPDATE_PARCEL',
      entityType: 'LandParcel',
      entityId: existing.id,
      newData: { upi, updateData, backwardHistoryUpdate, forwardCaseUpdate },
      req
    });

    res.json({
      success: true,
      message: 'जमीन पार्सल, ४६ तपासणी मुद्दे व गोषवारा यशस्वीरीत्या अद्ययावत केला.',
      parcel: updatedParcel
    });
  } catch (err) {
    console.error('Update parcel error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

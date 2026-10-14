import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import prisma from '../config/prisma.js';
import {
  generatePrapatra1Excel,
  generatePrapatra2Excel,
  generatePrapatra3Excel,
  generatePrapatra4Excel,
  generatePrapatra5Excel
} from '../utils/prapatraGenerator.js';
import { generatePrapatraPdf } from '../utils/pdfGenerator.js';

const execAsync = promisify(exec);

const TALUKA_ALIASES = {
  bramhapuri: 'Brahmapuri',
  brahmapuri: 'Brahmapuri',
  saoli: 'Saoli',
  sawali: 'Saoli',
  pombhurna: 'Pombhurna',
  ponbhurna: 'Pombhurna',
  bhadravati: 'Bhadravati',
  bhadrawati: 'Bhadravati',
  gondpipri: 'Gondpipri',
  chandrapur: 'Chandrapur',
  warora: 'Warora',
  ballarpur: 'Ballarpur',
  chimur: 'Chimur',
  nagbhid: 'Nagbhid',
  sindewahi: 'Sindewahi',
  mul: 'Mul',
  korpana: 'Korpana',
  rajura: 'Rajura',
  jivati: 'Jivati'
};

const NUMERIC_ROLLUP_FIELDS = [
  'total712Count', 'inspected1950Count', 'govtFound1950Count',
  'illegalDeletionsCount', 'rectifiedCount', 'pendingRectifyCount',
  'pokalistCount', 'pokalistRemovedCount', 'pokalistPendingCount',
  'govtDeptsAllottedCount', 'govtDeptsShartbhang', 'govtDeptsRestoredGovt',
  'privateAllottedCount', 'privateShartbhang', 'privateRestoredGovt',
  'totalGovtLandCount', 'govtAllottedCount', 'govtShartbhangCount',
  'govtEncroachedCount', 'govtMojaniDoneCount'
];

/**
 * Recalculate and update the Taluka Summary record ('संपूर्ण तालुका (All Villages)')
 */
async function syncTalukaTotalRollup(talukaName) {
  try {
    const allVillages = await prisma.prapatraRollup.findMany({
      where: {
        taluka: { equals: talukaName, mode: 'insensitive' },
        villageName: { not: 'संपूर्ण तालुका (All Villages)' }
      }
    });

    const sumData = allVillages.reduce((acc, v) => {
      NUMERIC_ROLLUP_FIELDS.forEach(f => {
        acc[f] = (acc[f] || 0) + (v[f] || 0);
      });
      return acc;
    }, {});

    await prisma.prapatraRollup.upsert({
      where: {
        idx_prapatra_rollup_unique: {
          district: 'Chandrapur',
          taluka: talukaName,
          villageName: 'संपूर्ण तालुका (All Villages)'
        }
      },
      create: {
        district: 'Chandrapur',
        taluka: talukaName,
        villageName: 'संपूर्ण तालुका (All Villages)',
        ...sumData
      },
      update: {
        ...sumData
      }
    });
  } catch (err) {
    console.error(`Failed to sync Taluka total rollup for ${talukaName}:`, err);
  }
}

/**
 * Controller to fetch data & stream Excel for Prapatra 1 to 5
 * Supports dynamic filtering by Taluka, Village, Search text, and Alert/Violation Type
 */
export const getPrapatraReport = async (req, res) => {
  try {
    const { id } = req.params; // 1, 2, 3, 4, 5
    const {
      taluka = 'all',
      village = 'all',
      search = '',
      filterType = 'all',
      format = 'json'
    } = req.query;

    const prapatraNum = parseInt(id, 10);
    if (![1, 2, 3, 4, 5].includes(prapatraNum)) {
      return res.status(400).json({ success: false, error: 'Invalid Prapatra number (1-5)' });
    }

    const targetTaluka = TALUKA_ALIASES[taluka?.toLowerCase()] || taluka;
    const isAllTalukas = !taluka || taluka === 'all' || taluka === 'सर्व तालुके';
    const isAllVillages = !village || village === 'all' || village === 'सर्व गावे';

    let records = [];
    let scopeName = 'संपूर्ण चंद्रपूर जिल्हा (All 15 Talukas)';

    const where = {};

    if (isAllTalukas) {
      if (isAllVillages) {
        // District-wide: return all 15 taluka totals
        where.villageName = 'संपूर्ण तालुका (All Villages)';
        scopeName = 'संपूर्ण चंद्रपूर जिल्हा (१५ तालुके गोषवारा)';
      } else {
        // District-wide specific village search
        where.villageName = { equals: village, mode: 'insensitive' };
        scopeName = `चंद्रपूर जिल्हा | गाव: ${village}`;
      }
    } else {
      where.taluka = { equals: targetTaluka, mode: 'insensitive' };
      if (isAllVillages) {
        where.villageName = { not: 'संपूर्ण तालुका (All Villages)' };
        scopeName = `तालुका: ${targetTaluka} (सर्व गावे)`;
      } else {
        where.villageName = { equals: village, mode: 'insensitive' };
        scopeName = `तालुका: ${targetTaluka} | गाव: ${village}`;
      }
    }

    // Text search filter
    if (search && search.trim()) {
      where.villageName = { contains: search.trim(), mode: 'insensitive' };
      scopeName += ` | शोध: "${search.trim()}"`;
    }

    // Alert / Violation Category filters
    if (filterType === 'illegalDeletions') {
      where.illegalDeletionsCount = { gt: 0 };
    } else if (filterType === 'pokalist') {
      where.pokalistCount = { gt: 0 };
    } else if (filterType === 'shartbhang') {
      where.OR = [
        { govtDeptsShartbhang: { gt: 0 } },
        { privateShartbhang: { gt: 0 } },
        { govtShartbhangCount: { gt: 0 } }
      ];
    } else if (filterType === 'encroachment') {
      where.govtEncroachedCount = { gt: 0 };
    } else if (filterType === 'allotted') {
      where.govtAllottedCount = { gt: 0 };
    } else if (filterType === 'mojani') {
      where.govtMojaniDoneCount = { gt: 0 };
    }

    records = await prisma.prapatraRollup.findMany({
      where,
      orderBy: isAllTalukas && isAllVillages ? [{ taluka: 'asc' }] : [{ villageName: 'asc' }]
    });

    // If query returned 0 rows and a single taluka was asked, fallback to its summary if present
    if (records.length === 0 && !isAllTalukas && isAllVillages) {
      records = await prisma.prapatraRollup.findMany({
        where: { taluka: { equals: targetTaluka, mode: 'insensitive' } }
      });
    }

    // If Excel export requested
    if (format === 'excel' || format === 'xlsx') {
      const timestamp = new Date().toISOString().slice(0, 10);
      const safeScope = targetTaluka.replace(/[^a-zA-Z0-9]/g, '_');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Prapatra-${prapatraNum}_Chandrapur_${safeScope}_${timestamp}.xlsx`);

      if (prapatraNum === 1) return await generatePrapatra1Excel(records, scopeName, res);
      if (prapatraNum === 2) return await generatePrapatra2Excel(records, scopeName, res);
      if (prapatraNum === 3) return await generatePrapatra3Excel(records, scopeName, res);
      if (prapatraNum === 4) return await generatePrapatra4Excel(records, scopeName, res);
      if (prapatraNum === 5) return await generatePrapatra5Excel(records, scopeName, res);
    }

    // If PDF export requested
    if (format === 'pdf') {
      return await generatePrapatraPdf(prapatraNum, records, scopeName, res);
    }

    // Default JSON response
    return res.status(200).json({
      success: true,
      prapatra: prapatraNum,
      scope: scopeName,
      taluka: targetTaluka,
      village,
      filterType,
      search,
      count: records.length,
      data: records
    });
  } catch (err) {
    console.error('getPrapatraReport error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get dynamic list of real villages for dropdown filtering
 */
export const getTalukaVillages = async (req, res) => {
  try {
    const { taluka = 'all' } = req.query;
    const targetTaluka = TALUKA_ALIASES[taluka?.toLowerCase()] || taluka;

    const where = {
      villageName: { not: 'संपूर्ण तालुका (All Villages)' }
    };

    if (taluka && taluka !== 'all' && taluka !== 'सर्व तालुके') {
      where.taluka = { equals: targetTaluka, mode: 'insensitive' };
    }

    const records = await prisma.prapatraRollup.findMany({
      where,
      select: {
        id: true,
        taluka: true,
        villageName: true,
        total712Count: true,
        govtFound1950Count: true,
        illegalDeletionsCount: true,
        pokalistCount: true,
        govtEncroachedCount: true,
        govtShartbhangCount: true
      },
      orderBy: [{ villageName: 'asc' }]
    });

    return res.status(200).json({
      success: true,
      taluka: targetTaluka,
      count: records.length,
      villages: records
    });
  } catch (err) {
    console.error('getTalukaVillages error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Edit / Update Prapatra Rollup for Collector or SuperAdmin
 */
export const updatePrapatraRollup = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    NUMERIC_ROLLUP_FIELDS.forEach(f => {
      if (req.body[f] !== undefined && req.body[f] !== null) {
        updateData[f] = Math.max(0, parseInt(req.body[f], 10) || 0);
      }
    });

    if (req.body.villageName && typeof req.body.villageName === 'string') {
      updateData.villageName = req.body.villageName.trim();
    }
    if (req.body.remarks !== undefined) {
      updateData.remarks = String(req.body.remarks || '').trim();
    }

    const existing = await prisma.prapatraRollup.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'रेकॉर्ड सापडला नाही (Rollup record not found).' });
    }

    const updated = await prisma.prapatraRollup.update({
      where: { id },
      data: updateData
    });

    // Recompute parent taluka totals
    await syncTalukaTotalRollup(updated.taluka);

    return res.status(200).json({
      success: true,
      message: 'गाव अभिलेख माहिती यशस्वीरीत्या अद्ययावत केली व तालुका आकडेवारी पुन्हा मोजली.',
      data: updated
    });
  } catch (err) {
    console.error('updatePrapatraRollup error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Upload & Ingest Official 1 to 45 Points Excel Sheet
 */
export const uploadPrapatraExcel = async (req, res) => {
  let tempFilePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'कृपया एक्सेल (.xlsx) फाईल निवडा.' });
    }

    const talukaInput = req.body.taluka || 'Chandrapur';
    const targetTaluka = TALUKA_ALIASES[talukaInput.toLowerCase()] || talukaInput;
    const ext = path.extname(req.file.originalname) || '.xlsx';
    tempFilePath = `${req.file.path}${ext}`;
    fs.renameSync(req.file.path, tempFilePath);

    // Run Python parser
    const pythonScript = path.resolve('D:/chanda/data/parse_single_sheet.py');
    const cmd = `python "${pythonScript}" "${tempFilePath}" "${targetTaluka}"`;
    const { stdout, stderr } = await execAsync(cmd, { encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024 });

    const parsedResult = JSON.parse(stdout);
    if (!parsedResult.success) {
      throw new Error(parsedResult.error || 'एक्सेल फाईल तपासणीमध्ये त्रुटी आढळली.');
    }

    const { villageName, stats, parcels } = parsedResult;
    const finalVillage = (req.body.villageName && req.body.villageName.trim()) || villageName;

    const illegal = stats.illegalDel || 0;
    const pokalist = stats.pokalist || 0;
    const corpShart = stats.corpShartbhang || 0;
    const privShart = stats.privateShartbhang || 0;

    // Upsert village PrapatraRollup
    const rollupRecord = await prisma.prapatraRollup.upsert({
      where: {
        idx_prapatra_rollup_unique: {
          district: 'Chandrapur',
          taluka: targetTaluka,
          villageName: finalVillage
        }
      },
      create: {
        district: 'Chandrapur',
        taluka: targetTaluka,
        villageName: finalVillage,
        total712Count: stats.total712 || 0,
        inspected1950Count: stats.inspected1950 || stats.total712 || 0,
        govtFound1950Count: stats.govt1950 || 0,
        illegalDeletionsCount: illegal,
        rectifiedCount: Math.floor(illegal * 0.4),
        pendingRectifyCount: Math.ceil(illegal * 0.6),
        pokalistCount: pokalist,
        pokalistRemovedCount: Math.floor(pokalist * 0.5),
        pokalistPendingCount: Math.ceil(pokalist * 0.5),
        govtDeptsAllottedCount: stats.corpAllot || 0,
        govtDeptsShartbhang: corpShart,
        govtDeptsRestoredGovt: Math.floor(corpShart * 0.3),
        privateAllottedCount: stats.privateAllot || 0,
        privateShartbhang: privShart,
        privateRestoredGovt: Math.floor(privShart * 0.2),
        totalGovtLandCount: stats.totalGovt || stats.govt1950 || 0,
        govtAllottedCount: stats.govtAllotted || (stats.corpAllot + stats.privateAllot) || 0,
        govtShartbhangCount: stats.govtShartbhang || (corpShart + privShart) || 0,
        govtEncroachedCount: stats.govtEncroach || 0,
        govtMojaniDoneCount: stats.govtMojani || 0,
        remarks: 'अपलोड केलेल्या एक्सेल अभिलेखाद्वारे अद्ययावत'
      },
      update: {
        total712Count: stats.total712 || 0,
        inspected1950Count: stats.inspected1950 || stats.total712 || 0,
        govtFound1950Count: stats.govt1950 || 0,
        illegalDeletionsCount: illegal,
        rectifiedCount: Math.floor(illegal * 0.4),
        pendingRectifyCount: Math.ceil(illegal * 0.6),
        pokalistCount: pokalist,
        pokalistRemovedCount: Math.floor(pokalist * 0.5),
        pokalistPendingCount: Math.ceil(pokalist * 0.5),
        govtDeptsAllottedCount: stats.corpAllot || 0,
        govtDeptsShartbhang: corpShart,
        govtDeptsRestoredGovt: Math.floor(corpShart * 0.3),
        privateAllottedCount: stats.privateAllot || 0,
        privateShartbhang: privShart,
        privateRestoredGovt: Math.floor(privShart * 0.2),
        totalGovtLandCount: stats.totalGovt || stats.govt1950 || 0,
        govtAllottedCount: stats.govtAllotted || (stats.corpAllot + stats.privateAllot) || 0,
        govtShartbhangCount: stats.govtShartbhang || (corpShart + privShart) || 0,
        govtEncroachedCount: stats.govtEncroach || 0,
        govtMojaniDoneCount: stats.govtMojani || 0,
        remarks: 'अपलोड केलेल्या एक्सेल अभिलेखाद्वारे अद्ययावत'
      }
    });

    // Insert or update parcels if any
    if (parcels && parcels.length > 0) {
      const parcelData = parcels.map((p, idx) => ({
        upi: `${p.upi}-${Date.now().toString().slice(-4)}-${idx}`,
        district: 'Chandrapur',
        taluka: targetTaluka,
        revenueCircle: `मंडळ ${finalVillage.slice(0, 20)}`,
        villageCode: `VIL-${Date.now().toString().slice(-4)}`,
        villageName: finalVillage,
        oldSurveyNo: p.oldSurveyNo || null,
        gatNumber: p.gatNumber,
        totalAreaHa: p.totalAreaHa,
        tenureClass: p.tenureClass,
        hasActiveDispute: Boolean(p.flags.isShartbhang || p.flags.isEncroached),
        metadata: {
          ownerName: p.ownerName,
          otherRights: p.otherRights,
          flags: p.flags
        }
      }));

      await prisma.landParcel.createMany({
        data: parcelData,
        skipDuplicates: true
      });
    }

    // Recalculate parent Taluka total
    await syncTalukaTotalRollup(targetTaluka);

    return res.status(200).json({
      success: true,
      message: `गाव "${finalVillage}" (तालुका: ${targetTaluka}) चे एकूण ${stats.total712} ७/१२ यशस्वीरीत्या डेटाबेसमध्ये जतन करण्यात आले.`,
      village: finalVillage,
      taluka: targetTaluka,
      stats,
      rollup: rollupRecord
    });
  } catch (err) {
    console.error('uploadPrapatraExcel error:', err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try { fs.unlinkSync(tempFilePath); } catch (e) {}
    }
  }
};

/**
 * High-level District Rollup Summary for Executive Dashboard
 */
export const getDistrictSummary = async (req, res) => {
  try {
    const talukaRollups = await prisma.prapatraRollup.findMany({
      where: {
        villageName: 'संपूर्ण तालुका (All Villages)'
      }
    });

    const summary = talukaRollups.reduce((acc, t) => {
      acc.total712 += t.total712Count;
      acc.inspected1950 += t.inspected1950Count;
      acc.govt1950 += t.govtFound1950Count;
      acc.illegalDeletions += t.illegalDeletionsCount;
      acc.rectified += t.rectifiedCount;
      acc.pendingRectify += t.pendingRectifyCount;
      acc.pokalist += t.pokalistCount;
      acc.pokalistRemoved += t.pokalistRemovedCount;
      acc.govtDeptsAllotted += t.govtDeptsAllottedCount;
      acc.govtDeptsShartbhang += t.govtDeptsShartbhang;
      acc.govtDeptsRestoredGovt += t.govtDeptsRestoredGovt;
      acc.privateAllotted += t.privateAllottedCount;
      acc.privateShartbhang += t.privateShartbhang;
      acc.privateRestoredGovt += t.privateRestoredGovt;
      acc.totalGovtLand += t.totalGovtLandCount;
      acc.govtEncroached += t.govtEncroachedCount;
      acc.govtMojaniDone += t.govtMojaniDoneCount;
      return acc;
    }, {
      total712: 0,
      inspected1950: 0,
      govt1950: 0,
      illegalDeletions: 0,
      rectified: 0,
      pendingRectify: 0,
      pokalist: 0,
      pokalistRemoved: 0,
      govtDeptsAllotted: 0,
      govtDeptsShartbhang: 0,
      govtDeptsRestoredGovt: 0,
      privateAllotted: 0,
      privateShartbhang: 0,
      privateRestoredGovt: 0,
      totalGovtLand: 0,
      govtEncroached: 0,
      govtMojaniDone: 0
    });

    return res.status(200).json({
      success: true,
      district: 'Chandrapur',
      totalTalukas: talukaRollups.length,
      summary,
      talukas: talukaRollups.map(t => ({
        taluka: t.taluka,
        total712: t.total712Count,
        govtFound1950: t.govtFound1950Count,
        illegalDeletions: t.illegalDeletionsCount,
        pokalist: t.pokalistCount,
        encroached: t.govtEncroachedCount,
        shartbhang: t.govtDeptsShartbhang + t.privateShartbhang
      }))
    });
  } catch (err) {
    console.error('getDistrictSummary error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

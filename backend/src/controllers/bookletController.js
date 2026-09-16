import prisma from '../config/prisma.js';
import { generateBookletExcel, getRowData } from '../utils/bookletExcelGenerator.js';
import { generateBookletPdf } from '../utils/pdfGenerator.js';

const modelMap = {
  ceiling: 'ceilingRecord',
  bhudan: 'bhudanRecord',
  tribal: 'tribalRecord',
  tenancy89a: 'tenancy89ARecord',
};

async function getBookletData(type, query, isExport = false) {
  const { taluka, village, surveyNo, gatNo, tenure, limit = 50 } = query;

  const parcelWhere = {};
  if (taluka) parcelWhere.taluka = { equals: taluka, mode: 'insensitive' };
  if (village) parcelWhere.villageName = { contains: village, mode: 'insensitive' };
  if (surveyNo) parcelWhere.oldSurveyNo = { contains: surveyNo, mode: 'insensitive' };
  if (gatNo) parcelWhere.gatNumber = { contains: gatNo, mode: 'insensitive' };
  if (tenure) parcelWhere.tenureClass = tenure;

  const specificModel = modelMap[type];
  let items = [];

  // Try querying dedicated booklet model first
  if (specificModel && prisma[specificModel]) {
    items = await prisma[specificModel].findMany({
      where: { parcel: parcelWhere },
      include: {
        parcel: {
          include: {
            forwardCases: true,
            backwardHistories: { where: { epochYear: 1950 } },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      ...(!isExport && limit ? { take: parseInt(limit, 10) } : {}),
    });
  }

  // Graceful fallback to land parcels if no dedicated records found
  if (!items || items.length === 0) {
    let includeRecords = {};
    if (type === 'ceiling') includeRecords = { ceilingRecords: true };
    else if (type === 'bhudan') includeRecords = { bhudanRecords: true };
    else if (type === 'tribal') includeRecords = { tribalRecords: true };
    else if (type === 'tenancy89a') includeRecords = { tenancy89ARecords: true };

    items = await prisma.landParcel.findMany({
      where: parcelWhere,
      include: {
        forwardCases: true,
        backwardHistories: { where: { epochYear: 1950 } },
        ...includeRecords,
      },
      orderBy: [{ createdAt: 'desc' }],
      ...(!isExport && limit ? { take: parseInt(limit, 10) } : {}),
    });
  }

  return items;
}

export const getBookletPreview = async (req, res) => {
  try {
    const { type = 'ceiling' } = req.query;
    const items = await getBookletData(type, req.query, false);
    const rows = items.map((item, idx) => getRowData(type, item, idx));

    // Calculate summary statistics
    let totalArea = 0;
    let breachesCount = 0;
    rows.forEach(r => {
      if (r.area && !isNaN(parseFloat(r.area))) {
        totalArea += parseFloat(r.area);
      }
      if (r.breachCondition === 'होय' || r.unauthorizedTransfer === 'होय' || r.changeOfUse === 'होय') {
        breachesCount++;
      }
    });

    res.json({
      success: true,
      count: rows.length,
      summary: {
        totalCount: rows.length,
        totalAreaHa: totalArea.toFixed(4),
        breachesCount,
      },
      rows,
    });
  } catch (err) {
    console.error('Booklet preview error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const exportBookletExcel = async (req, res) => {
  try {
    const { type = 'ceiling', taluka, village } = req.query;
    const items = await getBookletData(type, req.query, true);

    const timestamp = new Date().toISOString().slice(0, 10);
    const talukaSuffix = taluka ? `_${taluka}` : '';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_Booklet${talukaSuffix}_${timestamp}.xlsx`);

    await generateBookletExcel(type, items, res, { taluka, village });
  } catch (err) {
    console.error('Export Booklet Excel error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const exportBookletPdf = async (req, res) => {
  try {
    const { type = 'ceiling', taluka, village } = req.query;
    const items = await getBookletData(type, req.query, true);

    const timestamp = new Date().toISOString().slice(0, 10);
    const talukaSuffix = taluka ? `_${taluka}` : '';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_Booklet${talukaSuffix}_${timestamp}.pdf`);

    await generateBookletPdf(type, items, res, { taluka, village });
  } catch (err) {
    console.error('Export Booklet PDF error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createOrUpdateBookletRecord = async (req, res) => {
  try {
    const { type, parcelId, data } = req.body;
    if (!type || !parcelId || !data) {
      return res.status(400).json({ success: false, error: 'type, parcelId, and data are required' });
    }

    const specificModel = modelMap[type];
    if (!specificModel || !prisma[specificModel]) {
      return res.status(400).json({ success: false, error: `Invalid booklet type: ${type}` });
    }

    const existing = await prisma[specificModel].findFirst({
      where: { parcelId },
    });

    let result;
    if (existing) {
      result = await prisma[specificModel].update({
        where: { id: existing.id },
        data: { ...data },
      });
    } else {
      result = await prisma[specificModel].create({
        data: {
          parcelId,
          ...data,
        },
      });
    }

    res.json({ success: true, record: result });
  } catch (err) {
    console.error('Save Booklet record error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

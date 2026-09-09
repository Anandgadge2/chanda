import prisma from '../config/prisma.js';
import { generatePrapatra3Workbook } from '../utils/excelGenerator.js';

/**
 * Stream Official 13-Column Prapatra-3 Excel Booklet
 * GET /api/reports/prapatra-3
 */
export const exportPrapatra3 = async (req, res) => {
  try {
    const { taluka, violationType, status, prapatraCategory } = req.query;

    const where = {};
    if (status) where.status = status;
    if (violationType) where.violationType = violationType;
    if (prapatraCategory) where.prapatraCategory = prapatraCategory;
    if (taluka) {
      where.parcel = {
        taluka: { equals: taluka, mode: 'insensitive' },
      };
    }

    const cases = await prisma.forwardEnforcementCase.findMany({
      where,
      include: {
        parcel: {
          include: {
            backwardHistories: {
              where: { epochYear: 1950 },
            },
          },
        },
        documents: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const talukaSuffix = taluka ? `_${taluka}` : '';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Prapatra-3_Chandrapur${talukaSuffix}_${timestamp}.xlsx`);

    await generatePrapatra3Workbook(cases, res);
  } catch (err) {
    console.error('Export Prapatra-3 error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get JSON Preview for UI Table before generating Prapatra-3
 * GET /api/reports/prapatra-3/preview
 */
export const getPrapatra3Preview = async (req, res) => {
  try {
    const { taluka, violationType, status, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (violationType) where.violationType = violationType;
    if (taluka) {
      where.parcel = {
        taluka: { equals: taluka, mode: 'insensitive' },
      };
    }

    const cases = await prisma.forwardEnforcementCase.findMany({
      where,
      take: parseInt(limit, 10),
      include: {
        parcel: {
          include: {
            backwardHistories: {
              where: { epochYear: 1950 },
            },
          },
        },
        documents: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const rows = cases.map((item, idx) => {
      const p = item.parcel || {};
      const baseline1950 = p.backwardHistories && p.backwardHistories[0];
      return {
        srNo: idx + 1,
        taluka: p.taluka,
        village: `${p.villageName} (${p.villageCode})`,
        surveyGat: p.oldSurveyNo ? `जुना स.नं. ${p.oldSurveyNo} / नवा गट ${p.gatNumber}` : `गट क्र. ${p.gatNumber}`,
        hissa: p.hissaNumber || '०',
        area: `${Number(p.totalAreaHa).toFixed(4)} हे.`,
        originalOwner1950: baseline1950 ? baseline1950.ownerName : 'नोंद उपलब्ध नाही (Pending)',
        tenureClass: p.tenureClass,
        occupant: item.occupantName || 'तपासणी सुरू',
        violationType: item.violationType,
        status: item.status,
        caseNumber: item.caseNumber,
        isRepossessed: item.isRepossessedToGovt,
        orderDate: item.orderDate,
        documentsCount: item.documents.length,
      };
    });

    res.json({
      success: true,
      count: rows.length,
      rows,
    });
  } catch (err) {
    console.error('Prapatra-3 preview error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

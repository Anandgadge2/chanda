import prisma from '../config/prisma.js';

/**
 * Dashboard Analytical Rollup
 * GET /api/analytics/summary
 */
export const getSummary = async (req, res) => {
  try {
    const { taluka } = req.query;

    const parcelWhere = {};
    const caseWhere = {};

    if (taluka) {
      parcelWhere.taluka = { equals: taluka, mode: 'insensitive' };
      caseWhere.parcel = { taluka: { equals: taluka, mode: 'insensitive' } };
    }

    const [
      totalParcels,
      totalViolations,
      pendingHearings,
      repossessedAgg,
      violationsByType,
      tenureDistribution,
      recentHearings,
    ] = await Promise.all([
      prisma.landParcel.count({ where: parcelWhere }),
      prisma.forwardEnforcementCase.count({ where: caseWhere }),
      prisma.forwardEnforcementCase.count({
        where: {
          ...caseWhere,
          status: 'HEARING_SCHEDULED',
        },
      }),
      prisma.forwardEnforcementCase.aggregate({
        where: {
          ...caseWhere,
          isRepossessedToGovt: true,
        },
        _sum: { encroachedAreaHa: true },
        _count: true,
      }),
      prisma.forwardEnforcementCase.groupBy({
        by: ['violationType'],
        where: caseWhere,
        _count: true,
      }),
      prisma.landParcel.groupBy({
        by: ['tenureClass'],
        where: parcelWhere,
        _count: true,
      }),
      prisma.caseHearing.findMany({
        where: taluka ? { case: { parcel: { taluka: { equals: taluka, mode: 'insensitive' } } } } : {},
        take: 5,
        orderBy: { hearingDate: 'desc' },
        include: {
          case: {
            include: {
              parcel: {
                select: { upi: true, taluka: true, villageName: true, gatNumber: true },
              },
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      totalParcels,
      totalViolations,
      pendingHearings,
      totalRepossessedHa: repossessedAgg._sum.encroachedAreaHa || 0,
      totalRepossessedCases: repossessedAgg._count || 0,
      violationsByType: violationsByType.map((v) => ({
        type: v.violationType,
        count: v._count,
      })),
      tenureDistribution: tenureDistribution.map((t) => ({
        tenure: t.tenureClass,
        count: t._count,
      })),
      recentHearings,
    });
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

import prisma from '../config/prisma.js';

/**
 * Get forward quasi-judicial enforcement cases
 * GET /api/cases
 */
export const getCases = async (req, res) => {
  try {
    const { violationType, status, taluka, isRepossessedToGovt, page = 1, limit = 30 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const take = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * take;

    const where = {};
    if (violationType) where.violationType = violationType;
    if (status) where.status = status;
    if (isRepossessedToGovt !== undefined && isRepossessedToGovt !== '') {
      where.isRepossessedToGovt = isRepossessedToGovt === 'true';
    }
    if (taluka) {
      where.parcel = {
        taluka: { equals: taluka, mode: 'insensitive' },
      };
    }

    const [cases, totalCount] = await Promise.all([
      prisma.forwardEnforcementCase.findMany({
        where,
        skip,
        take,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          parcel: true,
          hearings: {
            orderBy: { hearingDate: 'desc' },
          },
          documents: true,
        },
      }),
      prisma.forwardEnforcementCase.count({ where }),
    ]);

    res.json({
      success: true,
      cases,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    console.error('Get cases error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Create new enforcement case
 * POST /api/cases
 */
export const createCase = async (req, res) => {
  try {
    const {
      parcelId,
      caseNumber,
      violationType,
      encroachedAreaHa = 0,
      occupantName,
      prapatraCategory = 'Prapatra-3',
      investigatingOfficer,
      showCauseNoticeDate,
    } = req.body;

    if (!parcelId || !caseNumber || !violationType) {
      return res.status(400).json({
        success: false,
        error: 'parcelId, caseNumber, and violationType are required',
      });
    }

    const newCase = await prisma.forwardEnforcementCase.create({
      data: {
        parcelId,
        caseNumber: caseNumber.trim(),
        violationType,
        status: 'FLAGGED_IN_AUDIT',
        encroachedAreaHa: parseFloat(encroachedAreaHa) || 0.0,
        occupantName: occupantName ? occupantName.trim() : null,
        prapatraCategory,
        investigatingOfficer: investigatingOfficer ? investigatingOfficer.trim() : null,
        showCauseNoticeDate: showCauseNoticeDate ? new Date(showCauseNoticeDate) : null,
      },
      include: {
        parcel: true,
      },
    });

    // Mark parcel as having active dispute
    await prisma.landParcel.update({
      where: { id: parcelId },
      data: { hasActiveDispute: true },
    });

    res.status(201).json({ success: true, case: newCase });
  } catch (err) {
    console.error('Create case error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Add hearing / proceedings log to a case
 * POST /api/cases/:id/hearings
 */
export const addHearing = async (req, res) => {
  try {
    const { id } = req.params;
    const { hearingDate, authority, proceedingsLog, nextHearingDate } = req.body;

    if (!hearingDate || !authority || !proceedingsLog) {
      return res.status(400).json({
        success: false,
        error: 'hearingDate, authority, and proceedingsLog are required',
      });
    }

    const hearing = await prisma.caseHearing.create({
      data: {
        caseId: id,
        hearingDate: new Date(hearingDate),
        authority: authority.trim(),
        proceedingsLog: proceedingsLog.trim(),
        nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : null,
      },
    });

    // Update case status to HEARING_SCHEDULED if currently flagged or panchnama
    await prisma.forwardEnforcementCase.update({
      where: { id },
      data: { status: 'HEARING_SCHEDULED' },
    });

    res.status(201).json({ success: true, hearing });
  } catch (err) {
    console.error('Add hearing error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Update case enforcement status & Shasan Jama action
 * PATCH /api/cases/:id/status
 */
export const updateCaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isRepossessedToGovt, finalOrderDetails, orderDate } = req.body;

    const data = {};
    if (status) data.status = status;
    if (isRepossessedToGovt !== undefined) data.isRepossessedToGovt = isRepossessedToGovt;
    if (finalOrderDetails) data.finalOrderDetails = finalOrderDetails;
    if (orderDate) data.orderDate = new Date(orderDate);

    const updatedCase = await prisma.forwardEnforcementCase.update({
      where: { id },
      data,
      include: {
        parcel: true,
        hearings: true,
      },
    });

    // If case is dismissed or rectified, check if parcel has any other active cases
    if (status === 'DISMISSED' || status === 'RECTIFIED_7_12') {
      const activeCount = await prisma.forwardEnforcementCase.count({
        where: {
          parcelId: updatedCase.parcelId,
          status: { notIn: ['DISMISSED', 'RECTIFIED_7_12'] },
        },
      });
      if (activeCount === 0) {
        await prisma.landParcel.update({
          where: { id: updatedCase.parcelId },
          data: { hasActiveDispute: false },
        });
      }
    }

    // If Shasan Jama (repossessed to govt), we can also update the parcel tenureClass to SARKAR_SHASAN if final
    if (isRepossessedToGovt && status === 'RECTIFIED_7_12') {
      await prisma.landParcel.update({
        where: { id: updatedCase.parcelId },
        data: { tenureClass: 'SARKAR_SHASAN' },
      });
    }

    res.json({ success: true, case: updatedCase });
  } catch (err) {
    console.error('Update case status error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

import prisma from '../config/prisma.js';
import { invalidateAnalyticsCache } from './analyticsController.js';
import { invalidateParcelCache } from './parcelController.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { buildParcelJurisdictionWhere, getJurisdictionCacheKey, userCanAccessParcel, userCanAccessTaluka } from '../services/rbacService.js';
import { logger } from '../utils/logger.js';

const CASE_FRESH_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh
const CASE_STALE_TTL_MS = 30 * 60 * 1000; // 30 minutes stale-while-revalidate
const MAX_CASE_CACHE_ENTRIES = 150;
const caseListCache = new Map();
const inFlightCases = new Map();

const TALUKA_CANONICAL = {
  ballarpur: 'Ballarpur',
  bhadravati: 'Bhadravati',
  bhadrawati: 'Bhadravati',
  brahmapuri: 'Brahmapuri',
  bramhapuri: 'Brahmapuri',
  chandrapur: 'Chandrapur',
  chimur: 'Chimur',
  gondpipri: 'Gondpipri',
  jivati: 'Jivati',
  korpana: 'Korpana',
  mul: 'Mul',
  nagbhid: 'Nagbhid',
  pombhurna: 'Pombhurna',
  ponbhurna: 'Pombhurna',
  rajura: 'Rajura',
  saoli: 'Saoli',
  sawali: 'Saoli',
  sindewahi: 'Sindewahi',
  warora: 'Warora',
};

export const invalidateCaseCache = () => {
  caseListCache.clear();
};

const fetchCasesPayload = async ({ search, violationType, status, taluka, village, villageName, isRepossessedToGovt, pageNum, take, isAll, skip, user }) => {
  const andConditions = [];
  const jurisdictionWhere = buildParcelJurisdictionWhere(user);
  if (jurisdictionWhere) {
    andConditions.push({ parcel: jurisdictionWhere });
  }

  if (violationType) andConditions.push({ violationType });
  if (status) andConditions.push({ status });
  if (isRepossessedToGovt !== undefined && isRepossessedToGovt !== '') {
    andConditions.push({ isRepossessedToGovt: isRepossessedToGovt === 'true' });
  }
  const parcelConditions = {};
  if (taluka && taluka !== 'all' && taluka !== 'सर्व तालुके') {
    const canonical = TALUKA_CANONICAL[String(taluka).trim().toLowerCase()];
    parcelConditions.taluka = canonical || { equals: taluka, mode: 'insensitive' };
  }
  const targetVillage = village || villageName;
  if (targetVillage && targetVillage !== 'all' && targetVillage !== 'सर्व गावे') {
    parcelConditions.villageName = { equals: targetVillage.trim(), mode: 'insensitive' };
  }
  if (Object.keys(parcelConditions).length > 0) {
    andConditions.push({ parcel: parcelConditions });
  }
  if (search && search.trim()) {
    const q = search.trim();
    andConditions.push({
      OR: [
        { caseNumber: { contains: q, mode: 'insensitive' } },
        { occupantName: { contains: q, mode: 'insensitive' } },
        { finalOrderDetails: { contains: q, mode: 'insensitive' } },
        { investigatingOfficer: { contains: q, mode: 'insensitive' } },
        {
          parcel: {
            OR: [
              { villageName: { contains: q, mode: 'insensitive' } },
              { gatNumber: { contains: q, mode: 'insensitive' } },
              { upi: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
      ],
    });
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  // Single groupBy replaces 5 separate count + aggregate queries
  const [cases, groupedStats] = await Promise.all([
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
    prisma.forwardEnforcementCase.groupBy({
      by: ['status', 'isRepossessedToGovt'],
      where,
      _count: { _all: true },
      _sum: { encroachedAreaHa: true },
    }),
  ]);

  let totalCount = 0;
  let activeHearingsCount = 0;
  let noticeCount = 0;
  let shasanJamaCount = 0;
  let totalDisputedAreaHa = 0;

  for (const g of groupedStats) {
    const cnt = g._count?._all || 0;
    totalCount += cnt;
    if (g.status === 'HEARING_SCHEDULED') activeHearingsCount += cnt;
    if (g.status === 'NOTICE_ISSUED') noticeCount += cnt;
    if (g.isRepossessedToGovt === true) shasanJamaCount += cnt;
    totalDisputedAreaHa += Number(g._sum?.encroachedAreaHa || 0);
  }

  return {
    success: true,
    cases,
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: isAll ? totalCount : take,
      totalPages: isAll ? 1 : Math.ceil(totalCount / take),
    },
    stats: {
      totalCases: totalCount,
      activeHearings: activeHearingsCount,
      noticesIssued: noticeCount,
      shasanJama: shasanJamaCount,
      totalDisputedAreaHa,
    },
  };
};

const refreshCaseCache = (cacheKey, params) => {
  let pending = inFlightCases.get(cacheKey);
  if (!pending) {
    pending = fetchCasesPayload(params)
      .then((payload) => {
        if (caseListCache.size >= MAX_CASE_CACHE_ENTRIES) {
          const oldestKey = caseListCache.keys().next().value;
          caseListCache.delete(oldestKey);
        }
        caseListCache.set(cacheKey, { timestamp: Date.now(), data: payload });
        inFlightCases.delete(cacheKey);
        return payload;
      })
      .catch((err) => {
        inFlightCases.delete(cacheKey);
        throw err;
      });
    inFlightCases.set(cacheKey, pending);
  }
  return pending;
};

export const warmCasesCache = async () => {
  try {
    const t0 = Date.now();
    const params = {
      search: undefined,
      violationType: undefined,
      status: undefined,
      taluka: undefined,
      village: undefined,
      villageName: undefined,
      isRepossessedToGovt: undefined,
      pageNum: 1,
      take: 25,
      isAll: false,
      skip: 0,
    };
    const cacheKey = JSON.stringify({ pageNum: 1, take: 25, isAll: false });
    await refreshCaseCache(cacheKey, params);
    logger.success(`Cases default cache warmed in ${Date.now() - t0}ms`, 'CASES');
  } catch (err) {
    logger.warn(`Cases cache warmup skipped: ${err.message}`, 'CASES');
  }
};

/**
 * Get forward quasi-judicial enforcement cases
 * GET /api/cases
 */
export const getCases = async (req, res) => {
  try {
    const { search, violationType, status, taluka, village, villageName, isRepossessedToGovt, page = 1, limit = 30, refresh } = req.query;

    const isAll = limit === 'all' || limit === 'ALL';
    const parsedLimit = parseInt(limit, 10);
    const take = isAll
      ? 2000
      : (isNaN(parsedLimit) ? 25 : Math.min(500, Math.max(1, parsedLimit)));
    const pageNum = isAll ? 1 : Math.max(1, parseInt(page, 10) || 1);
    const skip = isAll ? 0 : (pageNum - 1) * take;

    const targetVillage = village || villageName;
    const jurisdictionKey = getJurisdictionCacheKey(req.user);
    const cacheKey = JSON.stringify({
      search: search?.trim() || undefined,
      violationType: violationType || undefined,
      status: status || undefined,
      taluka: taluka || undefined,
      targetVillage: targetVillage || undefined,
      isRepossessedToGovt: isRepossessedToGovt !== undefined && isRepossessedToGovt !== '' ? isRepossessedToGovt : undefined,
      pageNum,
      take,
      isAll,
      jurisdictionKey,
    });

    const params = { search, violationType, status, taluka, village, villageName, isRepossessedToGovt, pageNum, take, isAll, skip, user: req.user };

    if (refresh !== 'true') {
      const cached = caseListCache.get(cacheKey);
      if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age < CASE_FRESH_TTL_MS) {
          res.setHeader('X-Cache-Status', 'HIT');
          return res.json(cached.data);
        }
        if (age < CASE_STALE_TTL_MS) {
          refreshCaseCache(cacheKey, params).catch(() => {});
          res.setHeader('X-Cache-Status', 'STALE');
          return res.json(cached.data);
        }
      }
    }

    const payload = await refreshCaseCache(cacheKey, params);
    res.setHeader('X-Cache-Status', 'MISS');
    res.json(payload);
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

    const targetParcel = await prisma.landParcel.findUnique({
      where: { id: parcelId },
      select: { taluka: true, revenueCircle: true, villageName: true, villageCode: true },
    });
    if (!targetParcel) {
      return res.status(404).json({ success: false, error: 'Parcel not found' });
    }
    if (!userCanAccessParcel(req.user, targetParcel)) {
      return res.status(403).json({
        success: false,
        error: `आपल्याकडे '${targetParcel.taluka}' / '${targetParcel.villageName}' कार्यक्षेत्रातील प्रकरण दाखल करण्याचे अधिकार नाहीत.`,
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

    invalidateCaseCache();
    invalidateParcelCache();
    invalidateAnalyticsCache();

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

    const existingCase = await prisma.forwardEnforcementCase.findUnique({
      where: { id },
      include: { parcel: { select: { taluka: true, revenueCircle: true, villageName: true, villageCode: true } } },
    });
    if (!existingCase) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }
    if (existingCase.parcel && !userCanAccessParcel(req.user, existingCase.parcel)) {
      return res.status(403).json({
        success: false,
        error: `आपल्याकडे '${existingCase.parcel.taluka}' / '${existingCase.parcel.villageName}' कार्यक्षेत्रातील सुनावणी नोंदवण्याचे अधिकार नाहीत.`,
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

    invalidateCaseCache();
    invalidateCaseCache();
    invalidateAnalyticsCache();

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

    const existingCase = await prisma.forwardEnforcementCase.findUnique({
      where: { id },
      include: { parcel: { select: { taluka: true, revenueCircle: true, villageName: true, villageCode: true } } },
    });
    if (!existingCase) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }
    if (existingCase.parcel && !userCanAccessParcel(req.user, existingCase.parcel)) {
      return res.status(403).json({
        success: false,
        error: `आपल्याकडे '${existingCase.parcel.taluka}' / '${existingCase.parcel.villageName}' कार्यक्षेत्रातील प्रकरणावर आदेश पारित करण्याचे अधिकार नाहीत.`,
      });
    }

    const updatedCase = await prisma.forwardEnforcementCase.update({
      where: { id },
      data,
      include: {
        parcel: true,
        hearings: true,
      },
    });

    // Audit log
    await logAudit({
      userId: req.user?.id || null,
      action: isRepossessedToGovt ? 'MARK_SHASAN_JAMA' : `UPDATE_CASE_STATUS_${status || 'CHANGED'}`,
      entityType: 'ForwardEnforcementCase',
      entityId: updatedCase.id,
      previousData: existingCase,
      newData: updatedCase,
      req,
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

    invalidateCaseCache();
    invalidateParcelCache();
    invalidateAnalyticsCache();

    res.json({ success: true, case: updatedCase });
  } catch (err) {
    console.error('Update case status error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

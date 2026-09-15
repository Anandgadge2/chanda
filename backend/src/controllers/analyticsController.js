import prisma from '../config/prisma.js';

// High-Performance In-Memory Cache with TTL & Request Deduplication
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL
const summaryCache = new Map();
const inFlightRequests = new Map();

/**
 * Invalidate the analytics rollup cache on data modifications
 */
export const invalidateAnalyticsCache = () => {
  summaryCache.clear();
};

/**
 * Internal worker: executes a single, hyper-optimized PostgreSQL query
 * that aggregates all rollup metrics, group-bys, and relations in one DB roundtrip.
 */
const fetchSummaryFromDatabase = async (taluka) => {
  const talukaParam = taluka && taluka.trim() ? taluka.trim() : null;

  const rows = await prisma.$queryRaw`
    SELECT
      -- Total Master Parcels
      (SELECT COUNT(*)::int FROM land_parcels lp 
       WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))) as "totalParcels",

      -- Total Violations
      (SELECT COUNT(*)::int FROM forward_enforcement_cases fec 
       LEFT JOIN land_parcels lp ON fec.parcel_id = lp.id 
       WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))) as "totalViolations",

      -- Pending SDO Hearings
      (SELECT COUNT(*)::int FROM forward_enforcement_cases fec 
       LEFT JOIN land_parcels lp ON fec.parcel_id = lp.id 
       WHERE fec.status = 'HEARING_SCHEDULED' AND (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))) as "pendingHearings",

      -- Repossessed Government Land (Area in Ha)
      (SELECT COALESCE(SUM(fec.encroached_area_ha), 0)::float FROM forward_enforcement_cases fec 
       LEFT JOIN land_parcels lp ON fec.parcel_id = lp.id 
       WHERE fec.is_repossessed_to_govt = true AND (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))) as "totalRepossessedHa",

      -- Repossessed Government Land (Cases Count)
      (SELECT COUNT(*)::int FROM forward_enforcement_cases fec 
       LEFT JOIN land_parcels lp ON fec.parcel_id = lp.id 
       WHERE fec.is_repossessed_to_govt = true AND (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))) as "totalRepossessedCases",

      -- Violations Grouped by Statutory Category
      (SELECT COALESCE(json_agg(json_build_object(
        'type', vt.violation_type,
        'count', vt.cnt,
        'encroachedAreaHa', vt.total_encroached_ha
      )), '[]'::json)
       FROM (
         SELECT 
           fec.violation_type::text as violation_type, 
           COUNT(*)::int as cnt,
           COALESCE(SUM(fec.encroached_area_ha), 0)::float as total_encroached_ha
         FROM forward_enforcement_cases fec
         LEFT JOIN land_parcels lp ON fec.parcel_id = lp.id
         WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
         GROUP BY fec.violation_type
       ) vt) as "violationsByType",

      -- Land Tenure Distribution with Total Area (Ha)
      (SELECT COALESCE(json_agg(json_build_object(
        'tenure', td.tenure_class,
        'count', td.cnt,
        'totalAreaHa', td.total_area_ha
      )), '[]'::json)
       FROM (
         SELECT 
           lp.tenure_class::text as tenure_class, 
           COUNT(*)::int as cnt,
           COALESCE(SUM(lp.total_area_ha), 0)::float as total_area_ha
         FROM land_parcels lp
         WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
         GROUP BY lp.tenure_class
       ) td) as "tenureDistribution",

      -- Taluka-wise Distribution & Comparative Analysis
      (SELECT COALESCE(json_agg(json_build_object(
        'taluka', t.taluka,
        'parcelCount', t.parcel_cnt,
        'totalAreaHa', t.total_area_ha,
        'violationCount', t.violation_cnt,
        'disputeCount', t.dispute_cnt
      )), '[]'::json)
       FROM (
         SELECT 
           lp.taluka,
           COUNT(DISTINCT lp.id)::int as parcel_cnt,
           COALESCE(SUM(lp.total_area_ha), 0)::float as total_area_ha,
           COUNT(DISTINCT fec.id)::int as violation_cnt,
           COUNT(DISTINCT CASE WHEN lp.has_active_dispute THEN lp.id END)::int as dispute_cnt
         FROM land_parcels lp
         LEFT JOIN forward_enforcement_cases fec ON fec.parcel_id = lp.id
         WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
         GROUP BY lp.taluka
         ORDER BY parcel_cnt DESC, total_area_ha DESC
       ) t) as "talukaDistribution",

      -- Enforcement Pipeline Status Distribution
      (SELECT COALESCE(json_agg(json_build_object(
        'status', es.status,
        'count', es.cnt
      )), '[]'::json)
       FROM (
         SELECT fec.status::text as status, COUNT(*)::int as cnt
         FROM forward_enforcement_cases fec
         LEFT JOIN land_parcels lp ON fec.parcel_id = lp.id
         WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
         GROUP BY fec.status
       ) es) as "statusDistribution",

      -- Land Usability (Potkharaba vs Cultivable Area)
      (SELECT COALESCE(SUM(lp.potkharaba_area_ha), 0)::float FROM land_parcels lp 
       WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))) as "totalPotkharabaHa",
      (SELECT COALESCE(SUM(lp.total_area_ha - lp.potkharaba_area_ha), 0)::float FROM land_parcels lp 
       WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))) as "totalCultivableHa",

      -- Top Survey No & Gat Number Parcels Analysis
      (SELECT COALESCE(json_agg(json_build_object(
        'upi', g.upi,
        'gatNumber', g.gat_number,
        'oldSurveyNo', g.old_survey_no,
        'villageName', g.village_name,
        'taluka', g.taluka,
        'tenureClass', g.tenure_class::text,
        'totalAreaHa', g.total_area_ha::float,
        'potkharabaAreaHa', g.potkharaba_area_ha::float,
        'cultivableAreaHa', g.cultivable_area_ha::float,
        'hasActiveDispute', g.has_active_dispute,
        'violationType', g.violation_type,
        'caseNumber', g.case_number
      )), '[]'::json)
       FROM (
         SELECT 
           lp.upi,
           lp.gat_number,
           lp.old_survey_no,
           lp.village_name,
           lp.taluka,
           lp.tenure_class,
           lp.total_area_ha,
           lp.potkharaba_area_ha,
           (lp.total_area_ha - lp.potkharaba_area_ha) as cultivable_area_ha,
           lp.has_active_dispute,
           fec.violation_type::text as violation_type,
           fec.case_number
         FROM land_parcels lp
         LEFT JOIN forward_enforcement_cases fec ON fec.parcel_id = lp.id
         WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
         ORDER BY lp.total_area_ha DESC
         LIMIT 25
       ) g) as "topGatParcels",

      -- Historical Timeline Progression (Epochs from 1950 baseline)
      (SELECT COALESCE(json_agg(json_build_object(
        'epochYear', bh.epoch_year,
        'recordsCount', bh.cnt,
        'totalAreaHa', bh.total_area_ha::float
      )), '[]'::json)
       FROM (
         SELECT 
           b.epoch_year, 
           COUNT(*)::int as cnt, 
           COALESCE(SUM(b.area_ha), 0)::float as total_area_ha
         FROM backward_histories b
         LEFT JOIN land_parcels lp ON b.parcel_id = lp.id
         WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
         GROUP BY b.epoch_year
         ORDER BY b.epoch_year ASC
       ) bh) as "historicalTimeline",

      -- Latest 5 Quasi-Judicial Hearings with Parcel and Case Context
      (SELECT COALESCE(json_agg(h), '[]'::json)
       FROM (
         SELECT 
           ch.id,
           ch.case_id as "caseId",
           ch.hearing_date as "hearingDate",
           ch.authority,
           ch.proceedings_log as "proceedingsLog",
           ch.next_hearing_date as "nextHearingDate",
           ch.created_at as "createdAt",
           json_build_object(
             'id', fec.id,
             'caseNumber', fec.case_number,
             'violationType', fec.violation_type::text,
             'status', fec.status::text,
             'parcel', json_build_object(
               'upi', lp.upi,
               'taluka', lp.taluka,
               'villageName', lp.village_name,
               'gatNumber', lp.gat_number
             )
           ) as "case"
         FROM case_hearings ch
         JOIN forward_enforcement_cases fec ON ch.case_id = fec.id
         JOIN land_parcels lp ON fec.parcel_id = lp.id
         WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
         ORDER BY ch.hearing_date DESC
         LIMIT 5
       ) h) as "recentHearings"
  `;

  const row = rows[0] || {};
  return {
    success: true,
    totalParcels: Number(row.totalParcels || 0),
    totalViolations: Number(row.totalViolations || 0),
    pendingHearings: Number(row.pendingHearings || 0),
    totalRepossessedHa: Number(row.totalRepossessedHa || 0),
    totalRepossessedCases: Number(row.totalRepossessedCases || 0),
    violationsByType: row.violationsByType || [],
    tenureDistribution: row.tenureDistribution || [],
    talukaDistribution: row.talukaDistribution || [],
    statusDistribution: row.statusDistribution || [],
    totalPotkharabaHa: Number(row.totalPotkharabaHa || 0),
    totalCultivableHa: Number(row.totalCultivableHa || 0),
    topGatParcels: row.topGatParcels || [],
    historicalTimeline: row.historicalTimeline || [],
    recentHearings: row.recentHearings || [],
  };
};

/**
 * Dashboard Analytical Rollup
 * GET /api/analytics/summary
 */
export const getSummary = async (req, res) => {
  try {
    const { taluka, refresh } = req.query;
    const cacheKey = taluka ? taluka.trim().toLowerCase() : '__ALL__';
    const now = Date.now();

    // 1. Check in-memory cache if not forced refresh
    if (refresh !== 'true') {
      const cached = summaryCache.get(cacheKey);
      if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        return res.json(cached.data);
      }
    }

    // 2. Request deduplication: if an identical query is currently in-flight, await it
    let pending = inFlightRequests.get(cacheKey);
    if (!pending) {
      pending = fetchSummaryFromDatabase(taluka)
        .then((data) => {
          summaryCache.set(cacheKey, { data, timestamp: Date.now() });
          inFlightRequests.delete(cacheKey);
          return data;
        })
        .catch((err) => {
          inFlightRequests.delete(cacheKey);
          throw err;
        });
      inFlightRequests.set(cacheKey, pending);
    }

    const data = await pending;
    res.json(data);
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


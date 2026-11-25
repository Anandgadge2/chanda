import prisma from '../config/prisma.js';
import { logger } from '../utils/logger.js';

// High-Performance In-Memory Cache with Stale-While-Revalidate (SWR) & Request Deduplication
const CACHE_FRESH_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh (invalidated immediately on writes)
const CACHE_STALE_TTL_MS = 60 * 60 * 1000; // 60 minutes stale-while-revalidate window
const summaryCache = new Map();
const inFlightRequests = new Map();

/**
 * Invalidate the analytics rollup cache on data modifications
 */
export const invalidateAnalyticsCache = () => {
  summaryCache.clear();
};

/**
 * Internal worker: executes a single-pass CTE PostgreSQL query
 * that avoids repeated full-table scans and large cross-table distinct joins.
 */
const fetchSummaryFromDatabase = async (taluka) => {
  const talukaParam = taluka && taluka.trim() ? taluka.trim() : null;

  const rows = await prisma.$queryRaw`
    WITH
    lp_base AS (
      SELECT
        COUNT(*)::int AS total_parcels,
        COUNT(DISTINCT village_name)::int AS total_villages,
        COALESCE(SUM(total_area_ha), 0)::float AS total_area_ha,
        COALESCE(SUM(potkharaba_area_ha), 0)::float AS total_potkharaba_ha,
        COALESCE(SUM(total_area_ha - potkharaba_area_ha), 0)::float AS total_cultivable_ha
      FROM land_parcels lp
      WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
    ),
    lp_tenure AS (
      SELECT
        lp.tenure_class::text AS tenure_class,
        COUNT(*)::int AS cnt,
        COALESCE(SUM(lp.total_area_ha), 0)::float AS total_area_ha
      FROM land_parcels lp
      WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
      GROUP BY lp.tenure_class
    ),
    fec_filtered AS (
      SELECT
        fec.id,
        fec.violation_type::text AS violation_type,
        fec.status::text AS status,
        fec.encroached_area_ha,
        fec.is_repossessed_to_govt,
        lp.total_area_ha AS lp_total_area_ha
      FROM forward_enforcement_cases fec
      LEFT JOIN land_parcels lp ON fec.parcel_id = lp.id
      WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
    ),
    fec_summary AS (
      SELECT
        COUNT(*)::int AS total_violations,
        COUNT(*) FILTER (WHERE status = 'HEARING_SCHEDULED')::int AS pending_hearings,
        COALESCE(SUM(COALESCE(NULLIF(encroached_area_ha, 0), lp_total_area_ha, 0)) FILTER (WHERE is_repossessed_to_govt = true), 0)::float AS total_repossessed_ha,
        COUNT(*) FILTER (WHERE is_repossessed_to_govt = true)::int AS total_repossessed_cases,
        COUNT(*) FILTER (WHERE (is_repossessed_to_govt = false OR is_repossessed_to_govt IS NULL) AND status NOT IN ('FINAL_ORDER_PASSED', 'RECTIFIED_7_12', 'DISMISSED'))::int AS in_progress_cases,
        COALESCE(SUM(COALESCE(NULLIF(encroached_area_ha, 0), lp_total_area_ha, 0)) FILTER (WHERE (is_repossessed_to_govt = false OR is_repossessed_to_govt IS NULL) AND status NOT IN ('FINAL_ORDER_PASSED', 'RECTIFIED_7_12', 'DISMISSED')), 0)::float AS in_progress_area_ha
      FROM fec_filtered
    ),
    fec_by_type AS (
      SELECT
        violation_type,
        COUNT(*)::int AS cnt,
        COALESCE(SUM(encroached_area_ha), 0)::float AS total_encroached_ha
      FROM fec_filtered
      GROUP BY violation_type
    ),
    fec_by_status AS (
      SELECT
        status,
        COUNT(*)::int AS cnt
      FROM fec_filtered
      GROUP BY status
    ),
    class2_to_1 AS (
      SELECT
        COUNT(*)::int AS cnt,
        COALESCE(SUM(lp.total_area_ha), 0)::float AS area_ha
      FROM land_parcels lp
      WHERE lp.tenure_class = 'BHOGVATDAR_CLASS_1'
        AND (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
        AND EXISTS (
          SELECT 1 FROM backward_histories bh
          WHERE bh.parcel_id = lp.id AND bh.tenure_class = 'BHOGVATDAR_CLASS_2'
        )
    ),
    taluka_lp AS (
      SELECT
        lp.taluka,
        COUNT(DISTINCT lp.village_name)::int AS village_cnt,
        COUNT(*)::int AS parcel_cnt,
        COALESCE(SUM(lp.total_area_ha), 0)::float AS total_area_ha,
        COALESCE(SUM(lp.total_area_ha - lp.potkharaba_area_ha), 0)::float AS cultivable_area_ha,
        COUNT(*) FILTER (WHERE lp.has_active_dispute)::int AS dispute_cnt
      FROM land_parcels lp
      GROUP BY lp.taluka
    ),
    taluka_fec AS (
      SELECT
        lp.taluka,
        COALESCE(SUM(fec.encroached_area_ha), 0)::float AS disputed_area_ha,
        COUNT(*)::int AS violation_cnt,
        COUNT(*) FILTER (WHERE fec.is_repossessed_to_govt = true)::int AS repossessed_cnt,
        COALESCE(SUM(CASE WHEN fec.is_repossessed_to_govt = true THEN COALESCE(NULLIF(fec.encroached_area_ha, 0), lp.total_area_ha, 0) ELSE 0 END), 0)::float AS repossessed_area_ha
      FROM forward_enforcement_cases fec
      JOIN land_parcels lp ON fec.parcel_id = lp.id
      GROUP BY lp.taluka
    ),
    top_lp AS (
      SELECT
        lp.id,
        lp.upi,
        lp.gat_number,
        lp.old_survey_no,
        lp.village_name,
        lp.taluka,
        lp.tenure_class,
        lp.total_area_ha,
        lp.potkharaba_area_ha,
        (lp.total_area_ha - lp.potkharaba_area_ha) AS cultivable_area_ha,
        lp.has_active_dispute
      FROM land_parcels lp
      WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
      ORDER BY lp.total_area_ha DESC, lp.upi ASC
      LIMIT 25
    )
    SELECT
      lb.total_parcels AS "totalParcels",
      lb.total_villages AS "totalVillages",
      (SELECT COUNT(*)::int FROM taluka_lp) AS "totalTalukas",
      fs.total_violations AS "totalViolations",
      fs.pending_hearings AS "pendingHearings",
      fs.total_repossessed_ha AS "totalRepossessedHa",
      fs.total_repossessed_cases AS "totalRepossessedCases",
      fs.in_progress_cases AS "inProgressCases",
      fs.in_progress_area_ha AS "inProgressAreaHa",
      c21.cnt AS "totalClass2To1Conversions",
      c21.area_ha AS "totalClass2To1AreaHa",
      lb.total_potkharaba_ha AS "totalPotkharabaHa",
      lb.total_cultivable_ha AS "totalCultivableHa",

      -- Violations Grouped by Statutory Category
      (SELECT COALESCE(json_agg(json_build_object(
        'type', violation_type,
        'count', cnt,
        'encroachedAreaHa', total_encroached_ha
      ) ORDER BY cnt DESC), '[]'::json) FROM fec_by_type) AS "violationsByType",

      -- Land Tenure Distribution with Total Area (Ha)
      (SELECT COALESCE(json_agg(json_build_object(
        'tenure', tenure_class,
        'count', cnt,
        'totalAreaHa', total_area_ha
      ) ORDER BY cnt DESC), '[]'::json) FROM lp_tenure) AS "tenureDistribution",

      -- Taluka-wise Distribution & Comparative Analysis (District-wide comparative rollup)
      (SELECT COALESCE(json_agg(json_build_object(
        'taluka', tl.taluka,
        'villageCount', tl.village_cnt,
        'parcelCount', tl.parcel_cnt,
        'totalAreaHa', tl.total_area_ha,
        'cultivableAreaHa', tl.cultivable_area_ha,
        'disputedAreaHa', COALESCE(tf.disputed_area_ha, 0),
        'violationCount', COALESCE(tf.violation_cnt, 0),
        'disputeCount', tl.dispute_cnt,
        'repossessedCount', COALESCE(tf.repossessed_cnt, 0),
        'repossessedAreaHa', COALESCE(tf.repossessed_area_ha, 0)
      ) ORDER BY tl.parcel_cnt DESC, tl.total_area_ha DESC), '[]'::json)
       FROM taluka_lp tl
       LEFT JOIN taluka_fec tf ON tf.taluka = tl.taluka) AS "talukaDistribution",

      -- Enforcement Pipeline Status Distribution
      (SELECT COALESCE(json_agg(json_build_object(
        'status', status,
        'count', cnt
      ) ORDER BY cnt DESC), '[]'::json) FROM fec_by_status) AS "statusDistribution",

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
        'violationType', fec.violation_type::text,
        'caseNumber', fec.case_number
      ) ORDER BY g.total_area_ha DESC, g.upi ASC), '[]'::json)
       FROM top_lp g
       LEFT JOIN forward_enforcement_cases fec ON fec.parcel_id = g.id) AS "topGatParcels",

      -- Historical Timeline Progression (Epochs from 1950 baseline to 2026 current status)
      (SELECT COALESCE(json_agg(json_build_object(
        'epochYear', t.epoch_year,
        'recordsCount', t.cnt,
        'totalAreaHa', t.total_area_ha::float,
        'label', t.label
      )), '[]'::json)
       FROM (
         SELECT
           b.epoch_year,
           COUNT(*)::int AS cnt,
           COALESCE(SUM(b.area_ha), 0)::float AS total_area_ha,
           '१९५० (मूळ सनद/बंदोबस्त)' AS label
         FROM backward_histories b
         WHERE (${talukaParam}::text IS NULL OR EXISTS (
           SELECT 1 FROM land_parcels lp
           WHERE lp.id = b.parcel_id AND LOWER(lp.taluka) = LOWER(${talukaParam})
         ))
         GROUP BY b.epoch_year

         UNION ALL

         SELECT
           2026 AS epoch_year,
           lb2.total_parcels AS cnt,
           lb2.total_area_ha AS total_area_ha,
           '२०२६ (विद्यमान चालू ७/१२)' AS label
         FROM lp_base lb2

         ORDER BY epoch_year ASC
       ) t) AS "historicalTimeline",

      -- Latest 5 Quasi-Judicial Hearings with Parcel and Case Context
      (SELECT COALESCE(json_agg(h), '[]'::json)
       FROM (
         SELECT
           ch.id,
           ch.case_id AS "caseId",
           ch.hearing_date AS "hearingDate",
           ch.authority,
           ch.proceedings_log AS "proceedingsLog",
           ch.next_hearing_date AS "nextHearingDate",
           ch.created_at AS "createdAt",
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
           ) AS "case"
         FROM case_hearings ch
         JOIN forward_enforcement_cases fec ON ch.case_id = fec.id
         JOIN land_parcels lp ON fec.parcel_id = lp.id
         WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
         ORDER BY ch.hearing_date DESC
         LIMIT 5
       ) h) AS "recentHearings",

      -- Featured Authentic Flagged Dispute Parcel
      (SELECT row_to_json(fd) FROM (
        SELECT
          lp.upi,
          lp.village_name AS "villageName",
          lp.taluka,
          lp.gat_number AS "gatNumber",
          lp.old_survey_no AS "oldSurveyNo",
          lp.total_area_ha::float AS "totalAreaHa",
          lp.tenure_class::text AS "currentTenure",
          COALESCE(lp.metadata->>'ownerName', 'विद्यमान खातेदार (चालू ७/१२)') AS "currentOwner",
          COALESCE(bh.owner_name, 'मूळ सनद नोंदणीकृत खातेदार') AS "baselineOwner",
          'वर्ग-२ (नवीन व अविभाज्य शर्त)' AS "baselineTenure",
          fec.case_number AS "caseNumber",
          fec.violation_type::text AS "violationType",
          fec.status::text AS "status"
        FROM forward_enforcement_cases fec
        JOIN land_parcels lp ON fec.parcel_id = lp.id
        LEFT JOIN backward_histories bh ON bh.parcel_id = lp.id AND bh.epoch_year = 1950
        WHERE lp.has_active_dispute = true
        ORDER BY fec.encroached_area_ha DESC
        LIMIT 1
      ) fd) AS "featuredDispute"
    FROM lp_base lb
    CROSS JOIN fec_summary fs
    CROSS JOIN class2_to_1 c21
  `;

  const row = rows[0] || {};
  return {
    success: true,
    totalParcels: Number(row.totalParcels || 0),
    totalVillages: Number(row.totalVillages || 0),
    totalTalukas: Number(row.totalTalukas || 0),
    totalViolations: Number(row.totalViolations || 0),
    pendingHearings: Number(row.pendingHearings || 0),
    totalRepossessedHa: Number(row.totalRepossessedHa || 0),
    totalRepossessedCases: Number(row.totalRepossessedCases || 0),
    inProgressCases: Number(row.inProgressCases ?? (row.totalViolations - (row.totalRepossessedCases || 0))),
    inProgressAreaHa: Number(row.inProgressAreaHa || 0),
    totalClass2To1Conversions: Number(row.totalClass2To1Conversions || 0),
    totalClass2To1AreaHa: Number(row.totalClass2To1AreaHa || 0),
    violationsByType: row.violationsByType || [],
    tenureDistribution: row.tenureDistribution || [],
    talukaDistribution: row.talukaDistribution || [],
    statusDistribution: row.statusDistribution || [],
    totalPotkharabaHa: Number(row.totalPotkharabaHa || 0),
    totalCultivableHa: Number(row.totalCultivableHa || 0),
    topGatParcels: row.topGatParcels || [],
    historicalTimeline: row.historicalTimeline || [],
    recentHearings: row.recentHearings || [],
    featuredDispute: row.featuredDispute || null,
  };
};

/**
 * Trigger a deduplicated fetch and store the result in summaryCache.
 */
const refreshSummaryCache = (taluka, cacheKey) => {
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
  return pending;
};

/**
 * Pre-warm the district-wide analytics summary cache on server startup
 */
export const warmAnalyticsCache = async () => {
  try {
    const t0 = Date.now();
    await refreshSummaryCache(null, '__ALL__');
    logger.success(`Analytics summary cache warmed in ${Date.now() - t0}ms`, 'ANALYTICS');
  } catch (err) {
    logger.warn(`Analytics cache warmup skipped: ${err.message}`, 'ANALYTICS');
  }
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

    // 1. Check in-memory cache (fresh or stale-while-revalidate) if not forced refresh
    if (refresh !== 'true') {
      const cached = summaryCache.get(cacheKey);
      if (cached) {
        const age = now - cached.timestamp;
        if (age < CACHE_FRESH_TTL_MS) {
          return res.json(cached.data);
        }
        if (age < CACHE_STALE_TTL_MS) {
          // Serve stale data immediately and revalidate in the background
          refreshSummaryCache(taluka, cacheKey).catch((err) => {
            logger.warn(`Background analytics refresh failed: ${err.message}`, 'ANALYTICS');
          });
          return res.json(cached.data);
        }
      }
    }

    // 2. Cache miss / expired / forced refresh: await deduplicated DB fetch
    const data = await refreshSummaryCache(taluka, cacheKey);
    res.json(data);
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

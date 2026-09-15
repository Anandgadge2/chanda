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
      (SELECT COALESCE(json_agg(json_build_object('type', vt.violation_type, 'count', vt.cnt)), '[]'::json)
       FROM (
         SELECT fec.violation_type::text as violation_type, COUNT(*)::int as cnt
         FROM forward_enforcement_cases fec
         LEFT JOIN land_parcels lp ON fec.parcel_id = lp.id
         WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
         GROUP BY fec.violation_type
       ) vt) as "violationsByType",

      -- Land Tenure Distribution
      (SELECT COALESCE(json_agg(json_build_object('tenure', td.tenure_class, 'count', td.cnt)), '[]'::json)
       FROM (
         SELECT lp.tenure_class::text as tenure_class, COUNT(*)::int as cnt
         FROM land_parcels lp
         WHERE (${talukaParam}::text IS NULL OR LOWER(lp.taluka) = LOWER(${talukaParam}))
         GROUP BY lp.tenure_class
       ) td) as "tenureDistribution",

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


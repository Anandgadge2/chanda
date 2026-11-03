/**
 * Tier 3: Cross-Feature Combinations E2E Tests
 * 
 * Verifies multi-feature interactions, consistency, and invariant relationships:
 * - Pairwise Integrity: Tenure code vs Occupant name (zero cross-contamination)
 * - Area Consistency across Duplicate Survey Numbers (no dropping of distinct co-sharer rows)
 * - Checklist vs Rollup Counts Consistency (API count == DB parcel count == Rollup count == 145)
 */

import {
  getCanonicalKoradiParcels,
  getDuplicateGatNumbers
} from './helpers/oracle.mjs';
import {
  fetchChecklistParcels,
  fetchDbParcels,
  fetchDbRollup,
  runSuite,
  assertEqual,
  assert,
  closePrisma
} from './helpers/test_utils.mjs';

export const tier3Tests = [
  {
    name: 'Tier 3.1: Pairwise Tenure Code vs Occupant Name Zero Cross-Contamination',
    fn: async () => {
      const apiResult = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });
      assert(apiResult.parcels.length > 0, 'API must return parcels');

      const knownTenureTokens = ['भो.व-1', 'भो.व-2', 'भो.व -2', 'भोगवटादार वर्ग', 'CLASS_1', 'CLASS_2'];

      let leakedOwnersCount = 0;
      const leakedOwners = [];

      for (const p of apiResult.parcels) {
        const owner = String(p.currentOwner || '').trim();

        // Check if owner is actually a tenure code
        if (knownTenureTokens.some(tok => owner.startsWith(tok) || owner === tok)) {
          leakedOwnersCount++;
          leakedOwners.push({ gat: p.gatNumber, owner });
        }
      }

      assertEqual(
        leakedOwnersCount,
        0,
        `Found ${leakedOwnersCount} parcels where tenure code leaked into occupant name (e.g. gat ${leakedOwners[0]?.gat}: "${leakedOwners[0]?.owner}")`
      );
    }
  },

  {
    name: 'Tier 3.2: Duplicate Survey Number Co-Sharer Row Preservation & Area Consistency',
    fn: async () => {
      const canonical = await getCanonicalKoradiParcels();
      const duplicateGats = await getDuplicateGatNumbers();
      assert(duplicateGats.length >= 10, 'Oracle should contain at least 10 duplicated survey numbers');

      const apiResult = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });

      // For every survey number that has multiple entries in the oracle, verify the exact count and areas are preserved
      for (const { gat, count } of duplicateGats) {
        const canonicalMatches = canonical.filter(p => p.cleanGat === gat);
        const apiMatches = apiResult.parcels.filter(p => p.gatNumber.replace(/\.$/, '') === gat);

        assertEqual(
          apiMatches.length,
          count,
          `Survey number "${gat}" has ${count} distinct co-sharer rows in source sheet, but API returned ${apiMatches.length}. Legitimate co-sharer rows must not be collapsed by deduplication!`
        );

        // Verify total area sum matches
        const expectedTotalArea = canonicalMatches.reduce((acc, p) => acc + p.totalAreaHa, 0);
        const actualTotalArea = apiMatches.reduce((acc, p) => acc + parseFloat(p.totalAreaHa || 0), 0);
        assertEqual(
          Math.round(actualTotalArea * 100),
          Math.round(expectedTotalArea * 100),
          `Total area sum for duplicate gat "${gat}" must match source (expected: ${expectedTotalArea}, actual: ${actualTotalArea})`
        );
      }

      // Verify grand total area across all Koradi parcels
      const canonicalTotalArea = canonical.reduce((acc, p) => acc + p.totalAreaHa, 0);
      const apiTotalArea = apiResult.parcels.reduce((acc, p) => acc + parseFloat(p.totalAreaHa || 0), 0);
      assertEqual(
        Math.round(apiTotalArea * 100),
        Math.round(canonicalTotalArea * 100),
        `Grand total area across all Koradi parcels must match source spreadsheet (expected: ${canonicalTotalArea.toFixed(2)}, got: ${apiTotalArea.toFixed(2)})`
      );
    }
  },

  {
    name: 'Tier 3.3: Checklist vs Rollup vs DB Parcels Count Invariant (Strict 145 Tri-Consistency)',
    fn: async () => {
      const [apiResult, dbParcels, rollup] = await Promise.all([
        fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' }),
        fetchDbParcels(),
        fetchDbRollup()
      ]);

      const apiCount = apiResult.parcels.length;
      const dbCount = dbParcels.length;
      const rollupTotal712 = rollup ? (rollup.total712Count ?? rollup.totalParcels ?? 0) : 0;

      // Tri-consistency invariant
      assertEqual(apiCount, 145, `API checklist returned count must be 145 (got ${apiCount})`);
      assertEqual(dbCount, 145, `Database LandParcel count must be 145 (got ${dbCount})`);
      assertEqual(
        rollupTotal712,
        145,
        `Database PrapatraRollup total712Count must be 145 (got ${rollupTotal712}). Rollup must reflect the canonical record count.`
      );

      assertEqual(
        apiCount,
        dbCount,
        `API checklist count (${apiCount}) must match Database LandParcel count (${dbCount})`
      );
      assertEqual(
        dbCount,
        rollupTotal712,
        `Database LandParcel count (${dbCount}) must match PrapatraRollup total712Count (${rollupTotal712})`
      );
    }
  }
];

// CLI runner if executed directly
if (process.argv[1] && process.argv[1].endsWith('tier3_cross_feature.test.mjs')) {
  runSuite('Tier 3: Cross-Feature Combinations (Koradi Village)', tier3Tests)
    .catch(console.error)
    .finally(() => closePrisma());
}

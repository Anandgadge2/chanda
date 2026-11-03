/**
 * Tier 1: Feature Coverage E2E Tests
 * 
 * Verifies core requirements for Koradi village (Korpana taluka):
 * - R1.1: Exact Record Count (145 records matching source spreadsheet)
 * - R1.2: Survey 1/1 & 1/2 presence and top ordering (excelSrNo 1, 2)
 * - R2.1: Column F Tenure Category mapping (e.g. 'भो.व-1', 'भो.व-2')
 * - R2.2: Column G Occupant Name mapping (occupant/owner names)
 * - R2.3: Column H Other Rights mapping (rights entries)
 */

import {
  getCanonicalKoradiParcels,
  getCanonicalParcelBySr
} from './helpers/oracle.mjs';
import {
  fetchChecklistParcels,
  fetchDbParcels,
  runSuite,
  assertEqual,
  assert,
  assertIncludes,
  closePrisma
} from './helpers/test_utils.mjs';

export const tier1Tests = [
  {
    name: 'Tier 1.1: Exact Record Count for Koradi Village (API returns exactly 145 parcels)',
    fn: async () => {
      const canonical = await getCanonicalKoradiParcels();
      assertEqual(canonical.length, 145, 'Authoritative oracle must contain 145 records');

      const apiResult = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });
      assertEqual(apiResult.statusCode, 200, 'API response status must be 200');
      assertEqual(apiResult.success, true, 'API response success flag must be true');
      assertEqual(
        apiResult.parcels.length,
        145,
        `Expected exactly 145 parcels returned by API for Koradi village (got ${apiResult.parcels.length}). Must not be 150 (ghost duplicate bug) or 137 (deduplication collapse bug).`
      );
    }
  },

  {
    name: 'Tier 1.2: Database LandParcel Count for Koradi Village (DB has 145 clean parcels, no ghosts)',
    fn: async () => {
      const dbParcels = await fetchDbParcels();
      assertEqual(
        dbParcels.length,
        145,
        `Database LandParcel table must contain exactly 145 records for Koradi village (got ${dbParcels.length}). Extra 5 ghost records must be cleaned.`
      );

      // Verify no records end with trailing periods in DB
      const dotted = dbParcels.filter(p => String(p.gatNumber || '').endsWith('.'));
      assertEqual(
        dotted.length,
        0,
        `Database must not contain unnormalized gat numbers with trailing periods. Found: ${dotted.map(d => d.gatNumber).join(', ')}`
      );
    }
  },

  {
    name: 'Tier 1.3: Survey 1/1 and 1/2 Presence and Top Ordering (excelSrNo 1 and 2 at positions 0 and 1)',
    fn: async () => {
      const apiResult = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });
      assert(apiResult.parcels.length >= 2, 'API must return at least 2 parcels');

      const first = apiResult.parcels[0];
      const second = apiResult.parcels[1];

      // Position 0 must be Survey 1/1 with excelSrNo: 1
      assertEqual(
        first.gatNumber.replace(/\.$/, ''),
        '1/1',
        `First record in sorted checklist must be Survey 1/1 (found gat: "${first.gatNumber}", srNo: ${first.srNo}, excelSrNo: ${first.excelSrNo})`
      );
      assertEqual(first.excelSrNo, 1, `First record excelSrNo must be 1 (got ${first.excelSrNo})`);
      assertEqual(Number(first.totalAreaHa), 2.67, `Survey 1/1 area must be 2.67 Ha (got ${first.totalAreaHa})`);

      // Position 1 must be Survey 1/2 with excelSrNo: 2
      assertEqual(
        second.gatNumber.replace(/\.$/, ''),
        '1/2',
        `Second record in sorted checklist must be Survey 1/2 (found gat: "${second.gatNumber}", srNo: ${second.srNo}, excelSrNo: ${second.excelSrNo})`
      );
      assertEqual(second.excelSrNo, 2, `Second record excelSrNo must be 2 (got ${second.excelSrNo})`);
      assertEqual(Number(second.totalAreaHa), 0.81, `Survey 1/2 area must be 0.81 Ha (got ${second.totalAreaHa})`);
    }
  },

  {
    name: 'Tier 1.4: Column F Tenure Category Mapping (Maps to tenureCategory, not occupant name)',
    fn: async () => {
      const apiResult = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });
      assert(apiResult.parcels.length > 0, 'API must return parcels');

      // Check first record (Survey 1/1, Sheet Col F: 'भो.व-2')
      const p1 = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '1/1');
      assert(Boolean(p1), 'Survey 1/1 must be present');
      assertEqual(
        p1.tenureClass,
        'BHOGVATDAR_CLASS_2',
        `Survey 1/1 tenureClass must map Column F 'भो.व-2' to BHOGVATDAR_CLASS_2 (got ${p1.tenureClass})`
      );
      assertIncludes(
        p1.tenureDisplay,
        'वर्ग-२',
        `Survey 1/1 tenureDisplay must be 'भोगवटादार वर्ग-२' (got ${p1.tenureDisplay})`
      );

      // Check record 3 (Survey 2, Sheet Col F: 'भो.व-2')
      const p3 = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '2');
      if (p3) {
        assertEqual(
          p3.tenureClass,
          'BHOGVATDAR_CLASS_2',
          `Survey 2 tenureClass must map Column F 'भो.व-2' to BHOGVATDAR_CLASS_2 (got ${p3.tenureClass})`
        );
      }

      // Check that tenureDisplay across all returned records never contains occupant names
      for (const p of apiResult.parcels) {
        assert(
          !p.tenureDisplay.includes('भोयर') && !p.tenureDisplay.includes('ठाकरे') && !p.tenureDisplay.includes('फोफरे'),
          `Tenure display for gat ${p.gatNumber} contains person name: ${p.tenureDisplay}`
        );
      }
    }
  },

  {
    name: 'Tier 1.5: Column G Occupant Name Mapping (Maps to currentOwner, not tenure code)',
    fn: async () => {
      const apiResult = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });
      assert(apiResult.parcels.length > 0, 'API must return parcels');

      // Survey 1/1 occupant in Sheet Col G
      const p1 = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '1/1');
      assert(Boolean(p1), 'Survey 1/1 must be present');
      assert(
        !p1.currentOwner.startsWith('भो.व') && !p1.currentOwner.startsWith('भोगव'),
        `Survey 1/1 currentOwner must NOT be a tenure code (got: "${p1.currentOwner}")`
      );
      assertIncludes(
        p1.currentOwner,
        'अनिता गजानन भोयर',
        `Survey 1/1 currentOwner must contain 'अनिता गजानन भोयर' from Column G (got: "${p1.currentOwner}")`
      );

      // Survey 1/2 occupant in Sheet Col G
      const p2 = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '1/2');
      assert(Boolean(p2), 'Survey 1/2 must be present');
      assert(
        !p2.currentOwner.startsWith('भो.व') && !p2.currentOwner.startsWith('भोगव'),
        `Survey 1/2 currentOwner must NOT be a tenure code (got: "${p2.currentOwner}")`
      );
      assertIncludes(
        p2.currentOwner,
        'रविंद्र मनोहर ठाकरे',
        `Survey 1/2 currentOwner must contain 'रविंद्र मनोहर ठाकरे' from Column G (got: "${p2.currentOwner}")`
      );

      // Survey 100 (Sr 145) occupant in Sheet Col G
      const p145 = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '100');
      assert(Boolean(p145), 'Survey 100 must be present');
      assertIncludes(
        p145.currentOwner,
        'मनोहर शिवराम भोयर',
        `Survey 100 currentOwner must contain 'मनोहर शिवराम भोयर' from Column G (got: "${p145.currentOwner}")`
      );
    }
  },

  {
    name: 'Tier 1.6: Column H Other Rights Mapping (Maps to otherRights, not occupant name)',
    fn: async () => {
      const apiResult = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });
      assert(apiResult.parcels.length > 0, 'API must return parcels');

      // Survey 1/1 other rights in Sheet Col H
      const p1 = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '1/1');
      assert(Boolean(p1), 'Survey 1/1 must be present');
      assert(
        !p1.otherRights.includes('अनिता गजानन भोयर'),
        `Survey 1/1 otherRights must NOT contain occupant name (got: "${p1.otherRights}")`
      );
      assertIncludes(
        p1.otherRights,
        'भुमीधारी हक्काने प्राप्त झालेली जमीन',
        `Survey 1/1 otherRights must match Column H (got: "${p1.otherRights}")`
      );

      // Survey 1/2 other rights in Sheet Col H
      const p2 = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '1/2');
      assert(Boolean(p2), 'Survey 1/2 must be present');
      assert(
        !p2.otherRights.includes('रविंद्र मनोहर ठाकरे'),
        `Survey 1/2 otherRights must NOT contain occupant name (got: "${p2.otherRights}")`
      );
      assertIncludes(
        p2.otherRights,
        'कुळ कायद्याने प्राप्त जमीन',
        `Survey 1/2 otherRights must match Column H (got: "${p2.otherRights}")`
      );

      // Survey 100 other rights in Sheet Col H
      const p145 = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '100');
      assert(Boolean(p145), 'Survey 100 must be present');
      assertIncludes(
        p145.otherRights,
        'इनाम व वतन जमीनी',
        `Survey 100 otherRights must match Column H (got: "${p145.otherRights}")`
      );
    }
  }
];

// CLI runner if executed directly
if (process.argv[1] && process.argv[1].endsWith('tier1_feature_coverage.test.mjs')) {
  runSuite('Tier 1: Feature Coverage (Koradi Village)', tier1Tests)
    .catch(console.error)
    .finally(() => closePrisma());
}

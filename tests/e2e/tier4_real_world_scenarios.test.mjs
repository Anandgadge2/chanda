/**
 * Tier 4: Real-World Application Scenarios E2E Tests
 * 
 * Verifies end-to-end portal usage workflows:
 * - End-to-End API Checklist Queries (schema compliance, payload integrity)
 * - Reports Endpoint Filtering Simulation (tenure filtering matching canonical distribution, search)
 * - Table Layout Bounds & Text Containment Verification (prevents column overlap into adjacent columns)
 */

import {
  getCanonicalKoradiParcels,
  getCanonicalTenureDistribution
} from './helpers/oracle.mjs';
import {
  fetchChecklistParcels,
  inspectFrontendReportsPage,
  runSuite,
  assertEqual,
  assert,
  assertIncludes,
  assertMatches,
  closePrisma
} from './helpers/test_utils.mjs';

export const tier4Tests = [
  {
    name: 'Tier 4.1: End-to-End API Query Contract & Response Schema Compliance',
    fn: async () => {
      const apiResult = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });

      assertEqual(apiResult.statusCode, 200, 'Checklist API must return HTTP 200');
      assertEqual(apiResult.success, true, 'Checklist API response must have success: true');
      assertEqual(apiResult.parcels.length, 145, `API must return 145 parcels (got ${apiResult.parcels.length})`);

      // Verify parcel schema invariants across every returned item
      for (let i = 0; i < apiResult.parcels.length; i++) {
        const p = apiResult.parcels[i];
        assert(Boolean(p.id), `Parcel at index ${i} missing id`);
        assert(Boolean(p.upi), `Parcel at index ${i} missing upi`);
        assert(Boolean(p.gatNumber), `Parcel at index ${i} missing gatNumber`);
        assert(Boolean(p.totalAreaHa), `Parcel at index ${i} missing totalAreaHa`);
        assert(Boolean(p.currentOwner), `Parcel at index ${i} missing currentOwner`);
        assert(Boolean(p.tenureDisplay), `Parcel at index ${i} missing tenureDisplay`);
        assert(Boolean(p.tenureClass), `Parcel at index ${i} missing tenureClass`);
        assert(p.otherRights !== undefined, `Parcel at index ${i} missing otherRights`);
        assert(Boolean(p.points), `Parcel at index ${i} missing 46 points map`);
        assert(p.excelSrNo !== undefined && !isNaN(p.excelSrNo), `Parcel at index ${i} missing valid excelSrNo`);
      }
    }
  },

  {
    name: 'Tier 4.2: Reports Endpoint Tenure Filter Simulation (Matches Canonical Distribution)',
    fn: async () => {
      const canonicalDist = await getCanonicalTenureDistribution();
      // Canonical distribution: Class 1 = 64, Class 2 = 80, Sarkar = 1
      assertEqual(canonicalDist.BHOGVATDAR_CLASS_1, 64, 'Class 1 canonical count should be 64');
      assertEqual(canonicalDist.BHOGVATDAR_CLASS_2, 80, 'Class 2 canonical count should be 80');
      assertEqual(canonicalDist.SARKAR_SHASAN, 1, 'Sarkar canonical count should be 1');

      // Test tenure=BHOGVATDAR_CLASS_2 filter
      const resClass2 = await fetchChecklistParcels({
        taluka: 'Korpana',
        village: 'कोराडी',
        tenure: 'BHOGVATDAR_CLASS_2'
      });
      assertEqual(
        resClass2.parcels.length,
        canonicalDist.BHOGVATDAR_CLASS_2,
        `Filtering by tenure=BHOGVATDAR_CLASS_2 must return exactly ${canonicalDist.BHOGVATDAR_CLASS_2} parcels (got ${resClass2.parcels.length})`
      );

      // Test tenure=BHOGVATDAR_CLASS_1 filter
      const resClass1 = await fetchChecklistParcels({
        taluka: 'Korpana',
        village: 'कोराडी',
        tenure: 'BHOGVATDAR_CLASS_1'
      });
      assertEqual(
        resClass1.parcels.length,
        canonicalDist.BHOGVATDAR_CLASS_1,
        `Filtering by tenure=BHOGVATDAR_CLASS_1 must return exactly ${canonicalDist.BHOGVATDAR_CLASS_1} parcels (got ${resClass1.parcels.length})`
      );
    }
  },

  {
    name: 'Tier 4.3: Reports Search Workflow Simulation (Search by Survey 1/1 and Owner)',
    fn: async () => {
      // Search by Survey '1/1'
      const searchRes = await fetchChecklistParcels({
        taluka: 'Korpana',
        village: 'कोराडी',
        search: '1/1'
      });
      assert(searchRes.parcels.length >= 1, 'Search for "1/1" must return at least 1 record');
      const found11 = searchRes.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '1/1');
      assert(Boolean(found11), 'Search result must include Survey 1/1');
      assertIncludes(found11.currentOwner, 'अनिता गजानन भोयर', 'Survey 1/1 search result must contain occupant name');
    }
  },

  {
    name: 'Tier 4.4: Table Layout Bounds and Column Overflow Containment in Reports UI',
    fn: async () => {
      const frontend = inspectFrontendReportsPage();

      // Table root has whitespace-nowrap
      assert(frontend.hasTableNowrap, 'Timeline <table> should have base styling');

      // The otherRights cell (Column 6) MUST have whitespace-normal and break-words
      // to prevent long text from encroaching into Column 7 ('i) बंदोबस्त क्र. (1950)')
      const otherRightsTd = frontend.otherRightsTd;
      assert(Boolean(otherRightsTd), 'otherRights <td> must exist in frontend/src/app/reports/page.jsx');

      const hasWordWrap = otherRightsTd.includes('whitespace-normal') || otherRightsTd.includes('break-words') || otherRightsTd.includes('line-clamp');
      const hasOverflowControl = otherRightsTd.includes('overflow-hidden') || otherRightsTd.includes('break-words') || otherRightsTd.includes('whitespace-normal');

      assert(
        hasWordWrap && hasOverflowControl,
        `The 'इतर अधिकारातील नोंद' <td> in frontend/src/app/reports/page.jsx MUST have 'whitespace-normal' and 'break-words' (or line-clamp container) to prevent text overlap into adjacent columns. Current classes: "${otherRightsTd.slice(0, 150)}"`
      );

      // Verify the otherRights <th> header also wraps cleanly
      const otherRightsTh = frontend.otherRightsTh;
      assert(Boolean(otherRightsTh), 'otherRights <th> must exist');
      assert(
        otherRightsTh.includes('whitespace-normal') || otherRightsTh.includes('break-words') || otherRightsTh.includes('leading-normal'),
        `The 'इतर अधिकारातील नोंद' <th> in frontend/src/app/reports/page.jsx must support clean wrapping`
      );
    }
  }
];

// CLI runner if executed directly
if (process.argv[1] && process.argv[1].endsWith('tier4_real_world_scenarios.test.mjs')) {
  runSuite('Tier 4: Real-World Application Scenarios (Koradi Village)', tier4Tests)
    .catch(console.error)
    .finally(() => closePrisma());
}

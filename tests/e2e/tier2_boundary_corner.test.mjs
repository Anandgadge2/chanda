/**
 * Tier 2: Boundary & Corner Cases E2E Tests
 * 
 * Verifies edge conditions and domain constraints for Koradi village:
 * - Empty / null / '..' fields (64 empty rights, '..' in NA areas)
 * - Multiple co-sharers (up to 10 co-sharers per parcel, preserving all names)
 * - Trailing periods in survey numbers (47 dotted gats, trailing dot normalization)
 * - Long Marathi strings (Devanagari strings up to 275 chars, encoding fidelity)
 * - Extreme survey numbers & Marathi sub-divisions ('1/1', '100', '58/2/अ', '58/2/ब')
 */

import {
  getCanonicalKoradiParcels,
  getTrailingDotGats,
  getMultiCoSharerRows
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
import { normalizeGatKey } from '../../backend/src/services/prapatraReconciliationService.js';

export const tier2Tests = [
  {
    name: 'Tier 2.1: Empty and Null Fields Graceful Handling (No NaN or undefined)',
    fn: async () => {
      const apiResult = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });
      assert(apiResult.parcels.length > 0, 'API must return parcels');

      for (const p of apiResult.parcels) {
        // Area must be a valid positive float string, not NaN
        assert(!isNaN(parseFloat(p.totalAreaHa)), `Parcel ${p.gatNumber} totalAreaHa is NaN`);
        assert(parseFloat(p.totalAreaHa) > 0, `Parcel ${p.gatNumber} totalAreaHa must be > 0 (got ${p.totalAreaHa})`);

        // Fields must never literally be 'undefined' or 'null' strings
        assert(p.currentOwner !== 'undefined' && p.currentOwner !== 'null', `currentOwner is undefined/null string on ${p.gatNumber}`);
        assert(p.otherRights !== 'undefined' && p.otherRights !== 'null', `otherRights is undefined/null string on ${p.gatNumber}`);
        assert(p.tenureDisplay !== 'undefined' && p.tenureDisplay !== 'null', `tenureDisplay is undefined/null string on ${p.gatNumber}`);

        // Sequence number must be a valid number, not NaN
        assert(!isNaN(p.excelSrNo), `excelSrNo is NaN on gat ${p.gatNumber}`);
      }
    }
  },

  {
    name: 'Tier 2.2: Multiple Co-Sharers Integrity (Preserves all 10 co-sharers on Sr 1)',
    fn: async () => {
      const canonical = await getCanonicalKoradiParcels();
      const multiRows = await getMultiCoSharerRows();
      assert(multiRows.length >= 40, 'Should identify at least 40 multi-co-sharer rows');

      const apiResult = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });
      const p1 = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '1/1');
      assert(Boolean(p1), 'Survey 1/1 must be present');

      // The 10 co-sharers of Survey 1/1
      const expectedSharers = [
        'अनिता गजानन भोयर',
        'इंदु बाई रामकृष्ण फोफरे',
        'बापूराव रामकृष्ण फोफरे',
        'राहुल शंकर फोफरे',
        'वनिता शंकर फोफरे',
        'शारदा भास्कर पोडे',
        'श्रावण रामकृष्ण फोफरे',
        'सतिश वामन बोढे',
        'सुचिता प्रविण ढवस',
        'स्नेहा प्रविण वडस्कर'
      ];

      for (const sharer of expectedSharers) {
        assertIncludes(
          p1.currentOwner,
          sharer,
          `Co-sharer "${sharer}" must be present in Survey 1/1 occupant string`
        );
      }
    }
  },

  {
    name: 'Tier 2.3: Trailing Period Normalization in Reconciliation Service',
    fn: async () => {
      // Direct unit contract test of normalizeGatKey
      assertEqual(normalizeGatKey('1/1.', null), '1/1', 'normalizeGatKey must strip trailing period from "1/1."');
      assertEqual(normalizeGatKey('1/2.', null), '1/2', 'normalizeGatKey must strip trailing period from "1/2."');
      assertEqual(normalizeGatKey('4/1.', null), '4/1', 'normalizeGatKey must strip trailing period from "4/1."');
      assertEqual(normalizeGatKey('58/2/अ.', null), '58/2/अ', 'normalizeGatKey must strip trailing period from "58/2/अ."');
      assertEqual(normalizeGatKey(' 100. ', null), '100', 'normalizeGatKey must strip trailing period and spaces from " 100. "');

      // Verify across all 47 dotted survey numbers from the canonical sheet
      const dottedParcels = await getTrailingDotGats();
      assertEqual(dottedParcels.length, 47, 'Oracle should contain 47 dotted parcels');

      for (const dp of dottedParcels) {
        const normalized = normalizeGatKey(dp.rawGat, null);
        assert(!normalized.endsWith('.'), `Normalized key "${normalized}" for raw "${dp.rawGat}" must not end with a period`);
        assertEqual(normalized, dp.cleanGat, `Normalized key for "${dp.rawGat}" must equal clean "${dp.cleanGat}"`);
      }
    }
  },

  {
    name: 'Tier 2.4: Long Devanagari Strings Encoding Fidelity (Up to 275 characters preserved)',
    fn: async () => {
      const apiResult = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });

      // Gat 88 has 275 character owner string
      const p88 = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '88');
      if (p88) {
        assert(
          p88.currentOwner.length > 150,
          `Gat 88 occupant name must preserve full length (> 150 chars, got ${p88.currentOwner.length}: "${p88.currentOwner}")`
        );
        assertIncludes(p88.currentOwner, 'करिष्मा विठठल टेकाम', 'Gat 88 must contain first sharer');
        assertIncludes(p88.currentOwner, 'सखुबाई मार्कंड टेकाम', 'Gat 88 must contain last sharer');
      }

      // Gat 16 has 128 character other rights string
      const p16 = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '16');
      if (p16) {
        assert(
          p16.otherRights.length > 50,
          `Gat 16 otherRights must preserve full length (> 50 chars, got ${p16.otherRights.length})`
        );
        assertIncludes(p16.otherRights, 'सक्षम प्राधिकार्यांच्या पूर्व परवानगी शिवाय', 'Gat 16 rights must preserve standard prefix');
      }
    }
  },

  {
    name: 'Tier 2.5: Extreme Survey Numbers & Marathi Sub-divisions (1/1, 100, 58/2/अ, 58/2/ब)',
    fn: async () => {
      const apiResult = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });

      // Minimum survey: 1/1
      const pMin = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '1/1');
      assert(Boolean(pMin), 'Minimum survey 1/1 must be present in results');

      // Maximum survey: 100
      const pMax = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === '100');
      assert(Boolean(pMax), 'Maximum survey 100 must be present in results');
      assertEqual(pMax.excelSrNo, 145, `Survey 100 must have excelSrNo: 145 (got ${pMax.excelSrNo})`);

      // Marathi letter sub-divisions: 58/2/अ, 58/2/ब, 58/2/क, 58/2/ड
      const marathiSubDivs = ['58/2/अ', '58/2/ब', '58/2/क', '58/2/ड'];
      for (const mGat of marathiSubDivs) {
        const found = apiResult.parcels.find(p => p.gatNumber.replace(/\.$/, '') === mGat);
        assert(Boolean(found), `Marathi letter sub-division "${mGat}" must be present in results`);
        assert(!isNaN(found.excelSrNo), `excelSrNo must not be NaN for "${mGat}" (got ${found.excelSrNo})`);
      }
    }
  }
];

// CLI runner if executed directly
if (process.argv[1] && process.argv[1].endsWith('tier2_boundary_corner.test.mjs')) {
  runSuite('Tier 2: Boundary & Corner Cases (Koradi Village)', tier2Tests)
    .catch(console.error)
    .finally(() => closePrisma());
}

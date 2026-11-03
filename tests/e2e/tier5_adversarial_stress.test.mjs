/**
 * Tier 5: Adversarial, Boundary & Idempotency Stress Testing
 * 
 * Verifies high-stress failure modes and system invariants:
 * - Cadastral survey sorting with unusual fractions ('1/1', '1/2', '58/2/अ', '58/2/ब', '100')
 * - Heuristic fallback sorting comparator robustness on randomized/shuffled permutations
 * - Extreme inputs: empty/null fields, corrupt dates, special punctuation, ReDoS resilience
 * - Multi-line Devanagari text (> 300 characters), quotes, special characters
 * - Malicious SQL injection and XSS input resilience
 * - Parser execution idempotency (triple run invariance)
 * - Reconciliation pre-flight diff idempotency (zero net-new, zero omitted)
 * - End-to-end reconciliation re-run idempotency (zero duplicate records generated in DB)
 * - In-memory deduplication selectivity (collapses ghost duplicates, preserves co-sharers)
 */

import {
  fetchChecklistParcels,
  fetchDbParcels,
  fetchDbRollup,
  getPrisma,
  parseCanonicalKoradiExcel,
  runSuite,
  assertEqual,
  assert,
  assertIncludes,
  closePrisma
} from './helpers/test_utils.mjs';
import {
  normalizeGatKey,
  mapTenureToEnum,
  inspectVillageDiff,
  reconcileAndSeedVillage
} from '../../backend/src/services/prapatraReconciliationService.js';
import {
  cleanSurveyNo,
  cleanArea,
  normalizeTenure
} from '../../backend/src/parsers/prapatraParserJs.js';
import { cleanVillageName } from '../../backend/src/utils/prapatraGenerator.js';

export const tier5Tests = [
  // =========================================================================
  // 1. Cadastral Survey Ordering Benchmark
  // =========================================================================
  {
    name: 'Tier 5.1: Cadastral Survey Ordering Benchmark (1/1 < 1/2 < 58/2/अ < 58/2/ब < 100)',
    fn: async () => {
      const apiResult = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });
      assertEqual(apiResult.parcels.length, 145, 'Checklist must contain exactly 145 parcels');

      const idx1_1 = apiResult.parcels.findIndex(p => p.gatNumber.replace(/\.$/, '') === '1/1');
      const idx1_2 = apiResult.parcels.findIndex(p => p.gatNumber.replace(/\.$/, '') === '1/2');
      const idx58_2_a = apiResult.parcels.findIndex(p => p.gatNumber.replace(/\.$/, '') === '58/2/अ');
      const idx58_2_b = apiResult.parcels.findIndex(p => p.gatNumber.replace(/\.$/, '') === '58/2/ब');
      const idx100 = apiResult.parcels.findIndex(p => p.gatNumber.replace(/\.$/, '') === '100');

      assert(idx1_1 !== -1, 'Survey 1/1 must exist in checklist');
      assert(idx1_2 !== -1, 'Survey 1/2 must exist in checklist');
      assert(idx58_2_a !== -1, 'Survey 58/2/अ must exist in checklist');
      assert(idx58_2_b !== -1, 'Survey 58/2/ब must exist in checklist');
      assert(idx100 !== -1, 'Survey 100 must exist in checklist');

      // Top positions
      assertEqual(idx1_1, 0, 'Survey 1/1 must be at index 0');
      assertEqual(idx1_2, 1, 'Survey 1/2 must be at index 1');

      // Terminal position
      assertEqual(idx100, 144, 'Survey 100 must be at index 144 (last row)');

      // Strict ordering chain
      assert(
        idx1_1 < idx1_2 && idx1_2 < idx58_2_a && idx58_2_a < idx58_2_b && idx58_2_b < idx100,
        `Cadastral order invariant violated: idx(1/1)=${idx1_1} < idx(1/2)=${idx1_2} < idx(58/2/अ)=${idx58_2_a} < idx(58/2/ब)=${idx58_2_b} < idx(100)=${idx100}`
      );

      // Verify excelSrNo matches array index + 1
      assertEqual(apiResult.parcels[idx1_1].excelSrNo, 1, 'Survey 1/1 excelSrNo must be 1');
      assertEqual(apiResult.parcels[idx1_2].excelSrNo, 2, 'Survey 1/2 excelSrNo must be 2');
      assertEqual(apiResult.parcels[idx58_2_a].excelSrNo, 92, 'Survey 58/2/अ excelSrNo must be 92');
      assertEqual(apiResult.parcels[idx58_2_b].excelSrNo, 95, 'Survey 58/2/ब excelSrNo must be 95');
      assertEqual(apiResult.parcels[idx100].excelSrNo, 145, 'Survey 100 excelSrNo must be 145');
    }
  },

  // =========================================================================
  // 2. Controller Heuristic & Comparator Robustness (Fractions & Multi-Subdivisions)
  // =========================================================================
  {
    name: 'Tier 5.2: Cadastral Heuristic & Sorting Comparator Robustness (Fractions & Multi-Subdivisions)',
    fn: async () => {
      // Replicate the exact getSeq algorithm from prapatraController.js (lines 1369-1392)
      const getSeq = (item) => {
        if (item.metadata?.srNo !== undefined && item.metadata?.srNo !== null) {
          const s = parseInt(item.metadata.srNo, 10);
          if (!isNaN(s) && s > 0) return s;
        }
        if (item.metadata?.auditPoints?.srNo !== undefined && item.metadata?.auditPoints?.srNo !== null) {
          const s = parseInt(item.metadata.auditPoints.srNo, 10);
          if (!isNaN(s) && s > 0) return s;
        }
        if (item.excelSrNo !== undefined && item.excelSrNo !== null) {
          const s = parseInt(item.excelSrNo, 10);
          if (!isNaN(s) && s > 0) return s;
        }
        const normGat = String(item.gatNumber || '').trim().replace(/\.+$/, '');
        if (normGat === '1/1') return 1;
        if (normGat === '1/2') return 2;
        const m = normGat.match(/^(\d+)(?:\/(\d+))?/);
        if (m) {
          const main = parseInt(m[1], 10);
          const sub = m[2] ? parseInt(m[2], 10) : 0;
          return main * 1000 + sub;
        }
        return 999999;
      };

      // Replicate the controller sorting comparator (lines 1428-1433)
      const cadastralComparator = (a, b) => {
        const srA = a.excelSrNo || getSeq(a) || 0;
        const srB = b.excelSrNo || getSeq(b) || 0;
        if (srA !== srB) return srA - srB;
        return String(a.gatNumber || '').localeCompare(String(b.gatNumber || ''), undefined, { numeric: true });
      };

      // Test 1: Fallback heuristic mode (items with NO metadata.srNo, purely algorithmic ordering)
      const rawGats = [
        '100', '58/2/ब', '1/2', '58/2/अ', '1/1', '1/3', '58/1', '2', '58/2/क', '58/10', '1/10', '58/2/ड'
      ];

      const parcelsWithoutSr = rawGats.map(g => ({ gatNumber: g, metadata: {} }));
      parcelsWithoutSr.sort(cadastralComparator);

      const sortedGats = parcelsWithoutSr.map(p => p.gatNumber);

      // Expected order:
      // 1/1 (seq 1), 1/2 (seq 2), 1/3 (seq 1003), 1/10 (seq 1010),
      // 2 (seq 2000), 58/1 (seq 58001), 58/2/अ, 58/2/क, 58/2/ड, 58/2/ब (all 58002, sorted by localeCompare),
      // 58/10 (seq 58010), 100 (seq 100000)
      assertEqual(sortedGats[0], '1/1', 'Position 0 must be 1/1');
      assertEqual(sortedGats[1], '1/2', 'Position 1 must be 1/2');
      assertEqual(sortedGats[2], '1/3', 'Position 2 must be 1/3');
      assertEqual(sortedGats[3], '1/10', 'Position 3 must be 1/10');
      assertEqual(sortedGats[4], '2', 'Position 4 must be 2');
      assertEqual(sortedGats[5], '58/1', 'Position 5 must be 58/1');
      assertIncludes(sortedGats.slice(6, 10), '58/2/अ', 'Position 6-9 must contain 58/2/अ');
      assertIncludes(sortedGats.slice(6, 10), '58/2/ब', 'Position 6-9 must contain 58/2/ब');
      assertEqual(sortedGats[10], '58/10', 'Position 10 must be 58/10');
      assertEqual(sortedGats[11], '100', 'Position 11 must be 100');

      // Test 2: Invariance under reverse permutation
      const reversedParcels = [...parcelsWithoutSr].reverse();
      reversedParcels.sort(cadastralComparator);
      assertEqual(
        JSON.stringify(reversedParcels.map(p => p.gatNumber)),
        JSON.stringify(sortedGats),
        'Sorting must be deterministic regardless of input permutation'
      );
    }
  },

  // =========================================================================
  // 3. Extreme Inputs Robustness (Empty/Null Fields & Corrupted Data)
  // =========================================================================
  {
    name: 'Tier 5.3: Extreme Inputs Robustness (Empty/Null Fields & Corrupted Data)',
    fn: async () => {
      // 1. normalizeGatKey null/undefined/empty handling
      assertEqual(normalizeGatKey(null, null), '', 'normalizeGatKey(null, null) must return empty string');
      assertEqual(normalizeGatKey(undefined, undefined), '', 'normalizeGatKey(undefined, undefined) must return empty string');
      assertEqual(normalizeGatKey('', ''), '', 'normalizeGatKey("", "") must return empty string');
      assertEqual(normalizeGatKey('   ', '   '), '', 'normalizeGatKey("   ", "   ") must return empty string');
      assertEqual(normalizeGatKey('Mon Oct 12 2026', null), '', 'normalizeGatKey must reject Excel converted date strings');
      assertEqual(normalizeGatKey('2026-10-12 00:00:00 GMT', null), '', 'normalizeGatKey must reject GMT datetime strings');
      assertEqual(normalizeGatKey('58/2/अ....,,,;;:', null), '58/2/अ', 'normalizeGatKey must strip multiple trailing punctuation marks');
      assertEqual(normalizeGatKey(' 58 / 2 / अ ', null), '58/2/अ', 'normalizeGatKey must strip internal whitespace');

      // 2. cleanSurveyNo boundary handling
      assertEqual(cleanSurveyNo(null), null, 'cleanSurveyNo(null) must return null');
      assertEqual(cleanSurveyNo(undefined), null, 'cleanSurveyNo(undefined) must return null');
      assertEqual(cleanSurveyNo(''), null, 'cleanSurveyNo("") must return null');
      assertEqual(cleanSurveyNo('   '), null, 'cleanSurveyNo("   ") must return null');
      assertEqual(cleanSurveyNo('-'), null, 'cleanSurveyNo("-") must return null');
      assertEqual(cleanSurveyNo('–'), null, 'cleanSurveyNo("–") must return null');
      assertEqual(cleanSurveyNo('निरंक'), null, 'cleanSurveyNo("निरंक") must return null');
      assertEqual(cleanSurveyNo('100.0'), '100', 'cleanSurveyNo("100.0") must remove Excel .0 suffix');
      assertEqual(cleanSurveyNo('58/2/अ....'), '58/2/अ', 'cleanSurveyNo must remove trailing dots');
      assertEqual(cleanSurveyNo('सक्षम प्राधिकारी'), null, 'cleanSurveyNo must reject header noise keywords');

      // 3. cleanArea boundary handling
      assertEqual(cleanArea(null), 0.0, 'cleanArea(null) must return 0.0');
      assertEqual(cleanArea(undefined), 0.0, 'cleanArea(undefined) must return 0.0');
      assertEqual(cleanArea(''), 0.0, 'cleanArea("") must return 0.0');
      assertEqual(cleanArea('..'), 0.0, 'cleanArea("..") must return 0.0');
      assertEqual(cleanArea('निरंक'), 0.0, 'cleanArea("निरंक") must return 0.0');
      assertEqual(cleanArea('None'), 0.0, 'cleanArea("None") must return 0.0');
      assertEqual(cleanArea('  1.4500  '), 1.45, 'cleanArea must parse padded float strings');
      assertEqual(cleanArea('0.0000'), 0.0, 'cleanArea must parse zero float');

      // 4. normalizeTenure (Parser) handling
      assertEqual(normalizeTenure('भो.व-2'), 'BHOGVATDAR_CLASS_2', 'normalizeTenure("भो.व-2") must map to CLASS_2');
      assertEqual(normalizeTenure('भो.व-1'), 'BHOGVATDAR_CLASS_1', 'normalizeTenure("भो.व-1") must map to CLASS_1');
      assertEqual(normalizeTenure('', 'आदिवासी जमीन'), 'BHOGVATDAR_CLASS_2', 'normalizeTenure with tribal rights must map to CLASS_2');
      assertEqual(normalizeTenure('', '', '', 'महाराष्ट्र शासन'), 'SARKAR_SHASAN', 'normalizeTenure with govt owner must map to SARKAR_SHASAN');

      // 5. mapTenureToEnum (Reconciliation / Backward History) boundary handling
      assertEqual(mapTenureToEnum(null), 'BHOGVATDAR_CLASS_1', 'mapTenureToEnum(null) must return default');
      assertEqual(mapTenureToEnum(''), 'BHOGVATDAR_CLASS_1', 'mapTenureToEnum("") must return default');
      assertEqual(mapTenureToEnum('अज्ञात'), 'BHOGVATDAR_CLASS_1', 'mapTenureToEnum("अज्ञात") must return default');
      assertEqual(mapTenureToEnum('वर्ग-२'), 'BHOGVATDAR_CLASS_2', 'mapTenureToEnum("वर्ग-२") must map to CLASS_2');
      assertEqual(mapTenureToEnum('२'), 'BHOGVATDAR_CLASS_2', 'mapTenureToEnum("२") must map to CLASS_2');
      assertEqual(mapTenureToEnum('वर्ग-१'), 'BHOGVATDAR_CLASS_1', 'mapTenureToEnum("वर्ग-१") must map to CLASS_1');
      assertEqual(mapTenureToEnum('१'), 'BHOGVATDAR_CLASS_1', 'mapTenureToEnum("१") must map to CLASS_1');
      assertEqual(mapTenureToEnum('शासन जमा / शासकीय'), 'SARKAR_SHASAN', 'mapTenureToEnum must map government land');
    }
  },

  // =========================================================================
  // 4. Multi-Line Devanagari Text (> 300 Characters) & Special Punctuation
  // =========================================================================
  {
    name: 'Tier 5.4: Multi-Line Devanagari Text (> 300 Characters) & Special Punctuation Resilience',
    fn: async () => {
      // Construct a realistic extreme Marathi co-sharer string > 300 characters
      const extremeOwner = [
        'श्रीमती सुलोचनाबाई गजाननराव पाटील (मूळ खातेदार),',
        'श्री. रामकृष्ण गजाननराव पाटील (वारसदार १),',
        'श्री. बापूराव गजाननराव पाटील (वारसदार २),',
        'सौ. शारदाबाई भास्करराव पोडे उर्फ देशपांडे (विवाहित मुलगी),',
        'श्री. श्रावण रामकृष्ण पाटील व इतर सर्व कायदेशीर सह-हिस्सेदार,',
        'विशेष शेरा: मौजे कोराडी येथील सामाईक वहिवाटदार [नोंद क्र. ४५/२०२४-२५].'
      ].join('\n');

      assert(extremeOwner.length > 300, `extremeOwner must exceed 300 chars (is ${extremeOwner.length})`);

      // Construct extreme rights string with statutory conditions and punctuation
      const extremeRights = [
        'महाराष्ट्र जमीन महसूल संहिता १९६६ चे कलम ३६ व ३६-अ च्या तरतुदीनुसार:',
        'सक्षम प्राधिकार्‍यांच्या (मा. जिल्हाधिकारी / उपविभागीय अधिकारी, राजुरा)',
        'पूर्वपरवानगीशिवाय सदर जमिनीची विक्री, बक्षीसपत्र, गहाण अथवा अन्य प्रकारे',
        'हस्तांतरण करण्यास पूर्णपणे सक्त मनाई आहे. (आदेश क्र. मशि/शा-४/कावि-७८९/२०२१)'
      ].join('; ');

      assert(extremeRights.length > 250, `extremeRights must exceed 250 chars (is ${extremeRights.length})`);

      // Simulate Controller dedupMap key generation with extreme strings (lines 1258-1270)
      const simulateDedupKey = (p) => {
        const normGat = String(p.gatNumber || '').trim().replace(/\.+$/, '').replace(/\s+/g, '');
        const metaOwner = String(p.metadata?.ownerName || '').trim();
        const otherRights = String(p.metadata?.otherRights || '').trim();
        const srNo = p.metadata?.srNo !== undefined && p.metadata?.srNo !== null ? String(p.metadata.srNo) : '';

        const ownerSig = metaOwner.toLowerCase().replace(/[\s\.\,]/g, '');
        const rightsSig = otherRights.slice(0, 40).toLowerCase().replace(/[\s\.\,]/g, '');

        return srNo
          ? `${p.taluka?.toLowerCase()}__${cleanVillageName(p.villageName)}__${normGat}__${srNo}`
          : `${p.taluka?.toLowerCase()}__${cleanVillageName(p.villageName)}__${normGat}__${Number(p.totalAreaHa || 0).toFixed(2)}__${ownerSig}__${rightsSig}`;
      };

      const mockParcel = {
        taluka: 'Korpana',
        villageName: 'कोराडी',
        gatNumber: '58/2/अ',
        totalAreaHa: 2.45,
        metadata: {
          srNo: 92,
          ownerName: extremeOwner,
          otherRights: extremeRights
        }
      };

      const keyWithSr = simulateDedupKey(mockParcel);
      assert(Boolean(keyWithSr), 'dedup key with srNo must generate successfully');
      assertEqual(keyWithSr, 'korpana__कोराडी__58/2/अ__92', 'dedup key with srNo must be canonical');

      const mockParcelNoSr = { ...mockParcel, metadata: { ...mockParcel.metadata, srNo: null } };
      const keyWithoutSr = simulateDedupKey(mockParcelNoSr);
      assert(Boolean(keyWithoutSr), 'dedup key without srNo must generate successfully without crashing');
      assert(keyWithoutSr.startsWith('korpana__कोराडी__58/2/अ__2.45__'), 'fallback key must incorporate normalized area and sig');
    }
  },

  // =========================================================================
  // 5. Malicious SQL / Script Injection Resilience
  // =========================================================================
  {
    name: 'Tier 5.5: Malicious SQL / Script Injection Query Resilience',
    fn: async () => {
      // Verify endpoint does not crash or execute raw SQL injection strings
      const sqlInjectionSearch = "'; DROP TABLE \"LandParcel\"; --";
      const apiResult1 = await fetchChecklistParcels({
        taluka: 'Korpana',
        village: 'कोराडी',
        search: sqlInjectionSearch
      });
      assertEqual(apiResult1.statusCode, 200, 'Search with SQL injection must return HTTP 200 safely');
      assertEqual(apiResult1.parcels.length, 0, 'SQL injection string must match 0 parcels');

      // Verify XSS probe strings
      const xssSearch = '<script>alert("xss")</script>';
      const apiResult2 = await fetchChecklistParcels({
        taluka: 'Korpana',
        village: 'कोराडी',
        search: xssSearch
      });
      assertEqual(apiResult2.statusCode, 200, 'Search with XSS probe must return HTTP 200 safely');
      assertEqual(apiResult2.parcels.length, 0, 'XSS probe must match 0 parcels');

      // Confirm DB was untouched
      const dbParcels = await fetchDbParcels();
      assertEqual(dbParcels.length, 145, 'LandParcel table must remain intact with 145 records');
    }
  },

  // =========================================================================
  // 6. Excel Parser Execution Idempotency (Triple Consecutive Run)
  // =========================================================================
  {
    name: 'Tier 5.6: Excel Parser Execution Idempotency (Triple Consecutive Run Invariance)',
    fn: async () => {
      const run1 = await parseCanonicalKoradiExcel();
      const run2 = await parseCanonicalKoradiExcel();
      const run3 = await parseCanonicalKoradiExcel();

      assertEqual(run1.parcels.length, 145, 'Run 1 must parse exactly 145 parcels');
      assertEqual(run2.parcels.length, 145, 'Run 2 must parse exactly 145 parcels');
      assertEqual(run3.parcels.length, 145, 'Run 3 must parse exactly 145 parcels');

      // Verify identical fields across runs
      for (let i = 0; i < 145; i++) {
        const p1 = run1.parcels[i];
        const p2 = run2.parcels[i];
        const p3 = run3.parcels[i];

        assertEqual(p1.gatNumber, p2.gatNumber, `Gat must match between run 1 and 2 at index ${i}`);
        assertEqual(p1.gatNumber, p3.gatNumber, `Gat must match between run 1 and 3 at index ${i}`);
        assertEqual(p1.excelSrNo, p2.excelSrNo, `excelSrNo must match between run 1 and 2 at index ${i}`);
        assertEqual(p1.totalAreaHa, p2.totalAreaHa, `totalAreaHa must match at index ${i}`);
        assertEqual(p1.tenureClass, p2.tenureClass, `tenureClass must match at index ${i}`);
        assertEqual(p1.ownerName, p2.ownerName, `ownerName must match at index ${i}`);
        assertEqual(p1.otherRights, p2.otherRights, `otherRights must match at index ${i}`);
      }
    }
  },

  // =========================================================================
  // 7. Reconciliation Pre-flight Diff Idempotency (Zero Net-New / Zero Omitted)
  // =========================================================================
  {
    name: 'Tier 5.7: Reconciliation Pre-flight Diff Idempotency (Zero Net-New / Zero Omitted)',
    fn: async () => {
      const parsed = await parseCanonicalKoradiExcel();
      const diff = await inspectVillageDiff(parsed.parcels, 'Korpana', 'कोराडी');

      // The diff against current reconciled database must detect NO net-new and NO omitted rows
      assertEqual(diff.stats.totalInSheet, 145, 'Total in sheet must be 145');
      assertEqual(diff.stats.totalInDb, 145, 'Total in DB must be 145');
      assertEqual(diff.stats.netNewCount, 0, 'netNewCount must be strictly 0 (no missing parcels)');
      assertEqual(diff.stats.omittedCount, 0, 'omittedCount must be strictly 0 (no ghost or orphaned parcels)');
      assertEqual(diff.netNewRows.length, 0, 'netNewRows array must be empty');
      assertEqual(diff.omittedRows.length, 0, 'omittedRows array must be empty');
    }
  },

  // =========================================================================
  // 8. Full End-to-End Reconcile & Seed Idempotency Execution
  // =========================================================================
  {
    name: 'Tier 5.8: Full End-to-End Reconcile & Seed Idempotency (Zero Duplicate Records Generated)',
    fn: async () => {
      const prisma = await getPrisma();

      // Step 1: Execute 1st Reconciliation Cycle
      const parsed = await parseCanonicalKoradiExcel();
      await reconcileAndSeedVillage({
        parcels: parsed.parcels,
        stats: parsed.stats,
        targetTaluka: 'Korpana',
        finalVillage: 'कोराडी',
        villageCode: '032'
      });

      // Record state after Run 1
      const postRun1Parcels = await fetchDbParcels();
      assertEqual(postRun1Parcels.length, 145, 'Post-Run-1 DB parcel count must remain strictly 145');

      const postRun1Rollup = await fetchDbRollup();
      assertEqual(postRun1Rollup.total712Count, 145, 'Post-Run-1 Rollup must remain strictly 145');

      const postRun1CasesCount = await prisma.forwardEnforcementCase.count({
        where: { parcel: { taluka: { equals: 'Korpana', mode: 'insensitive' }, villageName: { contains: 'कोराडी' } } }
      });

      const postRun1BackwardCount = await prisma.backwardHistory.count({
        where: { parcel: { taluka: { equals: 'Korpana', mode: 'insensitive' }, villageName: { contains: 'कोराडी' } } }
      });

      // Step 2: Execute 2nd Reconciliation Cycle (Consecutive re-run)
      await reconcileAndSeedVillage({
        parcels: parsed.parcels,
        stats: parsed.stats,
        targetTaluka: 'Korpana',
        finalVillage: 'कोराडी',
        villageCode: '032'
      });

      // Assert post-run 2 state is strictly identical to post-run 1 state
      const postRun2Parcels = await fetchDbParcels();
      assertEqual(postRun2Parcels.length, 145, 'Post-Run-2 DB parcel count must still remain strictly 145 (no duplicates)');
      assertEqual(postRun2Parcels.length, postRun1Parcels.length, 'Parcel count must not change across reconciliation runs');

      const postRun2Rollup = await fetchDbRollup();
      assertEqual(postRun2Rollup.total712Count, 145, 'Post-Run-2 Rollup must still remain strictly 145');
      assertEqual(postRun2Rollup.total712Count, postRun1Rollup.total712Count, 'Rollup count must not change across reconciliation runs');

      const postRun2CasesCount = await prisma.forwardEnforcementCase.count({
        where: { parcel: { taluka: { equals: 'Korpana', mode: 'insensitive' }, villageName: { contains: 'कोराडी' } } }
      });
      assertEqual(postRun2CasesCount, postRun1CasesCount, 'Forward enforcement cases count must remain identical across reconciliation runs');

      const postRun2BackwardCount = await prisma.backwardHistory.count({
        where: { parcel: { taluka: { equals: 'Korpana', mode: 'insensitive' }, villageName: { contains: 'कोराडी' } } }
      });
      assertEqual(postRun2BackwardCount, postRun1BackwardCount, 'Backward history count must remain identical across reconciliation runs');

      // Step 3: Verify API Checklist retains top ordering
      const apiCheck = await fetchChecklistParcels({ taluka: 'Korpana', village: 'कोराडी' });
      assertEqual(apiCheck.parcels.length, 145, 'API checklist must return exactly 145 parcels after re-seeding');
      assertEqual(apiCheck.parcels[0].gatNumber.replace(/\.$/, ''), '1/1', 'Position 0 must be Survey 1/1');
      assertEqual(apiCheck.parcels[0].excelSrNo, 1, 'Position 0 excelSrNo must be 1');
      assertEqual(apiCheck.parcels[1].gatNumber.replace(/\.$/, ''), '1/2', 'Position 1 must be Survey 1/2');
      assertEqual(apiCheck.parcels[1].excelSrNo, 2, 'Position 1 excelSrNo must be 2');
    }
  },

  // =========================================================================
  // 9. In-Memory Deduplication Idempotency with Injected Ghost Duplicates
  // =========================================================================
  {
    name: 'Tier 5.9: In-Memory Deduplication Selectivity (Collapses Ghost Duplicates, Preserves Co-Sharers)',
    fn: async () => {
      // Replicate the exact dedupMap logic from prapatraController.js (lines 1255-1285)
      const runDedupMap = (rawParcels) => {
        const dedupMap = new Map();
        for (const p of rawParcels) {
          const normGat = String(p.gatNumber || '').trim().replace(/\.+$/, '').replace(/\s+/g, '');
          const metaOwner = String(p.metadata?.ownerName || '').trim();
          const otherRights = String(p.metadata?.otherRights || '').trim();
          const srNo = p.metadata?.srNo !== undefined && p.metadata?.srNo !== null ? String(p.metadata.srNo) : '';

          const ownerSig = metaOwner.toLowerCase().replace(/[\s\.\,]/g, '');
          const rightsSig = otherRights.slice(0, 40).toLowerCase().replace(/[\s\.\,]/g, '');

          const key = srNo
            ? `${p.taluka?.toLowerCase()}__${cleanVillageName(p.villageName)}__${normGat}__${srNo}`
            : `${p.taluka?.toLowerCase()}__${cleanVillageName(p.villageName)}__${normGat}__${Number(p.totalAreaHa || 0).toFixed(2)}__${ownerSig}__${rightsSig}`;

          if (!dedupMap.has(key)) {
            dedupMap.set(key, p);
          } else {
            const existing = dedupMap.get(key);
            const existingPoints = Object.keys(existing.metadata?.auditPoints || {}).length;
            const currentPoints = Object.keys(p.metadata?.auditPoints || {}).length;
            const existingBk = existing.backwardHistories?.length || 0;
            const currentBk = p.backwardHistories?.length || 0;

            if (
              currentPoints > existingPoints ||
              (currentPoints === existingPoints && currentBk > existingBk) ||
              (currentPoints === existingPoints && currentBk === existingBk && new Date(p.createdAt || 0) > new Date(existing.createdAt || 0))
            ) {
              dedupMap.set(key, p);
            }
          }
        }
        return Array.from(dedupMap.values());
      };

      // Test dataset with:
      // a) 2 legitimate co-sharer parcels for Gat 24 (different owners and different srNo)
      // b) 1 ghost duplicate for Survey 1/1 (identical srNo, duplicate row)
      const testParcels = [
        {
          id: '1',
          taluka: 'Korpana',
          villageName: 'कोराडी',
          gatNumber: '1/1',
          totalAreaHa: 2.34,
          metadata: { srNo: 1, ownerName: 'अनिता गजानन भोयर' },
          createdAt: new Date('2026-01-01')
        },
        {
          id: '1-ghost',
          taluka: 'Korpana',
          villageName: 'कोराडी',
          gatNumber: '1/1.', // trailing dot ghost
          totalAreaHa: 2.34,
          metadata: { srNo: 1, ownerName: 'अनिता गजानन भोयर' },
          createdAt: new Date('2026-01-02') // newer
        },
        {
          id: '24-a',
          taluka: 'Korpana',
          villageName: 'कोराडी',
          gatNumber: '24',
          totalAreaHa: 1.05,
          metadata: { srNo: 35, ownerName: 'उज्वला बालाजी मोरे' }
        },
        {
          id: '24-b',
          taluka: 'Korpana',
          villageName: 'कोराडी',
          gatNumber: '24',
          totalAreaHa: 1.05,
          metadata: { srNo: 36, ownerName: 'अनिता संतोष मालेकर' }
        }
      ];

      const deduped = runDedupMap(testParcels);

      // Invariant:
      // - Ghost duplicate '1-ghost' must be collapsed (only 1 parcel for Gat 1/1)
      // - Both co-sharers '24-a' and '24-b' must be preserved because they have distinct srNo!
      assertEqual(deduped.length, 3, 'dedupMap must produce 3 parcels from 4 input rows');

      const gat1Parcels = deduped.filter(p => p.gatNumber.replace(/\.$/, '') === '1/1');
      assertEqual(gat1Parcels.length, 1, 'Gat 1/1 must have exactly 1 record after deduplication');
      assertEqual(gat1Parcels[0].id, '1-ghost', 'dedupMap should pick the newer/richer record for 1/1');

      const gat24Parcels = deduped.filter(p => p.gatNumber === '24');
      assertEqual(gat24Parcels.length, 2, 'Gat 24 must preserve both legitimate co-sharer records');
    }
  }
];

// CLI runner if executed directly
if (process.argv[1] && process.argv[1].endsWith('tier5_adversarial_stress.test.mjs')) {
  runSuite('Tier 5: Adversarial, Boundary & Idempotency Stress Testing', tier5Tests)
    .catch(console.error)
    .finally(() => closePrisma());
}

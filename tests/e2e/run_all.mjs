#!/usr/bin/env node

/**
 * Master E2E Test Suite Runner for Chandrapur Land Governance Portal
 * Koradi Village (Korpana Taluka) Discrepancy Fixes
 * 
 * Usage:
 *   node tests/e2e/run_all.mjs            # Run all 4 tiers
 *   node tests/e2e/run_all.mjs --tier 1   # Run Tier 1 only
 *   node tests/e2e/run_all.mjs --tier 2   # Run Tier 2 only
 *   node tests/e2e/run_all.mjs --tier 3   # Run Tier 3 only
 *   node tests/e2e/run_all.mjs --tier 4   # Run Tier 4 only
 */

import { tier1Tests } from './tier1_feature_coverage.test.mjs';
import { tier2Tests } from './tier2_boundary_corner.test.mjs';
import { tier3Tests } from './tier3_cross_feature.test.mjs';
import { tier4Tests } from './tier4_real_world_scenarios.test.mjs';
import { tier5Tests } from './tier5_adversarial_stress.test.mjs';
import { runSuite, closePrisma } from './helpers/test_utils.mjs';

const args = process.argv.slice(2);
const tierArgIdx = args.indexOf('--tier');
const targetTier = tierArgIdx !== -1 ? parseInt(args[tierArgIdx + 1], 10) : null;

const suites = [
  { tier: 1, name: 'Tier 1: Feature Coverage (Record Count, Survey 1/1 & 1/2, Columns F/G/H)', tests: tier1Tests },
  { tier: 2, name: 'Tier 2: Boundary & Corner Cases (Nulls, Co-Sharers, Trailing Dots, Long Strings)', tests: tier2Tests },
  { tier: 3, name: 'Tier 3: Cross-Feature Combinations (Pairwise, Area Consistency, Tri-Consistency)', tests: tier3Tests },
  { tier: 4, name: 'Tier 4: Real-World Application Scenarios (API, Reports Filtering, Table Bounds)', tests: tier4Tests },
  { tier: 5, name: 'Tier 5: Adversarial, Boundary & Idempotency Stress Testing', tests: tier5Tests },
];

async function main() {
  const startTime = Date.now();
  console.log(`\n================================================================================`);
  console.log(` Chandrapur Land Governance & Revenue Portal — E2E Test Suite (Koradi Village)`);
  console.log(`================================================================================\n`);

  const filteredSuites = targetTier ? suites.filter(s => s.tier === targetTier) : suites;

  if (filteredSuites.length === 0) {
    console.error(`Invalid tier specified: ${targetTier}. Choose 1, 2, 3, or 4.`);
    process.exit(1);
  }

  const allSuiteResults = [];
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of filteredSuites) {
    const res = await runSuite(suite.name, suite.tests);
    allSuiteResults.push(res);
    totalTests += res.total;
    totalPassed += res.passed;
    totalFailed += res.failed;
  }

  const totalDuration = Date.now() - startTime;

  console.log(`\n================================================================================`);
  console.log(`                           FINAL E2E EXECUTION REPORT                           `);
  console.log(`================================================================================`);
  console.log(`Total Execution Time : ${totalDuration} ms`);
  console.log(`Total Suites Run     : ${filteredSuites.length}`);
  console.log(`Total Test Cases     : ${totalTests}`);
  console.log(`Passed               : ${totalPassed} (${Math.round((totalPassed / totalTests) * 100)}%)`);
  console.log(`Failed               : ${totalFailed} (${Math.round((totalFailed / totalTests) * 100)}%)`);
  console.log(`================================================================================\n`);

  if (totalFailed > 0) {
    console.log(`FAILED TEST DETAILS:`);
    let failIdx = 1;
    for (const s of allSuiteResults) {
      for (const r of s.results) {
        if (!r.passed) {
          console.log(`\n  ${failIdx++}) [${s.suiteName}]`);
          console.log(`     Test:     ${r.name}`);
          console.log(`     Error:    ${r.error}`);
          if (r.expected !== undefined && r.actual !== undefined) {
            console.log(`     Expected: ${JSON.stringify(r.expected)}`);
            console.log(`     Actual:   ${JSON.stringify(r.actual)}`);
          }
        }
      }
    }
    console.log(`\n================================================================================\n`);
    await closePrisma();
    process.exit(1);
  } else {
    console.log(`ALL ${totalTests} TESTS PASSED SUCCESSFULLY!\n`);
    await closePrisma();
    process.exit(0);
  }
}

main().catch(async (err) => {
  console.error('Fatal Test Runner Error:', err);
  await closePrisma();
  process.exit(1);
});

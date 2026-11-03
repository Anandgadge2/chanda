/**
 * E2E Test Utilities & Harness for Chandrapur Land Governance Portal
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');

// Load environment variables from backend/.env natively
const backendEnvPath = path.join(ROOT_DIR, 'backend/.env');
if (fs.existsSync(backendEnvPath)) {
  const envContent = fs.readFileSync(backendEnvPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

let prismaClient = null;

export async function getPrisma() {
  if (!prismaClient) {
    const prismaModule = await import(pathToFileURL(path.join(ROOT_DIR, 'backend/src/config/prisma.js')).href);
    prismaClient = prismaModule.default || prismaModule;
  }
  return prismaClient;
}

export async function closePrisma() {
  if (prismaClient) {
    try {
      await prismaClient.$disconnect();
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Fetch parcels via Prapatra Controller (Simulates GET /api/prapatra/checklist)
 */
export async function fetchChecklistParcels(options = {}) {
  const { getPrapatraReport } = await import(pathToFileURL(path.join(ROOT_DIR, 'backend/src/controllers/prapatraController.js')).href);

  const req = {
    params: { id: 'checklist' },
    query: {
      taluka: options.taluka || 'Korpana',
      village: options.village || 'कोराडी',
      tenure: options.tenure || 'all',
      violation: options.violation || 'all',
      areaRange: options.areaRange || 'all',
      search: options.search || '',
      format: 'json',
      booklet: 'false'
    }
  };

  let statusCode = 200;
  let jsonResult = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResult = data;
      return res;
    },
    setHeader: () => {}
  };

  await getPrapatraReport(req, res);

  return {
    statusCode,
    success: jsonResult?.success ?? false,
    parcels: jsonResult?.parcels || [],
    total: jsonResult?.parcels?.length || 0,
    meta: jsonResult?.meta || {},
    raw: jsonResult
  };
}

/**
 * Directly fetch DB parcels for Koradi village from Neon PostgreSQL
 */
export async function fetchDbParcels() {
  const prisma = await getPrisma();
  return prisma.landParcel.findMany({
    where: {
      taluka: { equals: 'Korpana', mode: 'insensitive' },
      villageName: { contains: 'कोराडी' }
    },
    orderBy: [{ gatNumber: 'asc' }]
  });
}

/**
 * Directly fetch DB rollup metrics for Koradi village from Neon PostgreSQL
 */
export async function fetchDbRollup() {
  const prisma = await getPrisma();
  return prisma.prapatraRollup.findFirst({
    where: {
      taluka: { equals: 'Korpana', mode: 'insensitive' },
      villageName: { contains: 'कोराडी' }
    }
  });
}

/**
 * Run parser on canonical excel file
 */
export async function parseCanonicalKoradiExcel() {
  const { parsePrapatraBuffer } = await import(pathToFileURL(path.join(ROOT_DIR, 'backend/src/parsers/prapatraParserJs.js')).href);
  const filePath = path.join(ROOT_DIR, 'data/all_talukas_raw/Korpana/32_करड.xlsx');
  return parsePrapatraBuffer(filePath, 'Korpana', '32_करड.xlsx');
}

/**
 * Inspect frontend source code for table styling and overflow containment
 */
export function inspectFrontendReportsPage() {
  const filePath = path.join(ROOT_DIR, 'frontend/src/app/reports/page.jsx');
  const content = fs.readFileSync(filePath, 'utf8');
  return {
    content,
    hasTableNowrap: /<table[^>]*className=["'][^"']*whitespace-nowrap[^"']*["']/.test(content),
    otherRightsTh: content.match(/<th[^>]*>[\s\S]*?इतर अधिकारातील नोंद[\s\S]*?<\/th>/)?.[0] || '',
    otherRightsTd: content.match(/<td[\s\S]*?handleSelectCell\([^)]*otherRights[\s\S]*?<\/td>/)?.[0] || '',
    ownerTh: content.match(/<th[^>]*>[\s\S]*?भोगवटदाराचे नाव[\s\S]*?<\/th>/)?.[0] || '',
    ownerTd: content.match(/<td[\s\S]*?handleSelectCell\([^)]*owner[\s\S]*?<\/td>/)?.[0] || ''
  };
}

// ==========================================
// Test Assertions & Runner Framework
// ==========================================

export class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new AssertionError(message, condition, true);
  }
}

export function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    const msg = message ? `${message} | Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}` : `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`;
    throw new AssertionError(msg, actual, expected);
  }
}

export function assertTrue(actual, message = '') {
  if (actual !== true) {
    throw new AssertionError(message || `Expected true but got ${actual}`, actual, true);
  }
}

export function assertFalse(actual, message = '') {
  if (actual !== false) {
    throw new AssertionError(message || `Expected false but got ${actual}`, actual, false);
  }
}

export function assertIncludes(haystack, needle, message = '') {
  const str = String(haystack);
  if (!str.includes(needle)) {
    throw new AssertionError(message || `Expected ${JSON.stringify(str)} to include ${JSON.stringify(needle)}`, str, needle);
  }
}

export function assertMatches(str, regex, message = '') {
  if (!regex.test(String(str))) {
    throw new AssertionError(message || `Expected ${JSON.stringify(str)} to match regex ${regex}`, str, regex);
  }
}

/**
 * Lightweight test suite runner
 */
export async function runSuite(suiteName, testDefinitions) {
  console.log(`\n======================================================`);
  console.log(`RUNNING SUITE: ${suiteName}`);
  console.log(`======================================================\n`);

  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const def of testDefinitions) {
    const { name, fn } = def;
    const startTime = Date.now();
    try {
      await fn();
      const duration = Date.now() - startTime;
      console.log(`  [PASS] ${name} (${duration}ms)`);
      passedCount++;
      results.push({ name, passed: true, duration });
    } catch (err) {
      const duration = Date.now() - startTime;
      console.log(`  [FAIL] ${name} (${duration}ms)`);
      console.log(`         Error: ${err.message}`);
      if (err.actual !== undefined && err.expected !== undefined) {
        console.log(`         Expected: ${JSON.stringify(err.expected)}`);
        console.log(`         Actual:   ${JSON.stringify(err.actual)}`);
      }
      failedCount++;
      results.push({
        name,
        passed: false,
        duration,
        error: err.message,
        actual: err.actual,
        expected: err.expected
      });
    }
  }

  console.log(`\n------------------------------------------------------`);
  console.log(`Suite "${suiteName}" Summary: ${passedCount} passed, ${failedCount} failed of ${testDefinitions.length}`);
  console.log(`------------------------------------------------------\n`);

  return {
    suiteName,
    total: testDefinitions.length,
    passed: passedCount,
    failed: failedCount,
    results
  };
}

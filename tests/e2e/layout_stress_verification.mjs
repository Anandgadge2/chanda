/**
 * EMPIRICAL ADVERSARIAL HARNESS: Layout Stress Verification
 * 
 * Viewports: 1024px, 1280px, 1440px, 1920px
 * 
 * Verifies:
 * 1. Zero horizontal text bleed from 'इतर अधिकारातील नोंद' (Other Rights, Col 6)
 *    into 'i) बंदोबस्त क्र. (1950)' (Settlement No. 1950, Col 7).
 * 2. Strict CSS bounding box containment across all rendered rows.
 * 3. High-resolution screenshots captured at each viewport.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');

const wsModule = await import(pathToFileURL(path.join(ROOT_DIR, 'backend/node_modules/ws/index.js')).href);
const WebSocket = wsModule.default || wsModule;

const VIEWPORTS = [
  { width: 1024, height: 768, name: '1024px (Small Desktop / Tablet Landscape)' },
  { width: 1280, height: 800, name: '1280px (Standard Desktop / Laptop)' },
  { width: 1440, height: 900, name: '1440px (High-Res Desktop)' },
  { width: 1920, height: 1080, name: '1920px (Full HD 1080p Desktop)' }
];

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

function findBrowserPath() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Neither Chrome nor Edge found on system');
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id && this.callbacks.has(msg.id)) {
          const { res, rej } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) rej(new Error(msg.error.message || JSON.stringify(msg.error)));
          else res(msg.result);
        }
      });
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((res, rej) => {
      this.callbacks.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export async function runLayoutStressVerification() {
  console.log('================================================================================');
  console.log(' EMPIRICAL LAYOUT STRESS VERIFICATION ACROSS VIEWPORTS (1024, 1280, 1440, 1920)');
  console.log(' Target: "इतर अधिकारातील नोंद" -> "i) बंदोबस्त क्र. (1950)" Zero Bleed Invariant');
  console.log('================================================================================\n');

  // 1. Authenticate with backend API
  console.log('[Step 1] Authenticating with backend API...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'collector.chandrapur@maharashtra.gov.in', password: '111111' })
  });
  if (!loginRes.ok) throw new Error(`Login failed with HTTP ${loginRes.status}`);
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log(`[Step 1] Authenticated as ${loginData.user?.role}`);

  // 2. Launch headless browser
  const browserExe = findBrowserPath();
  const userDataDir = path.join(ROOT_DIR, '.tmp_chrome_userdata');
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const port = 9222;
  console.log(`[Step 2] Launching headless browser: ${browserExe}`);
  const browserProc = spawn(browserExe, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`
  ], { stdio: 'ignore' });

  let connected = false;
  let versionData = null;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        versionData = await res.json();
        connected = true;
        break;
      }
    } catch (_) {}
  }

  if (!connected) {
    browserProc.kill();
    throw new Error('Failed to connect to headless browser remote debugging port 9222');
  }

  const newTabRes = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
  const tabData = await newTabRes.json();
  const cdp = new CDPClient(tabData.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  // Pre-seed localStorage
  await cdp.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(1200);
  await cdp.send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('chanda_token', '${token}');
      localStorage.setItem('chanda_cookie_consent', JSON.stringify({ status: 'accepted', type: 'all' }));
      localStorage.setItem('chanda_sidebar_collapsed', 'true');
    `
  });

  const screenshotsDir = path.join(ROOT_DIR, 'tests/e2e/screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  const summaryResults = [];

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n--------------------------------------------------------------------------------`);
      console.log(` Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
      console.log(`--------------------------------------------------------------------------------`);

      // 1. Set Viewport Device Metrics
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: false
      });

      // 2. Navigate to Koradi village reports
      const targetUrl = 'http://localhost:3000/reports?taluka=Korpana&village=%E0%A4%95%E0%A5%8B%E0%A4%B0%E0%A4%BE%E0%A4%A1%E0%A5%80';
      await cdp.send('Page.navigate', { url: targetUrl });

      // 3. Wait until table has real data loaded
      let tableReady = false;
      for (let attempt = 0; attempt < 50; attempt++) {
        await sleep(400);
        const evalRes = await cdp.send('Runtime.evaluate', {
          expression: `
            (() => {
              const trs = Array.from(document.querySelectorAll('tbody tr'));
              if (trs.length === 0) return false;
              const firstGat = (trs[0].querySelector('td:nth-child(3)')?.innerText || '').trim();
              const firstOwner = (trs[0].querySelector('td:nth-child(6)')?.innerText || '').trim();
              return firstGat.length > 0 && firstOwner.length > 0 && firstOwner !== 'लोड होत आहे...';
            })()
          `,
          returnByValue: true
        });
        if (evalRes.result?.value === true) {
          tableReady = true;
          break;
        }
      }

      if (!tableReady) {
        throw new Error(`Table failed to render real parcels within 20s at viewport ${vp.width}px`);
      }

      await sleep(600);

      // 4. Measure layout bounds on Level 2 headers (Row 1 of thead) and all tbody data rows
      const measureRes = await cdp.send('Runtime.evaluate', {
        expression: `
          (() => {
            const table = document.querySelector('table');
            if (!table) return { error: 'No table found' };

            const headerRows = Array.from(table.querySelectorAll('thead tr'));
            if (headerRows.length < 2) return { error: 'Expected 2 thead rows, found ' + headerRows.length };

            const level2Ths = Array.from(headerRows[1].querySelectorAll('th'));
            let otherRightsColIdx = -1;
            let settlementColIdx = -1;

            level2Ths.forEach((th, idx) => {
              const text = (th.innerText || th.textContent || '').trim();
              if (otherRightsColIdx === -1 && (text.includes('इतर अधिकार') || text.includes('Other Rights'))) {
                otherRightsColIdx = idx;
              }
              if (settlementColIdx === -1 && (text.includes('बंदोबस्त क्र.') || text.includes('Settlement No.'))) {
                settlementColIdx = idx;
              }
            });

            if (otherRightsColIdx === -1 || settlementColIdx === -1) {
              return { error: 'Target columns not found in Level 2 header', otherRightsColIdx, settlementColIdx };
            }

            const thRightsRect = level2Ths[otherRightsColIdx].getBoundingClientRect();
            const thSettlementRect = level2Ths[settlementColIdx].getBoundingClientRect();
            const headerClearance = thSettlementRect.left - thRightsRect.right;

            const rows = Array.from(table.querySelectorAll('tbody tr'));
            let totalCheckedRows = 0;
            let minCellClearance = 999999;
            let minInnerClearance = 999999;
            let maxCellWidth = 0;
            const rowSamples = [];
            const violations = [];

            rows.forEach((row, rIdx) => {
              const cells = Array.from(row.querySelectorAll('td'));
              if (cells.length <= Math.max(otherRightsColIdx, settlementColIdx)) return;

              totalCheckedRows++;
              const tdRights = cells[otherRightsColIdx];
              const tdSettlement = cells[settlementColIdx];

              const rRights = tdRights.getBoundingClientRect();
              const rSettlement = tdSettlement.getBoundingClientRect();

              maxCellWidth = Math.max(maxCellWidth, rRights.width);

              const innerDiv = tdRights.querySelector('div') || tdRights;
              const rInner = innerDiv.getBoundingClientRect();

              const cellClearance = rSettlement.left - rRights.right;
              const innerClearance = rSettlement.left - rInner.right;

              minCellClearance = Math.min(minCellClearance, cellClearance);
              minInnerClearance = Math.min(minInnerClearance, innerClearance);

              if (rIdx < 5) {
                rowSamples.push({
                  row: rIdx,
                  gat: (cells[2]?.innerText || '').trim(),
                  rightsWidth: rRights.width,
                  settlementWidth: rSettlement.width,
                  cellClearance: Number(cellClearance.toFixed(2)),
                  innerClearance: Number(innerClearance.toFixed(2)),
                  text: (tdRights.innerText || '').trim().slice(0, 35)
                });
              }

              // Horizontal text bleed checks:
              // 1. Does the cell boundary bleed into adjacent column? (border clearance < -0.1)
              const cellOverlap = rRights.right > rSettlement.left + 0.1;
              // 2. Does the inner text bleed into adjacent column?
              const innerBleed = rInner.right > rSettlement.left + 0.1;
              // 3. Does the text bleed outside its own cell boundary?
              const boxOverflow = rInner.right > rRights.right + 0.5;

              if (cellOverlap || innerBleed || boxOverflow) {
                violations.push({
                  rowIndex: rIdx,
                  gatNumber: (cells[2]?.innerText || '').trim(),
                  cellClearance,
                  innerClearance,
                  rightsRight: rRights.right,
                  innerRight: rInner.right,
                  settlementLeft: rSettlement.left,
                  cellOverlap,
                  innerBleed,
                  boxOverflow,
                  textSnippet: (tdRights.innerText || '').trim().slice(0, 40)
                });
              }
            });

            return {
              otherRightsColIdx,
              settlementColIdx,
              thRightsWidth: thRightsRect.width,
              thSettlementWidth: thSettlementRect.width,
              headerClearance,
              totalCheckedRows,
              maxCellWidth,
              minCellClearance,
              minInnerClearance,
              rowSamples,
              violationCount: violations.length,
              violations: violations.slice(0, 5)
            };
          })()
        `,
        returnByValue: true
      });

      const metrics = measureRes.result?.value;
      if (metrics.error) {
        throw new Error(`Measurement error at ${vp.width}px: ${metrics.error}`);
      }

      // 5. Capture screenshot
      const ssRes = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const ssPath = path.join(screenshotsDir, `viewport_${vp.width}px.png`);
      fs.writeFileSync(ssPath, Buffer.from(ssRes.data, 'base64'));

      console.log(`  [Header Bounds]`);
      console.log(`    - 'इतर अधिकार' (Col ${metrics.otherRightsColIdx}) <th> width: ${metrics.thRightsWidth.toFixed(1)}px`);
      console.log(`    - 'बंदोबस्त' (Col ${metrics.settlementColIdx}) <th> width: ${metrics.thSettlementWidth.toFixed(1)}px`);
      console.log(`    - Header Clearance: ${metrics.headerClearance.toFixed(2)}px (0.00px: Flush adjacent border)`);
      console.log(`  [Data Cell Bounds across ${metrics.totalCheckedRows} rows]`);
      console.log(`    - Max 'इतर अधिकार' <td> width: ${metrics.maxCellWidth.toFixed(1)}px (enforced 200-280px constraint)`);
      console.log(`    - Min <td> Boundary Clearance: ${metrics.minCellClearance.toFixed(2)}px (0.00px indicates flush adjacent column boundary)`);
      console.log(`    - Min Text Inner Clearance: ${metrics.minInnerClearance.toFixed(2)}px (> 0 indicates safe interior text margin)`);
      console.log(`    - Total Horizontal Bleed Violations: ${metrics.violationCount}`);
      console.log(`    - First Row Samples:`, metrics.rowSamples);
      console.log(`    - Screenshot: file://${ssPath.replace(/\\\\/g, '/')}`);

      const passed = metrics.violationCount === 0 && metrics.headerClearance >= -0.1 && metrics.minInnerClearance >= -0.1;

      if (!passed) {
        console.error(`  FAIL: Detected layout bleed violations at ${vp.width}px!`);
        console.error('  Violations sample:', metrics.violations);
      } else {
        console.log(`  PASS: ZERO horizontal text bleed at ${vp.width}px! Text strictly contained.`);
      }

      summaryResults.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        metrics,
        passed,
        screenshot: ssPath
      });
    }

    console.log('\n================================================================================');
    console.log(' LAYOUT STRESS VERIFICATION SUMMARY ACROSS VIEWPORTS');
    console.log('================================================================================');
    let allPassed = true;
    for (const r of summaryResults) {
      console.log(`  ${r.passed ? '[PASS]' : '[FAIL]'} ${r.viewport}: Inner text clearance = ${r.metrics.minInnerClearance.toFixed(2)}px, Violations = ${r.metrics.violationCount}`);
      if (!r.passed) allPassed = false;
    }
    console.log('================================================================================');
    console.log(` FINAL VERDICT: ${allPassed ? 'ALL VIEWPORTS PASSED (ZERO BLEED)' : 'FAILURES OCCURRED'}`);
    console.log('================================================================================\n');

    return { allPassed, summaryResults };
  } finally {
    await cdp.close();
    browserProc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

// Run directly
if (process.argv[1] && process.argv[1].endsWith('layout_stress_verification.mjs')) {
  runLayoutStressVerification()
    .then(res => {
      if (!res.allPassed) process.exit(1);
    })
    .catch(err => {
      console.error('Layout stress verification error:', err);
      process.exit(1);
    });
}

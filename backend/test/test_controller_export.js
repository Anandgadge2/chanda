import assert from 'assert';
import { exportGoshwaraExcel, exportGoshwaraPdf } from '../src/controllers/prapatraController.js';
import ExcelJS from 'exceljs';

function createMockRes() {
  const chunks = [];
  const headers = {};
  return {
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
    },
    getHeader(name) {
      return headers[name.toLowerCase()];
    },
    write(chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    },
    end(chunk) {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
    },
    getBuffer() {
      return Buffer.concat(chunks);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.jsonData = obj;
      return this;
    }
  };
}

async function testControllers() {
  console.log('--- Testing Controller Endpoints ---');

  const req = {
    body: {
      tier: 'taluka',
      scopeName: 'Chandrapur',
      talukaRows: [{
        name: 'चंद्रपूर',
        taluka: 'CHANDRAPUR',
        totalSurveys: 10878,
        totalArea: '64787.34'
      }],
      villageRows: [{
        name: 'पेठा',
        taluka: 'CHANDRAPUR',
        villageName: 'Petha',
        totalSurveys: 22,
        totalArea: '112.37'
      }]
    }
  };

  // Test Excel controller
  const resExcel = createMockRes();
  await exportGoshwaraExcel(req, resExcel);
  const excelBuf = resExcel.getBuffer();
  assert(excelBuf.length > 0, 'Excel response buffer should not be empty');
  assert(resExcel.getHeader('content-type').includes('spreadsheetml'), 'Content-Type must be xlsx');

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(excelBuf);
  assert.strictEqual(wb.worksheets.length, 2, 'Must have 2 worksheets (Taluka and Village)');
  console.log('✓ exportGoshwaraExcel endpoint returned valid 2-sheet workbook');

  // Test PDF controller
  const resPdf = createMockRes();
  await exportGoshwaraPdf(req, resPdf);
  const pdfBuf = resPdf.getBuffer();
  assert(pdfBuf.length > 0, 'PDF response buffer should not be empty');
  assert(resPdf.getHeader('content-type').includes('pdf'), 'Content-Type must be pdf');
  assert.strictEqual(pdfBuf.slice(0, 4).toString(), '%PDF', 'Must be valid PDF');
  console.log('✓ exportGoshwaraPdf endpoint returned valid PDF');

  console.log('All Controller tests passed!');
}

testControllers().catch(err => {
  console.error('Controller test failed:', err);
  process.exit(1);
});

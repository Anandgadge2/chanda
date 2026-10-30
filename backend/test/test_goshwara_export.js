import assert from 'assert';
import ExcelJS from 'exceljs';
import {
  generateChecklistSummaryExcel,
  generateChecklistSummaryPdf
} from '../src/utils/masterBookletGenerator.js';

async function runTests() {
  console.log('--- Testing Goshwara Export Logic ---');

  // Sample data resembling Chandrapur taluka selection from frontend
  const mockTalukaRow = {
    id: 'taluka-CHANDRAPUR-संपूर्ण तालुका (All Villages)',
    key: 'taluka-CHANDRAPUR-संपूर्ण तालुका (All Villages)',
    name: 'चंद्रपूर',
    taluka: 'CHANDRAPUR',
    villageName: 'संपूर्ण तालुका (All Villages)',
    totalSurveys: 10878,
    totalArea: '64787.34',
    c1Surveys: 7736,
    c1Area: '51393.46',
    c2Surveys: 1405,
    c2Area: '2201.35',
    convSurveys: 223,
    convArea: '9316.03',
    noOtherSurveys: 3757,
    noOtherArea: '6934.66',
    delSurveys: 270,
    delArea: '9391.11'
  };

  const mockVillageRows = [
    {
      id: 'village-CHANDRAPUR-Petha',
      key: 'village-CHANDRAPUR-Petha',
      name: 'पेठा',
      taluka: 'CHANDRAPUR',
      villageName: 'Petha',
      totalSurveys: 22,
      totalArea: '112.37',
      c1Surveys: 1,
      c1Area: '2.02',
      c2Surveys: 12,
      c2Area: '7.47',
      convSurveys: 0,
      convArea: '0.00',
      noOtherSurveys: 7,
      noOtherArea: '10.90',
      delSurveys: 0,
      delArea: '0.00'
    },
    {
      id: 'village-CHANDRAPUR-Vorori',
      key: 'village-CHANDRAPUR-Vorori',
      name: 'वोटरिठ',
      taluka: 'CHANDRAPUR',
      villageName: 'Vorori',
      totalSurveys: 20,
      totalArea: '22.13',
      c1Surveys: 15,
      c1Area: '21.40',
      c2Surveys: 0,
      c2Area: '0.00',
      convSurveys: 0,
      convArea: '0.00',
      noOtherSurveys: 20,
      noOtherArea: '22.13',
      delSurveys: 0,
      delArea: '0.00'
    }
  ];

  const mockDistrictRow = {
    id: 'dist-total',
    name: 'चंद्रपूर जिल्हा',
    totalSurveys: 10878,
    totalArea: '64787.34',
    c1Surveys: 7736,
    c1Area: '51393.46',
    c2Surveys: 1405,
    c2Area: '2201.35',
    convSurveys: 223,
    convArea: '9316.03',
    noOtherSurveys: 3757,
    noOtherArea: '6934.66',
    delSurveys: 270,
    delArea: '9391.11'
  };

  // ==========================================
  // Test 1: Taluka Tier Excel Export
  // ==========================================
  console.log('\n[Test 1] Testing Taluka Tier Excel Export (both Taluka and Village sheets)...');
  const excelBufferTaluka = await generateChecklistSummaryExcel({
    tier: 'taluka',
    districtRows: [mockDistrictRow],
    talukaRows: [mockTalukaRow],
    villageRows: mockVillageRows
  }, 'Chandrapur');

  assert(excelBufferTaluka && excelBufferTaluka.length > 0, 'Excel buffer must not be empty');

  const wbTaluka = new ExcelJS.Workbook();
  await wbTaluka.xlsx.load(excelBufferTaluka);

  const sheetNamesTaluka = wbTaluka.worksheets.map(ws => ws.name);
  console.log('Worksheets generated for tier="taluka":', sheetNamesTaluka);
  assert(sheetNamesTaluka.includes('तालुक्याचा गोषवारा'), 'Must have तालुक्याचा गोषवारा sheet');
  assert(sheetNamesTaluka.includes('गावाचा गोषवारा'), 'Must have गावाचा गोषवारा sheet when taluka selected');

  // Check Taluka Sheet Data & Totals
  const wsTaluka = wbTaluka.getWorksheet('तालुक्याचा गोषवारा');
  // Row 1: Banner, Row 2: Super header, Row 3: Sub header, Row 4: Chandrapur row, Row 5: Total row
  const row4 = wsTaluka.getRow(4);
  console.log('Taluka sheet Row 4 (Data row):', row4.values);
  assert.strictEqual(row4.getCell(1).value, 1, 'Row 4 Sr No must be 1, NOT "एकूण"');
  assert.strictEqual(row4.getCell(2).value, 'चंद्रपूर', 'Row 4 Name must be Chandrapur');
  assert.strictEqual(row4.getCell(3).value, 10878, 'Row 4 Survey count must match');

  const row5 = wsTaluka.getRow(5);
  console.log('Taluka sheet Row 5 (Total row):', row5.values);
  assert.strictEqual(row5.getCell(1).value, 'एकूण', 'Row 5 Sr No must be "एकूण"');
  assert.strictEqual(row5.getCell(2).value, '-', 'Row 5 Name must be "-"');
  // Check that formula has result populated
  const totalSurveysCell = row5.getCell(3).value;
  console.log('Total surveys cell value in Row 5:', totalSurveysCell);
  assert(typeof totalSurveysCell === 'object' && totalSurveysCell.formula, 'Cell 3 must have formula');
  assert.strictEqual(totalSurveysCell.result, 10878, 'Cell 3 formula result must be 10878, NOT undefined/blank');

  const totalAreaCell = row5.getCell(4).value;
  console.log('Total area cell value in Row 5:', totalAreaCell);
  assert.strictEqual(totalAreaCell.result, 64787.34, 'Cell 4 formula result must be 64787.34, NOT undefined/blank');

  // Check Village Sheet
  const wsVillage = wbTaluka.getWorksheet('गावाचा गोषवारा');
  const vRow4 = wsVillage.getRow(4);
  assert.strictEqual(vRow4.getCell(1).value, 1, 'Village row 1 Sr No must be 1');
  assert.strictEqual(vRow4.getCell(2).value, 'पेठा', 'Village row 1 Name must be पेठा');

  const vRow5 = wsVillage.getRow(5);
  assert.strictEqual(vRow5.getCell(1).value, 2, 'Village row 2 Sr No must be 2');
  assert.strictEqual(vRow5.getCell(2).value, 'वोटरिठ', 'Village row 2 Name must be वोटरिठ');

  const vTotalRow = wsVillage.getRow(6);
  assert.strictEqual(vTotalRow.getCell(1).value, 'एकूण', 'Village total row Sr No must be "एकूण"');
  assert.strictEqual(vTotalRow.getCell(3).value.result, 42, 'Village total surveys sum must be 22+20=42');
  assert.strictEqual(vTotalRow.getCell(4).value.result, 134.50, 'Village total area sum must be 112.37+22.13=134.50');
  console.log('✓ Test 1 Passed!');

  // ==========================================
  // Test 2: Taluka Tier PDF Export
  // ==========================================
  console.log('\n[Test 2] Testing Taluka Tier PDF Export (both Taluka and Village tables)...');
  const pdfBufferTaluka = await generateChecklistSummaryPdf({
    tier: 'taluka',
    districtRows: [mockDistrictRow],
    talukaRows: [mockTalukaRow],
    villageRows: mockVillageRows
  }, 'Chandrapur');

  assert(pdfBufferTaluka && pdfBufferTaluka.length > 0, 'PDF buffer must not be empty');
  // Check PDF header signature (%PDF-)
  const pdfMagic = pdfBufferTaluka.slice(0, 5).toString('ascii');
  assert.strictEqual(pdfMagic, '%PDF-', 'Must be a valid PDF document');
  console.log(`✓ PDF Generated successfully (${pdfBufferTaluka.length} bytes)`);
  console.log('✓ Test 2 Passed!');

  // ==========================================
  // Test 3: All Tier Excel Export (District, Taluka, Village)
  // ==========================================
  console.log('\n[Test 3] Testing All Tier Excel Export (District, Taluka, and Village sheets)...');
  const excelBufferAll = await generateChecklistSummaryExcel({
    tier: 'all',
    districtRows: [mockDistrictRow],
    talukaRows: [mockTalukaRow],
    villageRows: mockVillageRows
  }, 'Chandrapur');

  const wbAll = new ExcelJS.Workbook();
  await wbAll.xlsx.load(excelBufferAll);
  const sheetNamesAll = wbAll.worksheets.map(ws => ws.name);
  console.log('Worksheets generated for tier="all":', sheetNamesAll);
  assert.deepStrictEqual(sheetNamesAll, ['जिल्हाचा गोषवारा', 'तालुक्याचा गोषवारा', 'गावाचा गोषवारा'], 'Must have all 3 sheets in correct order');
  console.log('✓ Test 3 Passed!');

  // ==========================================
  // Test 4: Village Tier Excel Export (Village only)
  // ==========================================
  console.log('\n[Test 4] Testing Village Tier Excel Export...');
  const excelBufferVillage = await generateChecklistSummaryExcel({
    tier: 'village',
    villageRows: [mockVillageRows[0]]
  }, 'Chandrapur');

  const wbV = new ExcelJS.Workbook();
  await wbV.xlsx.load(excelBufferVillage);
  const sheetNamesV = wbV.worksheets.map(ws => ws.name);
  console.log('Worksheets generated for tier="village":', sheetNamesV);
  assert.deepStrictEqual(sheetNamesV, ['गावाचा गोषवारा'], 'Must have only गावाचा गोषवारा sheet');
  console.log('✓ Test 4 Passed!');

  console.log('\n===========================================');
  console.log('ALL GOSHAWARA EXPORT TESTS PASSED PERFECTLY!');
  console.log('===========================================');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

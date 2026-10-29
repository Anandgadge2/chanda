const fs = require('fs');
const path = require('path');
const ExcelJS = require('../backend/node_modules/exceljs');

async function inspectSaoli() {
  const filePath = path.join(__dirname, '../data/all_talukas_raw/Saoli/03_1 त 45 अतरगव टल ok.xlsx');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  console.log('Worksheets:', wb.worksheets.map(w => w.name));
  
  const sheet = wb.getWorksheet('रिनंबरिंग पर्चा');
  if (!sheet) {
    console.log('Sheet not found by exact name, trying find');
    return;
  }
  
  console.log('Total rows:', sheet.rowCount, 'Total cols:', sheet.columnCount);
  for (let r = 1; r <= 35; r++) {
    const row = sheet.getRow(r);
    const rowVals = [];
    for (let c = 1; c <= 15; c++) {
      const cell = row.getCell(c);
      let v = cell.value;
      if (v && typeof v === 'object' && v.result !== undefined) v = v.result;
      if (v !== null && v !== undefined && v !== '') {
        rowVals.push(`C${c}: ${JSON.stringify(v)}`);
      }
    }
    if (rowVals.length > 0) {
      console.log(`Row ${r}: ${rowVals.join(' | ')}`);
    }
  }

  console.log('\n--- MERGES ---');
  console.log(sheet.model.merges);
}
inspectSaoli();

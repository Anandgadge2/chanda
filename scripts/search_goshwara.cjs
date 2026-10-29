const fs = require('fs');
const path = require('path');
const ExcelJS = require('../backend/node_modules/exceljs');

async function searchGoshwara() {
  const baseDirs = [
    path.join(__dirname, '../data/all_talukas_raw'),
    path.join(__dirname, '../data')
  ];

  for (const b of baseDirs) {
    function scan(dir) {
      const items = fs.readdirSync(dir);
      for (const it of items) {
        const full = path.join(dir, it);
        if (fs.statSync(full).isDirectory()) {
          if (it !== 'node_modules') scan(full);
        } else if (it.endsWith('.xlsx')) {
          check(full);
        }
      }
    }
    scan(b);
  }

  async function check(f) {
    const wb = new ExcelJS.Workbook();
    try {
      await wb.xlsx.readFile(f);
      for (const sheet of wb.worksheets) {
        const val = String(sheet.getCell('A1').value || '') + String(sheet.getCell('B1').value || '') + String(sheet.getCell('C1').value || '');
        if (val.includes('गोषवारा') || val.includes('मुद्द्यांचा') || sheet.name.includes('गोषवारा') || sheet.name.includes('पर्चा')) {
          console.log(`MATCHED: ${f} -> Sheet: ${sheet.name}`);
        }
      }
    } catch(e) {}
  }
}
searchGoshwara();

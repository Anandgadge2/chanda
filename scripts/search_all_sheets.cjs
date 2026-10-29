const fs = require('fs');
const path = require('path');
const ExcelJS = require('../backend/node_modules/exceljs');

async function searchAll() {
  const base = path.join(__dirname, '../data/all_talukas_raw');
  const talukas = fs.readdirSync(base);
  for (const t of talukas) {
    const tDir = path.join(base, t);
    if (!fs.statSync(tDir).isDirectory()) continue;
    const files = fs.readdirSync(tDir);
    for (const f of files.slice(0, 3)) {
      if (!f.endsWith('.xlsx')) continue;
      const wb = new ExcelJS.Workbook();
      try {
        await wb.xlsx.readFile(path.join(tDir, f));
        for (const sheet of wb.worksheets) {
          if (sheet.name.includes('पर्चा') || sheet.name.includes('रिनं') || sheet.name.includes('गोषवारा') || sheet.name.toLowerCase().includes('parcha') || sheet.name.toLowerCase().includes('renumber')) {
            console.log(`FOUND SHEET in [${t}/${f}]: ${sheet.name}`);
          }
        }
      } catch(e) {}
    }
  }
  console.log('Search completed.');
}
searchAll();

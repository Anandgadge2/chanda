const fs = require('fs');
const path = require('path');
const ExcelJS = require('../backend/node_modules/exceljs');

async function searchSheets() {
  const dir = path.join(__dirname, '../data/test_samples');
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (!f.endsWith('.xlsx')) continue;
    const wb = new ExcelJS.Workbook();
    try {
      await wb.xlsx.readFile(path.join(dir, f));
      console.log('File:', f, 'Sheets:', wb.worksheets.map(s => s.name));
      for (const sheet of wb.worksheets) {
        for (let r = 1; r <= 30; r++) {
          const row = sheet.getRow(r);
          for (let c = 1; c <= 20; c++) {
            const val = String(row.getCell(c).value || '');
            if (val.includes('रिनंबरिंग') || val.includes('गोषवारा') || val.includes('बंदोबस्त नंबर')) {
              console.log(`MATCH in [${f}] [${sheet.name}] R${r}C${c}: ${val}`);
            }
          }
        }
      }
    } catch(e) {}
  }
}
searchSheets();

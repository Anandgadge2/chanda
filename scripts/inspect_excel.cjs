const fs = require('fs');
const path = require('path');
const ExcelJS = require('../backend/node_modules/exceljs');

async function inspect() {
  const dir = path.join(__dirname, '../data/test_samples');
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (!f.endsWith('.xlsx')) continue;
    console.log('=== FILE:', f);
    const wb = new ExcelJS.Workbook();
    try {
      await wb.xlsx.readFile(path.join(dir, f));
      wb.eachSheet((sheet) => {
        console.log('  Sheet:', sheet.name);
        for (let r = 1; r <= 15; r++) {
          const row = sheet.getRow(r);
          const vals = [];
          for (let c = 1; c <= 15; c++) {
            const cell = row.getCell(c);
            if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
              vals.push(`C${c}: ${JSON.stringify(cell.value)}`);
            }
          }
          if (vals.length > 0) console.log(`    R${r}:`, vals.join(' | '));
        }
      });
    } catch (e) {
      console.log('  Error reading:', e.message);
    }
  }
}
inspect();

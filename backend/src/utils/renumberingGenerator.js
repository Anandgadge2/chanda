import ExcelJS from 'exceljs';
import pdfmake from 'pdfmake';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure pdfmake security policies
pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy(() => true);

// Configure Nirmala Devanagari font (bundled in backend/fonts/)
const fontRegular = path.resolve(__dirname, '../../fonts/Nirmala.ttf');
const fontBold = path.resolve(__dirname, '../../fonts/NirmalaB.ttf');

pdfmake.setFonts({
  Nirmala: {
    normal: fontRegular,
    bold: fontBold,
    italics: fontRegular,
    bolditalics: fontBold,
  },
});

const thinBorder = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } }
};

/**
 * GENERATE RENUMBERING PARCHA EXCEL WORKBOOK
 * Matches Image 2 format exactly:
 * - 1 ते 45 मुद्द्यांचा गोषवारा (Header)
 * - गावाचे नाव, तालुक्याचे नाव, उपविभागाचे नाव, जिल्ह्याचे नाव
 * - रिनंबरिंग पर्चा
 * - 5 Columns: बंदोबस्त नंबर, [blank], एकत्रिकरण नंबर, [blank], पुनर्मोजणी नंबर
 */
export async function generateRenumberingParchaExcel({ header = {}, rows = [] }, res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'District Administration Chandrapur';
  wb.lastModifiedBy = 'Collectorate Chandrapur';
  wb.created = new Date();

  const ws = wb.addWorksheet('रिनंबरिंग पर्चा', {
    views: [{ showGridLines: true }]
  });

  // 5 Columns matching the layout in Image 2
  ws.columns = [
    { width: 20 }, // Col A: बंदोबस्त नंबर
    { width: 18 }, // Col B: Blank / Notes
    { width: 30 }, // Col C: एकत्रिकरण नंबर
    { width: 18 }, // Col D: Blank / Notes
    { width: 24 }  // Col E: पुनर्मोजणी नंबर
  ];

  const applyBorderToRange = (startRow, startCol, endRow, endCol) => {
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = ws.getCell(r, c);
        cell.border = { ...thinBorder };
      }
    }
  };

  // Row 1: "1 ते 45 मुद्द्यांचा गोषवारा"
  ws.mergeCells('A1:E1');
  const cellA1 = ws.getCell('A1');
  cellA1.value = '1 ते 45 मुद्द्यांचा गोषवारा';
  cellA1.font = { name: 'Calibri', size: 14, bold: true };
  cellA1.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;
  applyBorderToRange(1, 1, 1, 5);

  // Rows 2-5: Hierarchy details
  const topFields = [
    { label: 'गावाचे नाव', val: header.villageName || '' },
    { label: 'तालुक्याचे नाव', val: header.taluka || '' },
    { label: 'उपविभागाचे नाव', val: header.subDivision || '' },
    { label: 'जिल्ह्याचे नाव', val: header.district || 'चंद्रपूर' }
  ];

  topFields.forEach((field, i) => {
    const rowNum = 2 + i;
    ws.getRow(rowNum).height = 24;

    const lblCell = ws.getCell(rowNum, 1);
    lblCell.value = field.label;
    lblCell.font = { name: 'Calibri', size: 11, bold: true };
    lblCell.alignment = { horizontal: 'center', vertical: 'middle' };

    ws.mergeCells(rowNum, 2, rowNum, 5);
    const valCell = ws.getCell(rowNum, 2);
    valCell.value = field.val;
    valCell.font = { name: 'Calibri', size: 11, bold: false };
    valCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

    applyBorderToRange(rowNum, 1, rowNum, 5);
  });

  // Row 6: Empty spacer row
  ws.getRow(6).height = 14;

  // Row 7: "रिनंबरिंग पर्चा" Header
  ws.mergeCells('A7:E7');
  const cellA7 = ws.getCell('A7');
  cellA7.value = 'रिनंबरिंग पर्चा';
  cellA7.font = { name: 'Calibri', size: 13, bold: true };
  cellA7.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(7).height = 28;
  applyBorderToRange(7, 1, 7, 5);

  // Row 8: Column Sub-Headers
  ws.getRow(8).height = 26;
  const colHeaders = [
    { col: 1, text: 'बंदोबस्त नंबर' },
    { col: 2, text: '' },
    { col: 3, text: 'एकत्रिकरण नंबर' },
    { col: 4, text: '' },
    { col: 5, text: 'पुनर्मोजणी नंबर' }
  ];

  colHeaders.forEach(ch => {
    const cell = ws.getCell(8, ch.col);
    cell.value = ch.text;
    cell.font = { name: 'Calibri', size: 11, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { ...thinBorder };
  });

  // Row 9+: Data Rows (minimum 16 rows to look visually complete like the template)
  const totalRowsCount = Math.max(rows.length, 16);
  for (let i = 0; i < totalRowsCount; i++) {
    const rowNum = 9 + i;
    ws.getRow(rowNum).height = 22;
    const rData = rows[i] || {};

    const cellA = ws.getCell(rowNum, 1);
    cellA.value = rData.bandobastNo !== undefined && rData.bandobastNo !== null ? String(rData.bandobastNo) : '';
    cellA.alignment = { horizontal: 'center', vertical: 'middle' };
    cellA.border = { ...thinBorder };

    const cellB = ws.getCell(rowNum, 2);
    cellB.value = rData.col2 !== undefined && rData.col2 !== null ? String(rData.col2) : '';
    cellB.alignment = { horizontal: 'center', vertical: 'middle' };
    cellB.border = {
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
      top: i === 0 ? { style: 'thin', color: { argb: 'FF000000' } } : undefined,
      bottom: i === totalRowsCount - 1 ? { style: 'thin', color: { argb: 'FF000000' } } : undefined
    };

    const cellC = ws.getCell(rowNum, 3);
    cellC.value = rData.ekatrikaranNo !== undefined && rData.ekatrikaranNo !== null ? String(rData.ekatrikaranNo) : '';
    cellC.alignment = { horizontal: 'center', vertical: 'middle' };
    cellC.border = { ...thinBorder };

    const cellD = ws.getCell(rowNum, 4);
    cellD.value = rData.col4 !== undefined && rData.col4 !== null ? String(rData.col4) : '';
    cellD.alignment = { horizontal: 'center', vertical: 'middle' };
    cellD.border = {
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
      top: i === 0 ? { style: 'thin', color: { argb: 'FF000000' } } : undefined,
      bottom: i === totalRowsCount - 1 ? { style: 'thin', color: { argb: 'FF000000' } } : undefined
    };

    const cellE = ws.getCell(rowNum, 5);
    cellE.value = rData.punarmajaniNo !== undefined && rData.punarmajaniNo !== null ? String(rData.punarmajaniNo) : '';
    cellE.alignment = { horizontal: 'center', vertical: 'middle' };
    cellE.border = { ...thinBorder };
  }

  await wb.xlsx.write(res);
}

/**
 * GENERATE RENUMBERING PARCHA PDF DOCUMENT
 * Matches Image 2 format exactly with Nirmala Devanagari font.
 */
export async function generateRenumberingParchaPdf({ header = {}, rows = [] }, res) {
  const table1Body = [
    [
      { text: '1 ते 45 मुद्द्यांचा गोषवारा', colSpan: 2, alignment: 'center', bold: true, fontSize: 13, margin: [0, 5, 0, 5] },
      {}
    ],
    [
      { text: 'गावाचे नाव', bold: true, alignment: 'center', fontSize: 11, margin: [0, 3, 0, 3] },
      { text: header.villageName || '', fontSize: 11, margin: [8, 3, 0, 3] }
    ],
    [
      { text: 'तालुक्याचे नाव', bold: true, alignment: 'center', fontSize: 11, margin: [0, 3, 0, 3] },
      { text: header.taluka || '', fontSize: 11, margin: [8, 3, 0, 3] }
    ],
    [
      { text: 'उपविभागाचे नाव', bold: true, alignment: 'center', fontSize: 11, margin: [0, 3, 0, 3] },
      { text: header.subDivision || '', fontSize: 11, margin: [8, 3, 0, 3] }
    ],
    [
      { text: 'जिल्ह्याचे नाव', bold: true, alignment: 'center', fontSize: 11, margin: [0, 3, 0, 3] },
      { text: header.district || 'चंद्रपूर', fontSize: 11, margin: [8, 3, 0, 3] }
    ]
  ];

  const table2Body = [
    [
      { text: 'रिनंबरिंग पर्चा', colSpan: 5, alignment: 'center', bold: true, fontSize: 13, margin: [0, 5, 0, 5] },
      {}, {}, {}, {}
    ],
    [
      { text: 'बंदोबस्त नंबर', alignment: 'center', bold: true, fontSize: 11, margin: [0, 4, 0, 4] },
      { text: '', alignment: 'center', fontSize: 11 },
      { text: 'एकत्रिकरण नंबर', alignment: 'center', bold: true, fontSize: 11, margin: [0, 4, 0, 4] },
      { text: '', alignment: 'center', fontSize: 11 },
      { text: 'पुनर्मोजणी नंबर', alignment: 'center', bold: true, fontSize: 11, margin: [0, 4, 0, 4] }
    ]
  ];

  const totalRowsCount = Math.max(rows.length, 16);
  for (let i = 0; i < totalRowsCount; i++) {
    const r = rows[i] || {};
    table2Body.push([
      { text: r.bandobastNo !== undefined && r.bandobastNo !== null ? String(r.bandobastNo) : '', alignment: 'center', fontSize: 10, margin: [0, 2.5, 0, 2.5] },
      { text: r.col2 !== undefined && r.col2 !== null ? String(r.col2) : '', alignment: 'center', fontSize: 10, margin: [0, 2.5, 0, 2.5] },
      { text: r.ekatrikaranNo !== undefined && r.ekatrikaranNo !== null ? String(r.ekatrikaranNo) : '', alignment: 'center', fontSize: 10, margin: [0, 2.5, 0, 2.5] },
      { text: r.col4 !== undefined && r.col4 !== null ? String(r.col4) : '', alignment: 'center', fontSize: 10, margin: [0, 2.5, 0, 2.5] },
      { text: r.punarmajaniNo !== undefined && r.punarmajaniNo !== null ? String(r.punarmajaniNo) : '', alignment: 'center', fontSize: 10, margin: [0, 2.5, 0, 2.5] }
    ]);
  }

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [30, 30, 30, 30],
    defaultStyle: {
      font: 'Nirmala',
      fontSize: 10
    },
    content: [
      {
        table: {
          widths: ['25%', '75%'],
          body: table1Body
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000'
        }
      },
      { text: '', margin: [0, 12, 0, 0] },
      {
        table: {
          widths: ['20%', '16%', '28%', '16%', '20%'],
          body: table2Body
        },
        layout: {
          hLineWidth: (i, node) => {
            // Keep clean borders
            return 1;
          },
          vLineWidth: () => 1,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000'
        }
      }
    ]
  };

  const pdf = pdfmake.createPdf(docDefinition);
  const buffer = await pdf.getBuffer();
  if (res) {
    if (typeof res.send === 'function') {
      res.send(buffer);
    } else if (typeof res.end === 'function') {
      res.end(buffer);
    }
  }
  return buffer;
}

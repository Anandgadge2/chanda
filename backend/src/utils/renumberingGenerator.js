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
 * - Row 1 (Title): "रिनंबरिंग पर्चा"
 * - Row 2 (Jurisdiction): "गावाचे नाव - ..." (Cols A-B) | "तालुक्याचे नाव - ..." (Cols C-D)
 * - Row 3 (4 Column Headers): "चालू सर्व्हे क्रमांक" | "बंदोबस्त नंबर" | "एकत्रीकरण नंबर" | "पुनर्मोजणी नंबर"
 * - Rows 4+: Real live parcel data rows
 */
export async function generateRenumberingParchaExcel({ header = {}, rows = [] }, res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'District Administration Chandrapur';
  wb.lastModifiedBy = 'Collectorate Chandrapur';
  wb.created = new Date();

  const ws = wb.addWorksheet('रिनंबरिंग पर्चा', {
    views: [{ showGridLines: true }]
  });

  // 4 Columns matching Image 2
  ws.columns = [
    { width: 24 }, // Col A: चालू सर्व्हे क्रमांक
    { width: 24 }, // Col B: बंदोबस्त नंबर
    { width: 24 }, // Col C: एकत्रीकरण नंबर
    { width: 24 }  // Col D: पुनर्मोजणी नंबर
  ];

  const applyBorderToRange = (startRow, startCol, endRow, endCol) => {
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = ws.getCell(r, c);
        cell.border = { ...thinBorder };
      }
    }
  };

  // Row 1: "रिनंबरिंग पर्चा" Centered Title
  ws.mergeCells('A1:D1');
  const cellA1 = ws.getCell('A1');
  cellA1.value = 'रिनंबरिंग पर्चा';
  cellA1.font = { name: 'Calibri', size: 14, bold: true };
  cellA1.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 30;
  applyBorderToRange(1, 1, 1, 4);

  // Row 2: गावाचे नाव & तालुक्याचे नाव
  ws.mergeCells('A2:B2');
  const cellVillage = ws.getCell('A2');
  cellVillage.value = `गावाचे नाव - ${header.villageName || ''}`;
  cellVillage.font = { name: 'Calibri', size: 11, bold: true };
  cellVillage.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

  ws.mergeCells('C2:D2');
  const cellTaluka = ws.getCell('C2');
  cellTaluka.value = `तालुक्याचे नाव - ${header.taluka || ''}`;
  cellTaluka.font = { name: 'Calibri', size: 11, bold: true };
  cellTaluka.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

  ws.getRow(2).height = 24;
  applyBorderToRange(2, 1, 2, 4);

  // Row 3: 4 Column Headers
  ws.getRow(3).height = 26;
  const colHeaders = [
    { col: 1, text: 'चालू सर्व्हे क्रमांक' },
    { col: 2, text: 'बंदोबस्त नंबर' },
    { col: 3, text: 'एकत्रीकरण नंबर' },
    { col: 4, text: 'पुनर्मोजणी नंबर' }
  ];

  colHeaders.forEach(ch => {
    const cell = ws.getCell(3, ch.col);
    cell.value = ch.text;
    cell.font = { name: 'Calibri', size: 11, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' }
    };
    cell.border = { ...thinBorder };
  });

  // Row 4+: Data Rows
  const totalRowsCount = Math.max(rows.length, 16);
  for (let i = 0; i < totalRowsCount; i++) {
    const rowNum = 4 + i;
    ws.getRow(rowNum).height = 22;
    const rData = rows[i] || {};

    const cellA = ws.getCell(rowNum, 1);
    cellA.value = rData.chaluSurveyNo !== undefined && rData.chaluSurveyNo !== null ? String(rData.chaluSurveyNo) : '';
    cellA.alignment = { horizontal: 'center', vertical: 'middle' };
    cellA.border = { ...thinBorder };

    const cellB = ws.getCell(rowNum, 2);
    cellB.value = rData.bandobastNo !== undefined && rData.bandobastNo !== null ? String(rData.bandobastNo) : '';
    cellB.alignment = { horizontal: 'center', vertical: 'middle' };
    cellB.border = { ...thinBorder };

    const cellC = ws.getCell(rowNum, 3);
    cellC.value = rData.ekatrikaranNo !== undefined && rData.ekatrikaranNo !== null ? String(rData.ekatrikaranNo) : '';
    cellC.alignment = { horizontal: 'center', vertical: 'middle' };
    cellC.border = { ...thinBorder };

    const cellD = ws.getCell(rowNum, 4);
    cellD.value = rData.punarmajaniNo !== undefined && rData.punarmajaniNo !== null ? String(rData.punarmajaniNo) : '';
    cellD.alignment = { horizontal: 'center', vertical: 'middle' };
    cellD.border = { ...thinBorder };
  }

  if (res) {
    await wb.xlsx.write(res);
  }
  return await wb.xlsx.writeBuffer();
}

/**
 * GENERATE RENUMBERING PARCHA PDF DOCUMENT
 * Matches Image 2 format exactly with Nirmala Devanagari font.
 */
export async function generateRenumberingParchaPdf({ header = {}, rows = [] }, res) {
  const tableBody = [
    // Row 1: Title
    [
      { text: 'रिनंबरिंग पर्चा', colSpan: 4, alignment: 'center', bold: true, fontSize: 13, margin: [0, 6, 0, 6] },
      {}, {}, {}
    ],
    // Row 2: Sub-header with Village and Taluka
    [
      { text: `गावाचे नाव - ${header.villageName || ''}`, colSpan: 2, bold: true, fontSize: 10.5, margin: [6, 4, 0, 4] },
      {},
      { text: `तालुक्याचे नाव - ${header.taluka || ''}`, colSpan: 2, bold: true, fontSize: 10.5, margin: [6, 4, 0, 4] },
      {}
    ],
    // Row 3: 4 Column Headers
    [
      { text: 'चालू सर्व्हे क्रमांक', alignment: 'center', bold: true, fontSize: 10, margin: [0, 4, 0, 4], fillColor: '#f1f5f9' },
      { text: 'बंदोबस्त नंबर', alignment: 'center', bold: true, fontSize: 10, margin: [0, 4, 0, 4], fillColor: '#f1f5f9' },
      { text: 'एकत्रीकरण नंबर', alignment: 'center', bold: true, fontSize: 10, margin: [0, 4, 0, 4], fillColor: '#f1f5f9' },
      { text: 'पुनर्मोजणी नंबर', alignment: 'center', bold: true, fontSize: 10, margin: [0, 4, 0, 4], fillColor: '#f1f5f9' }
    ]
  ];

  const totalRowsCount = Math.max(rows.length, 16);
  for (let i = 0; i < totalRowsCount; i++) {
    const r = rows[i] || {};
    tableBody.push([
      { text: r.chaluSurveyNo !== undefined && r.chaluSurveyNo !== null ? String(r.chaluSurveyNo) : '', alignment: 'center', fontSize: 9.5, margin: [0, 3, 0, 3] },
      { text: r.bandobastNo !== undefined && r.bandobastNo !== null ? String(r.bandobastNo) : '', alignment: 'center', fontSize: 9.5, margin: [0, 3, 0, 3] },
      { text: r.ekatrikaranNo !== undefined && r.ekatrikaranNo !== null ? String(r.ekatrikaranNo) : '', alignment: 'center', fontSize: 9.5, margin: [0, 3, 0, 3] },
      { text: r.punarmajaniNo !== undefined && r.punarmajaniNo !== null ? String(r.punarmajaniNo) : '', alignment: 'center', fontSize: 9.5, margin: [0, 3, 0, 3] }
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
          widths: ['25%', '25%', '25%', '25%'],
          body: tableBody
        },
        layout: {
          hLineWidth: () => 1,
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

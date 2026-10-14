import ExcelJS from 'exceljs';

const GOV_NAVY = 'FF1E3A8A';
const GOV_GOLD = 'FFD97706';
const HEADER_BG = 'FFF1F5F9';
const BORDER_COLOR = 'FFCBD5E1';

const thinBorder = {
  top: { style: 'thin', color: { argb: BORDER_COLOR } },
  left: { style: 'thin', color: { argb: BORDER_COLOR } },
  bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
  right: { style: 'thin', color: { argb: BORDER_COLOR } }
};

const getRowDisplayName = (row) => {
  if (row.villageName && row.villageName !== 'संपूर्ण तालुका (All Villages)') {
    return row.villageName;
  }
  return row.name || row.taluka || row.villageName || 'अज्ञात';
};

/**
 * Generate Prapatra 1 Excel Booklet (1950 Baseline & Illegal Deletions)
 * Exactly mirrors docs/1.pdf
 */
export async function generatePrapatra1Excel(data, talukaName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर';
  const ws = wb.addWorksheet('प्रपत्र - 1 (१९५० तपासणी)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });

  // Title Row 1
  ws.mergeCells('A1:I1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'प्रपत्र क्र. 1 - शासकीय जमिनींचे सन 1950 पासूनचे सर्व मुळ 7/12 अभिलेखाची तपासणी करुन त्यानुसार 7/12 अभिलेख अद्यावत करण्याबाबत';
  titleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ws.getRow(1).height = 36;

  // Subtitle Row 2
  ws.mergeCells('A2:I2');
  const subCell = ws.getCell('A2');
  subCell.value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${talukaName} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  subCell.font = { name: 'Arial', size: 10, italic: true };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 22;

  // Table Headers
  const headers = [
    'अ.क्र.',
    'जिल्हा / तालुका',
    'जिल्ह्यातील एकूण 7/12 ची संख्या\n[2(अ)]',
    '1950 पासूनच्या तपासणी करण्यात आलेल्या 7/12 ची संख्या\n[3(अ)]',
    '1950 पासून सरकार/शासन नोंद आढळून आलेल्या 7/12 ची संख्या\n[4(अ)]',
    'अवैधरीत्या सरकार/शासन नोंद कमी केलेल्या 7/12 ची संख्या\n[5(अ)]',
    'यापैकी दुरुस्ती करण्यात आलेल्या 7/12 ची संख्या\n[6(अ)]',
    'दुरुस्ती करण्यास शिल्लक असलेल्या 7/12 ची संख्या\n[7(अ)]',
    'शेरा'
  ];

  const headerRow = ws.addRow(headers);
  headerRow.height = 42;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 9, bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
  });

  // Column numbers row
  const colNums = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const numRow = ws.addRow(colNums);
  numRow.height = 18;
  numRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 8, italic: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    cell.border = thinBorder;
  });

  // Data rows
  data.forEach((row, idx) => {
    const r = ws.addRow([
      idx + 1,
      getRowDisplayName(row),
      row.total712Count || 0,
      row.inspected1950Count || 0,
      row.govtFound1950Count || 0,
      row.illegalDeletionsCount || 0,
      row.rectifiedCount || 0,
      row.pendingRectifyCount || 0,
      row.remarks || '-'
    ]);
    r.height = 24;
    r.eachCell((cell, colIdx) => {
      cell.font = { name: 'Arial', size: 9 };
      cell.border = thinBorder;
      cell.alignment = {
        horizontal: colIdx === 2 ? 'left' : (colIdx === 9 ? 'left' : 'center'),
        vertical: 'middle'
      };
      if (colIdx >= 3 && colIdx <= 8) {
        cell.numFmt = '#,##0';
      }
    });
  });

  // Summary Total Row
  const startRow = 5;
  const endRow = startRow + data.length - 1;
  const totRow = ws.addRow([
    '',
    'एकूण (Total)',
    { formula: `SUM(C${startRow}:C${endRow})` },
    { formula: `SUM(D${startRow}:D${endRow})` },
    { formula: `SUM(E${startRow}:E${endRow})` },
    { formula: `SUM(F${startRow}:F${endRow})` },
    { formula: `SUM(G${startRow}:G${endRow})` },
    { formula: `SUM(H${startRow}:H${endRow})` },
    ''
  ]);
  totRow.height = 28;
  totRow.eachCell((cell, colIdx) => {
    cell.font = { name: 'Arial', size: 9, bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.border = thinBorder;
    cell.alignment = { horizontal: colIdx === 2 ? 'left' : 'center', vertical: 'middle' };
    if (colIdx >= 3 && colIdx <= 8) cell.numFmt = '#,##0';
  });

  // Widths
  ws.columns = [
    { width: 6 },
    { width: 22 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 16 },
    { width: 16 },
    { width: 18 }
  ];

  await wb.xlsx.write(res);
}

/**
 * Generate Prapatra 2 Excel Booklet (Pokalist Nondi Removal)
 * Exactly mirrors docs/2.pdf
 */
export async function generatePrapatra2Excel(data, talukaName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('प्रपत्र - 2 (पोकळीस्त नोंदी)');

  ws.mergeCells('A1:F1');
  const t = ws.getCell('A1');
  t.value = 'प्रपत्र क्र. 2 - शासकीय जमिनीचे 7/12 अभिलेखावरील पोकळीस्त नोंदी (बु.ग.दे./ता.ग.दे./सं.कु.) कमी करण्याबाबत';
  t.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ws.getRow(1).height = 36;

  ws.mergeCells('A2:F2');
  ws.getCell('A2').value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${talukaName}`;
  ws.getCell('A2').alignment = { horizontal: 'center' };

  const headers = [
    'अ.क्र.',
    'जिल्हा / तालुका',
    'शासकीय जमिनीवर पोकळीस्त नोंदी असलेल्या 7/12 ची संख्या\n[2(अ)]',
    'नोंदी कमी करण्यात आलेल्या 7/12 ची संख्या\n[3(अ)]',
    'नोंदी कमी करावयास शिल्लक 7/12 ची संख्या\n[4(अ)]',
    'शेरा'
  ];

  const hr = ws.addRow(headers);
  hr.height = 40;
  hr.eachCell((c) => {
    c.font = { name: 'Arial', size: 9, bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = thinBorder;
  });

  ws.addRow(['1', '2', '3', '4', '5', '6']).eachCell(c => {
    c.font = { size: 8, italic: true };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder;
  });

  data.forEach((row, idx) => {
    const r = ws.addRow([
      idx + 1,
      getRowDisplayName(row),
      row.pokalistCount || 0,
      row.pokalistRemovedCount || 0,
      row.pokalistPendingCount || 0,
      row.remarks || '-'
    ]);
    r.height = 24;
    r.eachCell((c, i) => {
      c.border = thinBorder;
      c.alignment = { horizontal: i === 2 ? 'left' : 'center', vertical: 'middle' };
    });
  });

  ws.columns = [
    { width: 6 },
    { width: 22 },
    { width: 24 },
    { width: 20 },
    { width: 20 },
    { width: 20 }
  ];

  await wb.xlsx.write(res);
}

/**
 * Generate Prapatra 3 Excel Booklet (Govt Depts & Corporations Allotments)
 * Exactly mirrors docs/3 (1).pdf
 */
export async function generatePrapatra3Excel(data, talukaName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('प्रपत्र - 3 (महामंडळे जमीन)');

  ws.mergeCells('A1:F1');
  const t = ws.getCell('A1');
  t.value = 'प्रपत्र क्र. 3 - शासकीय विभाग/महामंडळे/स्थानिक स्वराज्य संस्था यांना प्रदान करण्यात आलेल्या शासकीय जमिनींचे अनधिकृत हस्तांतरण,शर्तभंग झाल्यास सदर जमिनींचे मालकी हक्क पुर्ववत करणे अथवा शासन जमा करण्याबाबत.';
  t.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ws.getRow(1).height = 42;

  ws.mergeCells('A2:F2');
  ws.getCell('A2').value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${talukaName}`;
  ws.getCell('A2').alignment = { horizontal: 'center' };

  const headers = [
    'अ.क्र.',
    'जिल्हा / तालुका',
    'शासकीय विभाग/महामंडळे/स्थानिक संस्था यांना प्रदान शासकीय जमिनींच्या 7/12 संख्या\n[2(अ)]',
    'यापैकी अनधिकृत हस्तांतरण अथवा शर्तभंग झालेल्या जमिनींच्या 7/12 संख्या\n[3(अ)]',
    'मालकी पुर्ववत किंवा शासन जमा केलेल्या जमिनींच्या 7/12 संख्या\n[4(अ)]',
    'शेरा'
  ];

  const hr = ws.addRow(headers);
  hr.height = 40;
  hr.eachCell(c => {
    c.font = { name: 'Arial', size: 9, bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = thinBorder;
  });

  ws.addRow(['1', '2', '3', '4', '5', '6']).eachCell(c => {
    c.font = { size: 8, italic: true };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder;
  });

  data.forEach((row, idx) => {
    const r = ws.addRow([
      idx + 1,
      getRowDisplayName(row),
      row.govtDeptsAllottedCount || 0,
      row.govtDeptsShartbhang || 0,
      row.govtDeptsRestoredGovt || 0,
      row.remarks || '-'
    ]);
    r.height = 24;
    r.eachCell((c, i) => {
      c.border = thinBorder;
      c.alignment = { horizontal: i === 2 ? 'left' : 'center', vertical: 'middle' };
    });
  });

  ws.columns = [
    { width: 6 },
    { width: 22 },
    { width: 26 },
    { width: 24 },
    { width: 24 },
    { width: 20 }
  ];

  await wb.xlsx.write(res);
}

/**
 * Generate Prapatra 4 Excel Booklet (Private Trusts/Societies Allotments)
 * Exactly mirrors docs/4.pdf
 */
export async function generatePrapatra4Excel(data, talukaName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('प्रपत्र - 4 (संस्था जमीन)');

  ws.mergeCells('A1:F1');
  const t = ws.getCell('A1');
  t.value = 'प्रपत्र क्र. 4 - शासनाकडून विविध शैक्षणिक/सामाजिक संस्था, खाजगी संस्था, ट्रस्ट, गृहनिर्माण संस्था व अशा इतर सर्व प्रकारच्या संस्थांना व खाजगी व्यक्तीं यांना प्रदान शासकीय जमिनींचे शर्तभंग व शासन जमा.';
  t.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ws.getRow(1).height = 42;

  ws.mergeCells('A2:F2');
  ws.getCell('A2').value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${talukaName}`;
  ws.getCell('A2').alignment = { horizontal: 'center' };

  const headers = [
    'अ.क्र.',
    'जिल्हा / तालुका',
    'शैक्षणिक / सामाजिक / ट्रस्ट / सोसायट्यांना प्रदान शासकीय जमिनींच्या 7/12 संख्या\n[2(अ)]',
    'यापैकी अनधिकृत हस्तांतरण अथवा शर्तभंग झालेल्या जमिनींच्या 7/12 संख्या\n[3(अ)]',
    'मालकी पुर्ववत किंवा शासन जमा केलेल्या जमिनींच्या 7/12 संख्या\n[4(अ)]',
    'शेरा'
  ];

  const hr = ws.addRow(headers);
  hr.height = 40;
  hr.eachCell(c => {
    c.font = { name: 'Arial', size: 9, bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = thinBorder;
  });

  ws.addRow(['1', '2', '3', '4', '5', '6']).eachCell(c => {
    c.font = { size: 8, italic: true };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder;
  });

  data.forEach((row, idx) => {
    const r = ws.addRow([
      idx + 1,
      getRowDisplayName(row),
      row.privateAllottedCount || 0,
      row.privateShartbhang || 0,
      row.privateRestoredGovt || 0,
      row.remarks || '-'
    ]);
    r.height = 24;
    r.eachCell((c, i) => {
      c.border = thinBorder;
      c.alignment = { horizontal: i === 2 ? 'left' : 'center', vertical: 'middle' };
    });
  });

  ws.columns = [
    { width: 6 },
    { width: 22 },
    { width: 26 },
    { width: 24 },
    { width: 24 },
    { width: 20 }
  ];

  await wb.xlsx.write(res);
}

/**
 * Generate Prapatra 5 Excel Booklet (Comprehensive Govt Lands Status)
 * Exactly mirrors docs/5.pdf
 */
export async function generatePrapatra5Excel(data, talukaName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('प्रपत्र - 5 (शासकीय जमीन स्थिती)');

  ws.mergeCells('A1:H1');
  const t = ws.getCell('A1');
  t.value = 'प्रपत्र क्र. 5 - शासकीय जमिनींची एकुण संख्या, वाटप करण्यात आलेल्या जमिनींची संख्या, शर्तभंग, अतिक्रमण झालेल्या जमिनींची संख्या, तसेच मोजणी झालेल्या जमिनींची संख्या याबाबत माहिती';
  t.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ws.getRow(1).height = 42;

  ws.mergeCells('A2:H2');
  ws.getCell('A2').value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${talukaName}`;
  ws.getCell('A2').alignment = { horizontal: 'center' };

  // Headers spanning row 3 & 4
  ws.mergeCells('A3:A4'); ws.getCell('A3').value = 'अ.क्र.';
  ws.mergeCells('B3:B4'); ws.getCell('B3').value = 'जिल्हा / तालुका';
  ws.mergeCells('C3:C4'); ws.getCell('C3').value = 'शासकीय जमिनींच्या एकूण 7/12 संख्या\n[2(अ)]';
  ws.mergeCells('D3:D4'); ws.getCell('D3').value = 'वाटप करण्यात आलेल्या शासकीय जमिनी संख्या\n[3(अ)]';
  ws.mergeCells('E3:G3'); ws.getCell('E3').value = 'शासकीय जमिनींची सद्यस्थिती';
  ws.getCell('E4').value = 'शर्तभंग झालेल्या\n[4(अ)]';
  ws.getCell('F4').value = 'अतिक्रमण असलेल्या\n[5(अ)]';
  ws.getCell('G4').value = 'मोजणी झालेल्या\n[6(अ)]';
  ws.mergeCells('H3:H4'); ws.getCell('H3').value = 'शेरा';

  [ws.getRow(3), ws.getRow(4)].forEach(row => {
    row.eachCell(c => {
      c.font = { name: 'Arial', size: 9, bold: true };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
      c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      c.border = thinBorder;
    });
  });
  ws.getRow(3).height = 24;
  ws.getRow(4).height = 24;

  ws.addRow(['1', '2', '3', '4', '5', '6', '7', '8']).eachCell(c => {
    c.font = { size: 8, italic: true };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder;
  });

  data.forEach((row, idx) => {
    const r = ws.addRow([
      idx + 1,
      getRowDisplayName(row),
      row.totalGovtLandCount || 0,
      row.govtAllottedCount || 0,
      row.govtShartbhangCount || 0,
      row.govtEncroachedCount || 0,
      row.govtMojaniDoneCount || 0,
      row.remarks || '-'
    ]);
    r.height = 24;
    r.eachCell((c, i) => {
      c.border = thinBorder;
      c.alignment = { horizontal: i === 2 ? 'left' : 'center', vertical: 'middle' };
    });
  });

  ws.columns = [
    { width: 6 },
    { width: 22 },
    { width: 20 },
    { width: 20 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 }
  ];

  await wb.xlsx.write(res);
}

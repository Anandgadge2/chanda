import ExcelJS from 'exceljs';

const GOV_NAVY = 'FF1E3A8A';
const GOV_GOLD = 'FFD97706';
const HEADER_BG = 'FFF1F5F9';
const BORDER_COLOR = 'FFCBD5E1';
const ZEBRA_BG = 'FFF8FAFC';

const thinBorder = {
  top: { style: 'thin', color: { argb: BORDER_COLOR } },
  left: { style: 'thin', color: { argb: BORDER_COLOR } },
  bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
  right: { style: 'thin', color: { argb: BORDER_COLOR } }
};

export function cleanVillageName(name) {
  if (!name) return 'अज्ञात गाव';
  if (name === 'संपूर्ण तालुका (All Villages)' || name === 'all' || name === 'सर्व गावे') return name;
  let raw = String(name);
  raw = raw.replace(/[1१]\s*[-तते]\s*[4४][56५६]/gi, '');
  raw = raw.replace(/[4४][56५६]\s*[-तते]\s*[1१]/gi, '');
  raw = raw.replace(/[1१]\s*[-तते]\s*[1-9१-९]+/gi, '');
  raw = raw.replace(/[1-9१-९]+\s*[-तते]\s*[1-9१-९]+/gi, '');
  raw = raw.replace(/1-46|१-४६|1-45|१-४५/gi, '');
  raw = raw.replace(/१ त ४५|१ ते ४६|1 to 46|1 to 45/gi, '');
  raw = raw.replace(/[4४][56५६]\s*मद[दत]?/gi, '');
  raw = raw.replace(/मद[दत]?\s+/gi, '');
  raw = raw.replace(/मदयच/gi, '');
  raw = raw.replace(/महसल\s*अधकर\s*अभलख/gi, '');
  raw = raw.replace(/महिती|महत/gi, '');
  raw = raw.replace(/तपसण[ी]?\s*सतर/gi, '');
  raw = raw.replace(/तपसण[ी]?/gi, '');
  raw = raw.replace(/Worksheet\s*\d*/gi, '');
  raw = raw.replace(/सधरत/gi, '');
  raw = raw.replace(/2026/g, '');
  raw = raw.replace(/^मंडळ\s*/i, '');
  raw = raw.trim().replace(/\s+/g, ' ');
  return raw || name || 'अज्ञात गाव';
}

const TALUKA_EN_TO_MR = {
  'Warora': 'वरोरा',
  'Rajura': 'राजुरा',
  'Chandrapur': 'चंद्रपूर',
  'Mul': 'मूल',
  'Chimur': 'चिमूर',
  'Ballarpur': 'बल्लारपूर',
  'Bhadravati': 'भद्रावती',
  'Sindewahi': 'सिंदेवाही',
  'Brahmapuri': 'ब्रह्मपुरी',
  'Nagbhid': 'नागभीड',
  'Gondpipri': 'गोंडपिपरी',
  'Korpana': 'कोरपना',
  'Pombhurna': 'पोंभुर्णा',
  'Saoli': 'सावली',
  'Jivati': 'जिवती',
};

const getRowDisplayName = (row) => {
  if (row.villageName && row.villageName !== 'संपूर्ण तालुका (All Villages)') {
    return cleanVillageName(row.villageName);
  }
  const tMr = row.taluka ? (TALUKA_EN_TO_MR[row.taluka] || row.taluka) : null;
  return row.name || (tMr ? `${tMr} (संपूर्ण तालुका)` : null) || cleanVillageName(row.villageName) || 'एकूण';
};

/**
 * Helper to populate the Detailed Actual Data Sheet (Sheet 1)
 */
function buildDetailedParcelsSheet(ws, prapatraNum, prapatraTitle, parcelRecords, scopeName) {
  // Title Row 1
  ws.mergeCells('A1:L1');
  const t = ws.getCell('A1');
  t.value = `महाराष्ट्र शासन - जिल्हाधिकारी कार्यालय, चंद्रपूर | ${prapatraTitle} - सविस्तर ७/१२ अभिलेख व खातेदार यादी`;
  t.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ws.getRow(1).height = 36;

  // Subtitle Row 2
  ws.mergeCells('A2:L2');
  const sub = ws.getCell('A2');
  sub.value = `कार्यक्षेत्र: ${scopeName} | एकूण अभिलेख संख्या: ${parcelRecords.length} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  sub.font = { name: 'Arial', size: 10, italic: true, bold: true, color: { argb: 'FF334155' } };
  sub.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 24;

  // Headers Row 3
  const headers = [
    'अ.क्र.',
    'तालुका',
    'गाव',
    'गट क्र.',
    'जुना स.नं.',
    'क्षेत्रफळ (हे.)',
    'सध्याचे खातेदार / भोगवटादाराचे नाव',
    'सन १९५० मधील मूळ नोंद / मालक',
    'धारणा प्रकार',
    'तपासणी निष्कर्ष / सद्यस्थिती',
    'फेरफार / आदेश संदर्भ',
    'शेरा व इतर हक्क'
  ];

  const hr = ws.addRow(headers);
  hr.height = 36;
  hr.eachCell(c => {
    c.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = thinBorder;
  });

  // Column numbers row 4
  const numRow = ws.addRow(['१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११', '१२']);
  numRow.height = 18;
  numRow.eachCell(c => {
    c.font = { name: 'Arial', size: 8, italic: true };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    c.border = thinBorder;
  });

  // Data rows
  parcelRecords.forEach((p, idx) => {
    const isEven = idx % 2 === 0;
    const r = ws.addRow([
      idx + 1,
      TALUKA_EN_TO_MR[p.taluka] || p.taluka || '-',
      cleanVillageName(p.villageName),
      p.gatNumber || '-',
      p.oldSurveyNo || '-',
      Number(p.totalAreaHa || 0),
      p.currentOwner || 'नोंद उपलब्ध नाही',
      p.baselineOwner1950 || 'नोंद उपलब्ध नाही',
      p.tenureDisplay || p.tenureClass || '-',
      p.statusFinding || '-',
      p.orderRef || '-',
      p.remarks || '-'
    ]);
    r.height = 26;
    r.eachCell((c, colIdx) => {
      c.font = { name: 'Arial', size: 9 };
      c.border = thinBorder;
      if (isEven) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_BG } };
      }
      if (colIdx === 1 || colIdx === 4 || colIdx === 5 || colIdx === 9 || colIdx === 11) {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colIdx === 6) {
        c.alignment = { horizontal: 'right', vertical: 'middle' };
        c.numFmt = '#,##0.0000';
      } else {
        c.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      }
    });
  });

  // Summary Totals Row at the bottom
  const startRow = 5;
  const endRow = startRow + parcelRecords.length - 1;
  const totRow = ws.addRow([
    '',
    '',
    'एकूण (Total)',
    `${parcelRecords.length} नोंदी`,
    '',
    parcelRecords.length > 0 ? { formula: `SUM(F${startRow}:F${endRow})` } : 0,
    '',
    '',
    '',
    '',
    '',
    ''
  ]);
  totRow.height = 28;
  totRow.eachCell((c, colIdx) => {
    c.font = { name: 'Arial', size: 9, bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    c.border = thinBorder;
    if (colIdx === 6) {
      c.numFmt = '#,##0.0000';
      c.alignment = { horizontal: 'right', vertical: 'middle' };
    } else {
      c.alignment = { horizontal: colIdx === 3 ? 'left' : 'center', vertical: 'middle' };
    }
  });

  // Column Widths
  ws.columns = [
    { width: 7 },   // 1. अ.क्र.
    { width: 14 },  // 2. तालुका
    { width: 18 },  // 3. गाव
    { width: 12 },  // 4. गट क्र.
    { width: 14 },  // 5. जुना स.नं.
    { width: 14 },  // 6. क्षेत्रफळ
    { width: 34 },  // 7. सध्याचे खातेदार
    { width: 28 },  // 8. १९५० मूळ मालक
    { width: 18 },  // 9. धारणा प्रकार
    { width: 30 },  // 10. तपासणी निष्कर्ष
    { width: 18 },  // 11. फेरफार / आदेश
    { width: 32 }   // 12. शेरा
  ];
}

/**
 * Generate Prapatra 1 Excel Booklet (1950 Baseline & Illegal Deletions)
 * Sheet 1: सविस्तर ७/१२ अभिलेख व खातेदार यादी (Actual Records & Owners)
 * Sheet 2: गोषवारा (Summary Rollup)
 */
export async function generatePrapatra1Excel(summaryData, parcelRecords = [], scopeName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर';

  // --- SHEET 1: Detailed Actual Data List ---
  const wsDetails = wb.addWorksheet('सविस्तर ७-१२ यादी (Data)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });
  buildDetailedParcelsSheet(
    wsDetails,
    1,
    'प्रपत्र क्र. १ - शासकीय जमिनींची १९५० तपासणी',
    parcelRecords,
    scopeName
  );

  // --- SHEET 2: Summary Rollup (गोषवारा) ---
  const wsSummary = wb.addWorksheet('गोषवारा (Summary)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });

  // Title Row 1
  wsSummary.mergeCells('A1:I1');
  const titleCell = wsSummary.getCell('A1');
  titleCell.value = 'प्रपत्र क्र. १ - शासकीय जमिनींचे सन १९५० पासूनचे सर्व मूळ ७/१२ अभिलेखाची तपासणी करून त्यानुसार ७/१२ अभिलेख अद्यावत करण्याबाबत';
  titleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  wsSummary.getRow(1).height = 36;

  // Subtitle Row 2
  wsSummary.mergeCells('A2:I2');
  const subCell = wsSummary.getCell('A2');
  subCell.value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  subCell.font = { name: 'Arial', size: 10, italic: true };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  wsSummary.getRow(2).height = 22;

  // Table Headers
  const headers = [
    'अ.क्र.',
    'जिल्हा / तालुका / गाव',
    'जिल्ह्यातील एकूण ७/१२ ची संख्या\n[२(अ)]',
    '१९५० पासूनच्या तपासणी करण्यात आलेल्या ७/१२ ची संख्या\n[३(अ)]',
    '१९५० पासून सरकार/शासन नोंद आढळून आलेल्या ७/१२ ची संख्या\n[४(अ)]',
    'अवैधरीत्या सरकार/शासन नोंद कमी केलेल्या ७/१२ ची संख्या\n[५(अ)]',
    'यापैकी दुरुस्ती करण्यात आलेल्या ७/१२ ची संख्या\n[६(अ)]',
    'दुरुस्ती करण्यास शिल्लक असलेल्या ७/१२ ची संख्या\n[७(अ)]',
    'शेरा'
  ];

  const headerRow = wsSummary.addRow(headers);
  headerRow.height = 42;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 9, bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
  });

  // Column numbers row
  const colNums = ['१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const numRow = wsSummary.addRow(colNums);
  numRow.height = 18;
  numRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 8, italic: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    cell.border = thinBorder;
  });

  // Data rows
  summaryData.forEach((row, idx) => {
    const r = wsSummary.addRow([
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
  const endRow = startRow + summaryData.length - 1;
  const totRow = wsSummary.addRow([
    '',
    'एकूण (Total)',
    summaryData.length > 0 ? { formula: `SUM(C${startRow}:C${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(D${startRow}:D${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(E${startRow}:E${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(F${startRow}:F${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(G${startRow}:G${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(H${startRow}:H${endRow})` } : 0,
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

  wsSummary.columns = [
    { width: 6 },
    { width: 24 },
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
 */
export async function generatePrapatra2Excel(summaryData, parcelRecords = [], scopeName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर';

  // --- SHEET 1: Detailed Actual Data List ---
  const wsDetails = wb.addWorksheet('सविस्तर पोकळीस्त यादी (Data)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });
  buildDetailedParcelsSheet(
    wsDetails,
    2,
    'प्रपत्र क्र. २ - पोकळीस्त नोंदींचा तपासणी अहवाल',
    parcelRecords,
    scopeName
  );

  // --- SHEET 2: Summary Rollup (गोषवारा) ---
  const wsSummary = wb.addWorksheet('गोषवारा (Summary)');

  wsSummary.mergeCells('A1:F1');
  const t = wsSummary.getCell('A1');
  t.value = 'प्रपत्र क्र. २ - शासकीय जमिनीचे ७/१२ अभिलेखावरील पोकळीस्त नोंदी (बु.ग.दे./ता.ग.दे./सं.कु.) कमी करण्याबाबत';
  t.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  wsSummary.getRow(1).height = 36;

  wsSummary.mergeCells('A2:F2');
  wsSummary.getCell('A2').value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  wsSummary.getCell('A2').alignment = { horizontal: 'center' };

  const headers = [
    'अ.क्र.',
    'जिल्हा / तालुका / गाव',
    'शासकीय जमिनीवर पोकळीस्त नोंदी असलेल्या ७/१२ ची संख्या\n[२(अ)]',
    'नोंदी कमी करण्यात आलेल्या ७/१२ ची संख्या\n[३(अ)]',
    'नोंदी कमी करावयास शिल्लक ७/१२ ची संख्या\n[४(अ)]',
    'शेरा'
  ];

  const hr = wsSummary.addRow(headers);
  hr.height = 40;
  hr.eachCell((c) => {
    c.font = { name: 'Arial', size: 9, bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = thinBorder;
  });

  wsSummary.addRow(['१', '२', '३', '४', '५', '६']).eachCell(c => {
    c.font = { size: 8, italic: true };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder;
  });

  summaryData.forEach((row, idx) => {
    const r = wsSummary.addRow([
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

  wsSummary.columns = [
    { width: 6 },
    { width: 24 },
    { width: 24 },
    { width: 20 },
    { width: 20 },
    { width: 20 }
  ];

  await wb.xlsx.write(res);
}

/**
 * Generate Prapatra 3 Excel Booklet (Govt Depts & Corporations Allotments)
 */
export async function generatePrapatra3Excel(summaryData, parcelRecords = [], scopeName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर';

  // --- SHEET 1: Detailed Actual Data List ---
  const wsDetails = wb.addWorksheet('सविस्तर महामंडळे यादी (Data)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });
  buildDetailedParcelsSheet(
    wsDetails,
    3,
    'प्रपत्र क्र. ३ - शासकीय विभाग व महामंडळे वाटप तपासणी अहवाल',
    parcelRecords,
    scopeName
  );

  // --- SHEET 2: Summary Rollup (गोषवारा) ---
  const wsSummary = wb.addWorksheet('गोषवारा (Summary)');

  wsSummary.mergeCells('A1:F1');
  const t = wsSummary.getCell('A1');
  t.value = 'प्रपत्र क्र. ३ - शासकीय विभाग/महामंडळे/स्थानिक स्वराज्य संस्था यांना प्रदान करण्यात आलेल्या शासकीय जमिनींचे अनधिकृत हस्तांतरण,शर्तभंग झाल्यास सदर जमिनींचे मालकी हक्क पुर्ववत करणे अथवा शासन जमा करण्याबाबत.';
  t.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  wsSummary.getRow(1).height = 42;

  wsSummary.mergeCells('A2:F2');
  wsSummary.getCell('A2').value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  wsSummary.getCell('A2').alignment = { horizontal: 'center' };

  const headers = [
    'अ.क्र.',
    'जिल्हा / तालुका / गाव',
    'शासकीय विभाग/महामंडळे/स्थानिक संस्था यांना प्रदान शासकीय जमिनींच्या ७/१२ संख्या\n[२(अ)]',
    'यापैकी अनधिकृत हस्तांतरण अथवा शर्तभंग झालेल्या जमिनींच्या ७/१२ संख्या\n[३(अ)]',
    'मालकी पुर्ववत किंवा शासन जमा केलेल्या जमिनींच्या ७/१२ संख्या\n[४(अ)]',
    'शेरा'
  ];

  const hr = wsSummary.addRow(headers);
  hr.height = 40;
  hr.eachCell(c => {
    c.font = { name: 'Arial', size: 9, bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = thinBorder;
  });

  wsSummary.addRow(['१', '२', '३', '४', '५', '६']).eachCell(c => {
    c.font = { size: 8, italic: true };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder;
  });

  summaryData.forEach((row, idx) => {
    const r = wsSummary.addRow([
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

  wsSummary.columns = [
    { width: 6 },
    { width: 24 },
    { width: 26 },
    { width: 24 },
    { width: 24 },
    { width: 20 }
  ];

  await wb.xlsx.write(res);
}

/**
 * Generate Prapatra 4 Excel Booklet (Private Trusts/Societies Allotments)
 */
export async function generatePrapatra4Excel(summaryData, parcelRecords = [], scopeName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर';

  // --- SHEET 1: Detailed Actual Data List ---
  const wsDetails = wb.addWorksheet('सविस्तर संस्था यादी (Data)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });
  buildDetailedParcelsSheet(
    wsDetails,
    4,
    'प्रपत्र क्र. ४ - खाजगी संस्था व व्यक्ती शर्तभंग तपासणी अहवाल',
    parcelRecords,
    scopeName
  );

  // --- SHEET 2: Summary Rollup (गोषवारा) ---
  const wsSummary = wb.addWorksheet('गोषवारा (Summary)');

  wsSummary.mergeCells('A1:F1');
  const t = wsSummary.getCell('A1');
  t.value = 'प्रपत्र क्र. ४ - शासनाकडून विविध शैक्षणिक/सामाजिक संस्था, खाजगी संस्था, ट्रस्ट, गृहनिर्माण संस्था व अशा इतर सर्व प्रकारच्या संस्थांना व खाजगी व्यक्तीं यांना प्रदान शासकीय जमिनींचे शर्तभंग व शासन जमा.';
  t.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  wsSummary.getRow(1).height = 42;

  wsSummary.mergeCells('A2:F2');
  wsSummary.getCell('A2').value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  wsSummary.getCell('A2').alignment = { horizontal: 'center' };

  const headers = [
    'अ.क्र.',
    'जिल्हा / तालुका / गाव',
    'शैक्षणिक / सामाजिक / ट्रस्ट / सोसायट्यांना प्रदान शासकीय जमिनींच्या ७/१२ संख्या\n[२(अ)]',
    'यापैकी अनधिकृत हस्तांतरण अथवा शर्तभंग झालेल्या जमिनींच्या ७/१२ संख्या\n[३(अ)]',
    'मालकी पुर्ववत किंवा शासन जमा केलेल्या जमिनींच्या ७/१२ संख्या\n[४(अ)]',
    'शेरा'
  ];

  const hr = wsSummary.addRow(headers);
  hr.height = 40;
  hr.eachCell(c => {
    c.font = { name: 'Arial', size: 9, bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = thinBorder;
  });

  wsSummary.addRow(['१', '२', '३', '४', '५', '६']).eachCell(c => {
    c.font = { size: 8, italic: true };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder;
  });

  summaryData.forEach((row, idx) => {
    const r = wsSummary.addRow([
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

  wsSummary.columns = [
    { width: 6 },
    { width: 24 },
    { width: 26 },
    { width: 24 },
    { width: 24 },
    { width: 20 }
  ];

  await wb.xlsx.write(res);
}

/**
 * Generate Prapatra 5 Excel Booklet (Comprehensive Govt Lands Status)
 */
export async function generatePrapatra5Excel(summaryData, parcelRecords = [], scopeName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर';

  // --- SHEET 1: Detailed Actual Data List ---
  const wsDetails = wb.addWorksheet('सविस्तर शासकीय जमीन यादी (Data)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });
  buildDetailedParcelsSheet(
    wsDetails,
    5,
    'प्रपत्र क्र. ५ - शासकीय व गायरान जमिनींची सर्वंकष तपासणी',
    parcelRecords,
    scopeName
  );

  // --- SHEET 2: Summary Rollup (गोषवारा) ---
  const wsSummary = wb.addWorksheet('गोषवारा (Summary)');

  wsSummary.mergeCells('A1:H1');
  const t = wsSummary.getCell('A1');
  t.value = 'प्रपत्र क्र. ५ - शासकीय जमिनींची एकूण संख्या, वाटप करण्यात आलेल्या जमिनींची संख्या, शर्तभंग, अतिक्रमण झालेल्या जमिनींची संख्या, तसेच मोजणी झालेल्या जमिनींची संख्या याबाबत माहिती';
  t.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  wsSummary.getRow(1).height = 42;

  wsSummary.mergeCells('A2:H2');
  wsSummary.getCell('A2').value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  wsSummary.getCell('A2').alignment = { horizontal: 'center' };

  // Headers spanning row 3 & 4
  wsSummary.mergeCells('A3:A4'); wsSummary.getCell('A3').value = 'अ.क्र.';
  wsSummary.mergeCells('B3:B4'); wsSummary.getCell('B3').value = 'जिल्हा / तालुका / गाव';
  wsSummary.mergeCells('C3:C4'); wsSummary.getCell('C3').value = 'शासकीय जमिनींच्या एकूण ७/१२ संख्या\n[२(अ)]';
  wsSummary.mergeCells('D3:D4'); wsSummary.getCell('D3').value = 'वाटप करण्यात आलेल्या शासकीय जमिनी संख्या\n[३(अ)]';
  wsSummary.mergeCells('E3:G3'); wsSummary.getCell('E3').value = 'शासकीय जमिनींची सद्यस्थिती';
  wsSummary.getCell('E4').value = 'शर्तभंग झालेल्या\n[४(अ)]';
  wsSummary.getCell('F4').value = 'अतिक्रमण असलेल्या\n[५(अ)]';
  wsSummary.getCell('G4').value = 'मोजणी झालेल्या\n[६(अ)]';
  wsSummary.mergeCells('H3:H4'); wsSummary.getCell('H3').value = 'शेरा';

  [wsSummary.getRow(3), wsSummary.getRow(4)].forEach(row => {
    row.eachCell(c => {
      c.font = { name: 'Arial', size: 9, bold: true };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
      c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      c.border = thinBorder;
    });
  });
  wsSummary.getRow(3).height = 24;
  wsSummary.getRow(4).height = 24;

  wsSummary.addRow(['१', '२', '३', '४', '५', '६', '७', '८']).eachCell(c => {
    c.font = { size: 8, italic: true };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder;
  });

  summaryData.forEach((row, idx) => {
    const r = wsSummary.addRow([
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

  wsSummary.columns = [
    { width: 6 },
    { width: 24 },
    { width: 20 },
    { width: 20 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 }
  ];

  await wb.xlsx.write(res);
}

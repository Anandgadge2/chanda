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

  // Standardize known aliases / abbreviations
  const aliases = {
    'UMRILAL MAN RITH': 'उमरी लालमान रीठ',
    'umrilal man rith': 'उमरी लालमान रीठ',
    'Kanhalgaon': 'कन्हाळगाव',
    'tangalakerambodijambhuldhara': 'टांगाळा, केरामबोडी, जांभुळधरा',
    'अकोला': 'अकोला',
    'अकोला खुर्द': 'अकोला',
    'अकोला, कातलाबोडी': 'अकोला',
    'अकोला,कातलाबोडी)': 'अकोला',
    'कातलाबोडी': 'कातलाबोडी',
    'अंतरगाव बु.': 'अंतरगाव बु',
    'कढोली खु.': 'कढोली खु',
    'शेरज ( खुर्द )': 'शेराज खुर्द',
    'सोनुर्ली (गाडे)': 'सोनुर्ली गाडेगाव',
    'दानोदा(रिठ)': 'दानोदा रिठ',
    'उपरावाही': 'उपरवाही',
    'निमणी': 'निमाणी',
    'asan buj 45 mudde updated': 'आसन बु',
    'केरामबोडी': 'केरामबोडी',
    'टांगला': 'टांगाळा',
    'टांगाळा': 'टांगाळा',
    'जांभुळधरा': 'जांभुळधरा',
    'चिचखोड': 'चिचखोड',
    'चीचखोड': 'चिचखोड',
    'दहेगाव': 'दहेगाव',
    'कन्हाळगाव': 'कन्हाळगाव',
    'हिरापुर': 'हिरापूर',
    'हिरापूर': 'हिरापूर',
    'उमरहिरा साजा पारडी': 'उमरहिरा',
    'उमरहिरा': 'उमरहिरा',
    'खडकी साजा पारडी': 'खडकी',
    'खडकी': 'खडकी',
    'बोरगाव बुज': 'बोरगाव बु',
    'बोरगाव बु': 'बोरगाव बु',
    'जेवरा रीठ': 'जेवरा रिठ',
    'जेवरा रिठ': 'जेवरा रिठ',
    'सोनापुर': 'सोनापूर',
    'सोनापूर': 'सोनापूर',
    'बल्लारपुर': 'बल्लारपूर',
    'बल्लारपूर': 'बल्लारपूर',
    'विसापुर': 'विसापूर',
    'विसापूर': 'विसापूर',
    'जामखुला': 'जामखुळा',
    'जामखुळा': 'जामखुळा',
    'गुर्हाड रिठ': 'गुऱ्हाड रिठ',
    'गुऱ्हाड रिठ': 'गुऱ्हाड रिठ',
    'कवडसी बो': 'कवडशी बोरगाव',
    'कवडशी बोरगाव': 'कवडशी बोरगाव',
    'सूर्ला': 'सुर्ला',
    'सुर्ला': 'सुर्ला',
    'शेंबळ': 'शेम्बळ',
    'शेम्बळ': 'शेम्बळ',
    'पौणी': 'पौनी',
    'पौनी': 'पौनी',
    'बोडखा मो': 'बोडखा',
    'बोडखा': 'बोडखा',
    'पाचगाव ठा': 'पाचगाव ठाकरे',
    'पाचगाव ठाकरे': 'पाचगाव ठाकरे',
    'पांढरताळा': 'पांढरतळा',
    'पांढरतळा': 'पांढरतळा',
    'चारगाव खु': 'चारगाव खुर्द',
    'चारगाव खुर्द': 'चारगाव खुर्द',
    'माेहाडी तुकूम': 'मोहाडी तुकूम',
    'मोहाडी तुकूम': 'मोहाडी तुकूम',
    'केमरिठ': 'केम रिठ',
    'केम रिठ': 'केम रिठ',
    'कोर्टी तुकूम अधिकार सूची': 'कोर्टी तुकूम',
    'कोर्टी तुकूम': 'कोर्टी तुकूम',
    'नागपूर छोटा 1': 'नागपूर छोटा',
    'नागपूर छोटा': 'नागपूर छोटा',
    'पेठा': 'पेठ',
    'पेठ': 'पेठ',
    'चक वायगाव नं1': 'चक वायगाव नं. १',
    'चक वायगाव नं 1': 'चक वायगाव नं. १',
    'चक वायगाव नं. १': 'चक वायगाव नं. १',
    'गवराळा': 'गवराळा रिठ',
    'गवराळा रिठ': 'गवराळा रिठ',
    'कोसारा नवीन सुधारित': 'कोसारा',
    'कोसारा': 'कोसारा',
    'जुनोना रे': 'जुनोना रै',
    'जुनोना': 'जुनोना रै',
    'जुनोना रै': 'जुनोना रै',
    'चेकगोजोली': 'चेक गोजोली',
    'चेक गोजोली': 'चेक गोजोली',
    'चकव्यंकटपूर': 'चक व्यंकटपूर',
    'चक व्यंकटपूर': 'चक व्यंकटपूर',
    'चेकघडोली': 'चेक घडोली',
    'चेक घडोली': 'चेक घडोली',
    'रानपरसोडी': 'रान परसोडी',
    'रान परसोडी': 'रान परसोडी',
    'खैरीचक पारखी': 'खैरी चक पारखी',
    'खैरी चक पारखी': 'खैरी चक पारखी',
    'मांगली अ': 'मांगली अरब',
    'मांगली अरब': 'मांगली अरब',
    'सोनापूर तु': 'सोनापूर तुकूम',
    'सोनापूर तुकूम': 'सोनापूर तुकूम',
    'कोसंबी चक -2': 'कोसंबी चक २',
    'कोसंबी चक 2': 'कोसंबी चक २',
    'कोसंबी चक २': 'कोसंबी चक २',
    'कोसंबी चक-1': 'कोसंबी चक १',
    'कोसंबी चक 1': 'कोसंबी चक १',
    'कोसंबी चक १': 'कोसंबी चक १',
    'पाचगाव (मूसलमान)': 'पाचगाव मुसलमान',
    'पाचगाव मुसलमान': 'पाचगाव मुसलमान',
    'गोटाळा रि': 'गोटाळा रिठ',
    'गोटाळा रिठ': 'गोटाळा रिठ',
    'थेटेगाव रिठ': 'थेटेगाव',
    'थेटेगाव': 'थेटेगाव',
    'कसारबोडी रिठ': 'कसरबोडी रिठ',
    'कसरबोडी रिठ': 'कसरबोडी रिठ',
    'नविन नवेगाव': 'नवेगाव',
    'पाचगांव': 'पाचगाव',
    'कांतापेठ': 'कांतापेठ रै',
    'कांतापेठ रै': 'कांतापेठ रै',
    'डोनी': 'डोणी',
    'डोणी': 'डोणी',
    'भगवानपूर (पूर्न)': 'भगवानपूर',
    'भगवानपूर': 'भगवानपूर',
    'कसरगावं': 'कसरगाव',
    'कसरगाव': 'कसरगाव',
    'खानाबाद': 'खानाबाद चक',
    'खानाबाद चक': 'खानाबाद चक',
    'जाम-बुज': 'जाम बु',
    'जाम बुज': 'जाम बु',
    'जाम बु': 'जाम बु',
    'पिरंजीमाल': 'पिरंजी माल',
    'पिरंजी माल': 'पिरंजी माल',
    'खातेरामाल': 'खातेरा माल',
    'खातेरा माल': 'खातेरा माल',
    'टेंभूर्न्बोडी': 'टेंभूर्णबोडी',
    'टेंभूर्णबोडी': 'टेंभूर्णबोडी',
    'पांढरवाणी': 'पांढरवाडी',
    'पांढरवाडी': 'पांढरवाडी',
    'सावरगाटा': 'सावरगाटा चक',
    'सावरगाटा चक': 'सावरगाटा चक',
    'जामखुर्द': 'जाम खुर्द',
    'जाम खुर्द': 'जाम खुर्द',
    'चक नवेगाव-3': 'चक नवेगाव',
    'चक नवेगाव': 'चक नवेगाव',
    'जामतुकूम': 'जामतुकूम',
    'जामतुकूम रै': 'जामतुकूम रै',
    'शेड वाही babapur': 'शेडवाही',
    'शेडवाही': 'शेडवाही',
    'सिंगारपठार नवीन': 'सिंगारपठार',
    'सिंगारपठार': 'सिंगारपठार',
    'मरकागोंदी धनक': 'मरकागोंदी',
    'मरकागोंदी': 'मरकागोंदी',
    'येरमीयेसापूर': 'येरमी येसापूर',
    'येरमी येसापूर': 'येरमी येसापूर'
  };
  if (aliases[raw]) raw = aliases[raw];

  raw = raw.replace(/[1१]\s*[-ततेtoTO]\s*[4५][56५६]/gi, '');
  raw = raw.replace(/[4५][56५६]\s*[-ततेtoTO]\s*[1१]/gi, '');
  raw = raw.replace(/[1१]\s*[-ततेtoTO]\s*[1-9१-९]+/gi, '');
  raw = raw.replace(/[1-9१-९]+\s*[-ततेtoTO]\s*[1-9१-९]+/gi, '');
  raw = raw.replace(/1-46|१-४६|1-45|१-४५|1\s*to\s*4[56]/gi, '');
  raw = raw.replace(/१ त ४५|१ ते ४६|1 to 46|1 to 45/gi, '');
  raw = raw.replace(/[4५][56५६]\s*मद[दत]?/gi, '');
  raw = raw.replace(/मद[दत]?\s+/gi, '');
  raw = raw.replace(/मदयच/gi, '');
  raw = raw.replace(/महसल\s*अधकर\s*अभलख/gi, '');
  raw = raw.replace(/महिती|महत/gi, '');
  raw = raw.replace(/तपसण[ी]?\s*सतर/gi, '');
  raw = raw.replace(/तपसण[ी]?/gi, '');
  raw = raw.replace(/सातबारा|७\/१२/gi, '');
  raw = raw.replace(/Worksheet\s*\d*/gi, '');
  raw = raw.replace(/सधरत/gi, '');
  raw = raw.replace(/2026/g, '');
  raw = raw.replace(/^मंडळ\s*/i, '');
  raw = raw.replace(/Microsoft Excel.*$/i, '');
  raw = raw.replace(/\.xlsx?$/i, '');

  // Normalize Marathi abbreviations with dot (e.g. बु. -> बु, खु. -> खु)
  raw = raw.replace(/बु\./g, 'बु');
  raw = raw.replace(/खु\./g, 'खु');
  raw = raw.replace(/रै\./g, 'रै');
  raw = raw.replace(/रे\./g, 'रे');
  raw = raw.replace(/नं\./g, 'नं');
  raw = raw.replace(/रीठ\./g, 'रीठ');
  raw = raw.replace(/रिठ\./g, 'रिठ');
  raw = raw.replace(/मं\./g, 'मं');
  raw = raw.replace(/सि\./g, 'सि');
  raw = raw.replace(/ता\./g, 'ता');

  // Normalize standard morphological revenue village suffixes
  raw = raw.replace(/पुर(?=[\s,]|$)/g, 'पूर');
  raw = raw.replace(/रीठ(?=[\s,]|$)/g, 'रिठ');
  raw = raw.replace(/तुकुम(?=[\s,]|$)/g, 'तुकूम');

  // Strip leading numbers/punctuation (e.g. "26_", "01 ", "1. ")
  raw = raw.replace(/^[0-9१-९]+[\s._\-–—]+/, '');

  // Strip unmatched closing parens or trailing punctuation
  if (!raw.includes('(')) {
    raw = raw.replace(/[.,_)\-–—\s]+$/, '');
  } else {
    raw = raw.replace(/[.,_\-–—\s]+$/, '');
  }
  raw = raw.replace(/^[.,_(\-–—\s]+/, '');

  // Normalize parentheses and punctuation spacing
  raw = raw.replace(/\s*\(\s*/g, ' (').replace(/\s*\)\s*/g, ')');
  raw = raw.replace(/\s*,\s*/g, ', ');
  raw = raw.replace(/\s+/g, ' ').trim();

  return raw || name || 'अज्ञात गाव';
}

export function getVillageVariants(name) {
  if (!name || name === 'all' || name === 'सर्व गावे' || name === 'All Villages' || name === 'संपूर्ण तालुका (All Villages)') return [];
  const raw = String(name).trim();
  const cleaned = cleanVillageName(raw);
  const variants = new Set([
    raw,
    cleaned,
    cleaned.replace(/पूर/g, 'पुर'),
    cleaned.replace(/पुर/g, 'पूर'),
    cleaned.replace(/रिठ/g, 'रीठ'),
    cleaned.replace(/रीठ/g, 'रिठ'),
    cleaned.replace(/तुकूम/g, 'तुकुम'),
    cleaned.replace(/तुकुम/g, 'तुकूम'),
    cleaned.replace(/बु$/g, 'बु.'),
    cleaned.replace(/खु$/g, 'खु.'),
    cleaned.replace(/रै$/g, 'रै.'),
    raw.replace(/पूर/g, 'पुर'),
    raw.replace(/पुर/g, 'पूर'),
    raw.replace(/रिठ/g, 'रीठ'),
    raw.replace(/रीठ/g, 'रिठ')
  ]);
  return Array.from(variants).filter(Boolean);
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
    const tMr = row.taluka ? (TALUKA_EN_TO_MR[row.taluka] || row.taluka) : null;
    return tMr ? `${cleanVillageName(row.villageName)} (${tMr})` : cleanVillageName(row.villageName);
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

const applyHeaderStyle = (cell) => {
  cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
  cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  cell.border = thinBorder;
};

const applyNumberRowStyle = (row) => {
  row.height = 18;
  row.eachCell(c => {
    c.font = { name: 'Arial', size: 8, italic: true };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    c.border = thinBorder;
  });
};

/**
 * Generate Prapatra 1 Excel Booklet (1950 Baseline & Illegal Deletions)
 * Strictly conforms to Official Booklet 1 PDF format
 */
export async function generatePrapatra1Excel(summaryData = [], parcelRecords = [], scopeName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर';

  // --- SHEET 1: Official Booklet Format (गोषवारा) ---
  const ws = wb.addWorksheet('प्रपत्र क्र. १ (Booklet 1)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });

  // Row 1: Title
  ws.mergeCells('A1:I1');
  const t = ws.getCell('A1');
  t.value = 'प्रपत्र क्र. 1 - शासकीय जमिनींचे सन 1950 पासूनचे सर्व मुळ 7/12 अभिलेखाची तपासणी करुन त्यानुसार 7/12 अभिलेख अद्यावत करण्याबाबत';
  t.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ws.getRow(1).height = 38;

  // Row 2: Subtitle
  ws.mergeCells('A2:I2');
  const sub = ws.getCell('A2');
  sub.value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  sub.font = { name: 'Arial', size: 9, italic: true, bold: true, color: { argb: 'FF334155' } };
  sub.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 20;

  // Row 3: Main Headers
  ws.mergeCells('A3:A4'); ws.getCell('A3').value = 'अ.क्र.';
  ws.mergeCells('B3:B4'); ws.getCell('B3').value = 'जिल्हा';
  ws.getCell('C3').value = 'जिल्ह्यातील एकूण';
  ws.getCell('D3').value = '1950 पासूनच्या तपासणी करण्यात आलेल्या';
  ws.getCell('E3').value = '1950 पासुन सरकार/शासन नोंद आढळून आलेल्या';
  ws.getCell('F3').value = 'अवैधरीत्या सरकार/शासन नोंद कमी केलेल्या';
  ws.getCell('G3').value = 'यापैकी दुरुस्ती करण्यात आलेल्या';
  ws.getCell('H3').value = 'दुरुस्ती करण्यास शिल्लक असलेल्या';
  ws.mergeCells('I3:I4'); ws.getCell('I3').value = 'शेरा';

  // Row 4: Sub-headers
  ws.getCell('C4').value = '7/12 ची संख्या';
  ws.getCell('D4').value = '7/12 ची संख्या';
  ws.getCell('E4').value = '7/12 ची संख्या';
  ws.getCell('F4').value = '7/12 ची संख्या';
  ws.getCell('G4').value = '7/12 ची संख्या';
  ws.getCell('H4').value = '7/12 ची संख्या';

  // Row 5: Column Notations
  ws.getCell('C5').value = '2(अ)';
  ws.getCell('D5').value = '3(अ)';
  ws.getCell('E5').value = '4(अ)';
  ws.getCell('F5').value = '5(अ)';
  ws.getCell('G5').value = '6(अ)';
  ws.getCell('H5').value = '7(अ)';

  [ws.getRow(3), ws.getRow(4), ws.getRow(5)].forEach((row, rIdx) => {
    row.height = rIdx === 0 ? 32 : (rIdx === 1 ? 22 : 18);
    for (let c = 1; c <= 9; c++) {
      applyHeaderStyle(row.getCell(c));
    }
  });

  // Row 6: Column Numbers (1 to 9)
  const numRow = ws.addRow(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  applyNumberRowStyle(numRow);

  // Data Rows (Row 7+)
  const startRow = 7;
  summaryData.forEach((row, idx) => {
    const insp = Number(row.inspected1950Count || row.total712Count || 0);
    const govtFound = Number(row.govtFound1950Count || row.totalGovtLandCount || 0);
    const illegalDel = Number(row.illegalDeletionsCount || 0);
    const rect = Number(row.rectifiedCount || 0);
    const pendRect = Number(row.pendingRectifyCount || Math.max(0, illegalDel - rect));

    const r = ws.addRow([
      idx + 1,
      getRowDisplayName(row),
      Number(row.total712Count || 0),
      insp,
      govtFound,
      illegalDel,
      rect,
      pendRect,
      row.remarks || '-'
    ]);
    r.height = 24;
    r.eachCell((c, colIdx) => {
      c.font = { name: 'Arial', size: 9 };
      c.border = thinBorder;
      if (colIdx === 1) {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colIdx === 2) {
        c.alignment = { horizontal: 'left', vertical: 'middle' };
        c.font = { name: 'Arial', size: 9, bold: true };
      } else if (colIdx >= 3 && colIdx <= 8) {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.numFmt = '#,##0';
      } else {
        c.alignment = { horizontal: 'left', vertical: 'middle' };
      }
    });
  });

  // Summary Total Row
  const endRow = startRow + summaryData.length - 1;
  const totRow = ws.addRow([
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
  totRow.eachCell((c, colIdx) => {
    c.font = { name: 'Arial', size: 9, bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    c.border = thinBorder;
    if (colIdx >= 3 && colIdx <= 8) {
      c.numFmt = '#,##0';
      c.alignment = { horizontal: 'center', vertical: 'middle' };
    } else {
      c.alignment = { horizontal: colIdx === 2 ? 'left' : 'center', vertical: 'middle' };
    }
  });

  ws.columns = [
    { width: 7 },   // 1. अ.क्र.
    { width: 26 },  // 2. जिल्हा
    { width: 18 },  // 3. एकूण 7/12
    { width: 22 },  // 4. 1950 तपासणी
    { width: 24 },  // 5. सरकार नोंद
    { width: 22 },  // 6. अवैध कमी केलेल्या
    { width: 20 },  // 7. दुरुस्ती केलेल्या
    { width: 20 },  // 8. दुरुस्तीस शिल्लक
    { width: 22 }   // 9. शेरा
  ];

  // --- SHEET 2: Detailed 7/12 Parcel Registry ---
  const wsDetails = wb.addWorksheet('सविस्तर ७-१२ यादी (Data)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });
  buildDetailedParcelsSheet(wsDetails, 1, 'प्रपत्र क्र. १ - शासकीय जमिनींची १९५० तपासणी', parcelRecords, scopeName);

  await wb.xlsx.write(res);
}

/**
 * Generate Prapatra 2 Excel Booklet (Pokalist Nondi Removal)
 * Strictly conforms to Official Booklet 2 PDF format
 */
export async function generatePrapatra2Excel(summaryData = [], parcelRecords = [], scopeName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर';

  // --- SHEET 1: Official Booklet Format ---
  const ws = wb.addWorksheet('प्रपत्र क्र. २ (Booklet 2)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });

  // Row 1: Title
  ws.mergeCells('A1:F1');
  const t = ws.getCell('A1');
  t.value = 'प्रपत्र क्र. 2 - शासकीय जमिनीचे 7/12 अभिलेखावरील पोकळीस्त नोंदी (बु.ग.दे./ता.ग.दे./सं.कु.) कमी करण्याबाबत';
  t.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ws.getRow(1).height = 38;

  // Row 2: Subtitle
  ws.mergeCells('A2:F2');
  const sub = ws.getCell('A2');
  sub.value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  sub.font = { name: 'Arial', size: 9, italic: true, bold: true, color: { argb: 'FF334155' } };
  sub.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 20;

  // Row 3: Main Headers
  ws.mergeCells('A3:A4'); ws.getCell('A3').value = 'अ.क्र.';
  ws.mergeCells('B3:B4'); ws.getCell('B3').value = 'जिल्हा';
  ws.getCell('C3').value = 'शासकीय जमिनीवर पोकळीस्त नोंदी असलेल्या';
  ws.getCell('D3').value = 'नोंदी कमी करण्यात आलेल्या';
  ws.getCell('E3').value = 'नोंदी कमी करावयास शिल्लक';
  ws.mergeCells('F3:F4'); ws.getCell('F3').value = 'शेरा';

  // Row 4: Sub-headers
  ws.getCell('C4').value = '7/12 ची संख्या';
  ws.getCell('D4').value = '7/12 ची संख्या';
  ws.getCell('E4').value = '7/12 ची संख्या';

  // Row 5: Column Notations
  ws.getCell('C5').value = '2(अ)';
  ws.getCell('D5').value = '3(अ)';
  ws.getCell('E5').value = '4(अ)';

  [ws.getRow(3), ws.getRow(4), ws.getRow(5)].forEach((row, rIdx) => {
    row.height = rIdx === 0 ? 32 : (rIdx === 1 ? 22 : 18);
    for (let c = 1; c <= 6; c++) {
      applyHeaderStyle(row.getCell(c));
    }
  });

  // Row 6: Column Numbers (1 to 6)
  const numRow = ws.addRow(['1', '2', '3', '4', '5', '6']);
  applyNumberRowStyle(numRow);

  // Data Rows (Row 7+)
  const startRow = 7;
  summaryData.forEach((row, idx) => {
    const pok = Number(row.pokalistCount || 0);
    const pokRem = Number(row.pokalistRemovedCount || 0);
    const pokPend = Number(row.pokalistPendingCount || Math.max(0, pok - pokRem));

    const r = ws.addRow([
      idx + 1,
      getRowDisplayName(row),
      pok,
      pokRem,
      pokPend,
      row.remarks || '-'
    ]);
    r.height = 24;
    r.eachCell((c, colIdx) => {
      c.font = { name: 'Arial', size: 9 };
      c.border = thinBorder;
      if (colIdx === 1) {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colIdx === 2) {
        c.alignment = { horizontal: 'left', vertical: 'middle' };
        c.font = { name: 'Arial', size: 9, bold: true };
      } else if (colIdx >= 3 && colIdx <= 5) {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.numFmt = '#,##0';
      } else {
        c.alignment = { horizontal: 'left', vertical: 'middle' };
      }
    });
  });

  // Summary Total Row
  const endRow = startRow + summaryData.length - 1;
  const totRow = ws.addRow([
    '',
    'एकूण (Total)',
    summaryData.length > 0 ? { formula: `SUM(C${startRow}:C${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(D${startRow}:D${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(E${startRow}:E${endRow})` } : 0,
    ''
  ]);
  totRow.height = 28;
  totRow.eachCell((c, colIdx) => {
    c.font = { name: 'Arial', size: 9, bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    c.border = thinBorder;
    if (colIdx >= 3 && colIdx <= 5) {
      c.numFmt = '#,##0';
      c.alignment = { horizontal: 'center', vertical: 'middle' };
    } else {
      c.alignment = { horizontal: colIdx === 2 ? 'left' : 'center', vertical: 'middle' };
    }
  });

  ws.columns = [
    { width: 7 },
    { width: 28 },
    { width: 26 },
    { width: 24 },
    { width: 24 },
    { width: 22 }
  ];

  // --- SHEET 2: Detailed Data List ---
  const wsDetails = wb.addWorksheet('सविस्तर ७-१२ यादी (Data)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });
  buildDetailedParcelsSheet(wsDetails, 2, 'प्रपत्र क्र. २ - पोकळीस्त नोंदींचा तपासणी अहवाल', parcelRecords, scopeName);

  await wb.xlsx.write(res);
}

/**
 * Generate Prapatra 3 Excel Booklet (Govt Depts & Corporations Allotments)
 * Strictly conforms to Official Booklet 3 PDF format
 */
export async function generatePrapatra3Excel(summaryData = [], parcelRecords = [], scopeName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर';

  // --- SHEET 1: Official Booklet Format ---
  const ws = wb.addWorksheet('प्रपत्र क्र. ३ (Booklet 3)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });

  // Row 1: Title
  ws.mergeCells('A1:F1');
  const t = ws.getCell('A1');
  t.value = 'प्रपत्र क्र. 3 - शासकीय विभाग/महामंडळे/स्थानिक स्वराज्य संस्था यांना प्रदान करण्यात आलेल्या शासकीय जमिनींचे अनधिकृत हस्तांतरण,शर्तभंग झाल्यास सदर जमिनींचे मालकी हक्क पुर्ववत करणे अथवा शासन जमा करण्याबाबत.';
  t.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ws.getRow(1).height = 42;

  // Row 2: Subtitle
  ws.mergeCells('A2:F2');
  const sub = ws.getCell('A2');
  sub.value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  sub.font = { name: 'Arial', size: 9, italic: true, bold: true, color: { argb: 'FF334155' } };
  sub.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 20;

  // Row 3: Main Headers
  ws.mergeCells('A3:A4'); ws.getCell('A3').value = 'अ.क्र.';
  ws.mergeCells('B3:B4'); ws.getCell('B3').value = 'जिल्हा';
  ws.getCell('C3').value = 'शासकीय विभाग/महामंडळे/स्थानिक स्वराज्य संस्था यांना प्रदान शासकीय जमिनींच्या';
  ws.getCell('D3').value = 'यापैकी अनधिकृत हस्तांतरण अथवा शर्तभंग झालेल्या जमिनींच्या';
  ws.getCell('E3').value = 'मालकी पुर्ववत किंवा शासन जमा केलेल्या जमिनींच्या';
  ws.mergeCells('F3:F4'); ws.getCell('F3').value = 'शेरा';

  // Row 4: Sub-headers
  ws.getCell('C4').value = '7/12 ची संख्या';
  ws.getCell('D4').value = '7/12 ची संख्या';
  ws.getCell('E4').value = '7/12 ची संख्या';

  // Row 5: Column Notations
  ws.getCell('C5').value = '2(अ)';
  ws.getCell('D5').value = '3(अ)';
  ws.getCell('E5').value = '4(अ)';

  [ws.getRow(3), ws.getRow(4), ws.getRow(5)].forEach((row, rIdx) => {
    row.height = rIdx === 0 ? 34 : (rIdx === 1 ? 22 : 18);
    for (let c = 1; c <= 6; c++) {
      applyHeaderStyle(row.getCell(c));
    }
  });

  // Row 6: Column Numbers (1 to 6)
  const numRow = ws.addRow(['1', '2', '3', '4', '5', '6']);
  applyNumberRowStyle(numRow);

  // Data Rows (Row 7+)
  const startRow = 7;
  summaryData.forEach((row, idx) => {
    const r = ws.addRow([
      idx + 1,
      getRowDisplayName(row),
      Number(row.govtDeptsAllottedCount || 0),
      Number(row.govtDeptsShartbhang || 0),
      Number(row.govtDeptsRestoredGovt || 0),
      row.remarks || '-'
    ]);
    r.height = 24;
    r.eachCell((c, colIdx) => {
      c.font = { name: 'Arial', size: 9 };
      c.border = thinBorder;
      if (colIdx === 1) {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colIdx === 2) {
        c.alignment = { horizontal: 'left', vertical: 'middle' };
        c.font = { name: 'Arial', size: 9, bold: true };
      } else if (colIdx >= 3 && colIdx <= 5) {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.numFmt = '#,##0';
      } else {
        c.alignment = { horizontal: 'left', vertical: 'middle' };
      }
    });
  });

  // Summary Total Row
  const endRow = startRow + summaryData.length - 1;
  const totRow = ws.addRow([
    '',
    'एकूण (Total)',
    summaryData.length > 0 ? { formula: `SUM(C${startRow}:C${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(D${startRow}:D${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(E${startRow}:E${endRow})` } : 0,
    ''
  ]);
  totRow.height = 28;
  totRow.eachCell((c, colIdx) => {
    c.font = { name: 'Arial', size: 9, bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    c.border = thinBorder;
    if (colIdx >= 3 && colIdx <= 5) {
      c.numFmt = '#,##0';
      c.alignment = { horizontal: 'center', vertical: 'middle' };
    } else {
      c.alignment = { horizontal: colIdx === 2 ? 'left' : 'center', vertical: 'middle' };
    }
  });

  ws.columns = [
    { width: 7 },
    { width: 28 },
    { width: 28 },
    { width: 26 },
    { width: 26 },
    { width: 22 }
  ];

  // --- SHEET 2: Detailed Data List ---
  const wsDetails = wb.addWorksheet('सविस्तर ७-१२ यादी (Data)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });
  buildDetailedParcelsSheet(wsDetails, 3, 'प्रपत्र क्र. ३ - शासकीय विभाग व महामंडळे वाटप तपासणी अहवाल', parcelRecords, scopeName);

  await wb.xlsx.write(res);
}

/**
 * Generate Prapatra 4 Excel Booklet (Private Trusts/Societies Allotments)
 * Strictly conforms to Official Booklet 4 PDF format
 */
export async function generatePrapatra4Excel(summaryData = [], parcelRecords = [], scopeName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर';

  // --- SHEET 1: Official Booklet Format ---
  const ws = wb.addWorksheet('प्रपत्र क्र. ४ (Booklet 4)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });

  // Row 1: Title
  ws.mergeCells('A1:F1');
  const t = ws.getCell('A1');
  t.value = 'प्रपत्र क्र. 4 - शासनाकडून विविध शैक्षणिक/सामाजिक संस्था, खाजगी संस्था, ट्रस्ट, गृहनिर्माण संस्था व अशा इतर सर्व प्रकारच्या संस्थांना व खाजगी व्यक्ती यांना प्रदान करण्यात आलेल्या शासकीय जमिनींचे अनधिकृत हस्तांतरण,शर्तभंग झाल्यास सदर जमिनींचे मालकी हक्क पुर्ववत करणे अथवा शासन जमा करण्याबाबत.';
  t.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ws.getRow(1).height = 46;

  // Row 2: Subtitle
  ws.mergeCells('A2:F2');
  const sub = ws.getCell('A2');
  sub.value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  sub.font = { name: 'Arial', size: 9, italic: true, bold: true, color: { argb: 'FF334155' } };
  sub.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 20;

  // Row 3: Main Headers
  ws.mergeCells('A3:A4'); ws.getCell('A3').value = 'अ.क्र.';
  ws.mergeCells('B3:B4'); ws.getCell('B3').value = 'जिल्हा';
  ws.getCell('C3').value = 'शैक्षणिक / सामाजिक संस्था, खाजगी संस्था, ट्रस्ट, गृहनिर्माण संस्था व अशा इतर सर्व प्रकारच्या संस्थांना व खाजगी व्यक्ती यांना प्रदान शासकीय जमिनींच्या';
  ws.getCell('D3').value = 'यापैकी अनधिकृत हस्तांतरण अथवा शर्तभंग झालेल्या जमिनींच्या';
  ws.getCell('E3').value = 'मालकी पुर्ववत किंवा शासन जमा केलेल्या जमिनींच्या';
  ws.mergeCells('F3:F4'); ws.getCell('F3').value = 'शेरा';

  // Row 4: Sub-headers
  ws.getCell('C4').value = '7/12 ची संख्या';
  ws.getCell('D4').value = '7/12 ची संख्या';
  ws.getCell('E4').value = '7/12 ची संख्या';

  // Row 5: Column Notations
  ws.getCell('C5').value = '2(अ)';
  ws.getCell('D5').value = '3(अ)';
  ws.getCell('E5').value = '4(अ)';

  [ws.getRow(3), ws.getRow(4), ws.getRow(5)].forEach((row, rIdx) => {
    row.height = rIdx === 0 ? 36 : (rIdx === 1 ? 22 : 18);
    for (let c = 1; c <= 6; c++) {
      applyHeaderStyle(row.getCell(c));
    }
  });

  // Row 6: Column Numbers (1 to 6)
  const numRow = ws.addRow(['1', '2', '3', '4', '5', '6']);
  applyNumberRowStyle(numRow);

  // Data Rows (Row 7+)
  const startRow = 7;
  summaryData.forEach((row, idx) => {
    const r = ws.addRow([
      idx + 1,
      getRowDisplayName(row),
      Number(row.privateAllottedCount || 0),
      Number(row.privateShartbhang || 0),
      Number(row.privateRestoredGovt || 0),
      row.remarks || '-'
    ]);
    r.height = 24;
    r.eachCell((c, colIdx) => {
      c.font = { name: 'Arial', size: 9 };
      c.border = thinBorder;
      if (colIdx === 1) {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colIdx === 2) {
        c.alignment = { horizontal: 'left', vertical: 'middle' };
        c.font = { name: 'Arial', size: 9, bold: true };
      } else if (colIdx >= 3 && colIdx <= 5) {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.numFmt = '#,##0';
      } else {
        c.alignment = { horizontal: 'left', vertical: 'middle' };
      }
    });
  });

  // Summary Total Row
  const endRow = startRow + summaryData.length - 1;
  const totRow = ws.addRow([
    '',
    'एकूण (Total)',
    summaryData.length > 0 ? { formula: `SUM(C${startRow}:C${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(D${startRow}:D${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(E${startRow}:E${endRow})` } : 0,
    ''
  ]);
  totRow.height = 28;
  totRow.eachCell((c, colIdx) => {
    c.font = { name: 'Arial', size: 9, bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    c.border = thinBorder;
    if (colIdx >= 3 && colIdx <= 5) {
      c.numFmt = '#,##0';
      c.alignment = { horizontal: 'center', vertical: 'middle' };
    } else {
      c.alignment = { horizontal: colIdx === 2 ? 'left' : 'center', vertical: 'middle' };
    }
  });

  ws.columns = [
    { width: 7 },
    { width: 28 },
    { width: 30 },
    { width: 26 },
    { width: 26 },
    { width: 22 }
  ];

  // --- SHEET 2: Detailed Data List ---
  const wsDetails = wb.addWorksheet('सविस्तर ७-१२ यादी (Data)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });
  buildDetailedParcelsSheet(wsDetails, 4, 'प्रपत्र क्र. ४ - खाजगी संस्था व व्यक्ती शर्तभंग तपासणी अहवाल', parcelRecords, scopeName);

  await wb.xlsx.write(res);
}

/**
 * Generate Prapatra 5 Excel Booklet (Comprehensive Govt Lands Status)
 * Strictly conforms to Official Booklet 5 PDF format
 */
export async function generatePrapatra5Excel(summaryData = [], parcelRecords = [], scopeName = 'सर्व तालुके', res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर';

  // --- SHEET 1: Official Booklet Format ---
  const ws = wb.addWorksheet('प्रपत्र क्र. ५ (Booklet 5)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });

  // Row 1: Title
  ws.mergeCells('A1:H1');
  const t = ws.getCell('A1');
  t.value = 'प्रपत्र क्र. 5 - शासकीय जमिनींची एकुण संख्या, वाटप करण्यात आलेल्या जमिनींची संख्या, शर्तभंग,अतिक्रमण झालेल्या जमिनींची संख्या, तसेच मोजणी झालेल्या जमिनींची संख्या याबाबत माहिती';
  t.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ws.getRow(1).height = 42;

  // Row 2: Subtitle
  ws.mergeCells('A2:H2');
  const sub = ws.getCell('A2');
  sub.value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  sub.font = { name: 'Arial', size: 9, italic: true, bold: true, color: { argb: 'FF334155' } };
  sub.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 20;

  // Row 3: Main Headers
  ws.mergeCells('A3:A5'); ws.getCell('A3').value = 'अ.क्र.';
  ws.mergeCells('B3:B5'); ws.getCell('B3').value = 'जिल्हा';
  ws.getCell('C3').value = 'शासकीय जमिनींच्या एकूण';
  ws.getCell('D3').value = 'वाटप करण्यात आलेल्या शासकीय जमिनींच्या';
  ws.mergeCells('E3:G3'); ws.getCell('E3').value = 'शासकीय जमिनींची सद्यस्थिती';
  ws.mergeCells('H3:H5'); ws.getCell('H3').value = 'शेरा';

  // Row 4: Sub-headers
  ws.getCell('C4').value = '7/12 ची संख्या';
  ws.getCell('D4').value = '7/12 ची संख्या';
  ws.getCell('E4').value = 'शर्तभंग झालेल्या जमिनींच्या';
  ws.getCell('F4').value = 'अतिक्रमण असलेल्या जमिनींच्या';
  ws.getCell('G4').value = 'मोजणी झालेल्या जमिनींच्या';

  // Row 5: Column Notations
  ws.getCell('C5').value = '2(अ)';
  ws.getCell('D5').value = '3(अ)';
  ws.getCell('E5').value = '7/12 ची संख्या\n4(अ)';
  ws.getCell('F5').value = '7/12 ची संख्या\n5(अ)';
  ws.getCell('G5').value = '7/12 ची संख्या\n6(अ)';

  [ws.getRow(3), ws.getRow(4), ws.getRow(5)].forEach((row, rIdx) => {
    row.height = rIdx === 0 ? 30 : (rIdx === 1 ? 24 : 24);
    for (let c = 1; c <= 8; c++) {
      applyHeaderStyle(row.getCell(c));
    }
  });

  // Row 6: Column Numbers (1 to 8)
  const numRow = ws.addRow(['1', '2', '3', '4', '5', '6', '7', '8']);
  applyNumberRowStyle(numRow);

  // Data Rows (Row 7+)
  const startRow = 7;
  summaryData.forEach((row, idx) => {
    const r = ws.addRow([
      idx + 1,
      getRowDisplayName(row),
      Number(row.totalGovtLandCount || 0),
      Number(row.govtAllottedCount || 0),
      Number(row.govtShartbhangCount || 0),
      Number(row.govtEncroachedCount || 0),
      Number(row.govtMojaniDoneCount || 0),
      row.remarks || '-'
    ]);
    r.height = 24;
    r.eachCell((c, colIdx) => {
      c.font = { name: 'Arial', size: 9 };
      c.border = thinBorder;
      if (colIdx === 1) {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colIdx === 2) {
        c.alignment = { horizontal: 'left', vertical: 'middle' };
        c.font = { name: 'Arial', size: 9, bold: true };
      } else if (colIdx >= 3 && colIdx <= 7) {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.numFmt = '#,##0';
      } else {
        c.alignment = { horizontal: 'left', vertical: 'middle' };
      }
    });
  });

  // Summary Total Row
  const endRow = startRow + summaryData.length - 1;
  const totRow = ws.addRow([
    '',
    'एकूण (Total)',
    summaryData.length > 0 ? { formula: `SUM(C${startRow}:C${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(D${startRow}:D${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(E${startRow}:E${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(F${startRow}:F${endRow})` } : 0,
    summaryData.length > 0 ? { formula: `SUM(G${startRow}:G${endRow})` } : 0,
    ''
  ]);
  totRow.height = 28;
  totRow.eachCell((c, colIdx) => {
    c.font = { name: 'Arial', size: 9, bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    c.border = thinBorder;
    if (colIdx >= 3 && colIdx <= 7) {
      c.numFmt = '#,##0';
      c.alignment = { horizontal: 'center', vertical: 'middle' };
    } else {
      c.alignment = { horizontal: colIdx === 2 ? 'left' : 'center', vertical: 'middle' };
    }
  });

  ws.columns = [
    { width: 7 },
    { width: 28 },
    { width: 22 },
    { width: 24 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 22 }
  ];

  // --- SHEET 2: Detailed Data List ---
  const wsDetails = wb.addWorksheet('सविस्तर ७-१२ यादी (Data)', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });
  buildDetailedParcelsSheet(wsDetails, 5, 'प्रपत्र क्र. ५ - शासकीय व गायरान जमिनींची सर्वंकष तपासणी', parcelRecords, scopeName);

  await wb.xlsx.write(res);
}

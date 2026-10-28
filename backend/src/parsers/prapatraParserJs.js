import ExcelJS from 'exceljs';
import path from 'path';

/**
 * Pure Node.js / JavaScript Prapatra & 46 Checkpoints Parser
 * Uses ExcelJS - 100% serverless compatible (works on Vercel without Python)
 */

export function cleanArea(val) {
  if (val === null || val === undefined) return 0.0;
  const s = String(val).trim();
  if (!s || ['-', '–', '—', '_', 'निरंक', 'नाही', 'None', 'nil', 'NIL', 'null'].includes(s)) {
    return 0.0;
  }
  const sClean = s.replace(/\s+/g, '').replace(/\.{2,}/g, '.');
  const match = sClean.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const num = parseFloat(match[1]);
    return isNaN(num) ? 0.0 : Math.round(num * 10000) / 10000;
  }
  return 0.0;
}

export function cleanSurveyNo(val) {
  if (val === null || val === undefined) return null;
  let s = String(val).trim();
  if (!s || ['-', '–', '—', '_', 'निरंक', 'नाही', 'None', 'nil', 'NIL', 'null'].includes(s)) {
    return null;
  }
  if (s.endsWith('.0')) {
    s = s.slice(0, -2);
  }
  // Remove trailing period if present e.g. "1/2." -> "1/2"
  if (s.endsWith('.') && s.length > 1) {
    s = s.slice(0, -1);
  }
  const invalidWords = [
    'सक्षम', 'बंदी', 'आदिवासी', 'हस्तांतरण', 'परवानगी', 'जमीन', 'नियम',
    'तहसिलदार', 'माहिती', 'गोषवारा', 'स्वाक्षरी', 'दिनांक', 'प्रमाणन', 'अ.क्र'
  ];
  if (invalidWords.some(w => s.includes(w))) {
    return null;
  }
  return s.slice(0, 30);
}

export function normalizeTenure(val, otherRights = '', bandobastTenure = '', owner = '') {
  const s = String(val || '').trim();
  const ownerStr = String(owner || '').trim();
  const rightsStr = String(otherRights || '').trim();
  const bTenure = String(bandobastTenure || '').trim();

  if (['महाराष्ट्र शासन', 'सरकार', 'शासन', 'कालवा', 'तलाव', 'गायरान', 'सार्वजनिक', 'राखीव'].some(k => ownerStr.includes(k))) {
    return 'SARKAR_SHASAN';
  }
  if (s.includes('वन') || ownerStr.includes('वन')) {
    return 'FOREST_JANGAL';
  }
  if (s.includes('देवस्थान') || s.includes('इनाम')) {
    return 'DEVASTHAN_INAM';
  }
  if (s.includes('2') || s.includes('२')) {
    return 'BHOGVATDAR_CLASS_2';
  }
  if (['आदिवासी', 'आदीवासी', '36', '३६', 'शर्तभंग', 'सक्षम प्राधिकारी'].some(k => rightsStr.includes(k))) {
    return 'BHOGVATDAR_CLASS_2';
  }
  if (s.includes('1') || s.includes('१') || bTenure.includes('भूमिधारी') || bTenure.includes('भूमिस्वामी')) {
    return 'BHOGVATDAR_CLASS_1';
  }
  return 'BHOGVATDAR_CLASS_1';
}

export function cleanVillageName(fname, sampleVillage) {
  if (sampleVillage && String(sampleVillage).trim().length > 2) {
    let cleanV = String(sampleVillage).trim().replace(/^[0-9.\-_ \t]+/, '');
    if (cleanV.length > 2 && !['-', '_', 'None', 'गावाचे नाव', '1', '2', 'नाही'].includes(cleanV)) {
      return cleanV.slice(0, 80);
    }
  }
  let v = fname || 'गाव';
  const prefixes = [
    '45 मुद्द्याची माहिती', '1 ते 45 तपासणी  मुद्दे  मौजा', '1 ते 45 तपासणी मुददे',
    '1 ते 45 मुददे ची तपासणी -', '1 ते 45 मुद्दे', '1 to 45.', '1 to 46',
    '1 ते 46', '1  ते 46', '1 ते 54', '1 TO 45', '1 TO 46', '1ते45'
  ];
  for (const p of prefixes) {
    v = v.replace(p, '');
  }
  v = v.replace(/^\d+[\s_.-]*/, '');
  v = v.replace(/[\s_.-]*ok.*$/i, '');
  v = v.replace(/\.xlsx$/i, '');
  v = v.replace(/Microsoft Excel.*$/i, '');
  v = v.trim();
  return v.length > 1 ? v.slice(0, 40) : (fname ? fname.replace('.xlsx', '').slice(0, 40) : 'गाव');
}

const FOOTER_STOP_KEYWORDS = [
  'माहिती तयार करणाऱ्या',
  'माहिती तपासणी करणाऱ्या',
  'स्वाक्षरी तलाठी',
  'तलाठी स्वाक्षरी',
  'स्वाक्षरी मंडळ',
  'मंडळ अधिकारी स्वाक्षरी',
  'स्वाक्षरी तहसीलदार',
  'तहसीलदार स्वाक्षरी',
  '१ ते ४५ मुद्द्यांचा गोषवारा',
  '1 ते 45 मुद्द्यांचा गोषवारा',
  'प्रमाणित करण्यात येते'
];

const SUB_TYPE_NAMES = [
  'कुळ वहिवाट व शेतजमीन (विदर्भ/हैदराबाद) कायदा अन्वये कुळ घोषित केलेली जमीन',
  'इनाम व वतन जमिनी (देवस्थान जमिनी वगळुन) प्रकारातील जमिनी',
  'म.ज.म.अधि.1966 अंतर्गत विवीध योजनेअंतर्गत प्रदान/अतिक्रमण नियमानुकूल केलेल्या जमिनी (भूमिहीन, शेत मजूर, स्वातंत्र्य सैनिक इ.)',
  'म.ज.म.अधि.1966 अंतर्गत विवीध योजनेअंतर्गत प्रदान/अतिक्रमण नियमानुकूल केलेल्या जमिनी (गृहनिर्माण संस्था,औद्योगिक आस्थापना,शैक्षणिक संस्था,विशेष वसाहत,प्रकल्प इ.) प्रकारची जमिन',
  'महाराष्ट्र शेतजमिन कमाल धारणा अधिनियम 1961 अंतर्गत वाटप केलेल्या जमिनी',
  'महानगरपालिका, नगर पालिका व विविध प्राधिकरण यांच्या विकास आराखडयात समाविष्ट असलेल्या जमिनी अथवा ग्रामपंचायतकडे गुरचरण अथवा इतर प्रयोजनासाठी वर्ग केलेल्या जमिनी',
  'जमीन देवस्थान इनाम जमिनी',
  'आदिवासी खातेदारांचे मालकीच्या जमिनी',
  'महाराष्ट्र पुर्नवसन अधिनियम 1999 च्या कलम 16 अन्वये प्रदान केलेल्या जमिनी',
  'भाडेपट्टयाने दिलेली शासकीय जमिन',
  'भुदान व ग्रामदान अंतर्गत प्रदान केलेल्या जमिनी',
  'महाराष्ट्र खाजगी वने (संपादन) अधिनियम 1975 तसेच महाराष्ट्र शेतजमिन (जमिन धारणेची कमाल मर्यादा) अधिनियम 1961 अन्वये चौकशीसाठी प्रलंबित असलेल्या जमीन',
  'भुमीधारी हक्कान्वये प्राप्त झालेल्या जमिनी',
  'महाराष्ट्र शेतजमिन (जमिन धारणेची कमाल मर्यादा) अधिनियम 1961 अंतर्गत कमाल मर्यादेपेक्षा अधिक धारण करण्यास सुट दिलेल्या जमिनी',
  'वक्फ बोर्डाचे मालकीची जमीन',
  'भुसंपादन कायदयाअंतर्गत अधिग्रहित/राखीव जमीन'
];

/**
 * Main Pure-JS Parser
 * @param {string|Buffer} input - File path or Buffer
 * @param {string} talukaOverride - e.g. "Korpana"
 * @param {string} originalFname - e.g. "हिरापुर साजा हिरापुर .xlsx"
 */
export async function parsePrapatraBuffer(input, talukaOverride = '', originalFname = '') {
  const wb = new ExcelJS.Workbook();
  if (Buffer.isBuffer(input)) {
    await wb.xlsx.load(input);
  } else {
    await wb.xlsx.readFile(input);
  }

  const allSheetNames = wb.worksheets.map(w => w.name);
  if (allSheetNames.length === 0) {
    throw new Error('एक्सेल फाईलमध्ये कोणतीही शीट आढळली नाही.');
  }

  let targetSheet = wb.worksheets[0];
  for (const s of wb.worksheets) {
    const sTitle = s.name.trim();
    if (['7/12', 'तपासणी', 'मुद्दे', '1 to 45', '1 ते 45', 'Booklet', 'Master'].some(k => sTitle.includes(k))) {
      targetSheet = s;
      break;
    }
  }

  // Convert worksheet rows to array of cell value arrays (1-based index in ExcelJS)
  const rawRows = [];
  targetSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    // row.values is 1-based (row.values[1] is col A)
    const rowVals = [];
    for (let c = 1; c <= 60; c++) {
      let cellVal = row.getCell(c).value;
      if (cellVal && typeof cellVal === 'object') {
        if (cellVal.richText) {
          cellVal = cellVal.richText.map(t => t.text).join('');
        } else if (cellVal.result !== undefined) {
          cellVal = cellVal.result;
        } else if (cellVal.text !== undefined) {
          cellVal = cellVal.text;
        }
      }
      rowVals.push(cellVal !== null && cellVal !== undefined ? cellVal : null);
    }
    rawRows.push(rowVals);
  });

  if (rawRows.length === 0) {
    return {
      success: true,
      villageName: cleanVillageName(originalFname, null),
      taluka: talukaOverride,
      sheetCount: allSheetNames.length,
      sheetNames: allSheetNames,
      detectedLayout: 'single_area',
      areaColumnsCount: 1,
      stats: getEmptyStats(),
      parcels: [],
      uniqueGatNumbers: []
    };
  }

  // Locate Header Row (typically rows 1 to 8)
  let headerRowIdx = 2; // Default to row 3 (0-indexed 2)
  for (let rIdx = 0; rIdx < Math.min(8, rawRows.length); rIdx++) {
    const lineStr = rawRows[rIdx].slice(0, 15).map(x => String(x || '').trim()).join(' ');
    if (['सर्व्हे', 'स.नं', 'गट क्रमांक'].some(k => lineStr.includes(k)) && ['क्षेत्र', 'गाव'].some(k => lineStr.includes(k))) {
      headerRowIdx = rIdx;
      break;
    }
  }

  const headerVals = rawRows[headerRowIdx].map(x => String(x || '').trim());

  // 1. Landmark Column Anchoring
  let colVillage = headerVals.findIndex(c => c.includes('गावाचे नाव') || c === 'गाव');
  if (colVillage === -1) colVillage = 1;

  let colSurvey = headerVals.findIndex(c => ['सर्व्हे क्रमांक', 'स.नं', 'गट क्रमांक', 'गट क्र'].some(k => c.includes(k)));
  if (colSurvey === -1) colSurvey = 2;

  let colTenure = headerVals.findIndex(c => ['भोगवटदार वर्ग', 'भूधारणा', 'कब्जेदार सदरी'].some(k => c.includes(k)));
  let colOwner = headerVals.findIndex(c => ['भोगवटदाराचे नाव', 'खातेदाराचे नाव'].some(k => c.includes(k)));
  let colRights = headerVals.findIndex(c => c.includes('इतर अधिकार'));

  // 2. Determine point 1 start index (Checkpoint 1 begins after Other Rights)
  let colPointStart = -1;
  for (let cIdx = 0; cIdx < headerVals.length; cIdx++) {
    if (cIdx > colSurvey && headerVals[cIdx] === '1') {
      colPointStart = cIdx;
      break;
    }
  }

  if (colPointStart === -1 && headerRowIdx + 1 < rawRows.length) {
    const subVals = rawRows[headerRowIdx + 1].map(x => String(x || '').trim());
    for (let cIdx = 0; cIdx < subVals.length; cIdx++) {
      if (subVals[cIdx].includes('बंदोबस्त')) {
        colPointStart = cIdx;
        break;
      }
    }
  }

  if (colTenure === -1) colTenure = colSurvey + 2;
  if (colOwner === -1) colOwner = colTenure + 1;
  if (colRights === -1) colRights = colOwner + 1;
  if (colPointStart === -1) colPointStart = colRights + 1;

  // 3. Dynamic Area Columns Identification
  const areaColIndices = [];
  for (let c = colSurvey + 1; c < colTenure; c++) {
    areaColIndices.push(c);
  }

  let colAgri = -1;
  let colNa = -1;
  let colPot = -1;
  let colSingleArea = -1;

  for (let subR = headerRowIdx + 1; subR < Math.min(headerRowIdx + 4, rawRows.length); subR++) {
    const subRowVals = rawRows[subR].map(x => String(x || '').trim());
    for (const cIdx of areaColIndices) {
      if (cIdx < subRowVals.length) {
        const cellText = subRowVals[cIdx];
        if (cellText.includes('अकृषक')) {
          colNa = cIdx;
        } else if (cellText.includes('कृषक')) {
          colAgri = cIdx;
        } else if (cellText.includes('पोटखराबा')) {
          colPot = cIdx;
        }
      }
    }
  }

  if (areaColIndices.length === 2 && colAgri === -1 && colNa === -1) {
    colAgri = areaColIndices[0];
    colNa = areaColIndices[1];
  } else if (areaColIndices.length === 1) {
    colSingleArea = areaColIndices[0];
  } else if (areaColIndices.length >= 3 && colAgri === -1) {
    colAgri = areaColIndices[0];
    colNa = areaColIndices[1];
    colPot = areaColIndices[2];
  }

  const hasDualArea = (colAgri !== -1 && colNa !== -1);

  // 4. Data Rows Start Index (Look for 1 in first column)
  let dataStartIdx = headerRowIdx + 2;
  for (let idx = headerRowIdx + 1; idx < Math.min(headerRowIdx + 10, rawRows.length); idx++) {
    const firstC = rawRows[idx] ? String(rawRows[idx][0] || '').trim() : '';
    if (/^[0-9]+(\.0)?$/.test(firstC) || ['१', '1'].includes(firstC)) {
      dataStartIdx = idx;
      break;
    }
  }

  // 5. Extract Sample Village
  let sampleVillage = null;
  for (let r = dataStartIdx; r < Math.min(dataStartIdx + 15, rawRows.length); r++) {
    const row = rawRows[r];
    if (row && row.length > colVillage) {
      const vCell = String(row[colVillage] || '').trim();
      if (vCell.length > 2 && !['-', '_', 'None', 'गावाचे नाव', '1', '2', 'नाही'].includes(vCell)) {
        sampleVillage = vCell;
        break;
      }
    }
  }

  const fname = originalFname || 'गाव';
  let vName = cleanVillageName(fname, sampleVillage);
  if (!vName || /^[0-9a-f]{16,}$/i.test(vName)) {
    const fallback = originalFname ? originalFname.replace(/\.[^/.]+$/, '').trim() : 'गाव';
    vName = cleanVillageName(fallback, null);
  }

  const vStats = getEmptyStats();
  const parcels = [];
  const pOffset = colPointStart;

  for (let rIdx = dataStartIdx; rIdx < rawRows.length; rIdx++) {
    const r = rawRows[rIdx];
    if (!r || !r.some(x => x !== null && x !== undefined && String(x).trim() !== '')) {
      continue;
    }

    const srVal = String(r[0] || '').trim();
    const isNumericSr = /^[0-9]+(\.0)?$/.test(srVal);

    // Stop on non-numeric footer signature rows
    const leadCells = r.slice(0, 4).map(x => String(x || '').trim()).join(' ');
    if (!isNumericSr && FOOTER_STOP_KEYWORDS.some(kw => leadCells.includes(kw))) {
      break;
    }

    const surveyRaw = r[colSurvey] !== undefined ? r[colSurvey] : null;
    const ownerRaw = r[colOwner] !== undefined ? r[colOwner] : null;
    const tenureRaw = r[colTenure] !== undefined ? r[colTenure] : null;
    const rightsRaw = r[colRights] !== undefined ? r[colRights] : null;

    let agriClean = 0.0;
    let naClean = 0.0;
    let totalAreaClean = 0.0;

    if (hasDualArea) {
      const agriRaw = r[colAgri] !== undefined ? r[colAgri] : null;
      const naRaw = r[colNa] !== undefined ? r[colNa] : null;
      agriClean = cleanArea(agriRaw);
      naClean = cleanArea(naRaw);
      totalAreaClean = Math.round((agriClean + (naClean / 10000.0)) * 10000) / 10000;
    } else {
      const cAreaIdx = colSingleArea !== -1 ? colSingleArea : (colSurvey + 1);
      const areaRaw = r[cAreaIdx] !== undefined ? r[cAreaIdx] : null;
      totalAreaClean = cleanArea(areaRaw);
      agriClean = totalAreaClean;
    }

    const surveyClean = cleanSurveyNo(surveyRaw);
    if (!surveyClean && !ownerRaw && totalAreaClean === 0.0) {
      continue;
    }

    const surveyFinal = surveyClean || `S-${parcels.length + 1}`;
    const ownerClean = String(ownerRaw || 'अज्ञात खातेदार').trim().slice(0, 240);
    const rightsClean = String(rightsRaw || 'नाही').trim();

    // Helper for audit points
    const getRawPt = (ptNum) => {
      const idx = pOffset + (ptNum - 1);
      if (r.length > idx && r[idx] !== null && r[idx] !== undefined) {
        const val = String(r[idx]).trim();
        return val !== 'None' && val !== 'null' ? val : '';
      }
      return '';
    };

    const auditPoints = {};
    for (let pt = 1; pt <= 46; pt++) {
      auditPoints[`point_${pt}`] = getRawPt(pt);
    }

    const bNo = auditPoints['point_1'] || null;
    const bOwner = auditPoints['point_2'] || '';
    const bTenure = auditPoints['point_3'] || '';

    const ekNo = auditPoints['point_4'] || null;
    const ekOwner = auditPoints['point_5'] || '';
    const ekTenure = auditPoints['point_6'] || '';

    const resNo = auditPoints['point_7'] || null;
    const resOwner = auditPoints['point_8'] || '';
    const resTenure = auditPoints['point_9'] || '';

    const col17Sarkar = auditPoints['point_10'] || '';
    const col18IllegalDel = auditPoints['point_18'] || '';
    const col19Pokalist = auditPoints['point_19'] || '';
    const col21PrivateAllot = auditPoints['point_22'] || '';
    const col22Encroach = auditPoints['point_15'] || '';
    const col23Mojani = auditPoints['point_16'] || '';
    const col35Class2To1 = auditPoints['point_35'] || '';
    const col36Shartbhang = auditPoints['point_36'] || '';
    const col37Tribal1 = auditPoints['point_37'] || '';
    const col38Tribal2 = auditPoints['point_38'] || '';

    const isGovt = ['शासकीय', 'सरकार', 'महाराष्ट्र शासन', 'गायरान', 'पडीत'].some(k => col17Sarkar.includes(k) || ownerClean.includes(k));
    const isIllegalDel = ['होय', 'आहे', 'तफावत', 'कमी'].some(k => col18IllegalDel.includes(k));
    const isPokalist = ['होय', 'आहे', 'नोंद', 'बु.ग.दे'].some(k => col19Pokalist.includes(k));
    const isEncroach = ['होय', 'आहे', 'अतिक्रमण'].some(k => col22Encroach.includes(k));
    const isMojani = ['होय', 'आहे', 'झाली'].some(k => col23Mojani.includes(k));
    const isShartbhang = ['होय', 'आहे', 'उल्लंघन', 'शर्तभंग'].some(k => col36Shartbhang.includes(k));
    const isTribal = ['होय', 'आहे'].some(k => col37Tribal1.includes(k) || col38Tribal2.includes(k)) || rightsClean.includes('आदिवासी');
    const isCorpAllot = false;
    const isPrivateAllot = ['होय', 'आहे'].some(k => col21PrivateAllot.includes(k));
    const isClass2To1 = ['होय', 'आहे', 'रूपांतर'].some(k => col35Class2To1.includes(k));

    const tenureEnum = normalizeTenure(tenureRaw, rightsClean, bTenure, ownerClean);

    // Update village statistics
    vStats.total712 += 1;
    if (bNo && bNo !== '-' && bNo !== 'नाही') vStats.inspected1950 += 1;
    if (isGovt) vStats.govt1950 += 1;
    if (isIllegalDel) vStats.illegalDel += 1;
    if (isPokalist) vStats.pokalist += 1;
    if (isPrivateAllot) vStats.privateAllot += 1;
    if (isPrivateAllot && isShartbhang) vStats.privateShartbhang += 1;
    if (isGovt) {
      vStats.totalGovt += 1;
      if (isShartbhang) vStats.govtShartbhang += 1;
      if (isEncroach) vStats.govtEncroach += 1;
      if (isMojani) vStats.govtMojani += 1;
    }

    if (tenureEnum === 'BHOGVATDAR_CLASS_1') {
      vStats.class1Count += 1;
      vStats.class1AreaHa = Math.round((vStats.class1AreaHa + totalAreaClean) * 10000) / 10000;
    } else if (tenureEnum === 'BHOGVATDAR_CLASS_2') {
      vStats.class2Count += 1;
      vStats.class2AreaHa = Math.round((vStats.class2AreaHa + totalAreaClean) * 10000) / 10000;
    } else if (tenureEnum === 'SARKAR_SHASAN') {
      vStats.govtAreaHa = Math.round((vStats.govtAreaHa + totalAreaClean) * 10000) / 10000;
    }

    if (isShartbhang) {
      vStats.shartbhangAreaHa = Math.round((vStats.shartbhangAreaHa + totalAreaClean) * 10000) / 10000;
    }
    if (isIllegalDel) {
      vStats.illegalDelAreaHa = Math.round((vStats.illegalDelAreaHa + totalAreaClean) * 10000) / 10000;
    }

    const talukaCode = (talukaOverride || 'CHA').slice(0, 3).toUpperCase();
    const upi = `MH-CHA-${talukaCode}-UPL-${String(parcels.length + 1).padStart(4, '0')}-01`;

    parcels.push({
      upi,
      gatNumber: surveyFinal,
      oldSurveyNo: bNo || null,
      agriAreaHa: agriClean,
      naAreaSqM: naClean,
      totalAreaHa: totalAreaClean,
      tenureClass: tenureEnum,
      ownerName: ownerClean,
      otherRights: rightsClean,
      subTypeCategory: null,
      auditPoints,
      backward: {
        settlement1950: { no: bNo, owner: bOwner, tenure: bTenure },
        ekatrikaran1972: { no: ekNo, owner: ekOwner, tenure: ekTenure },
        resurvey1995: { no: resNo, owner: resOwner, tenure: resTenure }
      },
      flags: {
        isGovt,
        isIllegalDeletion: isIllegalDel,
        isPokalist,
        isEncroached: isEncroach,
        isMojaniDone: isMojani,
        isShartbhang,
        isTribal,
        isCorpAllot,
        isPrivateAllot,
        isClass2ToClass1: isClass2To1
      }
    });
  }

  const uniqueGats = Array.from(new Set(parcels.map(p => p.gatNumber).filter(Boolean)));

  return {
    success: true,
    villageName: vName,
    taluka: talukaOverride,
    sheetCount: allSheetNames.length,
    sheetNames: allSheetNames,
    detectedLayout: hasDualArea ? 'dual_area' : (areaColIndices.length > 2 ? 'multi_area' : 'single_area'),
    areaColumnsCount: areaColIndices.length,
    stats: vStats,
    parcels,
    uniqueGatNumbers: uniqueGats
  };
}

function getEmptyStats() {
  return {
    total712: 0,
    inspected1950: 0,
    govt1950: 0,
    illegalDel: 0,
    pokalist: 0,
    corpAllot: 0,
    corpShartbhang: 0,
    privateAllot: 0,
    privateShartbhang: 0,
    totalGovt: 0,
    govtAllotted: 0,
    govtShartbhang: 0,
    govtEncroach: 0,
    govtMojani: 0,
    class1Count: 0,
    class1AreaHa: 0.0,
    class2Count: 0,
    class2AreaHa: 0.0,
    govtAreaHa: 0.0,
    shartbhangAreaHa: 0.0,
    illegalDelAreaHa: 0.0
  };
}

export default {
  parsePrapatraBuffer,
  cleanArea,
  cleanSurveyNo,
  normalizeTenure,
  cleanVillageName
};

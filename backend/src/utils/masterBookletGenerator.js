import {
  BOOKLET_18_CATEGORIES,
  getBooklet18Category,
  getDetailedColumnsForBooklet,
  getGoshwaraConfigForBooklet
} from './booklet18Definitions.js';
import ExcelJS from 'exceljs';
import pdfmake from 'pdfmake';
import path from 'path';
import { fileURLToPath } from 'url';
import { cleanVillageName } from './prapatraGenerator.js';

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

const formatTalukaMr = (name) => {
  if (!name) return '';
  const clean = String(name).trim();
  return TALUKA_EN_TO_MR[clean] || clean;
};

// 17 Official Statutory Categories
export const BOOKLET_CATEGORIES = BOOKLET_18_CATEGORIES;

/**
 * 46-Point Checklist Question Labels
 */
export const CHECKLIST_46_POINTS = [
  { num: 1, text: 'i) बंदोबस्त क्र' },
  { num: 2, text: 'ii) बंदोबस्त नंबर प्रमाणे भोगवटदाराचे नाव' },
  { num: 3, text: 'iii) बंदोबस्त नंबर प्रमाणे भूधारणा' },
  { num: 4, text: 'i) एकत्रिकरण नंबर' },
  { num: 5, text: 'ii) एकत्रिकरण नंबर प्रमाणे भोगवटदाराचे नाव' },
  { num: 6, text: 'iii) एकत्रिकरण नंबरप्रमाणे भूधारणा' },
  { num: 7, text: 'i) पुर्नमोजणी नंबर (७/१२)' },
  { num: 8, text: 'ii) ७/१२ प्रमाणे भोगवटदाराचे नाव' },
  { num: 9, text: 'iii) ७/१२ प्रमाणे भूधारणा' },
  { num: 10, text: 'सद्यस्थितीतील ७/१२ प्रमाणे भोगवटदाराचे नाव' },
  { num: 11, text: 'अधिकार अभिलेखानुसार जमिनीचा दर्जा/प्रकार (गायरान/पहाड खडक/परमपोक)' },
  { num: 12, text: 'मूळ ७/१२ शी तुलना करता सध्याच्या ७/१२ मधील क्षेत्र/भूधारणा/वापरात तफावत आहे का?' },
  { num: 13, text: 'वन / झुडपी जंगल जमीन आहे का?' },
  { num: 14, text: 'सदर जमीन वाटप झाली आहे का? (क्षेत्र)' },
  { num: 15, text: 'अतिक्रमण आहे का? (क्षेत्र)' },
  { num: 16, text: 'सदर गट/सर्व्हे नंबरचे KML तयार केले आहे काय?' },
  { num: 17, text: 'भूसंपादन झाले आहे का? (भूसंपादित क्षेत्र)' },
  { num: 18, text: 'अवैधरित्या सरकार किंवा शासन नोंद कमी केली आहे काय?' },
  { num: 19, text: 'शासकीय जमिनीवर पोकळीस्त नोंदी आहेत का? (फेरफारशिवाय नोंदी)' },
  { num: 20, text: 'मुंबई कुळ वहिवाट व शेतजमीन (विदर्भ) कायदा अन्वये कुळ घोषित केलेली जमीन आहे काय?' },
  { num: 21, text: 'सदर जमिन इनाम व वतन जमिनी (देवस्थान वगळून) प्रकारातील आहे काय?' },
  { num: 22, text: 'म.ज.म.अधि. १९६६ अंतर्गत भूमिहीन, शेतमजूर, स्वातंत्र्यसैनिक प्रदान जमीन आहे काय?' },
  { num: 23, text: 'म.ज.म.अधि. १९६६ अंतर्गत संस्था, औद्योगिक, शैक्षणिक, प्रकल्प प्रदान जमीन आहे काय?' },
  { num: 24, text: 'महाराष्ट्र शेतजमीन कमाल धारणा अधिनियम १९६१ अंतर्गत वाटप केलेली जमीन आहे काय?' },
  { num: 25, text: 'विकास आराखड्यात समाविष्ट किंवा ग्रामपंचायतकडे गुरचरण वर्ग केलेली जमीन आहे का?' },
  { num: 26, text: 'सदर जमीन देवस्थान इनाम जमीन आहे काय?' },
  { num: 27, text: 'सदर जमीन आदिवासी खातेदारांचे मालकीची आहे काय?' },
  { num: 28, text: 'महाराष्ट्र पुनर्वसन अधिनियम १९९९ कलम १६ अन्वये प्रदान केलेली आहे काय?' },
  { num: 29, text: 'सदर जमीन भाडेपट्ट्याने दिलेली शासकीय जमीन आहे काय?' },
  { num: 30, text: 'सदर जमीन भूदान व ग्रामदान अंतर्गत दिलेली आहे काय?' },
  { num: 31, text: 'महाराष्ट्र खाजगी वने संपादन १९७५ व कमाल मर्यादा कायद्यान्वये चौकशी प्रलंबित आहे काय?' },
  { num: 32, text: 'सदर जमीन भूमीधारी हक्कान्वये प्राप्त झालेली आहे काय?' },
  { num: 33, text: 'कमाल मर्यादेपेक्षा अधिक जमीन धारण करण्यास सूट दिलेली आहे काय?' },
  { num: 34, text: 'सदर जमीन वक्फ बोर्डाचे मालकीची आहे काय?' },
  { num: 35, text: 'सदर जमीन भूसंपादन कायद्यांतर्गत अधिग्रहित/राखीव आहे काय?' },
  { num: 36, text: 'सक्षम परवानगीशिवाय भोग. वर्ग-२ मधून वर्ग-१ मध्ये रूपांतरित झालेली आहे काय?' },
  { num: 37, text: 'मौका चौकशीअंती सदर जमिनीबाबत शर्तभंग झालेला आहे काय? (वापरात बदल/हस्तांतरण)' },
  { num: 38, text: 'आदिवासी जमिनीबाबत सक्षम परवानगीशिवाय आदिवासी ते आदिवासी हस्तांतरण झाले आहे का?' },
  { num: 39, text: 'आदिवासी जमिनीबाबत सक्षम परवानगीशिवाय आदिवासी ते गैर-आदिवासी हस्तांतरण झाले आहे का?' },
  { num: 40, text: 'जमिनीच्या निर्बंधित सत्ताप्रकारानुसार नोंद इतर अधिकारामध्ये घेण्यात आली आहे काय?' },
  { num: 41, text: 'इतर अधिकारातील नोंदी/भूधारणा/भोगवटदार यांच्या नोंदी अवैधरित्या कमी केल्या आहेत काय?' },
  { num: 42, text: 'भोगवटदार कंपनी/बिगर शेतकरी असल्यास कलम ८९/८९अ अन्वये परवानगी घेतली आहे काय?' },
  { num: 43, text: 'कुळ कायदा कलम ८९/८९अ - खरेदी दिनांक', subText: 'खरेदी दिनांक' },
  { num: 44, text: 'कुळ कायदा कलम ८९/८९अ - वापर सुरू केला आहे काय?', subText: 'वापर सुरू केला आहे काय?' },
  { num: 45, text: 'कुळ कायदा कलम ८९/८९अ - विनापरवानगी हस्तांतरण / वापरात बदल झाला आहे काय?', subText: 'विना परवानगी/हस्तांतरण/वापरात बदल झाला आहे काय ?' },
  { num: 46, text: 'मुद्दा क्र. १० ते ३४ प्रमाणे गाव नमुना १-क अद्यावत आहे काय?', subText: 'गाव नमुना १-क अद्यावत आहे काय?' }
];

/**
 * Resolve individual 46-point answers for a parcel
 */
export function resolveParcel46Points(p) {
  const points = {};
  const metaPoints = p.metadata?.auditPoints || {};

  // If raw auditPoints are present in metadata (parsed directly from Excel), use them 100% faithfully
  let hasAuditPoints = false;
  for (let pt = 1; pt <= 46; pt++) {
    const val = metaPoints[`point_${pt}`];
    if (val !== undefined && val !== null) {
      hasAuditPoints = true;
      points[pt] = String(val).trim();
    } else {
      points[pt] = '';
    }
  }

  if (hasAuditPoints) {
    return points;
  }

  const flags = p.metadata?.flags || {};
  const b1950 = p.backwardHistories?.find(b => b.epochYear === 1950) || {};
  const b1972 = p.backwardHistories?.find(b => b.epochYear === 1972) || {};
  const b1995 = p.backwardHistories?.find(b => b.epochYear >= 1990) || {};
  const c = p.forwardCases?.[0] || {};
  const otherRights = p.metadata?.otherRights || '';

  // Clean helper
  const cleanPrefix = (str, prefix) => {
    if (!str) return '';
    const s = String(str).trim();
    if (s.startsWith(prefix)) return s.slice(prefix.length).trim();
    return s;
  };

  let b1950Ferfar = cleanPrefix(b1950.ferfarNumber, 'F-');
  b1950Ferfar = cleanPrefix(b1950Ferfar, '1950-');
  let b1950Khata = cleanPrefix(b1950.khataNumber, 'K-');
  b1950Khata = cleanPrefix(b1950Khata, '1950-');

  // 1-3 Settlement (रिनंबरींग पर्चा - बंदोबस्त)
  // Point 1: बंदोबस्त क्र.
  points[1] = b1950Ferfar && b1950Ferfar !== 'उपलब्ध नाही' && b1950Ferfar !== 'अधिकार अभिलेख उपलब्ध नाही'
    ? b1950Ferfar
    : (b1950Khata && b1950Khata !== 'उपलब्ध नाही' ? b1950Khata : (p.oldSurveyNo && p.oldSurveyNo !== 'उपलब्ध नाही' ? p.oldSurveyNo : (p.gatNumber || '-')));

  // Point 2: बंदोबस्त नंबर प्रमाणे भोगवटदाराचे नाव (Must be an actual name, not survey number)
  const isPureNumberOrSurvey = (val) => Boolean(val && String(val).trim().match(/^[0-9\/\.\-\,\s\(\)\_]+$/));

  let rawBkName = '';
  if (b1950.ownerName && b1950.ownerName !== '_' && b1950.ownerName !== 'उपलब्ध नाही' && b1950.ownerName !== 'अधिकार अभिलेख उपलब्ध नाही' && !isPureNumberOrSurvey(b1950.ownerName)) {
    rawBkName = b1950.ownerName;
  } else if (b1950Khata && !isPureNumberOrSurvey(b1950Khata) && b1950Khata !== '_' && b1950Khata !== 'उपलब्ध नाही') {
    rawBkName = b1950Khata;
  }

  points[2] = rawBkName || (p.tenureClass === 'SARKAR_SHASAN' ? 'सरकार (शासकीय मूळ नोंद)' : (p.metadata?.ownerName || p.currentOwner || 'मूळ खातेदार'));

  const rawBkTenure = b1950.ownerName && (b1950.ownerName.includes('भूमि') || b1950.ownerName.includes('सरकार') || b1950.ownerName.includes('वर्ग') || b1950.ownerName.includes('पट्टेदार'))
    ? b1950.ownerName
    : (b1950.tenureClass === 'SARKAR_SHASAN' ? 'सरकार' : (b1950.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'भूमिस्वामी' : (b1950.tenureClass === 'BHOGVATDAR_CLASS_2' ? 'सशर्थ भूमिधारी' : 'भूमिधारी')));
  points[3] = rawBkTenure;

  // 4-6 Consolidation (एकत्रिकरण)
  let ekFerfar = cleanPrefix(b1972.ferfarNumber, 'F-');
  ekFerfar = cleanPrefix(ekFerfar, 'EK-');
  let ekKhata = cleanPrefix(b1972.khataNumber, 'K-');
  ekKhata = cleanPrefix(ekKhata, 'EK-');

  points[4] = ekFerfar && ekFerfar !== 'उपलब्ध नाही' && ekFerfar !== 'नाही'
    ? ekFerfar
    : (ekKhata && ekKhata !== 'उपलब्ध नाही' && ekKhata !== 'नाही' ? ekKhata : (points[1] || p.gatNumber || '-'));

  let rawEkName = '';
  if (b1972.ownerName && b1972.ownerName !== '_' && b1972.ownerName !== 'नाही' && !isPureNumberOrSurvey(b1972.ownerName)) {
    rawEkName = b1972.ownerName;
  } else if (b1995.ownerName && b1995.ownerName !== 'नाही' && b1995.ownerName !== '_' && !isPureNumberOrSurvey(b1995.ownerName)) {
    rawEkName = b1995.ownerName;
  }

  points[5] = rawEkName || rawBkName || p.currentOwner || 'एकत्रिकरण नोंद';

  points[6] = b1972.tenureClass === 'BHOGVATDAR_CLASS_1' || b1995.tenureClass === 'BHOGVATDAR_CLASS_1'
    ? 'भूमिस्वामी'
    : (p.tenureClass === 'SARKAR_SHASAN' ? 'सरकार' : 'सशर्थ भूमिधारी');

  // 7-9 Resurvey (पुनर्मोजणी ७/१२)
  points[7] = p.gatNumber || '-';
  points[8] = p.currentOwner || p.metadata?.ownerName || 'नोंद उपलब्ध नाही';
  points[9] = p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'भोग वर्ग - १' : (p.tenureClass === 'BHOGVATDAR_CLASS_2' ? 'भोग वर्ग - २' : 'सरकार'));

  // 10-19 Govt Lands & Present Status (भोगवटदार सरकार / महाराष्ट्र शासन असल्यास)
  points[10] = (p.tenureClass === 'SARKAR_SHASAN' || flags.isGovt)
    ? (p.currentOwner || 'महाराष्ट्र शासन वन विभाग')
    : (p.currentOwner || 'खाजगी');

  points[11] = p.tenureClass === 'SARKAR_SHASAN' || flags.isGovt
    ? (otherRights.includes('झाड') || otherRights.includes('जंगल') ? 'मोठ्या झाडाचा जंगल' : (otherRights.includes('पहाड') ? 'सरकार पहाड' : (otherRights.includes('कुरण') ? 'गायरान / कुरण' : 'शासकीय पडीत / गायरान')))
    : 'नाही';

  points[12] = metaPoints.point_12 || (flags.isIllegalDeletion || flags.isShartbhang ? 'तफावत आढळली' : '-');
  points[13] = p.tenureClass === 'FOREST_JANGAL' || otherRights.includes('वन') || otherRights.includes('जंगल') ? 'आहे' : 'नाही';
  points[14] = metaPoints.point_14 || (flags.isCorpAllot || flags.isPrivateAllot ? 'होय' : 'नाही');
  points[15] = flags.isEncroached || c.violationType === 'ENCROACHMENT' ? 'आहे' : 'नाही';
  points[16] = metaPoints.point_16 || (flags.isMojaniDone ? 'आहे' : 'नाही');
  points[17] = metaPoints.point_17 || (otherRights.includes('भूसंपादन') ? 'होय' : 'नाही');
  points[18] = flags.isIllegalDeletion || c.violationType === 'GOVERNMENT_NAME_MISSING' ? 'होय' : 'नाही';
  points[19] = flags.isPokalist || c.violationType === 'POKALIST_NONDI' || otherRights.includes('बु.ग.दे') ? 'होय' : 'नाही';

  // 20-35 Statutory Categories (वैधानिक कायदे तपासणी - रकाने २० ते ३५) Exactly aligned with Sheet 1
  // 20: मुंबई कुळ वहिवाट व शेतजमीन (विदर्भ) कायदा
  points[20] = metaPoints.point_20 || (otherRights.includes('कुळ') ? 'होय' : 'नाही');
  // 21: इनाम व वतन जमिनी (देवस्थान जमिनी वगळुन)
  points[21] = metaPoints.point_21 || (p.tenureClass === 'DEVASTHAN_INAM' || otherRights.includes('इनाम') || otherRights.includes('वतन') ? 'होय' : 'नाही');
  // 22: म.ज.म.अधि.1966 अंतर्गत भूमिहीन, शेत मजूर, स्वातंत्र्य सैनिक
  points[22] = metaPoints.point_22 || (otherRights.includes('भूमिहीन') || otherRights.includes('शेतमजूर') || otherRights.includes('स्वातंत्र्य') ? 'होय' : 'नाही');
  // 23: म.ज.म.अधि.1966 विविध योजना (गृहनिर्माण, औद्योगिक, शैक्षणिक, वसाहत, प्रकल्प)
  points[23] = metaPoints.point_23 || (flags.isCorpAllot || flags.isPrivateAllot || otherRights.includes('संस्था') || otherRights.includes('उद्योग') || otherRights.includes('प्रकल्प') ? 'होय' : 'नाही');
  // 24: महाराष्ट्र शेतजमिन कमाल धारणा अधिनियम 1961 वाटप
  points[24] = metaPoints.point_24 || (p.ceilingRecords?.length > 0 || otherRights.includes('कमाल धारणा') || otherRights.includes('सिलिंग') ? 'होय' : 'नाही');
  // 25: महानगरपालिका / प्राधिकरण विकास आराखडा किंवा ग्रामपंचायत गुरचरण
  points[25] = metaPoints.point_25 || (otherRights.includes('गुरचरण') || otherRights.includes('चराई') || otherRights.includes('विकास') || otherRights.includes('प्राधिकरण') ? 'होय' : 'नाही');
  // 26: देवस्थान इनाम जमीन
  points[26] = metaPoints.point_26 || (p.tenureClass === 'DEVASTHAN_INAM' || otherRights.includes('देवस्थान') ? 'होय' : 'नाही');
  // 27: आदिवासी खातेदारांचे मालकीची जमीन (Sheet 1 Point 27)
  points[27] = metaPoints.point_27 || (flags.isTribal || p.tribalRecords?.length > 0 || otherRights.includes('आदिवासी') ? 'होय' : 'नाही');
  // 28: महाराष्ट्र पुर्नवसन अधिनियम 1999 कलम 16 अन्वये प्रदान
  points[28] = metaPoints.point_28 || (otherRights.includes('पुनर्वसन') || otherRights.includes('प्रकल्पग्रस्त') ? 'होय' : 'नाही');
  // 29: भाडेपट्टयाने दिलेली शासकीय जमिन
  points[29] = metaPoints.point_29 || (otherRights.includes('भाडेपट्टा') || otherRights.includes('लीज') ? 'होय' : 'नाही');
  // 30: भुदान व ग्रामदान अंतर्गत दिलेली
  points[30] = metaPoints.point_30 || (p.bhudanRecords?.length > 0 || otherRights.includes('भूदान') || otherRights.includes('ग्रामदान') ? 'होय' : 'नाही');
  // 31: महाराष्ट्र खाजगी वने (संपादन) अधिनियम 1975 व कमाल मर्यादा 1961 चौकशी प्रलंबित
  points[31] = metaPoints.point_31 || (otherRights.includes('खाजगी वन') || otherRights.includes('वन जमीन') ? 'होय' : 'नाही');
  // 32: भुमीधारी हक्कान्वये प्राप्त
  points[32] = metaPoints.point_32 || (otherRights.includes('भूमीधारी') || rawBkTenure.includes('भूमीधारी') ? 'होय' : 'नाही');
  // 33: कमाल मर्यादेपेक्षा अधिक धारण करण्यास सुट
  points[33] = metaPoints.point_33 || (otherRights.includes('सूट') || otherRights.includes('कमाल मर्यादा') ? 'होय' : 'नाही');
  // 34: वक्फ बोर्डाचे मालकीची
  points[34] = metaPoints.point_34 || (otherRights.includes('वक्फ') || otherRights.includes('कब्रस्तान') ? 'होय' : 'नाही');
  // 35: भुसंपादन कायदयाअंतर्गत अधिग्रहित/राखीव
  points[35] = metaPoints.point_35 || (otherRights.includes('भूसंपादन') || otherRights.includes('अधिग्रहित') || otherRights.includes('राखीव') ? 'होय' : 'नाही');

  // 36-46 Enforcement & Conversions (शर्तभंग, रूपांतरण व अद्यावत पडताळणी - रकाने ३६ ते ४६)
  // 36: भोग. वर्ग-२ मधून वर्ग-१ मध्ये विनापरवानगी रूपांतरण (Sheet 1 Point 36)
  points[36] = metaPoints.point_36 || ((flags.isShartbhang && p.tenureClass === 'BHOGVATDAR_CLASS_1' && b1950.tenureClass === 'BHOGVATDAR_CLASS_2') || otherRights.includes('रूपांतर') ? 'होय' : 'नाही');
  // 37: मौका चौकशीअंती शर्तभंग (Sheet 1 Point 37)
  points[37] = metaPoints.point_37 || (flags.isShartbhang || c.violationType === 'SHARTBHANG' ? 'होय' : 'नाही');
  // 38: आदिवासी ते आदिवासी हस्तांतरण परवानगीशिवाय (Sheet 1 Point 38)
  points[38] = metaPoints.point_38 || (flags.isTribal && otherRights.includes('हस्तांतरण') ? 'होय' : 'नाही');
  // 39: आदिवासी ते गैर-आदिवासी हस्तांतरण परवानगीशिवाय (Sheet 1 Point 39)
  points[39] = metaPoints.point_39 || (flags.isTribal && c.violationType === 'TRIBAL_LAND_VIOLATION' ? 'होय' : 'नाही');
  // 40: जमिनीच्या निर्बंधीत सत्ताप्रकारानुसार नोंद इतर अधिकारामध्ये (Sheet 1 Point 40)
  points[40] = metaPoints.point_40 || (otherRights && otherRights !== '-' && otherRights !== '....' ? 'होय' : 'ईतर अधिकारात नोंद नाही');
  // 41: इतर अधिकारातील नोंदी/भूधारणा/भोगवटदार अवैधरित्या कमी (Sheet 1 Point 41)
  points[41] = metaPoints.point_41 || (flags.isIllegalDeletion || c.violationType === 'GOVERNMENT_NAME_MISSING' ? 'होय' : 'नाही');
  // 42: भोगवटदार कंपनी/बिगर शेतकरी असल्यास परवानगी (Sheet 1 Point 42)
  points[42] = metaPoints.point_42 || (p.tenancy89ARecords?.length > 0 || otherRights.includes('कंपनी') ? 'होय' : 'नाही');
  // 43: खरेदी दिनांक (Sheet 1 Point 43 - कलम ८९/८९अ खरेदी दिनांक)
  points[43] = metaPoints.point_43 || (p.tenancy89ARecords?.[0]?.purchaseDate ? new Date(p.tenancy89ARecords[0].purchaseDate).toLocaleDateString('mr-IN') : '');
  // 44: वापर सुरू केला आहे काय? (Sheet 1 Point 44)
  points[44] = metaPoints.point_44 || (p.tenancy89ARecords?.[0]?.isGenuineIndustrialUse ? 'होय' : 'नाही');
  // 45: विना परवानगी/हस्तांतरण/वापरात बदल (Sheet 1 Point 45)
  points[45] = metaPoints.point_45 || (flags.isShartbhang ? 'होय' : 'नाही');
  // 46: गाव नमुना १ क अद्यावत (Sheet 1 Point 46)
  points[46] = metaPoints.point_46 || 'होय';

  // HIGH FIDELITY OVERRIDE:
  // If the upload or modal edit saved explicit officer entries in metaPoints,
  // honor them verbatim (preserving '-', 'नाही', exact remarks, or order numbers)
  for (let i = 1; i <= 46; i++) {
    const rawVal = metaPoints[`point_${i}`];
    if (rawVal !== undefined && rawVal !== null) {
      const s = String(rawVal).trim();
      if (s !== '') {
        points[i] = s;
      }
    }
  }

  return points;
}

/**
 * GENERATE MASTER 1-46 CHECKLIST EXCEL
 * Matches the official booklet submitted by the user
 */
export async function generateMasterChecklistExcel(parcels, scopeName, res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर - महसूल शाखा';
  wb.created = new Date();

  const ws = wb.addWorksheet('महसूल अधिकार अभिलेख तपासणी', {
    views: [{ showGridLines: true }]
  });

  // Row 1: Title (Spans A1 to BB1 - exactly 54 Columns)
  ws.mergeCells('A1:BB1');
  const t1 = ws.getCell('A1');
  t1.value = 'महसूल अधिकार अभिलेखातील (7/12) ची तपासणी सुची';
  t1.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  t1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t1.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 36;

  // Row 2: Subtitle (Spans A2 to BB2)
  ws.mergeCells('A2:BB2');
  const t2 = ws.getCell('A2');
  t2.value = 'अधिकार अभिलेख (1950) ते आजपर्यतच्या सर्व 7/12 ची तपासणी करुन खालील माहिती भरावी';
  t2.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  t2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
  t2.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 28;

  // Row 3: Jurisdiction Scope (Spans A3 to BB3)
  ws.mergeCells('A3:BB3');
  const t3 = ws.getCell('A3');
  t3.value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | एकूण तपासणी अभिलेख संख्या: ${parcels.length} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  t3.font = { name: 'Arial', size: 10, italic: true, bold: true, color: { argb: 'FF334155' } };
  t3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  t3.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(3).height = 22;

  // Row 4, 5, 6: Exact Multi-Level Headers matching Sheet 1 specifications
  // Columns 1 to 8: Baseline 7/12 Details
  ws.mergeCells('A4:A6'); ws.getCell('A4').value = 'अ.क्र.';
  ws.mergeCells('B4:B6'); ws.getCell('B4').value = 'गावाचे नाव';
  ws.mergeCells('C4:C6'); ws.getCell('C4').value = 'सर्व्हे क्रमांक';
  
  // Row 4: Merged D4:E4 for 'क्षेत्र'
  ws.mergeCells('D4:E4'); 
  const areaHead = ws.getCell('D4');
  areaHead.value = 'क्षेत्र';
  areaHead.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Rows 5-6: Split into Krushak and Akrushak
  ws.mergeCells('D5:D6'); ws.getCell('D5').value = 'कृषक (हे.आर)';
  ws.mergeCells('E5:E6'); ws.getCell('E5').value = 'अकृषक (आर चौ.मी)';

  ws.mergeCells('F4:F6'); ws.getCell('F4').value = 'भोगवटदार वर्ग\n(भूधारणा नुसार )';
  ws.mergeCells('G4:G6'); ws.getCell('G4').value = 'भोगवटदाराचे नाव';
  ws.mergeCells('H4:H6'); ws.getCell('H4').value = 'इतर अधिकारातील नोंद (जी नोंद सदर 7/12 चे इतर अधिकारात असेल, तीच नोंद इथे नमूद करावी. उदा. आदिवासी/कुळ इ.)';

  // Group 1: सदर गट क्रमांकाचा रिनंबरींग पर्चाप्रमाणे (स्तंभ I ते Q, मुद्दे १ ते ९)
  ws.mergeCells('I4:Q4');
  const g1 = ws.getCell('I4');
  g1.value = 'सदर गट क्रमांकाचा रिनंबरींग पर्चाप्रमाणे (१ ते ९)';
  g1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
  g1.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('I5:I6'); ws.getCell('I5').value = 'i)बंदोबस्त क्र';
  ws.mergeCells('J5:J6'); ws.getCell('J5').value = 'ii)बंदोबस्त नंबर प्रमाणे भोगवटदाराचे नाव';
  ws.mergeCells('K5:K6'); ws.getCell('K5').value = 'iii) बंदोबस्त नंबर प्रमाणे भूधारणा';
  ws.mergeCells('L5:L6'); ws.getCell('L5').value = 'i)एकत्रिकरण नंबर';
  ws.mergeCells('M5:M6'); ws.getCell('M5').value = 'ii) एकत्रिकरण नंबर प्रमाणे भोगवटदाराचे नाव';
  ws.mergeCells('N5:N6'); ws.getCell('N5').value = 'iii) एकत्रिकरण नंबरप्रमाणे भूधारणा';
  ws.mergeCells('O5:O6'); ws.getCell('O5').value = 'i) पुर्नमोजणी नंबर(7/12)';
  ws.mergeCells('P5:P6'); ws.getCell('P5').value = 'i)७/१२ प्रमाणे भोगवटदाराचे नाव';
  ws.mergeCells('Q5:Q6'); ws.getCell('Q5').value = 'ii)७/१२ प्रमाणे भूधारणा';

  // Group 2: भोगवटदार सरकार / महाराष्ट्र शासन असल्यास (स्तंभ R ते AA, मुद्दे १० ते १९)
  ws.mergeCells('R4:AA4');
  const g2 = ws.getCell('R4');
  g2.value = 'भोगवटदार सरकार / महाराष्ट्र शासन असल्यास (१० ते १९)';
  g2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
  g2.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('R5:R6'); ws.getCell('R5').value = 'सध्यस्थितीतील 7/12 प्रमाणे भोगवटदाराचे नाव';
  ws.mergeCells('S5:S6'); ws.getCell('S5').value = 'अधिकार अभिलेखानुसार जमिनीचा दर्जा/प्रकार (गायरान/सरकार पहाड खडक/परमपोक इ.)';
  ws.mergeCells('T5:T6'); ws.getCell('T5').value = 'मूळ ७/१२ शी तुलना करता सध्यास्थितीती 7/12 मधील क्षेत्र, एकक,भूधारणा, इतर अधिकार मधील नोंदी किंवा वापराचे प्रयोजन या मध्ये तफावत 7/12 मध्ये आहेत का? असल्यास नमूद करणे.';
  ws.mergeCells('U5:U6'); ws.getCell('U5').value = 'वन / झुडपी जंगल जमीन आहे का?';
  ws.mergeCells('V5:V6'); ws.getCell('V5').value = 'सदर जमीन वाटप झाली आहे का? असल्यास क्षेत्र नमूद करावे.';
  ws.mergeCells('W5:W6'); ws.getCell('W5').value = 'अतिक्रमण आहे का? असल्यास क्षेत्र';
  ws.mergeCells('X5:X6'); ws.getCell('X5').value = 'सदर गट/सर्व्हे नंबरचे KML तयार केले आहे काय?';
  ws.mergeCells('Y5:Y6'); ws.getCell('Y5').value = 'भूसंपादन झाले आहे का? असल्यास भूसंपादित क्षेत्र';
  ws.mergeCells('Z5:Z6'); ws.getCell('Z5').value = 'अवैधरित्या सरकार किंवा शासन नोंद कमी केली आहे काय?';
  ws.mergeCells('AA5:AA6'); ws.getCell('AA5').value = 'शासकीय जमिनीवर पोकळीस्त नोंदी आहेत का ? असल्यास इतर अधिकारामध्ये फेरफारशिवाय काही नोंदी झाल्यात का ? असल्यास नमूद करणे.';

  // Group 3: वैधानिक कायदे व पडताळणी रकाने (स्तंभ AB ते BB, मुद्दे २० ते ४६)
  ws.mergeCells('AB4:BB4');
  const g3 = ws.getCell('AB4');
  g3.value = 'वैधानिक कायदे व पडताळणी रकाने (२० ते ४६)';
  g3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  g3.alignment = { horizontal: 'center', vertical: 'middle' };

  const statChecklistHeaders = [
    { col: 'AB', text: 'मुंबई कुळ वहिवाट व शेतजमीन (विदर्भ) कायदा अन्वये कुळ घोषित केलेली जमीन आहे काय?' }, // 20
    { col: 'AC', text: 'सदर जमिन इनाम व वतन जमिनी (देवस्थान जमिनी वगळुन) प्रकारातील आहे काय ? असल्यास कोणता प्रकार (मदद माश इनाम/खिदमत माश इनाम, इतर)' }, // 21
    { col: 'AD', text: 'सदर जमिन म.ज.म.अधि.1966 अंतर्गत भूमिहीन, शेत मजूर, स्वातंत्र्य सैनिक प्रदान केलेल्या जमिनी प्रकारातील आहे काय?' }, // 22
    { col: 'AE', text: 'सदर जमिन म.ज.म.अधि.1966 अंतर्गत विवीध योजनेअंतर्गत प्रदान/अतिक्रमण नियमानुकूल केलेल्या जमिनी (गृहनिर्माण संस्था,औद्योगिक आस्थापना,शैक्षणिक संस्था,विशेष वसाहत,प्रकल्प इ.) प्रकारची जमिन आहे का ? असल्यास संस्थेचे नाव नमुद करावे. (नसल्यास "नाही" असे नमूद करावे.)' }, // 23
    { col: 'AF', text: 'सदर जमिन महाराष्ट्र शेतजमिन कमाल धारणा अधिनियम 1961 अंतर्गत वाटप केलेल्या जमिनी प्रकारातील आहे काय ? (होय/नाही)' }, // 24
    { col: 'AG', text: 'सदर जमीन महानगरपालिका, नगर पालिका व विविध प्राधिकरण यांच्या विकास आराखडयात समाविष्ट असलेल्या जमिनी अथवा ग्रामपंचायतकडे गुरचरण अथवा इतर प्रयोजनासाठी वर्ग केलेली आहे का ? (असल्यास, कोणत्या प्रयोजनासाठी आरक्षित आहे?)' }, // 25
    { col: 'AH', text: 'सदर जमीन देवस्थान इनाम जमीन आहे काय? (होय/नाही)' }, // 26
    { col: 'AI', text: 'सदर जमीन आदिवासी खातेदारांचे मालकीची आहे काय? (होय/नाही)' }, // 27
    { col: 'AJ', text: 'सदर जमिन महाराष्ट्र पुर्नवसन अधिनियम 1999 च्या कलम 16 अन्वये प्रदान केलेली आहे काय ? (होय/नाही) असल्यास, प्रदान केल्याचा दिनांक नमूद करावा. (नसल्यास "नाही" असे नमूद करावे.)' }, // 28
    { col: 'AK', text: 'सदर जमिन भाडेपट्टयाने दिलेली शासकीय जमिन आहे काय? (होय/नाही)' }, // 29
    { col: 'AL', text: 'सदर जमिन भुदान व ग्रामदान अंतर्गत दिलेली आहे काय ? (होय/नाही)' }, // 30
    { col: 'AM', text: 'सदर जमिन महाराष्ट्र खाजगी वने (संपादन) अधिनियम 1975 तसेच महाराष्ट्र शेतजमिन (जमिन धारणेची कमाल मर्यादा) अधिनियम 1961 अन्वये चौकशीसाठी प्रलंबित आहे काय ? (होय/नाही)' }, // 31
    { col: 'AN', text: 'सदर जमिन भुमीधारी हक्कान्वये प्राप्त झालेली आहे काय ? (होय/नाही)' }, // 32
    { col: 'AO', text: 'सदर जमिनीस महाराष्ट्र शेतजमिन (जमिन धारणेची कमाल मर्यादा) अधिनियम 1961 अंतर्गत कमाल मर्यादेपेक्षा अधिक धारण करण्यास सुट दिलेली आहे काय ? (होय/नाही)' }, // 33
    { col: 'AP', text: 'सदर जमिन वक्फ बोर्डाचे मालकीची आहे काय? (होय/नाही)' }, // 34
    { col: 'AQ', text: 'सदर जमिन भुसंपादन कायदयाअंतर्गत अधिग्रहित/राखीव आहे काय ? (होय/नाही)' }, // 35
    { col: 'AR', text: 'सदर जमीन रकाना 10 ते 34 पैकी कोणत्याही रकान्यात होय असल्यास सक्षम प्राधिका-यांच्या परवानगीशिवाय भोग. वर्ग-2 मधुन भोग. वर्ग-1 मध्ये रुपांतरीत झालेली आहे काय ? (होय/नाही) असल्यास, सक्षम प्राधिका-यांचे पदनाम व आदेश क्रमांक नमूद करावा.' }, // 36
    { col: 'AS', text: 'सदर जमीन रकाना 10 ते 34 पैकी कोणत्याही रकान्यात होय असल्यास, मौका चौकशीअंती सदर जमिनीबाबत शर्तभंग झालेला आहे काय ? असल्यास कोणत्या प्रकारचा ? (वापरात बदल/हस्तांतरण/इतर)' }, // 37
    { col: 'AT', text: 'रकाना क्र. 26 चे उत्तर "होय" असल्यास, आदिवासी जमिनीबाबत सक्षम अधिकारी यांचे परवानगीशिवाय आदिवासी ते आदिवासी हस्तांतरण झाले आहे का ? (होय / नाही)' }, // 38
    { col: 'AU', text: 'रकाना क्र. 26 चे उत्तर "होय" असल्यास, आदिवासी जमिनीबाबत सक्षम अधिकारी यांचे परवानगीशिवाय आदिवासी ते गैर आदिवासी हस्तांतरण झाले आहे का ? (होय / नाही)' }, // 39
    { col: 'AV', text: 'जमिनीच्या निर्बंधीत सत्ताप्रकारानुसार नोंद इतर अधिकारामध्ये घेण्यात आली आहे काय? (होय / नाही)' }, // 40
    { col: 'AW', text: 'अधिकार अभिलेखापासून ते आजपावेतोच्या अधिकार अभिलेखानुसार इतर अधिकारातील नोंदी/भुधारणा/भोगवटदार यांच्या नोंदी अवैधरित्या कमी केलेल्या आहेत काय? (होय / नाही)' }, // 41
    { col: 'AX', text: 'भोगवटदार कंपनी/बिगर शेतकरी असल्यास,सदर जमिन वाणिज्य/रहिवास प्रयोजनाकरीता कंपनीने धारण केलेली असल्यास महाराष्ट्र कुळ वहिवाट व शेतजमिन (विदर्भ प्रदेश) अधिनियम 1948 /महाराष्ट्र कुळ वहिवाट व शेतजमिन (हैद्राबाद प्रदेश) अधिनियम 1950 मधील तरतुदीनुसार परवानगी घेतलेली आहे काय ? (होय/नाही)' } // 42
  ];

  statChecklistHeaders.forEach(item => {
    ws.mergeCells(`${item.col}5:${item.col}6`);
    ws.getCell(`${item.col}5`).value = item.text;
  });

  // Points 43, 44, 45: Section 89 / 89A group (AY to BA)
  ws.mergeCells('AY5:BA5');
  const sec89Head = ws.getCell('AY5');
  sec89Head.value = 'सदर जमिन महाराष्ट्र कुळ वहिवाट व शेतजमिन (विदर्भ प्रदेश) अधिनियम 1948 चे कलम 89 व 89 अ/महाराष्ट्र कुळ वहिवाट व शेतजमिन (हैद्राबाद प्रदेश) अधिनियम 1950 चे कलम 47 व 47 अ अन्वये ख-याखु-या औद्योगिक प्रयोजनाकरिता कंपनीने धारण केलेली आहे काय ? (होय/नाही)';
  sec89Head.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.getCell('AY6').value = 'खरेदी दिनांक'; // 43
  ws.getCell('AZ6').value = 'वापर सुरू केला आहे काय?'; // 44
  ws.getCell('BA6').value = 'विना परवानगी/हस्तांतरण/वापरात बदल झाला आहे काय ?'; // 45

  // Point 46: Village Form 1-C
  ws.mergeCells('BB5:BB6');
  ws.getCell('BB5').value = 'मुद्दा क्र. 10 ते 34 प्रमाणे गाव नमुना 1 क अद्यावत आहे काय ?'; // 46

  // Row heights for header rows
  ws.getRow(4).height = 28;
  ws.getRow(5).height = 70;
  ws.getRow(6).height = 40;

  // Row 7: Column Numbers (१ ते ४६ Matching Sheet 1 Row 3 & 4)
  const colNums = [
    'अ.क्र.', 'गावाचे नाव', 'सर्व्हे क्रमांक', 'कृषक', 'अकृषक', 'भोगवटदार वर्ग', 'भोगवटदाराचे नाव', 'इतर अधिकारातील नोंद',
    '१', '२', '३', '४', '५', '६', '७', '८', '९', // 1-9
    '१०', '११', '१२', '१३', '१४', '१५', '१६', '१७', '१८', '१९', // 10-19
    '२०', '२१', '२२', '२३', '२४', '२५', '२६', '२७', '२८', '२९', // 20-29
    '३०', '३१', '३२', '३३', '३४', '३५', '३६', '३७', '३८', '३९', // 30-39
    '४०', '४१', '४२', '४३', '४४', '४५', '४६' // 40-46
  ];
  ws.addRow(colNums);
  ws.getRow(7).height = 20;

  // Format Header Rows (4, 5, 6, 7)
  for (let r = 4; r <= 7; r++) {
    const row = ws.getRow(r);
    row.eachCell({ includeEmpty: true }, (c, colIdx) => {
      c.font = { name: 'Arial', size: 9, bold: true };
      c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      c.border = thinBorder;
      if (r === 7) {
        c.font = { name: 'Arial', size: 8, bold: true, italic: true };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      } else if (colIdx <= 8) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      } else if (colIdx <= 17) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
      } else if (colIdx <= 27) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
      } else if (colIdx >= 51 && colIdx <= 53) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F3FF' } }; // Distinct soft purple highlight for Section 89/89A
      } else {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      }
    });
  }

  // Populate Data Rows (Total 54 columns per row)
  parcelsList.forEach((p, idx) => {
    const isEven = idx % 2 === 0;
    const pt = resolveParcel46Points(p);

    const rowData = [
      idx + 1,
      cleanVillageName(p.villageName),
      p.gatNumber || p.oldSurveyNo || '-',
      Number(p.totalAreaHa || 0),
      Number(p.potkharabaAreaHa || (p.metadata?.nonAgriArea ? parseFloat(p.metadata.nonAgriArea) : 0)),
      p.tenureDisplay || p.tenureClass || '-',
      p.currentOwner || 'नोंद उपलब्ध नाही',
      p.remarks || (p.metadata?.otherRights ? p.metadata.otherRights.slice(0, 100) : '-'),
      // रिनंबरींग पर्चा (१ ते ९)
      pt[1], pt[2], pt[3], pt[4], pt[5], pt[6], pt[7], pt[8], pt[9],
      // भोगवटदार सरकार असल्यास (१० ते १९)
      pt[10], pt[11], pt[12], pt[13], pt[14], pt[15], pt[16], pt[17], pt[18], pt[19],
      // वैधानिक कायदे व तपासणी (२० ते ४६)
      pt[20], pt[21], pt[22], pt[23], pt[24], pt[25], pt[26], pt[27], pt[28], pt[29],
      pt[30], pt[31], pt[32], pt[33], pt[34], pt[35], pt[36], pt[37], pt[38], pt[39],
      pt[40], pt[41], pt[42], pt[43], pt[44], pt[45], pt[46]
    ];

    const r = ws.addRow(rowData);
    r.height = 24;
    r.eachCell((c, colIdx) => {
      c.font = { name: 'Arial', size: 9 };
      c.border = thinBorder;
      if (isEven) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_BG } };
      }
      // Highlight owner name
      if (colIdx === 7) {
        c.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };
        c.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      } else if (colIdx === 2 || colIdx === 8) {
        c.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      } else if (colIdx === 4 || colIdx === 5) {
        c.alignment = { horizontal: 'right', vertical: 'middle' };
        c.numFmt = '#,##0.0000';
      } else {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  // Footer Signature Block matching Sheet 1 rows 20-26
  ws.addRow([]);
  ws.addRow([]);
  const lastRowIdx = ws.rowCount;

  // Stage 1: Talathi / Revenue Assistant
  ws.mergeCells(`AR${lastRowIdx + 1}:AU${lastRowIdx + 1}`);
  const sig1 = ws.getCell(`AR${lastRowIdx + 1}`);
  sig1.value = 'माहिती तयार करणाऱ्याचे नाव व पदनाम: __________________\n(तलाठी / महसूल सहाय्यक)';
  sig1.font = { name: 'Arial', size: 10, bold: true };
  sig1.alignment = { vertical: 'middle', horizontal: 'left' };

  ws.getCell(`AV${lastRowIdx + 1}`).value = 'दिनांक: ______________';
  ws.getCell(`AV${lastRowIdx + 1}`).font = { name: 'Arial', size: 10, bold: true };

  ws.getCell(`AW${lastRowIdx + 1}`).value = 'स्वाक्षरी: ______________';
  ws.getCell(`AW${lastRowIdx + 1}`).font = { name: 'Arial', size: 10, bold: true };
  ws.getRow(lastRowIdx + 1).height = 36;

  // Stage 2: Circle Officer / Naib Tehsildar
  ws.mergeCells(`AR${lastRowIdx + 3}:AU${lastRowIdx + 3}`);
  const sig2 = ws.getCell(`AR${lastRowIdx + 3}`);
  sig2.value = 'माहिती तपासणी करणाऱ्या अधिकाऱ्याचे नाव व पदनाम: __________________\n(मंडळ अधिकारी / नायब तहसीलदार)';
  sig2.font = { name: 'Arial', size: 10, bold: true };
  sig2.alignment = { vertical: 'middle', horizontal: 'left' };

  ws.getCell(`AV${lastRowIdx + 3}`).value = 'दिनांक: ______________';
  ws.getCell(`AV${lastRowIdx + 3}`).font = { name: 'Arial', size: 10, bold: true };

  ws.getCell(`AW${lastRowIdx + 3}`).value = 'स्वाक्षरी: ______________';
  ws.getCell(`AW${lastRowIdx + 3}`).font = { name: 'Arial', size: 10, bold: true };
  ws.getRow(lastRowIdx + 3).height = 36;

  // Stage 3: Tehsildar Certification
  ws.mergeCells(`AR${lastRowIdx + 4}:AW${lastRowIdx + 4}`);
  const sig3 = ws.getCell(`AR${lastRowIdx + 4}`);
  sig3.value = 'माहिती अचूक असल्याबाबत तहसिलदार यांचेव्दारा प्रमाणन';
  sig3.font = { name: 'Arial', size: 10, bold: true };
  sig3.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(lastRowIdx + 4).height = 28;

  // Stage 4: Tehsildar Signature
  ws.mergeCells(`AX${lastRowIdx + 6}:BB${lastRowIdx + 6}`);
  const sig4 = ws.getCell(`AX${lastRowIdx + 6}`);
  sig4.value = 'तहसिलदार: __________________\nचंद्रपूर';
  sig4.font = { name: 'Arial', size: 10, bold: true };
  sig4.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(lastRowIdx + 6).height = 40;

  // Set Column Widths (Exact 54 Columns: A to BB)
  ws.columns = [
    { width: 6 },  // 1: Sr No (A)
    { width: 20 }, // 2: Village (B)
    { width: 14 }, // 3: Survey/Gat (C)
    { width: 13 }, // 4: Agri Area (D)
    { width: 13 }, // 5: Non-Agri Area (E)
    { width: 16 }, // 6: Tenure Class (F)
    { width: 30 }, // 7: Owner Name (G)
    { width: 32 }, // 8: Other Rights (H)
    // Points 1-9 (I to Q) - रिनंबरींग पर्चा
    { width: 14 }, { width: 24 }, { width: 14 }, { width: 14 }, { width: 24 }, { width: 14 }, { width: 14 }, { width: 24 }, { width: 14 },
    // Points 10-19 (R to AA) - शासकीय जमीन
    { width: 24 }, { width: 22 }, { width: 16 }, { width: 12 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 18 }, { width: 18 },
    // Points 20-46 (AB to BB) - वैधानिक कायदे व पडताळणी
    ...Array(23).fill({ width: 20 }), // Points 20 to 42
    { width: 16 }, // Point 43: खरेदी दिनांक (AY)
    { width: 16 }, // Point 44: वापर सुरू केला आहे काय? (AZ)
    { width: 24 }, // Point 45: विना परवानगी/हस्तांतरण/वापरात बदल झाला आहे काय ? (BA)
    { width: 22 }  // Point 46: मुद्दा क्र. 10 ते 34 प्रमाणे गाव नमुना 1 क अद्यावत आहे काय ? (BB)
  ];

  if (res && (typeof res.setHeader === 'function' || typeof res.write === 'function')) {
    await wb.xlsx.write(res);
  } else {
    return await wb.xlsx.writeBuffer();
  }
}

export async function generateMasterChecklistPdf(parcels, scopeName, res) {
  const tableBody = [
    [
      { text: 'अ.क्र.', style: 'th', rowSpan: 2 },
      { text: 'गाव', style: 'th', rowSpan: 2 },
      { text: 'गट क्र.', style: 'th', rowSpan: 2 },
      { text: 'क्षेत्र (हे.)', style: 'th', rowSpan: 2 },
      { text: 'भोगवटदार वर्ग', style: 'th', rowSpan: 2 },
      { text: 'भोगवटदाराचे नाव (सध्याचे खातेदार)', style: 'th', rowSpan: 2 },
      { text: 'रिनंबरींग (१-९)', style: 'th', colSpan: 3 },
      {}, {},
      { text: 'तपासणी निष्कर्ष व प्रमुख मुद्दे (१०-४५)', style: 'th', colSpan: 4 },
      {}, {}, {}
    ],
    [
      {}, {}, {}, {}, {}, {},
      { text: '१९५० नोंद', style: 'subTh' },
      { text: 'एकत्रिकरण', style: 'subTh' },
      { text: 'पुनर्मोजणी', style: 'subTh' },
      { text: 'सरकारी जमीन / दर्जा', style: 'subTh' },
      { text: 'शर्तभंग / रूपांतरण', style: 'subTh' },
      { text: 'आदिवासी / कुळ', style: 'subTh' },
      { text: 'अतिक्रमण / शेरा', style: 'subTh' }
    ]
  ];

  parcels.slice(0, 300).forEach((p, idx) => {
    const pt = resolveParcel46Points(p);
    tableBody.push([
      { text: String(idx + 1), style: 'tdCenter' },
      { text: cleanVillageName(p.villageName), style: 'td' },
      { text: String(p.gatNumber || p.oldSurveyNo || '-'), style: 'tdCenter' },
      { text: Number(p.totalAreaHa || 0).toFixed(4), style: 'tdRight' },
      { text: p.tenureDisplay || p.tenureClass || '-', style: 'tdCenter' },
      { text: p.currentOwner || 'नोंद उपलब्ध नाही', style: 'tdBold' },
      { text: `${pt[1]}\n${pt[2]}`, style: 'tdSmall' },
      { text: `${pt[4]}\n${pt[5]}`, style: 'tdSmall' },
      { text: `${pt[7]}\n${pt[8]}`, style: 'tdSmall' },
      { text: `${pt[10]}\nदर्जा: ${pt[11]}`, style: 'tdSmall' },
      { text: `रूपांतरण: ${pt[36]}\nशर्तभंग: ${pt[37]}`, style: 'tdSmall' },
      { text: `कुळ: ${pt[20]}\nआदिवासी: ${pt[27]}`, style: 'tdSmall' },
      { text: `अतिक्रमण: ${pt[15]}\n${p.remarks ? p.remarks.slice(0, 40) : '-'}`, style: 'tdSmall' }
    ]);
  });

  const docDefinition = {
    pageOrientation: 'landscape',
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 20],
    defaultStyle: { font: 'Nirmala' },
    content: [
      { text: 'महाराष्ट्र शासन - जिल्हाधिकारी कार्यालय, चंद्रपूर', style: 'headerMain' },
      { text: 'महसूल अधिकार अभिलेखातील (7/12) ची तपासणी सुची', style: 'headerSub' },
      { text: 'अधिकार अभिलेख (1950) ते आजपर्यतच्या सर्व 7/12 ची तपासणी करुन खालील माहिती भरावी', style: 'headerMini' },
      {
        columns: [
          { text: `कार्यक्षेत्र: ${scopeName}`, style: 'meta', bold: true },
          { text: `एकूण अभिलेख: ${parcels.length} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`, style: 'meta', alignment: 'right' }
        ],
        margin: [0, 4, 0, 8]
      },
      {
        table: {
          headerRows: 2,
          widths: [20, 50, 36, 42, 54, 110, 65, 65, 65, 75, 80, 65, 75],
          body: tableBody
        },
        layout: {
          fillColor: (rowIndex) => {
            if (rowIndex === 0) return '#1E3A8A';
            if (rowIndex === 1) return '#3B82F6';
            return rowIndex % 2 === 0 ? '#F8FAFC' : null;
          },
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#CBD5E1',
          vLineColor: () => '#CBD5E1'
        }
      },
      {
        margin: [0, 16, 0, 0],
        columns: [
          {
            text: 'माहिती तयार करणाऱ्याचे नाव व पदनाम\n(तलाठी / महसूल सहाय्यक)\nदिनांक: ____________\nस्वाक्षरी: ____________',
            style: 'sig'
          },
          {
            text: 'माहिती तपासणी करणाऱ्या अधिकाऱ्याचे नाव व पदनाम\n(मंडळ अधिकारी / नायब तहसीलदार)\nदिनांक: ____________\nस्वाक्षरी: ____________',
            style: 'sig',
            alignment: 'center'
          },
          {
            text: 'माहिती अचूक असल्याबाबत प्रमाणन\n\nतहसिलदार: ____________\nचंद्रपूर',
            style: 'sig',
            alignment: 'right'
          }
        ]
      }
    ],
    styles: {
      headerMain: { fontSize: 13, bold: true, alignment: 'center', color: '#1E3A8A' },
      headerSub: { fontSize: 11, bold: true, alignment: 'center', color: '#B45309', margin: [0, 2, 0, 1] },
      headerMini: { fontSize: 9.5, bold: true, alignment: 'center', color: '#0F172A', margin: [0, 0, 0, 4] },
      meta: { fontSize: 8.5, color: '#334155' },
      th: { fontSize: 8.5, bold: true, alignment: 'center', color: '#FFFFFF', margin: [1, 2, 1, 2] },
      subTh: { fontSize: 7.5, bold: true, alignment: 'center', color: '#FFFFFF', margin: [1, 1, 1, 1] },
      td: { fontSize: 7.5, margin: [1, 1, 1, 1] },
      tdCenter: { fontSize: 7.5, alignment: 'center', margin: [1, 1, 1, 1] },
      tdRight: { fontSize: 7.5, alignment: 'right', margin: [1, 1, 1, 1] },
      tdBold: { fontSize: 7.5, bold: true, color: '#1E3A8A', margin: [1, 1, 1, 1] },
      tdSmall: { fontSize: 6.5, color: '#334155', margin: [1, 1, 1, 1] },
      sig: { fontSize: 8, bold: true, color: '#0F172A', lineHeight: 1.3 }
    }
  };

  const pdf = pdfmake.createPdf(docDefinition);
  const buffer = await pdf.getBuffer();
  if (typeof res.send === 'function') {
    res.send(buffer);
  } else if (typeof res.end === 'function') {
    res.end(buffer);
  }
  return buffer;
}

/**
 * GENERATE SANKSHIPT 7/12 PARCELS LIST PDF (९ मुख्य स्तंभ)
 */
export async function generateChecklistParcelsPdf(parcels, scopeName, res) {
  const tableBody = [
    [
      { text: 'अ.क्र.', style: 'th' },
      { text: 'गावाचे नाव', style: 'th' },
      { text: 'सर्व्हे/गट क्र.', style: 'th' },
      { text: 'क्षेत्र (हे.आर.)', style: 'th' },
      { text: 'सध्याचे खातेदार / भोगवटादार नाव', style: 'th' },
      { text: 'धारणा प्रकार', style: 'th' },
      { text: '१९५० मूळ नोंद', style: 'th' },
      { text: 'तपासणी निष्कर्ष / सद्यस्थिती', style: 'th' },
      { text: 'शेरा व इतर हक्क', style: 'th' }
    ]
  ];

  parcels.slice(0, 500).forEach((p, idx) => {
    const isAlert = p.statusFinding?.includes('शर्तभंग') || p.statusFinding?.includes('अवैध') || p.statusFinding?.includes('अतिक्रमण');
    tableBody.push([
      { text: String(idx + 1), style: 'tdCenter' },
      { text: cleanVillageName(p.villageName) + (p.taluka ? `\n(${formatTalukaMr(p.taluka)})` : ''), style: 'td' },
      { text: String(p.gatNumber || p.oldSurveyNo || '-'), style: 'tdCenter' },
      { text: Number(p.totalAreaHa || 0).toFixed(4), style: 'tdRight' },
      { text: p.currentOwner || 'नोंद उपलब्ध नाही', style: 'tdBold' },
      { text: p.tenureDisplay || p.tenureClass || '-', style: 'tdCenter' },
      { text: p.baselineOwner1950 || '-', style: 'tdSmall' },
      { text: p.statusFinding || 'प्रमाणित', style: isAlert ? 'tdAlert' : 'tdSmall' },
      { text: p.remarks && p.remarks !== '-' ? String(p.remarks).slice(0, 80) : '-', style: 'tdSmall' }
    ]);
  });

  const docDefinition = {
    pageOrientation: 'landscape',
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 20],
    defaultStyle: { font: 'Nirmala' },
    content: [
      { text: 'महाराष्ट्र शासन - जिल्हाधिकारी कार्यालय, चंद्रपूर', style: 'headerMain' },
      { text: 'संक्षिप्त ७/१२ महसूल अधिकार अभिलेख तपासणी यादी', style: 'headerSub' },
      {
        columns: [
          { text: `कार्यक्षेत्र: ${scopeName}`, style: 'meta', bold: true },
          { text: `एकूण तपासणी अभिलेख संख्या: ${parcels.length} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`, style: 'meta', alignment: 'right' }
        ],
        margin: [0, 4, 0, 8]
      },
      {
        table: {
          headerRows: 1,
          widths: [24, 75, 45, 45, 160, 75, 105, 120, 145],
          body: tableBody
        },
        layout: {
          fillColor: (rowIndex) => {
            if (rowIndex === 0) return '#1E3A8A';
            return rowIndex % 2 === 0 ? '#F8FAFC' : null;
          },
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#CBD5E1',
          vLineColor: () => '#CBD5E1'
        }
      },
      {
        margin: [0, 16, 0, 0],
        columns: [
          {
            text: 'माहिती तयार करणाऱ्याचे नाव व पदनाम\n(तलाठी / महसूल सहाय्यक)\nदिनांक: ____________\nस्वाक्षरी: ____________',
            style: 'sig'
          },
          {
            text: 'माहिती तपासणी करणाऱ्या अधिकाऱ्याचे नाव व पदनाम\n(मंडळ अधिकारी / नायब तहसीलदार)\nदिनांक: ____________\nस्वाक्षरी: ____________',
            style: 'sig',
            alignment: 'center'
          },
          {
            text: 'माहिती अचूक असल्याबाबत प्रमाणन\n\nतहसिलदार: ____________\nचंद्रपूर',
            style: 'sig',
            alignment: 'right'
          }
        ]
      }
    ],
    styles: {
      headerMain: { fontSize: 13, bold: true, alignment: 'center', color: '#1E3A8A' },
      headerSub: { fontSize: 11, bold: true, alignment: 'center', color: '#B45309', margin: [0, 2, 0, 2] },
      meta: { fontSize: 8.5, color: '#334155' },
      th: { fontSize: 8.5, bold: true, alignment: 'center', color: '#FFFFFF', margin: [1, 2, 1, 2] },
      td: { fontSize: 7.5, margin: [1, 1, 1, 1] },
      tdCenter: { fontSize: 7.5, alignment: 'center', margin: [1, 1, 1, 1] },
      tdRight: { fontSize: 7.5, alignment: 'right', margin: [1, 1, 1, 1] },
      tdBold: { fontSize: 7.5, bold: true, color: '#1E3A8A', margin: [1, 1, 1, 1] },
      tdSmall: { fontSize: 7, color: '#334155', margin: [1, 1, 1, 1] },
      tdAlert: { fontSize: 7, bold: true, color: '#991B1B', margin: [1, 1, 1, 1] },
      sig: { fontSize: 8, bold: true, color: '#0F172A', lineHeight: 1.3 }
    }
  };

  const pdf = pdfmake.createPdf(docDefinition);
  const buffer = await pdf.getBuffer();
  if (typeof res.send === 'function') {
    res.send(buffer);
  } else if (typeof res.end === 'function') {
    res.end(buffer);
  }
  return buffer;
}

/**
 * Reusable worksheet builder for Goshwara Rollup (गावाचा गोषवारा, तालुक्याचा गोषवारा, जिल्हाचा गोषवारा)
 * Strictly matches the 14-column official statutory layout with super and sub headers
 */
function createGoshwaraWorksheet(wb, sheetName, titleText, nameHeader, rows) {
  wb.calcProperties = wb.calcProperties || {};
  wb.calcProperties.fullCalcOnLoad = true;

  const ws = wb.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  });

  // Row 1: Merged Title Banner (All 16 Columns A to P)
  ws.mergeCells('A1:P1');
  const t1 = ws.getCell('A1');
  t1.value = titleText;
  t1.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF000000' } };
  t1.alignment = { horizontal: 'center', vertical: 'middle' };
  t1.border = thinBorder;
  t1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  ws.getRow(1).height = 28;

  // Row 2: Super Headers (All 16 Official Columns)
  const r2 = ws.addRow([
    'अ.क्र.',
    nameHeader,
    'एकूण सर्व्हे क्रमांक',
    'एकूण क्षेत्र(हे.आर.)',
    'एकूण भोगवटदार वर्ग 1 जमिनी', '',
    'एकूण भोगवटदार वर्ग 2 जमिनी', '',
    'अवैधरित्या वर्ग 2 मधून वर्ग 1 केलेल्या जमिनी', '',
    'इतर अधिकारात नोंद न घेतलेल्या जमिनी', '',
    'अवैधरित्या इतर अधिकारामधून नोंद कमी केलेल्या जमिनी', '',
    'शर्तभंग झालेल्या जमिनी', ''
  ]);
  r2.height = 26;

  // Row 3: Sub Headers
  const r3 = ws.addRow([
    '', '', '', '',
    'एकूण सर्व्हे क्रमांक', 'एकूण क्षेत्र(हे.आर.)',
    'एकूण सर्व्हे क्रमांक', 'एकूण क्षेत्र(हे.आर.)',
    'एकूण सर्व्हे क्रमांक', 'एकूण क्षेत्र(हे.आर.)',
    'एकूण सर्व्हे क्रमांक', 'एकूण क्षेत्र(हे.आर.)',
    'एकूण सर्व्हे क्रमांक', 'एकूण क्षेत्र(हे.आर.)',
    'एकूण सर्व्हे क्रमांक', 'एकूण क्षेत्र(हे.आर.)'
  ]);
  r3.height = 24;

  // Merging super headers
  ws.mergeCells('A2:A3');
  ws.mergeCells('B2:B3');
  ws.mergeCells('C2:C3');
  ws.mergeCells('D2:D3');
  ws.mergeCells('E2:F2');
  ws.mergeCells('G2:H2');
  ws.mergeCells('I2:J2');
  ws.mergeCells('K2:L2');
  ws.mergeCells('M2:N2');
  ws.mergeCells('O2:P2');

  [r2, r3].forEach(row => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder;
    });
  });

  const cleanRows = (rows || []).filter(r => {
    if (!r) return false;
    if (r.isTotal) return false;
    if (r.name === 'एकूण' || r.villageName === 'एकूण' || r.name === 'Total') return false;
    if (r.id === 'total' || r.id === 'grand-total') return false;
    return true;
  });

  let sumTot = 0, sumArea = 0;
  let sumC1 = 0, sumC1A = 0;
  let sumC2 = 0, sumC2A = 0;
  let sumConv = 0, sumConvA = 0;
  let sumNo = 0, sumNoA = 0;
  let sumDel = 0, sumDelA = 0;
  let sumShart = 0, sumShartA = 0;

  const startDataRow = 4;
  cleanRows.forEach((row, idx) => {
    const isDistrictName = row.villageName === 'संपूर्ण जिल्हा (१५ तालुके गोषवारा)' || row.villageName === 'Whole District Rollup';
    const displayName = row.name || (isDistrictName
      ? 'चंद्रपूर जिल्हा'
      : (row.taluka && (row.villageName === 'संपूर्ण तालुका (All Villages)' || !row.villageName))
      ? formatTalukaMr(row.taluka)
      : cleanVillageName(row.villageName || row.taluka || '-'));

    const totalSurveys = Number(row.totalSurveys ?? row.total712Count ?? row.totalGovtLandCount ?? 0);
    const totalAreaVal = parseFloat(row.totalArea ?? row.totalAreaHa ?? 0) || 0;
    const c1Count = Number(row.c1Count ?? row.c1Surveys ?? 0);
    const c1Area = parseFloat(row.c1Area ?? 0) || 0;
    const c2Count = Number(row.c2Count ?? row.c2Surveys ?? 0);
    const c2Area = parseFloat(row.c2Area ?? 0) || 0;
    const convCount = Number(row.convCount ?? row.convSurveys ?? 0);
    const convArea = parseFloat(row.convArea ?? 0) || 0;
    const noOtherCount = Number(row.noOtherCount ?? row.noOtherSurveys ?? 0);
    const noOtherArea = parseFloat(row.noOtherArea ?? 0) || 0;
    const delCount = Number(row.delCount ?? row.delSurveys ?? row.illegalReductionCount ?? 0);
    const delArea = parseFloat(row.delArea ?? row.illegalReductionArea ?? 0) || 0;
    const shartCount = Number(row.shartCount ?? row.shartSurveys ?? ((row.govtDeptsShartbhang || 0) + (row.privateShartbhang || 0)) ?? 0);
    const shartArea = parseFloat(row.shartArea ?? 0) || 0;

    sumTot += totalSurveys;
    sumArea += totalAreaVal;
    sumC1 += c1Count;
    sumC1A += c1Area;
    sumC2 += c2Count;
    sumC2A += c2Area;
    sumConv += convCount;
    sumConvA += convArea;
    sumNo += noOtherCount;
    sumNoA += noOtherArea;
    sumDel += delCount;
    sumDelA += delArea;
    sumShart += shartCount;
    sumShartA += shartArea;

    const r = ws.addRow([
      idx + 1,
      displayName,
      totalSurveys,
      totalAreaVal,
      c1Count,
      c1Area,
      c2Count,
      c2Area,
      convCount,
      convArea,
      noOtherCount,
      noOtherArea,
      delCount,
      delArea,
      shartCount,
      shartArea
    ]);

    r.height = 20;
    r.eachCell((cell, colIdx) => {
      cell.font = { name: 'Arial', size: 9 };
      cell.border = thinBorder;
      if (idx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_BG } };
      }

      if (colIdx === 2) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if ([4, 6, 8, 10, 12, 14, 16].includes(colIdx)) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0.00';
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (colIdx > 2) cell.numFmt = '#,##0';
      }
    });
  });

  const endDataRow = ws.rowCount;
  if (endDataRow >= startDataRow && cleanRows.length > 0) {
    const totalRow = ws.addRow([
      'एकूण',
      '-',
      { formula: `SUM(C${startDataRow}:C${endDataRow})`, result: sumTot },
      { formula: `SUM(D${startDataRow}:D${endDataRow})`, result: Number(sumArea.toFixed(2)) },
      { formula: `SUM(E${startDataRow}:E${endDataRow})`, result: sumC1 },
      { formula: `SUM(F${startDataRow}:F${endDataRow})`, result: Number(sumC1A.toFixed(2)) },
      { formula: `SUM(G${startDataRow}:G${endDataRow})`, result: sumC2 },
      { formula: `SUM(H${startDataRow}:H${endDataRow})`, result: Number(sumC2A.toFixed(2)) },
      { formula: `SUM(I${startDataRow}:I${endDataRow})`, result: sumConv },
      { formula: `SUM(J${startDataRow}:J${endDataRow})`, result: Number(sumConvA.toFixed(2)) },
      { formula: `SUM(K${startDataRow}:K${endDataRow})`, result: sumNo },
      { formula: `SUM(L${startDataRow}:L${endDataRow})`, result: Number(sumNoA.toFixed(2)) },
      { formula: `SUM(M${startDataRow}:M${endDataRow})`, result: sumDel },
      { formula: `SUM(N${startDataRow}:N${endDataRow})`, result: Number(sumDelA.toFixed(2)) },
      { formula: `SUM(O${startDataRow}:O${endDataRow})`, result: sumShart },
      { formula: `SUM(P${startDataRow}:P${endDataRow})`, result: Number(sumShartA.toFixed(2)) }
    ]);
    totalRow.height = 24;
    totalRow.eachCell((cell, colIdx) => {
      cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.border = thinBorder;
      if (colIdx === 1 || colIdx === 2) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if ([4, 6, 8, 10, 12, 14, 16].includes(colIdx)) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0.00';
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.numFmt = '#,##0';
      }
    });
  }

  ws.columns = [
    { width: 8 },   // A: अ.क्र.
    { width: 26 },  // B: नाव
    { width: 15 },  // C: एकूण सर्व्हे क्रमांक
    { width: 16 },  // D: एकूण क्षेत्र(हे.आर.)
    { width: 15 },  // E: वर्ग 1 सर्व्हे
    { width: 16 },  // F: वर्ग 1 क्षेत्र
    { width: 15 },  // G: वर्ग 2 सर्व्हे
    { width: 16 },  // H: वर्ग 2 क्षेत्र
    { width: 16 },  // I: अवैध रूपांतरण सर्व्हे
    { width: 16 },  // J: अवैध रूपांतरण क्षेत्र
    { width: 16 },  // K: इतर अधिकार नोंद नाही सर्व्हे
    { width: 16 },  // L: इतर अधिकार नोंद नाही क्षेत्र
    { width: 16 },  // M: इतर अधिकार नोंद कमी सर्व्हे
    { width: 16 },  // N: इतर अधिकार नोंद कमी क्षेत्र
    { width: 16 },  // O: शर्तभंग सर्व्हे
    { width: 16 }   // P: शर्तभंग क्षेत्र
  ];
}
/**
 * GENERATE GOSHAWARA (ROLLUP SUMMARY) PDF (16 Official Columns)
 */
export async function generateChecklistSummaryPdf(summaryData, scopeName, res) {
  let tier = 'all';
  let districtRows = [];
  let talukaRows = [];
  let villageRows = [];

  if (summaryData && typeof summaryData === 'object' && !Array.isArray(summaryData)) {
    tier = summaryData.tier || 'all';
    districtRows = summaryData.districtRows || (summaryData.districtTotal ? [summaryData.districtTotal] : []);
    talukaRows = summaryData.talukaRows || summaryData.byTaluka || [];
    villageRows = summaryData.villageRows || summaryData.byVillage || [];
  } else if (Array.isArray(summaryData)) {
    districtRows = summaryData.filter(r => r.villageName === 'संपूर्ण जिल्हा (१५ तालुके गोषवारा)' || r.villageName === 'Whole District Rollup' || r.isDistrictTotal);
    talukaRows = summaryData.filter(r => r.villageName === 'संपूर्ण तालुका (All Villages)' || r.isTalukaTotal);
    villageRows = summaryData.filter(r => !districtRows.includes(r) && !talukaRows.includes(r));
  }

  if (districtRows.length === 0 && talukaRows.length > 1) {
    const sourceRows = talukaRows;
    const dTot = {
      name: 'चंद्रपूर जिल्हा',
      isDistrictTotal: true,
      totalSurveys: sourceRows.reduce((a, b) => a + Number(b.totalSurveys ?? b.total712Count ?? 0), 0),
      totalArea: sourceRows.reduce((a, b) => a + parseFloat(b.totalArea ?? b.totalAreaHa ?? 0), 0).toFixed(2),
      c1Surveys: sourceRows.reduce((a, b) => a + Number(b.c1Surveys ?? b.c1Count ?? 0), 0),
      c1Area: sourceRows.reduce((a, b) => a + parseFloat(b.c1Area ?? 0), 0).toFixed(2),
      c2Surveys: sourceRows.reduce((a, b) => a + Number(b.c2Surveys ?? b.c2Count ?? 0), 0),
      c2Area: sourceRows.reduce((a, b) => a + parseFloat(b.c2Area ?? 0), 0).toFixed(2),
      convSurveys: sourceRows.reduce((a, b) => a + Number(b.convSurveys ?? b.convCount ?? 0), 0),
      convArea: sourceRows.reduce((a, b) => a + parseFloat(b.convArea ?? 0), 0).toFixed(2),
      noOtherSurveys: sourceRows.reduce((a, b) => a + Number(b.noOtherSurveys ?? b.noOtherCount ?? 0), 0),
      noOtherArea: sourceRows.reduce((a, b) => a + parseFloat(b.noOtherArea ?? 0), 0).toFixed(2),
      delSurveys: sourceRows.reduce((a, b) => a + Number(b.delSurveys ?? b.delCount ?? 0), 0),
      delArea: sourceRows.reduce((a, b) => a + parseFloat(b.delArea ?? 0), 0).toFixed(2),
      shartSurveys: sourceRows.reduce((a, b) => a + Number(b.shartSurveys ?? b.shartCount ?? ((b.govtDeptsShartbhang || 0) + (b.privateShartbhang || 0)) ?? 0), 0),
      shartArea: sourceRows.reduce((a, b) => a + parseFloat(b.shartArea ?? 0), 0).toFixed(2)
    };
    districtRows = [dTot];
  }

  function buildPdfTable(titleText, nameHeader, rows) {
    const isDistrictTable = titleText.includes('जिल्हा');
    const tableBanner = {
      table: {
        widths: ['*'],
        body: [[{
          text: titleText,
          style: 'tableBanner',
          fillColor: isDistrictTable ? '#0F766E' : '#1E3A8A'
        }]]
      },
      layout: 'noBorders',
      margin: [0, 10, 0, 4]
    };

    const tableBody = [
      // Row 1: Super Headers (All 16 Official Columns)
      [
        { text: 'अ.क्र.', rowSpan: 2, style: 'th', alignment: 'center' },
        { text: nameHeader, rowSpan: 2, style: 'th', alignment: 'center' },
        { text: 'एकूण सर्व्हे क्रमांक', rowSpan: 2, style: 'th', alignment: 'center' },
        { text: 'एकूण क्षेत्र(हे.आर.)', rowSpan: 2, style: 'th', alignment: 'center' },
        { text: 'एकूण भोगवटदार वर्ग १ जमिनी', colSpan: 2, style: 'th', alignment: 'center' }, {},
        { text: 'एकूण भोगवटदार वर्ग २ जमिनी', colSpan: 2, style: 'th', alignment: 'center' }, {},
        { text: 'अवैधरित्या वर्ग २ मधून वर्ग १ केलेल्या जमिनी', colSpan: 2, style: 'th', alignment: 'center' }, {},
        { text: 'इतर अधिकारात नोंद न घेतलेल्या जमिनी', colSpan: 2, style: 'th', alignment: 'center' }, {},
        { text: 'अवैधरित्या इतर अधिकारामधून नोंद कमी केलेल्या जमिनी', colSpan: 2, style: 'th', alignment: 'center' }, {},
        { text: 'शर्तभंग झालेल्या जमिनी', colSpan: 2, style: 'th', alignment: 'center' }, {}
      ],
      // Row 2: Sub Headers
      [
        {}, {}, {}, {},
        { text: 'एकूण सर्व्हे क्रमांक', style: 'thSub', alignment: 'center' }, { text: 'एकूण क्षेत्र(हे.आर.)', style: 'thSub', alignment: 'center' },
        { text: 'एकूण सर्व्हे क्रमांक', style: 'thSub', alignment: 'center' }, { text: 'एकूण क्षेत्र(हे.आर.)', style: 'thSub', alignment: 'center' },
        { text: 'एकूण सर्व्हे क्रमांक', style: 'thSub', alignment: 'center' }, { text: 'एकूण क्षेत्र(हे.आर.)', style: 'thSub', alignment: 'center' },
        { text: 'एकूण सर्व्हे क्रमांक', style: 'thSub', alignment: 'center' }, { text: 'एकूण क्षेत्र(हे.आर.)', style: 'thSub', alignment: 'center' },
        { text: 'एकूण सर्व्हे क्रमांक', style: 'thSub', alignment: 'center' }, { text: 'एकूण क्षेत्र(हे.आर.)', style: 'thSub', alignment: 'center' },
        { text: 'एकूण सर्व्हे क्रमांक', style: 'thSub', alignment: 'center' }, { text: 'एकूण क्षेत्र(हे.आर.)', style: 'thSub', alignment: 'center' }
      ],
      // Row 3: Column Numbers Row (Matching Excel Sheet 2 - 1 to 16)
      ['१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११', '१२', '१३', '१४', '१५', '१६'].map(n => ({
        text: n,
        style: 'thNum',
        alignment: 'center'
      }))
    ];

    const cleanRows = (rows || []).filter(r => {
      if (!r) return false;
      if (r.isTotal) return false;
      if (r.name === 'एकूण' || r.villageName === 'एकूण' || r.name === 'Total') return false;
      if (r.id === 'total' || r.id === 'grand-total') return false;
      return true;
    });

    let sumTot = 0, sumArea = 0;
    let sumC1 = 0, sumC1A = 0;
    let sumC2 = 0, sumC2A = 0;
    let sumConv = 0, sumConvA = 0;
    let sumNo = 0, sumNoA = 0;
    let sumDel = 0, sumDelA = 0;
    let sumShart = 0, sumShartA = 0;

    cleanRows.forEach((r, idx) => {
      const isDistrictName = r.villageName === 'संपूर्ण जिल्हा (१५ तालुके गोषवारा)' || r.villageName === 'Whole District Rollup';
      const displayName = r.name || (isDistrictName
        ? 'चंद्रपूर जिल्हा'
        : (r.taluka && (r.villageName === 'संपूर्ण तालुका (All Villages)' || !r.villageName))
        ? formatTalukaMr(r.taluka)
        : cleanVillageName(r.villageName || r.taluka || '-'));

      const cnt = Number(r.totalSurveys ?? r.total712Count ?? r.totalGovtLandCount ?? 0);
      const area = parseFloat(r.totalArea ?? r.totalAreaHa ?? 0) || 0;
      const c1 = Number(r.c1Count ?? r.c1Surveys ?? 0);
      const c1A = parseFloat(r.c1Area ?? 0) || 0;
      const c2 = Number(r.c2Count ?? r.c2Surveys ?? 0);
      const c2A = parseFloat(r.c2Area ?? 0) || 0;
      const conv = Number(r.convCount ?? r.convSurveys ?? 0);
      const convA = parseFloat(r.convArea ?? 0) || 0;
      const noOther = Number(r.noOtherCount ?? r.noOtherSurveys ?? 0);
      const noOtherA = parseFloat(r.noOtherArea ?? 0) || 0;
      const del = Number(r.delCount ?? r.delSurveys ?? r.illegalReductionCount ?? 0);
      const delA = parseFloat(r.delArea ?? r.illegalReductionArea ?? 0) || 0;
      const shart = Number(r.shartCount ?? r.shartSurveys ?? ((r.govtDeptsShartbhang || 0) + (r.privateShartbhang || 0)) ?? 0);
      const shartA = parseFloat(r.shartArea ?? 0) || 0;

      sumTot += cnt; sumArea += area;
      sumC1 += c1; sumC1A += c1A;
      sumC2 += c2; sumC2A += c2A;
      sumConv += conv; sumConvA += convA;
      sumNo += noOther; sumNoA += noOtherA;
      sumDel += del; sumDelA += delA;
      sumShart += shart; sumShartA += shartA;

      tableBody.push([
        { text: String(idx + 1), style: 'tdCenter' },
        { text: displayName, style: isDistrictTable ? 'tdBold' : 'td' },
        { text: String(cnt), style: 'tdCenter' },
        { text: area.toFixed(2), style: 'tdRight' },
        { text: String(c1), style: 'tdCenter' },
        { text: c1A.toFixed(2), style: 'tdRight' },
        { text: String(c2), style: 'tdCenter' },
        { text: c2A.toFixed(2), style: 'tdRight' },
        { text: String(conv), style: conv > 0 ? 'tdAlert' : 'tdCenter' },
        { text: convA.toFixed(2), style: convA > 0 ? 'tdAlertRight' : 'tdRight' },
        { text: String(noOther), style: noOther > 0 ? 'tdWarning' : 'tdCenter' },
        { text: noOtherA.toFixed(2), style: noOtherA > 0 ? 'tdWarningRight' : 'tdRight' },
        { text: String(del), style: del > 0 ? 'tdAlert' : 'tdCenter' },
        { text: delA.toFixed(2), style: delA > 0 ? 'tdAlertRight' : 'tdRight' },
        { text: String(shart), style: shart > 0 ? 'tdAlert' : 'tdCenter' },
        { text: shartA.toFixed(2), style: shartA > 0 ? 'tdAlertRight' : 'tdRight' }
      ]);
    });

    // Total Row (All 16 columns)
    tableBody.push([
      { text: 'एकूण', style: 'tdTotalCenter' },
      { text: '-', style: 'tdTotalCenter' },
      { text: String(sumTot), style: 'tdTotalCenter' },
      { text: sumArea.toFixed(2), style: 'tdTotalRight' },
      { text: String(sumC1), style: 'tdTotalCenter' },
      { text: sumC1A.toFixed(2), style: 'tdTotalRight' },
      { text: String(sumC2), style: 'tdTotalCenter' },
      { text: sumC2A.toFixed(2), style: 'tdTotalRight' },
      { text: String(sumConv), style: 'tdTotalCenter' },
      { text: sumConvA.toFixed(2), style: 'tdTotalRight' },
      { text: String(sumNo), style: 'tdTotalCenter' },
      { text: sumNoA.toFixed(2), style: 'tdTotalRight' },
      { text: String(sumDel), style: 'tdTotalCenter' },
      { text: sumDelA.toFixed(2), style: 'tdTotalRight' },
      { text: String(sumShart), style: 'tdTotalCenter' },
      { text: sumShartA.toFixed(2), style: 'tdTotalRight' }
    ]);

    return [
      tableBanner,
      {
        table: {
          headerRows: 3,
          dontBreakRows: true,
          widths: [20, 88, 44, 46, 42, 45, 42, 45, 43, 45, 43, 45, 43, 45, 42, 45],
          body: tableBody
        },
        layout: {
          fillColor: (rowIndex) => {
            if (rowIndex === 0 || rowIndex === 1) return isDistrictTable ? '#0F766E' : '#1E3A8A';
            if (rowIndex === 2) return '#F1F5F9';
            if (rowIndex === tableBody.length - 1) return '#E2E8F0';
            return rowIndex % 2 === 0 ? '#F8FAFC' : null;
          },
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#94A3B8',
          vLineColor: () => '#94A3B8',
          paddingLeft: () => 1.5,
          paddingRight: () => 1.5,
          paddingTop: () => 2,
          paddingBottom: () => 2
        },
        margin: [0, 0, 0, 18]
      }
    ];
  }

  const content = [];
  if (tier === 'village') {
    if (villageRows.length > 0) {
      content.push(...buildPdfTable('गावाचा गोषवारा', 'गावाचे नाव', villageRows));
    }
  } else if (tier === 'taluka') {
    let hasPrevious = false;
    if (talukaRows.length > 0) {
      content.push(...buildPdfTable('तालुक्याचा गोषवारा', 'तालुक्याचे नाव', talukaRows));
      hasPrevious = true;
    }
    if (villageRows.length > 0) {
      if (hasPrevious) content.push({ text: '', pageBreak: 'after' });
      content.push(...buildPdfTable('गावाचा गोषवारा', 'गावाचे नाव', villageRows));
    }
  } else if (tier === 'district') {
    let hasPrevious = false;
    if (districtRows.length > 0) {
      content.push(...buildPdfTable('जिल्हाचा गोषवारा', 'जिल्हाचे नाव', districtRows));
      hasPrevious = true;
    }
    if (talukaRows.length > 0) {
      if (hasPrevious) content.push({ text: '', pageBreak: 'after' });
      content.push(...buildPdfTable('तालुक्याचा गोषवारा', 'तालुक्याचे नाव', talukaRows));
    }
  } else {
    // All tiers: Show District, Taluka, and Village
    let hasPrevious = false;
    if (districtRows.length > 0) {
      content.push(...buildPdfTable('जिल्हाचा गोषवारा', 'जिल्हाचे नाव', districtRows));
      hasPrevious = true;
    }
    if (talukaRows.length > 0) {
      if (hasPrevious) content.push({ text: '', pageBreak: 'after' });
      content.push(...buildPdfTable('तालुक्याचा गोषवारा', 'तालुक्याचे नाव', talukaRows));
      hasPrevious = true;
    }
    if (villageRows.length > 0) {
      if (hasPrevious) content.push({ text: '', pageBreak: 'after' });
      content.push(...buildPdfTable('गावाचा गोषवारा', 'गावाचे नाव', villageRows));
    }
  }

  if (content.length === 0) {
    content.push(...buildPdfTable('गोषवारा', 'नाव', []));
  }

  const docDefinition = {
    pageOrientation: 'landscape',
    pageSize: 'A4',
    pageMargins: [12, 12, 12, 16],
    defaultStyle: { font: 'Nirmala' },
    content,
    styles: {
      tableTitle: { fontSize: 11, bold: true, alignment: 'center', color: '#0F172A' },
      tableBanner: { fontSize: 9.5, bold: true, color: '#FFFFFF', alignment: 'center', margin: [0, 3, 0, 3] },
      th: { fontSize: 7, bold: true, alignment: 'center', color: '#FFFFFF', margin: [0, 2, 0, 2] },
      thSub: { fontSize: 6.2, bold: true, alignment: 'center', color: '#FFFFFF', margin: [0, 1, 0, 1] },
      thNum: { fontSize: 5.8, bold: false, alignment: 'center', color: '#475569', margin: [0, 1, 0, 1] },
      td: { fontSize: 6.5, margin: [1, 1, 1, 1] },
      tdBold: { fontSize: 6.5, bold: true, color: '#1E3A8A', margin: [1, 1, 1, 1] },
      tdCenter: { fontSize: 6.5, alignment: 'center', margin: [1, 1, 1, 1] },
      tdRight: { fontSize: 6.5, alignment: 'right', margin: [1, 1, 1, 1] },
      tdTotalCenter: { fontSize: 7, bold: true, alignment: 'center', color: '#0F172A', margin: [1, 1, 1, 1] },
      tdTotalRight: { fontSize: 7, bold: true, alignment: 'right', color: '#0F172A', margin: [1, 1, 1, 1] },
      tdAlert: { fontSize: 6.5, bold: true, alignment: 'center', color: '#DC2626' },
      tdAlertRight: { fontSize: 6.5, bold: true, alignment: 'right', color: '#DC2626' },
      tdWarning: { fontSize: 6.5, bold: true, alignment: 'center', color: '#D97706' },
      tdWarningRight: { fontSize: 6.5, bold: true, alignment: 'right', color: '#D97706' }
    }
  };

  const pdf = pdfmake.createPdf(docDefinition);
  const buffer = await pdf.getBuffer();
  if (res && typeof res.send === 'function') {
    res.send(buffer);
  } else if (res && typeof res.end === 'function') {
    res.end(buffer);
  }
  return buffer;
}

/**
 * GENERATE GOSHAWARA (ROLLUP SUMMARY) EXCEL (14 Official Columns)
 */
export async function generateChecklistSummaryExcel(summaryData, scopeName, res) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर - महसूल शाखा';
  wb.created = new Date();

  let tier = 'all';
  let districtRows = [];
  let talukaRows = [];
  let villageRows = [];

  if (summaryData && typeof summaryData === 'object' && !Array.isArray(summaryData)) {
    tier = summaryData.tier || 'all';
    districtRows = summaryData.districtRows || (summaryData.districtTotal ? [summaryData.districtTotal] : []);
    talukaRows = summaryData.talukaRows || summaryData.byTaluka || [];
    villageRows = summaryData.villageRows || summaryData.byVillage || [];
  } else if (Array.isArray(summaryData)) {
    districtRows = summaryData.filter(r => r.villageName === 'संपूर्ण जिल्हा (१५ तालुके गोषवारा)' || r.villageName === 'Whole District Rollup' || r.isDistrictTotal);
    talukaRows = summaryData.filter(r => r.villageName === 'संपूर्ण तालुका (All Villages)' || r.isTalukaTotal);
    villageRows = summaryData.filter(r => !districtRows.includes(r) && !talukaRows.includes(r));
  }

  if (districtRows.length === 0 && talukaRows.length > 1) {
    const sourceRows = talukaRows;
    const dTot = {
      name: 'चंद्रपूर जिल्हा',
      isDistrictTotal: true,
      totalSurveys: sourceRows.reduce((a, b) => a + Number(b.totalSurveys ?? b.total712Count ?? 0), 0),
      totalArea: sourceRows.reduce((a, b) => a + parseFloat(b.totalArea ?? b.totalAreaHa ?? 0), 0).toFixed(2),
      c1Surveys: sourceRows.reduce((a, b) => a + Number(b.c1Surveys ?? b.c1Count ?? 0), 0),
      c1Area: sourceRows.reduce((a, b) => a + parseFloat(b.c1Area ?? 0), 0).toFixed(2),
      c2Surveys: sourceRows.reduce((a, b) => a + Number(b.c2Surveys ?? b.c2Count ?? 0), 0),
      c2Area: sourceRows.reduce((a, b) => a + parseFloat(b.c2Area ?? 0), 0).toFixed(2),
      convSurveys: sourceRows.reduce((a, b) => a + Number(b.convSurveys ?? b.convCount ?? 0), 0),
      convArea: sourceRows.reduce((a, b) => a + parseFloat(b.convArea ?? 0), 0).toFixed(2),
      noOtherSurveys: sourceRows.reduce((a, b) => a + Number(b.noOtherSurveys ?? b.noOtherCount ?? 0), 0),
      noOtherArea: sourceRows.reduce((a, b) => a + parseFloat(b.noOtherArea ?? 0), 0).toFixed(2),
      delSurveys: sourceRows.reduce((a, b) => a + Number(b.delSurveys ?? b.delCount ?? 0), 0),
      delArea: sourceRows.reduce((a, b) => a + parseFloat(b.delArea ?? 0), 0).toFixed(2),
      shartSurveys: sourceRows.reduce((a, b) => a + Number(b.shartSurveys ?? b.shartCount ?? ((b.govtDeptsShartbhang || 0) + (b.privateShartbhang || 0)) ?? 0), 0),
      shartArea: sourceRows.reduce((a, b) => a + parseFloat(b.shartArea ?? 0), 0).toFixed(2)
    };
    districtRows = [dTot];
  }

  if (tier === 'village') {
    if (villageRows.length > 0) {
      createGoshwaraWorksheet(wb, 'गावाचा गोषवारा', 'गावाचा गोषवारा', 'गावाचे नाव', villageRows);
    }
  } else if (tier === 'taluka') {
    if (talukaRows.length > 0) {
      createGoshwaraWorksheet(wb, 'तालुक्याचा गोषवारा', 'तालुक्याचा गोषवारा', 'तालुक्याचे नाव', talukaRows);
    }
    if (villageRows.length > 0) {
      createGoshwaraWorksheet(wb, 'गावाचा गोषवारा', 'गावाचा गोषवारा', 'गावाचे नाव', villageRows);
    }
  } else if (tier === 'district') {
    if (districtRows.length > 0) {
      createGoshwaraWorksheet(wb, 'जिल्हाचा गोषवारा', 'जिल्हाचा गोषवारा', 'जिल्हाचे नाव', districtRows);
    }
    if (talukaRows.length > 0) {
      createGoshwaraWorksheet(wb, 'तालुक्याचा गोषवारा', 'तालुक्याचा गोषवारा', 'तालुक्याचे नाव', talukaRows);
    }
  } else {
    // All tiers: 3 separate sheets matching the exact requirements
    if (districtRows.length > 0) {
      createGoshwaraWorksheet(wb, 'जिल्हाचा गोषवारा', 'जिल्हाचा गोषवारा', 'जिल्हाचे नाव', districtRows);
    }
    if (talukaRows.length > 0) {
      createGoshwaraWorksheet(wb, 'तालुक्याचा गोषवारा', 'तालुक्याचा गोषवारा', 'तालुक्याचे नाव', talukaRows);
    }
    if (villageRows.length > 0) {
      createGoshwaraWorksheet(wb, 'गावाचा गोषवारा', 'गावाचा गोषवारा', 'गावाचे नाव', villageRows);
    }
  }

  if (wb.worksheets.length === 0) {
    createGoshwaraWorksheet(wb, 'गोषवारा', 'गोषवारा', 'नाव', []);
  }

  if (res) {
    if (res && (typeof res.setHeader === 'function' || typeof res.write === 'function')) {
    await wb.xlsx.write(res);
  } else {
    return await wb.xlsx.writeBuffer();
  }
  } else {
    return await wb.xlsx.writeBuffer();
  }
}

/**
 * GENERATE 17 STATUTORY CATEGORY BOOKLET EXCEL
 * Includes Sheet 1: सविस्तर जमिनींची यादी (Detailed Land Records with Owner Names)
 * Includes Sheet 2: गोषवारा (गाव, तालुका, जिल्हा गोषवारा)
 */
/**
 * Helper to convert 1-based column index to Excel column letter (A, B, C, ... AA, etc.)
 */
function getColLetter(colIndex) {
  let temp, letter = '';
  let c = colIndex;
  while (c > 0) {
    temp = (c - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    c = Math.floor((c - temp - 1) / 26);
  }
  return letter;
}

/**
 * GENERATE 18 STATUTORY CATEGORY BOOKLET EXCEL
 * Strictly matches the 18 official Gazette / ODS formats
 * Sheet 1: सविस्तर जमिनींची यादी (Detailed Data Table)
 * Sheet 2: गोषवारा (Village, Taluka, District Goshwara Table)
 */
export async function generateCategoryBookletExcel(catId, summaryData, parcels, scopeName, res) {
  const catIdNum = parseInt(catId, 10);
  const category = getBooklet18Category(catIdNum);
  const parcelsList = Array.isArray(parcels) ? parcels : [];
  const detailedCols = getDetailedColumnsForBooklet(catIdNum);
  const goshwaraDef = getGoshwaraConfigForBooklet(catIdNum);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर - महसूल शाखा';
  wb.created = new Date();

  // -------------------------------------------------------------
  // SHEET 1: सविस्तर जमिनींची यादी (Detailed Land Records)
  // -------------------------------------------------------------
  const wsParcels = wb.addWorksheet('सविस्तर यादी (Actual Data)', {
    views: [{ showGridLines: true }]
  });

  const lastColLetter = getColLetter(detailedCols.length);

  // Title
  wsParcels.mergeCells(`A1:${lastColLetter}1`);
  const t1 = wsParcels.getCell('A1');
  t1.value = `महाराष्ट्र शासन - जिल्हाधिकारी कार्यालय, चंद्रपूर | ${category.id}) ${category.nameMr}`;
  t1.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  t1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t1.alignment = { horizontal: 'center', vertical: 'middle' };
  wsParcels.getRow(1).height = 36;

  // Subtitle
  wsParcels.mergeCells(`A2:${lastColLetter}2`);
  const t2 = wsParcels.getCell('A2');
  t2.value = `${category.descMr} | कार्यक्षेत्र: ${scopeName} | एकूण अभिलेख संख्या: ${parcels.length}`;
  t2.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF334155' } };
  t2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
  t2.alignment = { horizontal: 'center', vertical: 'middle' };
  wsParcels.getRow(2).height = 24;

  // Headers
  const catHeaders = detailedCols.map(c => c.label);
  const hr = wsParcels.addRow(catHeaders);
  hr.height = 36;
  hr.eachCell(c => {
    c.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = thinBorder;
  });

  // Numbering row
  const numLabels = ['१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११', '१२'].slice(0, detailedCols.length);
  wsParcels.addRow(numLabels).eachCell(c => {
    c.font = { name: 'Arial', size: 8, italic: true };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  });

  // Rows
  const areaColIdx = detailedCols.findIndex(c => c.isArea);
  parcelsList.forEach((p, idx) => {
    const isEven = idx % 2 === 0;
    const pt = resolveParcel46Points(p);

    const rowValues = detailedCols.map(col => col.getValue(p, pt, idx));
    const r = wsParcels.addRow(rowValues);
    r.height = 24;
    r.eachCell((c, colIdx) => {
      const colDef = detailedCols[colIdx - 1];
      c.font = { name: 'Arial', size: 9 };
      c.border = thinBorder;
      if (isEven) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_BG } };
      }
      if (colDef.isOwner) {
        c.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };
        c.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (colDef.align === 'left') {
        c.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (colDef.isArea) {
        c.alignment = { horizontal: 'right', vertical: 'middle' };
        c.numFmt = '#,##0.0000';
      } else {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  // Auto sum row
  const sumRowValues = new Array(detailedCols.length).fill('');
  sumRowValues[0] = 'एकूण';
  sumRowValues[2] = `${parcels.length} गट/सर्व्हे`;
  if (areaColIdx >= 0) {
    const areaLetter = getColLetter(areaColIdx + 1);
    sumRowValues[areaColIdx] = { formula: `SUM(${areaLetter}5:${areaLetter}${wsParcels.rowCount})` };
  }
  const sumRow = wsParcels.addRow(sumRowValues);
  sumRow.height = 26;
  sumRow.eachCell((c, colIdx) => {
    c.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    c.border = thinBorder;
    if (colIdx === areaColIdx + 1) {
      c.numFmt = '#,##0.0000';
      c.alignment = { horizontal: 'right' };
    } else {
      c.alignment = { horizontal: 'center' };
    }
  });

  // Signatures on Sheet 1
  wsParcels.addRow([]);
  const sig1Row = wsParcels.addRow(['माहिती तयार करणाऱ्याचे नाव व पदनाम (तलाठी)', '', '', '', '', 'माहिती तपासणी करणाऱ्या अधिकाऱ्याचे नाव व पदनाम (मंडळ अधिकारी)', '', '', 'तहसिलदार', '']);
  sig1Row.font = { name: 'Arial', size: 10, bold: true };
  wsParcels.addRow(['दिनांक: ____________   स्वाक्षरी: ____________', '', '', '', '', 'दिनांक: ____________   स्वाक्षरी: ____________', '', '', 'दिनांक: ____________   स्वाक्षरी: ____________', '']);

  wsParcels.columns = detailedCols.map(c => ({ width: c.width || 16 }));

  // -------------------------------------------------------------
  // SHEET 2: गोषवारा (गाव, तालुका, जिल्हा गोषवारा)
  // -------------------------------------------------------------
  const wsSummary = wb.addWorksheet('गोषवारा (Rollup Summary)', {
    views: [{ showGridLines: true }]
  });

  const lastSummaryLetter = getColLetter(goshwaraDef.totalCols);
  wsSummary.mergeCells(`A1:${lastSummaryLetter}1`);
  const st1 = wsSummary.getCell('A1');
  st1.value = `महाराष्ट्र शासन - महसूल व वन विभाग | ${category.id}) ${category.nameMr} - गोषवारा`;
  st1.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  st1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  st1.alignment = { horizontal: 'center', vertical: 'middle' };
  wsSummary.getRow(1).height = 36;

  wsSummary.mergeCells(`A2:${lastSummaryLetter}2`);
  wsSummary.getCell('A2').value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  wsSummary.getCell('A2').alignment = { horizontal: 'center' };
  wsSummary.getCell('A2').font = { name: 'Arial', size: 10, italic: true };
  wsSummary.getRow(2).height = 22;

  // Separate summary data into Village rows, Taluka rows, and District Total
  const talukaRows = summaryData.filter(r => r.villageName === 'संपूर्ण तालुका (All Villages)' || r.id?.startsWith('t-'));
  const villageRows = summaryData.filter(r => r.villageName && !r.villageName.includes('संपूर्ण तालुका') && !r.villageName.includes('संपूर्ण जिल्हा') && !r.id?.startsWith('t-') && r.id !== 'district-chandrapur-grand-total');

  function renderDynamicGoshwaraBlock(title, rows, isDistrict = false) {
    wsSummary.addRow([]);
    const bannerRow = wsSummary.addRow([title]);
    wsSummary.mergeCells(`A${bannerRow.number}:${lastSummaryLetter}${bannerRow.number}`);
    bannerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    bannerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isDistrict ? 'FF0F766E' : GOV_NAVY } };
    bannerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    bannerRow.height = 28;

    // Row 1: Super Headers
    const r1Cells = [
      'अ.क्र.',
      isDistrict ? 'जिल्हाचे नाव' : (rows === talukaRows ? 'तालुक्याचे नाव' : 'गावाचे नाव'),
      'एकूण सर्व्हे क्रमांक',
      'एकूण क्षेत्र(हे.आर.)'
    ];
    goshwaraDef.superHeaders.forEach(sh => {
      r1Cells.push(sh.label, '');
    });
    const r1 = wsSummary.addRow(r1Cells);
    r1.height = 28;

    const rowNum1 = r1.number;
    const rowNum2 = rowNum1 + 1;

    // Row 2: Sub Headers
    const r2Cells = ['', '', '', ''];
    goshwaraDef.superHeaders.forEach(() => {
      r2Cells.push('एकूण सर्व्हे क्रमांक', 'एकूण क्षेत्र(हे.आर.)');
    });
    const r2 = wsSummary.addRow(r2Cells);
    r2.height = 24;

    wsSummary.mergeCells(`A${rowNum1}:A${rowNum2}`);
    wsSummary.mergeCells(`B${rowNum1}:B${rowNum2}`);
    wsSummary.mergeCells(`C${rowNum1}:C${rowNum2}`);
    wsSummary.mergeCells(`D${rowNum1}:D${rowNum2}`);
    let cIdx = 5;
    goshwaraDef.superHeaders.forEach(() => {
      const colL1 = getColLetter(cIdx);
      const colL2 = getColLetter(cIdx + 1);
      wsSummary.mergeCells(`${colL1}${rowNum1}:${colL2}${rowNum1}`);
      cIdx += 2;
    });

    [r1, r2].forEach(r => {
      r.eachCell(c => {
        c.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF0F172A' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.border = thinBorder;
      });
    });

    // Row 3: Column Numbers Row
    const rNumsCells = [];
    const numMr = ['१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११', '१२', '१३', '१४', '१५', '१६', '१७', '१८', '१९', '२०'];
    for (let i = 0; i < goshwaraDef.totalCols; i++) {
      rNumsCells.push(numMr[i] || String(i + 1));
    }
    const rNums = wsSummary.addRow(rNumsCells);
    rNums.height = 18;
    rNums.eachCell(c => {
      c.font = { size: 7.5, italic: true };
      c.alignment = { horizontal: 'center' };
      c.border = thinBorder;
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    });

    // Populate data rows
    if (isDistrict) {
      const distItem = summaryData.find(r => r.id === 'district-chandrapur-grand-total' || r.villageName?.includes('संपूर्ण जिल्हा') || r.isDistrictTotal);
      const dataRows = distItem ? [distItem] : (talukaRows.length > 1 ? talukaRows : []);

      const totalSurv = distItem ? Number(distItem.total712Count || 0) : dataRows.reduce((acc, r) => acc + Number(r.total712Count || 0), 0);
      const totalAr = distItem ? parseFloat(distItem.totalAreaHa || 0) : dataRows.reduce((acc, r) => acc + parseFloat(r.totalAreaHa || 0), 0);

      const dRowCells = [
        1,
        'चंद्रपूर जिल्हा (एकूण १५ तालुके)',
        totalSurv,
        Number(totalAr.toFixed(4))
      ];

      goshwaraDef.superHeaders.forEach(sh => {
        let cnt = 0;
        let area = 0;
        if (distItem) {
          cnt = Number(distItem[sh.countKey] || 0);
          area = parseFloat(distItem[sh.areaKey] || 0);
        } else {
          cnt = dataRows.reduce((acc, r) => acc + Number(r[sh.countKey] || 0), 0);
          area = dataRows.reduce((acc, r) => acc + parseFloat(r[sh.areaKey] || 0), 0);
        }
        dRowCells.push(cnt, Number(area.toFixed(4)));
      });

      const dRow = wsSummary.addRow(dRowCells);
      dRow.height = 26;
      dRow.eachCell((c, colIdx) => {
        c.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        c.border = thinBorder;
        c.alignment = { horizontal: colIdx === 2 ? 'left' : 'center', vertical: 'middle' };
      });
    } else {
      const dataRows = rows.length > 0 ? rows : summaryData;
      dataRows.forEach((row, idx) => {
        const isTot = row.villageName === 'संपूर्ण तालुका (All Villages)';
        const talukaPart = (!isTot && row.taluka) ? ` (${formatTalukaMr(row.taluka)})` : '';
        const nameVal = isTot
          ? `${formatTalukaMr(row.taluka)} (संपूर्ण तालुका)`
          : `${cleanVillageName(row.villageName || row.taluka || 'गाव')}${talukaPart}`;

        const drCells = [idx + 1, nameVal];
        goshwaraDef.superHeaders.forEach(sh => {
          drCells.push(Number(row[sh.countKey] || 0), Number(parseFloat(row[sh.areaKey] || 0).toFixed(4)));
        });

        const dr = wsSummary.addRow(drCells);
        dr.height = 22;
        dr.eachCell((c, colIdx) => {
          c.border = thinBorder;
          c.font = { name: 'Arial', size: 8.5 };
          if (isTot) {
            c.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF1E3A8A' } };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          }
          c.alignment = { horizontal: colIdx === 2 ? 'left' : 'center', vertical: 'middle' };
        });
      });
    }
  }

  // 1. गावाचा गोषवारा (Village Level Summary)
  if (villageRows.length > 0) {
    renderDynamicGoshwaraBlock('गावाचा गोषवारा', villageRows, false);
  } else if (talukaRows.length === 0) {
    renderDynamicGoshwaraBlock('गावाचा गोषवारा', summaryData, false);
  }

  // 2. तालुक्याचा गोषवारा (Taluka Level Summary)
  if (talukaRows.length > 0) {
    renderDynamicGoshwaraBlock('तालुक्याचा गोषवारा', talukaRows, false);
  }

  // 3. जिल्हाचा गोषवारा (District Level Summary)
  renderDynamicGoshwaraBlock('जिल्हाचा गोषवारा', [], true);

  // Set Summary Columns Widths
  const sumCols = [{ width: 6 }, { width: 26 }, { width: 16 }, { width: 16 }];
  for (let i = 0; i < goshwaraDef.superHeaders.length; i++) {
    sumCols.push({ width: 14 }, { width: 14 });
  }
  wsSummary.columns = sumCols;

  if (res && (typeof res.setHeader === 'function' || typeof res.write === 'function')) {
    await wb.xlsx.write(res);
  } else {
    return await wb.xlsx.writeBuffer();
  }
}

/**
 * GENERATE 18 STATUTORY CATEGORY BOOKLET PDF
 * Strictly matches the 18 official Gazette / ODS formats
 */
export async function generateCategoryBookletPdf(catId, summaryData, parcels, scopeName, res, options = {}) {
  const catIdNum = parseInt(catId, 10);
  const category = getBooklet18Category(catIdNum);
  const detailedCols = getDetailedColumnsForBooklet(catIdNum);
  const goshwaraDef = getGoshwaraConfigForBooklet(catIdNum);
  const isOnlySummary = options.view === 'categorySummary' || options.view === 'summary';

  // Separate into District, Taluka, Village rows
  const rawSummary = Array.isArray(summaryData) ? summaryData : [];
  let districtRows = rawSummary.filter(r =>
    r.id === 'district-chandrapur-grand-total' ||
    r.villageName?.includes('संपूर्ण जिल्हा') ||
    r.villageName === 'Whole District Rollup' ||
    r.isDistrictTotal
  );
  let talukaRows = rawSummary.filter(r =>
    (r.villageName === 'संपूर्ण तालुका (All Villages)' || r.id?.startsWith('t-') || r.isTalukaTotal) &&
    !districtRows.includes(r)
  );
  let villageRows = rawSummary.filter(r =>
    !districtRows.includes(r) &&
    !talukaRows.includes(r) &&
    r.villageName &&
    r.villageName !== 'संपूर्ण तालुका (All Villages)' &&
    !r.villageName.includes('संपूर्ण जिल्हा') &&
    r.name !== 'एकूण'
  );

  // If multi-taluka rows exist but no district row was provided, compute district row
  if (districtRows.length === 0 && talukaRows.length > 1) {
    const sourceRows = talukaRows;
    const dRow = {
      id: 'district-chandrapur-grand-total',
      name: 'चंद्रपूर जिल्हा',
      villageName: 'संपूर्ण जिल्हा (१५ तालुके गोषवारा)',
      isDistrictTotal: true,
      total712Count: sourceRows.reduce((a, b) => a + Number(b.total712Count ?? b.totalSurveys ?? 0), 0),
      totalAreaHa: sourceRows.reduce((a, b) => a + parseFloat(b.totalAreaHa ?? b.totalArea ?? 0), 0).toFixed(2),
      c1Count: sourceRows.reduce((a, b) => a + Number(b.c1Count ?? 0), 0),
      c1Area: sourceRows.reduce((a, b) => a + parseFloat(b.c1Area ?? 0), 0).toFixed(2),
      c2Count: sourceRows.reduce((a, b) => a + Number(b.c2Count ?? 0), 0),
      c2Area: sourceRows.reduce((a, b) => a + parseFloat(b.c2Area ?? 0), 0).toFixed(2),
      convCount: sourceRows.reduce((a, b) => a + Number(b.convCount ?? 0), 0),
      convArea: sourceRows.reduce((a, b) => a + parseFloat(b.convArea ?? 0), 0).toFixed(2),
      noOtherCount: sourceRows.reduce((a, b) => a + Number(b.noOtherCount ?? 0), 0),
      noOtherArea: sourceRows.reduce((a, b) => a + parseFloat(b.noOtherArea ?? 0), 0).toFixed(2),
      delCount: sourceRows.reduce((a, b) => a + Number(b.delCount ?? 0), 0),
      delArea: sourceRows.reduce((a, b) => a + parseFloat(b.delArea ?? 0), 0).toFixed(2),
      shartCount: sourceRows.reduce((a, b) => a + Number(b.shartCount ?? 0), 0),
      shartArea: sourceRows.reduce((a, b) => a + parseFloat(b.shartArea ?? 0), 0).toFixed(2),
      tribalToTribalCount: sourceRows.reduce((a, b) => a + Number(b.tribalToTribalCount || 0), 0),
      tribalToTribalArea: sourceRows.reduce((a, b) => a + parseFloat(b.tribalToTribalArea || 0), 0).toFixed(2),
      tribalToNonTribalCount: sourceRows.reduce((a, b) => a + Number(b.tribalToNonTribalCount || 0), 0),
      tribalToNonTribalArea: sourceRows.reduce((a, b) => a + parseFloat(b.tribalToNonTribalArea || 0), 0).toFixed(2),
      bhudanTransferCount: sourceRows.reduce((a, b) => a + Number(b.bhudanTransferCount || 0), 0),
      bhudanTransferArea: sourceRows.reduce((a, b) => a + parseFloat(b.bhudanTransferArea || 0), 0).toFixed(2),
      companyPermittedCount: sourceRows.reduce((a, b) => a + Number(b.companyPermittedCount || 0), 0),
      companyPermittedArea: sourceRows.reduce((a, b) => a + parseFloat(b.companyPermittedArea || 0), 0).toFixed(2),
      companyUnpermittedCount: sourceRows.reduce((a, b) => a + Number(b.companyUnpermittedCount || 0), 0),
      companyUnpermittedArea: sourceRows.reduce((a, b) => a + parseFloat(b.companyUnpermittedArea || 0), 0).toFixed(2),
      usageBreachCount: sourceRows.reduce((a, b) => a + Number(b.usageBreachCount || 0), 0),
      usageBreachArea: sourceRows.reduce((a, b) => a + parseFloat(b.usageBreachArea || 0), 0).toFixed(2),
      transferBreachCount: sourceRows.reduce((a, b) => a + Number(b.transferBreachCount || 0), 0),
      transferBreachArea: sourceRows.reduce((a, b) => a + parseFloat(b.transferBreachArea || 0), 0).toFixed(2),
      otherRightsCount: sourceRows.reduce((a, b) => a + Number(b.otherRightsCount || 0), 0),
      otherRightsArea: sourceRows.reduce((a, b) => a + parseFloat(b.otherRightsArea || 0), 0).toFixed(2)
    };
    districtRows = [dRow];
  }

  // Helper to build Goshwara PDF Table Block
  function buildDynamicCategoryGoshwaraTable(titleText, nameHeader, rows, isDistrict = false) {
    const banner = {
      table: {
        widths: ['*'],
        body: [[{
          text: titleText,
          style: 'tableBanner',
          fillColor: isDistrict ? '#0F766E' : '#1E3A8A'
        }]]
      },
      layout: 'noBorders',
      margin: [0, 8, 0, 4]
    };

    // Calculate column widths
    const availableWidth = 800; // landscape usable width
    const srWidth = 18;
    const nameWidth = goshwaraDef.totalCols <= 8 ? 140 : (goshwaraDef.totalCols <= 14 ? 100 : (goshwaraDef.totalCols <= 16 ? 85 : 75));
    const totalSurvWidth = 40;
    const totalAreaWidth = 46;
    const pairColsCount = goshwaraDef.superHeaders.length * 2;
    const pairColWidth = Math.floor((availableWidth - srWidth - nameWidth - totalSurvWidth - totalAreaWidth) / pairColsCount);

    const widths = [srWidth, nameWidth, totalSurvWidth, totalAreaWidth];
    for (let i = 0; i < pairColsCount; i++) {
      widths.push(pairColWidth);
    }

    // Row 1: Super Headers
    // Col 1: अ.क्र., Col 2: नाव, Col 3: एकूण सर्व्हे क्रमांक, Col 4: एकूण क्षेत्र(हे.आर.)
    const row1 = [
      { text: 'अ.क्र.', rowSpan: 2, style: 'th', alignment: 'center' },
      { text: nameHeader, rowSpan: 2, style: 'th', alignment: 'center' },
      { text: 'एकूण सर्व्हे क्रमांक', rowSpan: 2, style: 'th', alignment: 'center' },
      { text: 'एकूण क्षेत्र(हे.आर.)', rowSpan: 2, style: 'th', alignment: 'center' }
    ];
    goshwaraDef.superHeaders.forEach(sh => {
      row1.push({ text: sh.label, colSpan: 2, style: 'th', alignment: 'center' });
      row1.push({});
    });

    // Row 2: Sub Headers (Sub-columns under breakdown pairs only)
    const row2 = [{}, {}, {}, {}];
    goshwaraDef.superHeaders.forEach(() => {
      row2.push(
        { text: 'एकूण सर्व्हे क्र.', style: 'thSub', alignment: 'center' },
        { text: 'एकूण क्षेत्र(हे.आर.)', style: 'thSub', alignment: 'center' }
      );
    });

    // Row 3: Numbers row
    const numMr = ['१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११', '१२', '१३', '१४', '१५', '१६', '१७', '१८', '१९', '२०'];
    const row3 = [];
    for (let i = 0; i < goshwaraDef.totalCols; i++) {
      row3.push({ text: numMr[i] || String(i + 1), style: 'thNum', alignment: 'center' });
    }

    const tableBody = [row1, row2, row3];

    // Data rows
    const dataRows = rows.length > 0 ? rows : (isDistrict ? districtRows : rawSummary);
    const pairSums = new Array(goshwaraDef.superHeaders.length * 2).fill(0);

    dataRows.forEach((r, idx) => {
      const isDistrictName = isDistrict || r.isDistrictTotal;
      const isTalukaTotalName = r.villageName === 'संपूर्ण तालुका (All Villages)';
      const talukaPart = (!isDistrictName && !isTalukaTotalName && r.taluka) ? ` (${formatTalukaMr(r.taluka)})` : '';
      const displayName = isDistrictName ? 'चंद्रपूर जिल्हा' : (isTalukaTotalName ? `${formatTalukaMr(r.taluka)} (संपूर्ण तालुका)` : `${cleanVillageName(r.villageName || r.taluka || '-')}${talukaPart}`);

      const totSurv = Number(r.total712Count || 0);
      const totAr = parseFloat(r.totalAreaHa || 0);

      const rowCells = [
        { text: String(idx + 1), style: 'tdCenter' },
        { text: displayName, style: isDistrictName || isTalukaTotalName ? 'tdBold' : 'td' },
        { text: String(totSurv), style: 'tdCenter' },
        { text: totAr.toFixed(2), style: 'tdRight' }
      ];

      goshwaraDef.superHeaders.forEach((sh, pIdx) => {
        const cnt = Number(r[sh.countKey] || 0);
        const area = parseFloat(r[sh.areaKey] || 0);
        pairSums[pIdx * 2] += cnt;
        pairSums[pIdx * 2 + 1] += area;

        rowCells.push({ text: String(cnt), style: 'tdCenter' });
        rowCells.push({ text: area.toFixed(2), style: 'tdRight' });
      });

      tableBody.push(rowCells);
    });

    // Total Row
    const totalSurvSum = dataRows.reduce((a, b) => a + Number(b.total712Count || 0), 0);
    const totalArSum = dataRows.reduce((a, b) => a + parseFloat(b.totalAreaHa || 0), 0);

    const totalCells = [
      { text: 'एकूण', style: 'tdTotalCenter' },
      { text: '-', style: 'tdTotalCenter' },
      { text: String(totalSurvSum), style: 'tdTotalCenter' },
      { text: totalArSum.toFixed(2), style: 'tdTotalRight' }
    ];
    goshwaraDef.superHeaders.forEach((sh, pIdx) => {
      totalCells.push({ text: String(pairSums[pIdx * 2]), style: 'tdTotalCenter' });
      totalCells.push({ text: pairSums[pIdx * 2 + 1].toFixed(2), style: 'tdTotalRight' });
    });
    tableBody.push(totalCells);

    return [
      banner,
      {
        table: {
          headerRows: 3,
          dontBreakRows: true,
          widths,
          body: tableBody
        },
        layout: {
          fillColor: (rowIndex) => {
            if (rowIndex === 0 || rowIndex === 1) return isDistrict ? '#0F766E' : '#1E3A8A';
            if (rowIndex === 2) return '#F1F5F9';
            if (rowIndex === tableBody.length - 1) return '#E2E8F0';
            return rowIndex % 2 === 0 ? '#F8FAFC' : null;
          },
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#94A3B8',
          vLineColor: () => '#94A3B8',
          paddingLeft: () => 1.5,
          paddingRight: () => 1.5,
          paddingTop: () => 2,
          paddingBottom: () => 2
        },
        margin: [0, 0, 0, 18]
      }
    ];
  }

  // Build Goshwara Section Content
  const goshwaraSectionContent = [];
  goshwaraSectionContent.push({
    text: isOnlySummary ? 'गोषवारा (Summary Rollup - Sheet 2 Format)' : 'विभाग १: गोषवारा (Summary Rollup - Sheet 2 Format)',
    style: 'headerSub',
    margin: [0, 4, 0, 6]
  });

  // 1. गावाचा गोषवारा
  if (villageRows.length > 0) {
    goshwaraSectionContent.push(...buildDynamicCategoryGoshwaraTable('गावाचा गोषवारा (Village Level Summary)', 'गावाचे नाव', villageRows, false));
  } else if (talukaRows.length === 0) {
    goshwaraSectionContent.push(...buildDynamicCategoryGoshwaraTable('गावाचा गोषवारा (Village Level Summary)', 'गावाचे नाव', rawSummary, false));
  }

  // 2. तालुक्याचा गोषवारा
  if (talukaRows.length > 0) {
    goshwaraSectionContent.push(...buildDynamicCategoryGoshwaraTable('तालुक्याचा गोषवारा (Taluka Level Summary)', 'तालुक्याचे नाव', talukaRows, false));
  }

  // 3. जिल्हाचा गोषवारा
  if (districtRows.length > 0) {
    goshwaraSectionContent.push(...buildDynamicCategoryGoshwaraTable('जिल्हाचा गोषवारा (District Level Summary)', 'जिल्हाचे नाव', districtRows, true));
  }

  // Detailed Table Body
  const parcelHeaders = detailedCols.map(c => ({ text: c.label, style: 'th' }));
  const parcelBody = [parcelHeaders];

  // Up to 250 parcels for PDF performance
  (parcels || []).slice(0, 250).forEach((p, idx) => {
    const pt = resolveParcel46Points(p);
    const row = detailedCols.map(c => {
      const val = c.getValue(p, pt, idx);
      if (c.isOwner) return { text: String(val || '-'), style: 'tdBold' };
      if (c.isArea) return { text: Number(val || 0).toFixed(4), style: 'tdRight' };
      if (c.align === 'left') return { text: String(val || '-'), style: 'td' };
      return { text: String(val || '-'), style: 'tdCenter' };
    });
    parcelBody.push(row);
  });

  // Detailed Table column widths
  const detailedWidths = detailedCols.map(c => {
    if (c.key === 'srNo') return 22;
    if (c.key === 'village') return 80;
    if (c.key === 'surveyNo') return 48;
    if (c.key === 'area') return 42;
    if (c.key === 'owner') return 120;
    if (c.key === 'tenureClass' || c.key === 'tenureType') return 60;
    return 65;
  });

  const docDefinition = {
    pageOrientation: 'landscape',
    pageSize: 'A4',
    pageMargins: [14, 14, 14, 16],
    defaultStyle: { font: 'Nirmala' },
    content: [
      { text: 'महाराष्ट्र शासन - जिल्हाधिकारी कार्यालय, चंद्रपूर', style: 'headerMain' },
      { text: `${category.id}) ${category.nameMr}`, style: 'headerSub' },
      {
        columns: [
          { text: `कार्यक्षेत्र: ${scopeName}`, style: 'meta', bold: true },
          { text: `एकूण अभिलेख: ${(parcels || []).length} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`, style: 'meta', alignment: 'right' }
        ],
        margin: [0, 4, 0, 8]
      },
      ...goshwaraSectionContent,
      ...(isOnlySummary ? [] : [
        { text: 'विभाग २: सविस्तर ७/१२ अभिलेख व खातेदार यादी', style: 'headerSub', pageBreak: 'before', margin: [0, 6, 0, 4] },
        {
          table: {
            headerRows: 1,
            widths: detailedWidths,
            body: parcelBody
          },
          layout: {
            fillColor: (rowIndex) => {
              if (rowIndex === 0) return '#1E3A8A';
              return rowIndex % 2 === 0 ? '#F8FAFC' : null;
            },
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#CBD5E1',
            vLineColor: () => '#CBD5E1'
          }
        }
      ]),
      {
        margin: [0, 20, 0, 0],
        columns: [
          {
            text: 'माहिती तयार करणाऱ्याचे नाव व पदनाम\\n(तलाठी / महसूल सहाय्यक)\\nदिनांक: ____________\\nस्वाक्षरी: ____________',
            style: 'sig'
          },
          {
            text: 'माहिती तपासणी करणाऱ्या अधिकाऱ्याचे नाव व पदनाम\\n(मंडळ अधिकारी / नायब तहसीलदार)\\nदिनांक: ____________\\nस्वाक्षरी: ____________',
            style: 'sig',
            alignment: 'center'
          },
          {
            text: 'माहिती अचूक असल्याबाबत प्रमाणन\\n\\nतहसिलदार: ____________\\nचंद्रपूर',
            style: 'sig',
            alignment: 'right'
          }
        ]
      }
    ],
    styles: {
      headerMain: { fontSize: 13, bold: true, alignment: 'center', color: '#1E3A8A' },
      headerSub: { fontSize: 11, bold: true, alignment: 'center', color: '#B45309', margin: [0, 2, 0, 1] },
      headerMini: { fontSize: 9.5, bold: true, alignment: 'center', color: '#0F172A', margin: [0, 0, 0, 4] },
      meta: { fontSize: 8.5, color: '#334155' },
      tableBanner: { fontSize: 9.5, bold: true, color: '#FFFFFF', alignment: 'center', margin: [0, 3, 0, 3] },
      th: { fontSize: 6.8, bold: true, alignment: 'center', color: '#FFFFFF', margin: [0, 2, 0, 2] },
      thSub: { fontSize: 6.2, bold: true, alignment: 'center', color: '#FFFFFF', margin: [0, 1, 0, 1] },
      thNum: { fontSize: 5.8, bold: false, alignment: 'center', color: '#475569', margin: [0, 1, 0, 1] },
      td: { fontSize: 6.2, margin: [1, 1, 1, 1] },
      tdCenter: { fontSize: 6.2, alignment: 'center', margin: [1, 1, 1, 1] },
      tdRight: { fontSize: 6.2, alignment: 'right', margin: [1, 1, 1, 1] },
      tdBold: { fontSize: 6.2, bold: true, color: '#1E3A8A', margin: [1, 1, 1, 1] },
      tdTotalCenter: { fontSize: 6.8, bold: true, alignment: 'center', color: '#0F172A', margin: [1, 2, 1, 2] },
      tdTotalRight: { fontSize: 6.8, bold: true, alignment: 'right', color: '#0F172A', margin: [1, 2, 1, 2] },
      sig: { fontSize: 8.5, bold: true, color: '#0F172A', lineHeight: 1.3 }
    }
  };

  const pdf = pdfmake.createPdf(docDefinition);
  const buffer = await pdf.getBuffer();
  if (typeof res?.send === 'function') {
    res.send(buffer);
  } else if (typeof res?.end === 'function') {
    res.end(buffer);
  }
  return buffer;
}
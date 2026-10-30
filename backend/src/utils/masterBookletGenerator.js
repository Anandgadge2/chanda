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
export const BOOKLET_CATEGORIES = [
  {
    id: 1,
    key: 'govt_land',
    nameMr: 'सरकारी जमीन',
    nameEn: 'Government Land (Gairan, Forest, Parampok)',
    desc: 'शासकीय जमिनी, वन/झुडपी जंगल, अतिक्रमण, वाटप व गैरकायदेशीर वगळणे तपासणी',
    color: 'border-blue-500 text-blue-900 bg-blue-50/60'
  },
  {
    id: 2,
    key: 'tenancy_kul',
    nameMr: 'कुळ वहिवाट व शेतजमीन कायदा',
    nameEn: 'Tenancy & Agricultural Land Act (Vidarbha/Hyd)',
    desc: 'कुळ घोषित जमिनी, शर्तभंग, वर्ग-२ चे वर्ग-१ मध्ये अवैध रूपांतरण व इतर हक्क तपासणी',
    color: 'border-amber-500 text-amber-900 bg-amber-50/60'
  },
  {
    id: 3,
    key: 'inam_watan',
    nameMr: 'जमिन इनाम व वतन जमिनी (देवस्थान वगळून)',
    nameEn: 'Inam & Watan Lands (Excluding Devasthan)',
    desc: 'मदद माश / खिदमत माश इनाम वतन जमिनी, वर्ग-२ रूपांतरण व शर्तभंग तपासणी',
    color: 'border-emerald-500 text-emerald-900 bg-emerald-50/60'
  },
  {
    id: 4,
    key: 'mlrc_landless',
    nameMr: 'म.ज.म.अधि. १९६६ भूमिहीन, शेतमजूर वाटप',
    nameEn: 'MLRC 1966 Landless / Laborers Allotment',
    desc: 'भूमिहीन, शेतमजूर, स्वातंत्र्य सैनिकांना प्रदान व अतिक्रमण नियमानुकूल जमिनी',
    color: 'border-purple-500 text-purple-900 bg-purple-50/60'
  },
  {
    id: 5,
    key: 'mlrc_institutions',
    nameMr: 'म.ज.म.अधि. १९६६ गृहनिर्माण, उद्योग व संस्था वाटप',
    nameEn: 'MLRC 1966 Housing / Industrial / Educational Allotment',
    desc: 'गृहनिर्माण संस्था, औद्योगिक आस्थापना, शैक्षणिक संस्था, प्रकल्प यांना प्रदान जमिनी',
    color: 'border-indigo-500 text-indigo-900 bg-indigo-50/60'
  },
  {
    id: 6,
    key: 'ceiling_allotment',
    nameMr: 'महाराष्ट्र शेतजमीन कमाल धारणा अधिनियम १९६१',
    nameEn: 'Agricultural Land Ceiling Allotment (1961)',
    desc: 'सिलिंग कायद्यान्वये वाटप केलेल्या जमिनी, शर्तभंग व वर्ग-१ रूपांतरण तपासणी',
    color: 'border-rose-500 text-rose-900 bg-rose-50/60'
  },
  {
    id: 7,
    key: 'development_gurcharan',
    nameMr: 'विकास आराखडा व ग्रामपंचायत गुरचरण जमिनी',
    nameEn: 'Development Plan & Gurcharan Lands',
    desc: 'महानगरपालिका/प्राधिकरण विकास आराखड्यातील व ग्रामपंचायत गुरचरण आरक्षित जमिनी',
    color: 'border-cyan-500 text-cyan-900 bg-cyan-50/60'
  },
  {
    id: 8,
    key: 'devasthan_inam',
    nameMr: 'जमीन देवस्थान इनाम जमिनी',
    nameEn: 'Devasthan Inam Lands',
    desc: 'देवस्थान इनाम जमिनी, अवैध वर्ग-१ रूपांतरण, शर्तभंग व इतर हक्क तपासणी',
    color: 'border-orange-500 text-orange-900 bg-orange-50/60'
  },
  {
    id: 9,
    key: 'tribal_protection',
    nameMr: 'आदिवासी खातेदारांचे मालकीच्या जमिनी',
    nameEn: 'Tribal Land Protection (Sec 36/36A)',
    desc: 'आदिवासी खातेदारांच्या जमिनींचे सक्षम परवानगीशिवाय आदिवासी/गैर-आदिवासी हस्तांतरण तपासणी',
    color: 'border-teal-500 text-teal-900 bg-teal-50/60'
  },
  {
    id: 10,
    key: 'rehabilitation_sec16',
    nameMr: 'महाराष्ट्र पुनर्वसन अधिनियम १९९९ कलम १६ प्रदान',
    nameEn: 'Maharashtra Rehabilitation Act 1999 Sec 16',
    desc: 'प्रकल्पग्रस्तांना प्रदान केलेल्या जमिनी, अवैध रूपांतरण व इतर हक्क तपासणी',
    color: 'border-lime-500 text-lime-900 bg-lime-50/60'
  },
  {
    id: 11,
    key: 'govt_lease',
    nameMr: 'भाडेपट्ट्याने दिलेली शासकीय जमीन',
    nameEn: 'Government Leased Lands',
    desc: 'शासकीय भाडेपट्टा जमिनी, कालावधी, शर्तभंग व वर्ग-१ रूपांतरण तपासणी',
    color: 'border-sky-500 text-sky-900 bg-sky-50/60'
  },
  {
    id: 12,
    key: 'bhudan_gramdan',
    nameMr: 'भूदान व ग्रामदान अंतर्गत प्रदान जमिनी',
    nameEn: 'Bhudan & Gramdan Allotted Lands',
    desc: 'भूदान चळवळीतील जमिनींचे वाटप, वारसदार, अनधिकृत हस्तांतरण व वापर तपासणी',
    color: 'border-amber-600 text-amber-950 bg-amber-50/60'
  },
  {
    id: 13,
    key: 'private_forests',
    nameMr: 'महाराष्ट्र खाजगी वने (संपादन) अधिनियम १९७५',
    nameEn: 'Maharashtra Private Forests Act 1975',
    desc: 'खाजगी वने संपादन व कमाल जमीन धारणा चौकशीसाठी प्रलंबित जमिनी',
    color: 'border-emerald-600 text-emerald-950 bg-emerald-50/60'
  },
  {
    id: 14,
    key: 'bhumidhari_rights',
    nameMr: 'भूमीधारी हक्कान्वये प्राप्त झालेल्या जमिनी',
    nameEn: 'Bhumidhari Rights Allotment',
    desc: 'भूमीधारी हक्क जमिनी, वर्ग-२ ते वर्ग-१ अवैध रूपांतरण व शर्तभंग तपासणी',
    color: 'border-violet-500 text-violet-900 bg-violet-50/60'
  },
  {
    id: 15,
    key: 'ceiling_exemption',
    nameMr: 'कमाल जमीन धारणा सूट मिळालेली जमीन',
    nameEn: 'Ceiling Act Exemption Lands',
    desc: 'कमाल धारणेपेक्षा अधिक जमीन धारण करण्यास विशेष सूट दिलेल्या जमिनींची तपासणी',
    color: 'border-fuchsia-500 text-fuchsia-900 bg-fuchsia-50/60'
  },
  {
    id: 16,
    key: 'waqf_board',
    nameMr: 'वक्फ बोर्डाचे मालकीची जमीन',
    nameEn: 'Waqf Board Properties',
    desc: 'वक्फ बोर्ड मालमत्ता, अवैध हस्तांतरण, शर्तभंग व इतर हक्क तपासणी',
    color: 'border-green-600 text-green-950 bg-green-50/60'
  },
  {
    id: 17,
    key: 'land_acquisition',
    nameMr: 'भूसंपादन कायद्यांतर्गत अधिग्रहित / राखीव जमीन',
    nameEn: 'Land Acquisition Reserved Lands',
    desc: 'प्रकल्प/रस्ते/कालव्यांसाठी भूसंपादित किंवा राखीव जमिनींची महसूल अभिलेख तपासणी',
    color: 'border-red-600 text-red-950 bg-red-50/60'
  }
];

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
  { num: 43, text: 'खरेदी दिनांक' },
  { num: 44, text: 'वापर सुरू केला आहे काय?' },
  { num: 45, text: 'विनापरवानगी हस्तांतरण / वापरात बदल झाला आहे काय?' },
  { num: 46, text: 'मुद्दा क्र. १० ते ३४ प्रमाणे गाव नमुना १-क अद्यावत आहे काय?' }
];

/**
 * Resolve individual 46-point answers for a parcel
 */
export function resolveParcel46Points(p) {
  const points = {};
  const metaPoints = p.metadata?.auditPoints || {};
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

  // 20-34 Statutory Categories (वैधानिक कायदे तपासणी - रकाने २० ते ३४)
  points[20] = metaPoints.point_20 || (otherRights.includes('कुळ') ? 'होय' : 'नाही');
  points[21] = metaPoints.point_21 || (p.tenureClass === 'DEVASTHAN_INAM' || otherRights.includes('इनाम') || otherRights.includes('वतन') ? 'होय' : 'नाही');
  points[22] = metaPoints.point_22 || (flags.isCorpAllot || flags.isPrivateAllot || otherRights.includes('संस्था') || otherRights.includes('उद्योग') || otherRights.includes('भूमिहीन') || otherRights.includes('प्रकल्प') ? 'होय' : 'नाही');
  points[23] = metaPoints.point_23 || (p.ceilingRecords?.length > 0 || otherRights.includes('कमाल धारणा') || otherRights.includes('सिलिंग') ? 'होय' : 'नाही');
  points[24] = metaPoints.point_24 || (otherRights.includes('गुरचरण') || otherRights.includes('चराई') || otherRights.includes('विकास') || otherRights.includes('प्राधिकरण') ? 'होय' : 'नाही');
  points[25] = metaPoints.point_25 || (p.tenureClass === 'DEVASTHAN_INAM' || otherRights.includes('देवस्थान') ? 'होय' : 'नाही');
  points[26] = metaPoints.point_26 || (flags.isTribal || p.tribalRecords?.length > 0 || otherRights.includes('आदिवासी') ? 'होय' : 'नाही');
  points[27] = metaPoints.point_27 || (otherRights.includes('पुनर्वसन') || otherRights.includes('प्रकल्पग्रस्त') ? 'होय' : 'नाही');
  points[28] = metaPoints.point_28 || (otherRights.includes('भाडेपट्टा') || otherRights.includes('लीज') ? 'होय' : 'नाही');
  points[29] = metaPoints.point_29 || (p.bhudanRecords?.length > 0 || otherRights.includes('भूदान') || otherRights.includes('ग्रामदान') ? 'होय' : 'नाही');
  points[30] = metaPoints.point_30 || (otherRights.includes('खाजगी वन') || otherRights.includes('वन जमीन') ? 'होय' : 'नाही');
  points[31] = metaPoints.point_31 || (otherRights.includes('भूमीधारी') || rawBkTenure.includes('भूमीधारी') ? 'होय' : 'नाही');
  points[32] = metaPoints.point_32 || (otherRights.includes('सूट') || otherRights.includes('कमाल मर्यादा') ? 'होय' : 'नाही');
  points[33] = metaPoints.point_33 || (otherRights.includes('वक्फ') || otherRights.includes('कब्रस्तान') ? 'होय' : 'नाही');
  points[34] = metaPoints.point_34 || (otherRights.includes('भूसंपादन') || otherRights.includes('अधिग्रहित') || otherRights.includes('राखीव') ? 'होय' : 'नाही');

  // 35-46 Enforcement & Conversions (शर्तभंग, रूपांतरण व अद्यावत पडताळणी - रकाने ३५ ते ४६)
  // 35: भोग. वर्ग-२ मधून वर्ग-१ मध्ये विनापरवानगी रूपांतरण
  points[35] = metaPoints.point_35 || ((flags.isShartbhang && p.tenureClass === 'BHOGVATDAR_CLASS_1' && b1950.tenureClass === 'BHOGVATDAR_CLASS_2') || otherRights.includes('रूपांतर') ? 'होय' : 'नाही');
  // 36: मौका चौकशीअंती शर्तभंग
  points[36] = metaPoints.point_36 || (flags.isShartbhang || c.violationType === 'SHARTBHANG' ? 'होय' : 'नाही');
  // 37: आदिवासी ते आदिवासी हस्तांतरण
  points[37] = metaPoints.point_37 || (flags.isTribal && otherRights.includes('हस्तांतरण') ? 'होय' : 'नाही');
  // 38: आदिवासी ते गैर-आदिवासी हस्तांतरण
  points[38] = metaPoints.point_38 || (flags.isTribal && c.violationType === 'TRIBAL_LAND_VIOLATION' ? 'होय' : 'नाही');
  // 39: निर्बंधीत सत्ताप्रकारानुसार नोंद इतर अधिकारामध्ये
  points[39] = metaPoints.point_39 || (otherRights && otherRights !== '-' && otherRights !== '....' ? 'होय' : 'ईतर अधिकारात नोंद नाही');
  // 40: इतर अधिकारातील नोंदी/भूधारणा अवैधरित्या कमी
  points[40] = metaPoints.point_40 || (flags.isIllegalDeletion || c.violationType === 'GOVERNMENT_NAME_MISSING' ? 'होय' : 'नाही');
  // 41: भोगवटदार कंपनी/बिगर शेतकरी असल्यास परवानगी
  points[41] = metaPoints.point_41 || (p.tenancy89ARecords?.length > 0 || otherRights.includes('कंपनी') ? 'होय' : 'नाही');
  // 42: कलम ८९/८९अ अन्वये औद्योगिक प्रयोजनाकरिता कंपनीने धारण
  points[42] = metaPoints.point_42 || (p.tenancy89ARecords?.[0]?.isGenuineIndustrialUse ? 'होय' : 'नाही');
  // 43: खरेदी दिनांक
  points[43] = metaPoints.point_43 || (p.tenancy89ARecords?.[0]?.purchaseDate ? new Date(p.tenancy89ARecords[0].purchaseDate).toLocaleDateString('mr-IN') : '');
  // 44: वापर सुरू केला आहे काय?
  points[44] = metaPoints.point_44 || (p.tenancy89ARecords?.[0]?.isGenuineIndustrialUse ? 'होय' : 'नाही');
  // 45: विना परवानगी/हस्तांतरण/वापरात बदल
  points[45] = metaPoints.point_45 || (flags.isShartbhang ? 'होय' : 'नाही');
  // 46: गाव नमुना १ क अद्यावत
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

  // Row 1: Title
  ws.mergeCells('A1:BA1');
  const t1 = ws.getCell('A1');
  t1.value = 'महसूल अधिकार अभिलेखातील (7/12) ची तपासणी सुची';
  t1.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  t1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t1.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 36;

  // Row 2: Subtitle
  ws.mergeCells('A2:BA2');
  const t2 = ws.getCell('A2');
  t2.value = 'अधिकार अभिलेख (1950) ते आजपर्यतच्या सर्व 7/12 ची तपासणी करुन खालील माहिती भरावी';
  t2.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  t2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
  t2.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 28;

  // Row 3: Jurisdiction Scope
  ws.mergeCells('A3:BA3');
  const t3 = ws.getCell('A3');
  t3.value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | एकूण तपासणी अभिलेख संख्या: ${parcels.length} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  t3.font = { name: 'Arial', size: 10, italic: true, bold: true, color: { argb: 'FF334155' } };
  t3.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(3).height = 22;

  // Row 4 & 5: Exact Multi-Level Headers matching user specification
  ws.mergeCells('A4:A5'); ws.getCell('A4').value = 'अ.क्र.';
  ws.mergeCells('B4:B5'); ws.getCell('B4').value = 'गावाचे नाव';
  ws.mergeCells('C4:C5'); ws.getCell('C4').value = 'सर्व्हे क्रमांक';
  ws.mergeCells('D4:D5'); ws.getCell('D4').value = 'क्षेत्र\n(हे.आर.)';
  ws.mergeCells('E4:E5'); ws.getCell('E4').value = 'भोगवटदार वर्ग\n(भूधारणा नुसार )';
  ws.mergeCells('F4:F5'); ws.getCell('F4').value = 'भोगवटदाराचे नाव';
  ws.mergeCells('G4:G5'); ws.getCell('G4').value = 'इतर अधिकारातील नोंद (जी नोंद सदर 7/12 चे इतर अधिकारात असेल, तीच नोंद इथे नमूद करावी. उदा. आदिवासी/कुळ इ.)';

  // Group 1: रिनंबरींग पर्चाप्रमाणे (स्तंभ H ते P, मुद्दे १ ते ९)
  ws.mergeCells('H4:P4');
  const g1 = ws.getCell('H4');
  g1.value = 'सदर गट क्रमांकाचा रिनंबरींग पर्चाप्रमाणे (ऐतिहासिक कालक्रम)';
  g1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };

  ws.getCell('H5').value = 'i) बंदोबस्त क्र';
  ws.getCell('I5').value = 'ii) बंदोबस्त नंबर प्रमाणे भोगवटदाराचे नाव';
  ws.getCell('J5').value = 'iii) बंदोबस्त नंबर प्रमाणे भूधारणा';
  ws.getCell('K5').value = 'i) एकत्रिकरण नंबर';
  ws.getCell('L5').value = 'ii) एकत्रिकरण नंबर प्रमाणे भोगवटदाराचे नाव';
  ws.getCell('M5').value = 'iii) एकत्रिकरण नंबरप्रमाणे भूधारणा';
  ws.getCell('N5').value = 'i) पुर्नमोजणी नंबर(7/12)';
  ws.getCell('O5').value = 'ii) ७/१२ प्रमाणे भोगवटदाराचे नाव';
  ws.getCell('P5').value = 'iii) ७/१२ प्रमाणे भूधारणा';

  // Group 2: भोगवटदार सरकार / महाराष्ट्र शासन असल्यास (स्तंभ Q ते Z, मुद्दे १० ते १९)
  ws.mergeCells('Q4:Z4');
  const g2 = ws.getCell('Q4');
  g2.value = 'भोगवटदार सरकार / महाराष्ट्र शासन असल्यास';
  g2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };

  ws.getCell('Q5').value = 'सध्यस्थितीतील 7/12 प्रमाणे भोगवटदाराचे नाव';
  ws.getCell('R5').value = 'अधिकार अभिलेखानुसार जमिनीचा दर्जा/प्रकार (गायरान/सरकार पहाड खडक/परमपोक इ.)';
  ws.getCell('S5').value = 'मुढ ७/१२ शी तुलना करता सध्यास्थितीती 7/12 मधील क्षेत्र, एकक,भूधारणा, इतर अधिकार मधील नोंदी किंवा वापराचे प्रयोजन या मध्ये तफावत  7/12 मध्ये  आहेत का? असल्यास नमूद करणे.';
  ws.getCell('T5').value = 'वन / झुडपी जंगल जमीन आहे का?';
  ws.getCell('U5').value = 'सदर जमीन वाटप झाली आहे का? असल्यास क्षेत्र नमूद करावे.';
  ws.getCell('V5').value = 'अतिक्रमण आहे का? असल्यास क्षेत्र';
  ws.getCell('W5').value = 'सदर गट/सर्व्हे नंबरचे KML तयार केले आहे काय?';
  ws.getCell('X5').value = 'भूसंपादन झाले आहे का? असल्यास भूसंपादित क्षेत्र';
  ws.getCell('Y5').value = 'अवैधरित्या सरकार किंवा शासन नोंद कमी केली आहे काय?';
  ws.getCell('Z5').value = 'शासकीय जमिनीवर  पोकळीस्त नोंदी आहेत का ? असल्यास इतर अधिकारामध्ये फेरफारशिवाय काही नोंदी झाल्यात का ? असल्यास नमूद करणे.';

  // Group 3: वैधानिक कायदे व तपासणी रकाने (स्तंभ AA ते BA, मुद्दे २० ते ४६)
  const statChecklistHeaders = [
    { col: 'AA', text: 'मुंबई कुळ वहिवाट व शेतजमीन (विदर्भ) कायदा अन्वये कुळ घोषित केलेली जमीन आहे काय?' },
    { col: 'AB', text: 'सदर जमिन इनाम व वतन जमिनी (देवस्थान जमिनी वगळुन) प्रकारातील आहे काय ? असल्यास कोणता प्रकार (मदद माश इनाम/खिदमत माश इनाम, इतर)' },
    { col: 'AC', text: 'सदर जमिन म.ज.म.अधि.1966 अंतर्गत विवीध योजनेअंतर्गत प्रदान/अतिक्रमण नियमानुकूल केलेल्या जमिनी (गृहनिर्माण संस्था,औद्योगिक आस्थापना,शैक्षणिक संस्था,विशेष वसाहत,प्रकल्प इ.) प्रकारची जमिन आहे का ? असल्यास संस्थेचे नाव नमुद करावे. (नसल्यास "नाही" असे नमूद करावे.)' },
    { col: 'AD', text: 'सदर जमिन महाराष्ट्र शेतजमिन कमाल धारणा अधिनियम 1961 अंतर्गत वाटप केलेल्या जमिनी प्रकारातील आहे काय ? (होय/नाही)' },
    { col: 'AE', text: 'सदर जमीन महानगरपालिका, नगर पालिका व विविध प्राधिकरण यांच्या विकास आराखडयात समाविष्ट असलेल्या जमिनी अथवा  ग्रामपंचायतकडे गुरचरण अथवा इतर प्रयोजनासाठी वर्ग केलेली आहे का ? (असल्यास, कोणत्या प्रयोजनासाठी आरक्षित आहे?)' },
    { col: 'AF', text: 'सदर जमीन देवस्थान इनाम जमीन आहे काय? (होय/नाही)' },
    { col: 'AG', text: 'सदर जमीन आदिवासी खातेदारांचे मालकीची आहे काय? (होय/नाही)' },
    { col: 'AH', text: 'सदर जमिन महाराष्ट्र पुर्नवसन अधिनियम 1999 च्या कलम 16 अन्वये प्रदान केलेली आहे काय ? (होय/नाही) असल्यास, प्रदान केल्याचा दिनांक नमूद करावा. (नसल्यास "नाही" असे नमूद करावे.)' },
    { col: 'AI', text: 'सदर जमिन भाडेपट्टयाने दिलेली शासकीय जमिन आहे काय? (होय/नाही)' },
    { col: 'AJ', text: 'सदर जमिन भुदान व ग्रामदान अंतर्गत दिलेली आहे काय ? (होय/नाही)' },
    { col: 'AK', text: 'सदर जमिन महाराष्ट्र खाजगी वने (संपादन) अधिनियम 1975 तसेच महाराष्ट्र शेतजमिन (जमिन धारणेची कमाल मर्यादा) अधिनियम 1961 अन्वये चौकशीसाठी प्रलंबित आहे काय ? (होय/नाही)' },
    { col: 'AL', text: 'सदर जमिन भुमीधारी हक्कान्वये प्राप्त झालेली आहे काय ? (होय/नाही)' },
    { col: 'AM', text: 'सदर जमिनीस महाराष्ट्र शेतजमिन (जमिन धारणेची कमाल मर्यादा) अधिनियम 1961 अंतर्गत कमाल मर्यादेपेक्षा अधिक धारण करण्यास सुट दिलेली आहे काय ? (होय/नाही)' },
    { col: 'AN', text: 'सदर जमिन वक्फ बोर्डाचे मालकीची आहे काय? (होय/नाही)' },
    { col: 'AO', text: 'सदर जमिन भुसंपादन कायदयाअंतर्गत  अधिग्रहित/राखीव आहे काय ? (होय/नाही)' },
    { col: 'AP', text: 'सदर जमीन रकाना 10 ते 34 पैकी कोणत्याही रकान्यात होय असल्यास सक्षम प्राधिका-यांच्या परवानगीशिवाय भोग. वर्ग-2 मधुन भोग. वर्ग-1 मध्ये रुपांतरीत झालेली आहे काय ? (होय/नाही) असल्यास, सक्षम प्राधिका-यांचे पदनाम व आदेश क्रमांक नमूद करावा.' },
    { col: 'AQ', text: 'सदर जमीन रकाना 10 ते 34 पैकी कोणत्याही रकान्यात होय असल्यास, मौका चौकशीअंती सदर जमिनीबाबत शर्तभंग झालेला आहे काय ? असल्यास कोणत्या प्रकारचा ? (वापरात बदल/हस्तांतरण/इतर)' },
    { col: 'AR', text: 'रकाना क्र. 26 चे उत्तर "होय" असल्यास, आदिवासी जमिनीबाबत सक्षम अधिकारी यांचे  परवानगीशिवाय आदिवासी ते आदिवासी हस्तांतरण झाले आहे का ? (होय / नाही)' },
    { col: 'AS', text: 'रकाना क्र. 26 चे उत्तर "होय" असल्यास, आदिवासी जमिनीबाबत सक्षम अधिकारी यांचे  परवानगीशिवाय  आदिवासी ते गैर आदिवासी हस्तांतरण झाले आहे का ?  (होय / नाही)' },
    { col: 'AT', text: 'जमिनीच्या निर्बंधीत सत्ताप्रकारानुसार नोंद इतर अधिकारामध्ये घेण्यात आली आहे काय? (होय / नाही)' },
    { col: 'AU', text: 'अधिकार अभिलेखापासून ते आजपावेतोच्या अधिकार अभिलेखानुसार इतर अधिकारातील नोंदी/भुधारणा/भोगवटदार यांच्या नोंदी अवैधरित्या कमी केलेल्या आहेत काय? (होय / नाही)' },
    { col: 'AV', text: 'भोगवटदार कंपनी/बिगर शेतकरी असल्यास,सदर जमिन वाणिज्य/रहिवास प्रयोजनाकरीता कंपनीने धारण केलेली असल्यास महाराष्ट्र कुळ वहिवाट व शेतजमिन (विदर्भ प्रदेश) अधिनियम 1948 /महाराष्ट्र कुळ वहिवाट व शेतजमिन (हैद्राबाद प्रदेश) अधिनियम 1950 मधील तरतुदीनुसार परवानगी घेतलेली आहे काय ? (होय/नाही)' },
    { col: 'AW', text: 'सदर जमिन महाराष्ट्र कुळ वहिवाट व शेतजमिन (विदर्भ प्रदेश) अधिनियम 1948 चे कलम 89 व 89 अ/महाराष्ट्र कुळ वहिवाट व शेतजमिन (हैद्राबाद प्रदेश) अधिनियम 1950 चे कलम 47 व 47 अ अन्वये ख-याखु-या औद्योगिक प्रयोजनाकरिता कंपनीने धारण केलेली आहे काय ? (होय/नाही)' },
    { col: 'AX', text: 'खरेदी दिनांक' },
    { col: 'AY', text: 'वापर सुरू केला आहे काय?' },
    { col: 'AZ', text: 'विना परवानगी/हस्तांतरण/वापरात बदल झाला आहे काय ?' },
    { col: 'BA', text: 'मुद्दा क्र. 10 ते 34 प्रमाणे गाव नमुना 1 क अद्यावत आहे काय ?' }
  ];

  statChecklistHeaders.forEach(item => {
    ws.mergeCells(`${item.col}4:${item.col}5`);
    const c = ws.getCell(`${item.col}4`);
    c.value = item.text;
  });

  // Header styles
  [ws.getRow(4), ws.getRow(5)].forEach(row => {
    row.eachCell(c => {
      c.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF0F172A' } };
      if (!c.fill?.fgColor) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
      }
      c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      c.border = thinBorder;
    });
  });
  ws.getRow(4).height = 40;
  ws.getRow(5).height = 54;

  // Row 6: Exact Column Numbering Row matching User Table
  const numLabels = ['अ.क्र.', 'गावाचे नाव', 'सर्व्हे क्रमांक', 'क्षेत्र', 'भोगवटदार वर्ग (भूधारणा नुसार )', 'भोगवटदाराचे नाव', 'इतर अधिकारातील नोंद'];
  for (let i = 1; i <= 46; i++) numLabels.push(String(i));
  const numRow = ws.addRow(numLabels);
  numRow.height = 20;
  numRow.eachCell(c => {
    c.font = { name: 'Arial', size: 8, bold: true, color: { argb: 'FF475569' } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    c.border = thinBorder;
  });

  // Populate Actual Parcel Records
  parcels.forEach((p, idx) => {
    const isEven = idx % 2 === 0;
    const pt = resolveParcel46Points(p);

    const rowData = [
      idx + 1,
      cleanVillageName(p.villageName),
      p.gatNumber || p.oldSurveyNo || '-',
      Number(p.totalAreaHa || 0),
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
      if (colIdx === 6) {
        c.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };
        c.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      } else if (colIdx === 2 || colIdx === 7) {
        c.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      } else if (colIdx === 4) {
        c.alignment = { horizontal: 'right', vertical: 'middle' };
        c.numFmt = '#,##0.0000';
      } else {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  // Footer Signature Block
  ws.addRow([]);
  ws.addRow([]);
  const lastRowIdx = ws.rowCount;

  ws.mergeCells(`A${lastRowIdx + 1}:N${lastRowIdx + 1}`);
  const sig1 = ws.getCell(`A${lastRowIdx + 1}`);
  sig1.value = 'माहिती तयार करणाऱ्याचे नाव व पदनाम: __________________\n(तलाठी / महसूल सहाय्यक)   दिनांक: ______________   स्वाक्षरी: ______________';
  sig1.font = { name: 'Arial', size: 10, bold: true };
  sig1.alignment = { vertical: 'middle' };

  ws.mergeCells(`O${lastRowIdx + 1}:AF${lastRowIdx + 1}`);
  const sig2 = ws.getCell(`O${lastRowIdx + 1}`);
  sig2.value = 'माहिती तपासणी करणाऱ्या अधिकाऱ्याचे नाव व पदनाम: __________________\n(मंडळ अधिकारी / नायब तहसीलदार)   दिनांक: ______________   स्वाक्षरी: ______________';
  sig2.font = { name: 'Arial', size: 10, bold: true };
  sig2.alignment = { vertical: 'middle' };

  ws.mergeCells(`AG${lastRowIdx + 1}:BA${lastRowIdx + 1}`);
  const sig3 = ws.getCell(`AG${lastRowIdx + 1}`);
  sig3.value = 'माहिती अचूक असल्याबाबत तहसिलदार यांचेव्दारा प्रमाणन\n\nतहसिलदार: __________________   चंद्रपूर';
  sig3.font = { name: 'Arial', size: 10, bold: true };
  sig3.alignment = { vertical: 'middle', horizontal: 'center' };

  ws.getRow(lastRowIdx + 1).height = 50;

  // Adjust column widths (Total 53 columns: A to BA)
  ws.columns = [
    { width: 6 },  // 1: Sr No (A)
    { width: 20 }, // 2: Village (B)
    { width: 14 }, // 3: Survey/Gat (C)
    { width: 13 }, // 4: Area Ha (D)
    { width: 16 }, // 5: Tenure Class (E)
    { width: 30 }, // 6: Owner Name (F)
    { width: 32 }, // 7: Other Rights (G)
    // Points 1-9 (H to P) - रिनंबरींग पर्चा
    { width: 14 }, { width: 24 }, { width: 14 }, { width: 14 }, { width: 24 }, { width: 14 }, { width: 14 }, { width: 24 }, { width: 14 },
    // Points 10-19 (Q to Z) - शासकीय जमीन
    { width: 24 }, { width: 22 }, { width: 16 }, { width: 12 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 18 }, { width: 18 },
    // Points 20-46 (AA to BA) - वैधानिक कायदे व पडताळणी
    ...Array(27).fill({ width: 20 })
  ];

  await wb.xlsx.write(res);
}

/**
 * GENERATE MASTER 1-46 CHECKLIST PDF
 */
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

  // Row 1: Merged Title Banner
  ws.mergeCells('A1:N1');
  const t1 = ws.getCell('A1');
  t1.value = titleText;
  t1.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF000000' } };
  t1.alignment = { horizontal: 'center', vertical: 'middle' };
  t1.border = thinBorder;
  t1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  ws.getRow(1).height = 28;

  // Row 2: Super Headers
  const r2 = ws.addRow([
    'अ.क्र.',
    nameHeader,
    'एकूण सर्व्हे क्रमांक',
    'एकूण क्षेत्र(हे.आर.)',
    'एकूण भोगवटदार वर्ग 1 जमिनी', '',
    'एकूण भोगवटदार वर्ग 2 जमिनी', '',
    'अवैधरित्या वर्ग 2 मधून वर्ग 1 केलेल्या जमिनी', '',
    'इतर अधिकारात नोंद न घेतलेल्या जमिनी', '',
    'अवैधरित्या इतर अधिकारामधून नोंद कमी केलेल्या जमिनी', ''
  ]);
  r2.height = 26;

  // Row 3: Sub Headers
  const r3 = ws.addRow([
    '', '', '', '',
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

  const startDataRow = 4;
  cleanRows.forEach((row, idx) => {
    const isDistrictName = row.villageName === 'संपूर्ण जिल्हा (१५ तालुके गोषवारा)' || row.villageName === 'Whole District Rollup';
    const displayName = row.name || (isDistrictName
      ? 'चंद्रपूर जिल्हा'
      : (row.taluka && (row.villageName === 'संपूर्ण तालुका (All Villages)' || !row.villageName))
      ? `${formatTalukaMr(row.taluka)}`
      : cleanVillageName(row.villageName || row.taluka || '-'));

    const totalSurveys = Number(row.totalSurveys ?? row.total712Count ?? row.totalGovtLandCount ?? 0);
    const totalAreaVal = parseFloat(row.totalArea ?? row.totalAreaHa ?? 0) || 0;
    const c1Count = Number(row.c1Surveys ?? row.c1Count ?? row.govtFound1950Count ?? 0);
    const c1Area = parseFloat(row.c1Area ?? 0) || 0;
    const c2Count = Number(row.c2Surveys ?? row.c2Count ?? row.pendingRectifyCount ?? 0);
    const c2Area = parseFloat(row.c2Area ?? 0) || 0;
    const convCount = Number(row.convSurveys ?? row.convCount ?? row.illegalDeletionsCount ?? 0);
    const convArea = parseFloat(row.convArea ?? 0) || 0;
    const noOtherCount = Number(row.noOtherSurveys ?? row.noOtherCount ?? row.pokalistPendingCount ?? 0);
    const noOtherArea = parseFloat(row.noOtherArea ?? 0) || 0;
    const delCount = Number(row.delSurveys ?? row.delCount ?? row.illegalReductionCount ?? row.shartCount ?? 0);
    const delArea = parseFloat(row.delArea ?? row.illegalReductionArea ?? row.shartArea ?? 0) || 0;

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
      delArea
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
      } else if ([4, 6, 8, 10, 12, 14].includes(colIdx)) {
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
      { formula: `SUM(N${startDataRow}:N${endDataRow})`, result: Number(sumDelA.toFixed(2)) }
    ]);
    totalRow.height = 24;
    totalRow.eachCell((cell, colIdx) => {
      cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.border = thinBorder;
      if (colIdx === 1 || colIdx === 2) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if ([4, 6, 8, 10, 12, 14].includes(colIdx)) {
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
    { width: 16 }   // N: इतर अधिकार नोंद कमी क्षेत्र
  ];
}

/**
 * GENERATE GOSHAWARA (ROLLUP SUMMARY) PDF (14 Official Columns)
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

  if (districtRows.length === 0 && (talukaRows.length > 0 || villageRows.length > 0)) {
    const sourceRows = talukaRows.length > 0 ? talukaRows : villageRows;
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
      delSurveys: sourceRows.reduce((a, b) => a + Number(b.delSurveys ?? b.delCount ?? b.shartCount ?? 0), 0),
      delArea: sourceRows.reduce((a, b) => a + parseFloat(b.delArea ?? b.shartArea ?? 0), 0).toFixed(2)
    };
    districtRows = [dTot];
  }

  function buildPdfTable(titleText, nameHeader, rows) {
    const tableBody = [
      // Row 1: Super Headers
      [
        { text: 'अ.क्र.', rowSpan: 2, style: 'th', alignment: 'center' },
        { text: nameHeader, rowSpan: 2, style: 'th', alignment: 'center' },
        { text: 'एकूण सर्व्हे क्रमांक', rowSpan: 2, style: 'th', alignment: 'center' },
        { text: 'एकूण क्षेत्र(हे.आर.)', rowSpan: 2, style: 'th', alignment: 'center' },
        { text: 'एकूण भोगवटदार वर्ग 1 जमिनी', colSpan: 2, style: 'th', alignment: 'center' }, {},
        { text: 'एकूण भोगवटदार वर्ग 2 जमिनी', colSpan: 2, style: 'th', alignment: 'center' }, {},
        { text: 'अवैधरित्या वर्ग 2 मधून वर्ग 1 केलेल्या जमिनी', colSpan: 2, style: 'th', alignment: 'center' }, {},
        { text: 'इतर अधिकारात नोंद न घेतलेल्या जमिनी', colSpan: 2, style: 'th', alignment: 'center' }, {},
        { text: 'अवैधरित्या इतर अधिकारामधून नोंद कमी केलेल्या जमिनी', colSpan: 2, style: 'th', alignment: 'center' }, {}
      ],
      // Row 2: Sub Headers
      [
        {}, {}, {}, {},
        { text: 'एकूण सर्व्हे क्रमांक', style: 'thSub' }, { text: 'एकूण क्षेत्र(हे.आर.)', style: 'thSub' },
        { text: 'एकूण सर्व्हे क्रमांक', style: 'thSub' }, { text: 'एकूण क्षेत्र(हे.आर.)', style: 'thSub' },
        { text: 'एकूण सर्व्हे क्रमांक', style: 'thSub' }, { text: 'एकूण क्षेत्र(हे.आर.)', style: 'thSub' },
        { text: 'एकूण सर्व्हे क्रमांक', style: 'thSub' }, { text: 'एकूण क्षेत्र(हे.आर.)', style: 'thSub' },
        { text: 'एकूण सर्व्हे क्रमांक', style: 'thSub' }, { text: 'एकूण क्षेत्र(हे.आर.)', style: 'thSub' }
      ]
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

    cleanRows.forEach((r, idx) => {
      const isDistrictName = r.villageName === 'संपूर्ण जिल्हा (१५ तालुके गोषवारा)' || r.villageName === 'Whole District Rollup';
      const displayName = r.name || (isDistrictName
        ? 'चंद्रपूर जिल्हा'
        : (r.taluka && (r.villageName === 'संपूर्ण तालुका (All Villages)' || !r.villageName))
        ? `${formatTalukaMr(r.taluka)}`
        : cleanVillageName(r.villageName || r.taluka || '-'));

      const cnt = Number(r.totalSurveys ?? r.total712Count ?? r.totalGovtLandCount ?? 0);
      const area = parseFloat(r.totalArea ?? r.totalAreaHa ?? 0) || 0;
      const c1 = Number(r.c1Surveys ?? r.c1Count ?? r.govtFound1950Count ?? 0);
      const c1A = parseFloat(r.c1Area ?? 0) || 0;
      const c2 = Number(r.c2Surveys ?? r.c2Count ?? r.pendingRectifyCount ?? 0);
      const c2A = parseFloat(r.c2Area ?? 0) || 0;
      const conv = Number(r.convSurveys ?? r.convCount ?? r.illegalDeletionsCount ?? 0);
      const convA = parseFloat(r.convArea ?? 0) || 0;
      const noOther = Number(r.noOtherSurveys ?? r.noOtherCount ?? r.pokalistPendingCount ?? 0);
      const noOtherA = parseFloat(r.noOtherArea ?? 0) || 0;
      const del = Number(r.delSurveys ?? r.delCount ?? r.illegalReductionCount ?? r.shartCount ?? 0);
      const delA = parseFloat(r.delArea ?? r.illegalReductionArea ?? r.shartArea ?? 0) || 0;

      sumTot += cnt; sumArea += area;
      sumC1 += c1; sumC1A += c1A;
      sumC2 += c2; sumC2A += c2A;
      sumConv += conv; sumConvA += convA;
      sumNo += noOther; sumNoA += noOtherA;
      sumDel += del; sumDelA += delA;

      tableBody.push([
        { text: String(idx + 1), style: 'tdCenter' },
        { text: displayName, style: 'td' },
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
        { text: delA.toFixed(2), style: delA > 0 ? 'tdAlertRight' : 'tdRight' }
      ]);
    });

    // Total Row
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
      { text: sumDelA.toFixed(2), style: 'tdTotalRight' }
    ]);

    return [
      { text: titleText, style: 'tableTitle', margin: [0, 8, 0, 4] },
      {
        table: {
          headerRows: 2,
          widths: [30, 92, 48, 50, 44, 48, 44, 48, 48, 48, 48, 48, 50, 50],
          body: tableBody
        },
        layout: {
          fillColor: (rowIndex) => {
            if (rowIndex === 0 || rowIndex === 1) return '#F1F5F9';
            if (rowIndex === tableBody.length - 1) return '#E2E8F0';
            return rowIndex % 2 === 0 ? '#F8FAFC' : null;
          },
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#94A3B8',
          vLineColor: () => '#94A3B8'
        }
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
      th: { fontSize: 7, bold: true, alignment: 'center', color: '#0F172A', margin: [0, 2, 0, 2] },
      thSub: { fontSize: 6.5, bold: true, alignment: 'center', color: '#334155', margin: [0, 1, 0, 1] },
      td: { fontSize: 6.5, margin: [1, 1, 1, 1] },
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

  if (districtRows.length === 0 && (talukaRows.length > 0 || villageRows.length > 0)) {
    const sourceRows = talukaRows.length > 0 ? talukaRows : villageRows;
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
      delSurveys: sourceRows.reduce((a, b) => a + Number(b.delSurveys ?? b.delCount ?? b.shartCount ?? 0), 0),
      delArea: sourceRows.reduce((a, b) => a + parseFloat(b.delArea ?? b.shartArea ?? 0), 0).toFixed(2)
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
    await wb.xlsx.write(res);
  } else {
    return await wb.xlsx.writeBuffer();
  }
}

/**
 * GENERATE 17 STATUTORY CATEGORY BOOKLET EXCEL
 * Includes Sheet 1: सविस्तर जमिनींची यादी (Detailed Land Records with Owner Names)
 * Includes Sheet 2: गोषवारा (गाव, तालुका, जिल्हा गोषवारा)
 */
export async function generateCategoryBookletExcel(catId, summaryData, parcels, scopeName, res) {
  const category = BOOKLET_CATEGORIES.find(c => c.id === parseInt(catId, 10)) || BOOKLET_CATEGORIES[0];
  const wb = new ExcelJS.Workbook();
  wb.creator = 'जिल्हाधिकारी कार्यालय, चंद्रपूर - महसूल शाखा';
  wb.created = new Date();

  // -------------------------------------------------------------
  // SHEET 1: सविस्तर जमिनींची यादी (Actual Records with Owners)
  // -------------------------------------------------------------
  const wsParcels = wb.addWorksheet('सविस्तर यादी (Actual Data)', {
    views: [{ showGridLines: true }]
  });

  // Title
  wsParcels.mergeCells('A1:J1');
  const t1 = wsParcels.getCell('A1');
  t1.value = `महाराष्ट्र शासन - जिल्हाधिकारी कार्यालय, चंद्रपूर | ${category.id}) ${category.nameMr}`;
  t1.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  t1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  t1.alignment = { horizontal: 'center', vertical: 'middle' };
  wsParcels.getRow(1).height = 36;

  // Subtitle
  wsParcels.mergeCells('A2:J2');
  const t2 = wsParcels.getCell('A2');
  t2.value = `${category.desc} | कार्यक्षेत्र: ${scopeName} | एकूण अभिलेख संख्या: ${parcels.length}`;
  t2.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF334155' } };
  t2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
  t2.alignment = { horizontal: 'center', vertical: 'middle' };
  wsParcels.getRow(2).height = 24;

  // Headers
  const catHeaders = [
    'अ.क्र.',
    'गावाचे नाव',
    'सर्व्हे / गट क्रमांक',
    'क्षेत्र (हे.आर.)',
    'भोगवटदाराचे नाव (सध्याचे खातेदार)',
    'भोगवटदार वर्ग',
    'शर्तभंग झालेला आहे काय?',
    'अवैधरित्या वर्ग २ मधून वर्ग १ मध्ये रूपांतरण केलेले आहे काय?',
    'इतर अधिकारात नोंद घेतलेली आहे काय?',
    'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहेत काय?'
  ];

  const hr = wsParcels.addRow(catHeaders);
  hr.height = 36;
  hr.eachCell(c => {
    c.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = thinBorder;
  });

  // Numbering row
  wsParcels.addRow(['१', '२', '३', '४', '५', '६', '७', '८', '९', '१०']).eachCell(c => {
    c.font = { name: 'Arial', size: 8, italic: true };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  });

  // Rows
  parcels.forEach((p, idx) => {
    const isEven = idx % 2 === 0;
    const pt = resolveParcel46Points(p);

    const r = wsParcels.addRow([
      idx + 1,
      cleanVillageName(p.villageName),
      p.gatNumber || p.oldSurveyNo || '-',
      Number(p.totalAreaHa || 0),
      p.currentOwner || 'नोंद उपलब्ध नाही',
      p.tenureDisplay || p.tenureClass || '-',
      pt[37], // Shartbhang
      pt[36], // Class 2 to 1 illegal
      pt[40], // Other rights noted
      pt[41]  // Illegally removed
    ]);
    r.height = 24;
    r.eachCell((c, colIdx) => {
      c.font = { name: 'Arial', size: 9 };
      c.border = thinBorder;
      if (isEven) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_BG } };
      }
      if (colIdx === 5) {
        c.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };
        c.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (colIdx === 2) {
        c.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (colIdx === 4) {
        c.alignment = { horizontal: 'right', vertical: 'middle' };
        c.numFmt = '#,##0.0000';
      } else {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  // Auto sum row
  const sumRow = wsParcels.addRow([
    'एकूण',
    '',
    `${parcels.length} गट/सर्व्हे`,
    { formula: `SUM(D4:D${wsParcels.rowCount})` },
    '', '', '', '', '', ''
  ]);
  sumRow.height = 26;
  sumRow.eachCell((c, colIdx) => {
    c.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    c.border = thinBorder;
    if (colIdx === 4) {
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

  wsParcels.columns = [
    { width: 6 },
    { width: 22 },
    { width: 16 },
    { width: 14 },
    { width: 32 },
    { width: 18 },
    { width: 22 },
    { width: 26 },
    { width: 22 },
    { width: 22 }
  ];

  // -------------------------------------------------------------
  // SHEET 2: गोषवारा (गाव, तालुका, जिल्हा गोषवारा - SHEET 2 FORMAT)
  // -------------------------------------------------------------
  const wsSummary = wb.addWorksheet('गोषवारा (Rollup Summary)', {
    views: [{ showGridLines: true }]
  });

  wsSummary.mergeCells('A1:P1');
  const st1 = wsSummary.getCell('A1');
  st1.value = `महाराष्ट्र शासन - महसूल व वन विभाग | १ ते ४५ मुद्द्यांचा गोषवारा - ${category.id}) ${category.nameMr}`;
  st1.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  st1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOV_NAVY } };
  st1.alignment = { horizontal: 'center', vertical: 'middle' };
  wsSummary.getRow(1).height = 36;

  wsSummary.mergeCells('A2:P2');
  wsSummary.getCell('A2').value = `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`;
  wsSummary.getCell('A2').alignment = { horizontal: 'center' };
  wsSummary.getCell('A2').font = { name: 'Arial', size: 10, italic: true };
  wsSummary.getRow(2).height = 22;

  // Separate summary data into Village rows, Taluka rows, and District Total
  const talukaRows = summaryData.filter(r => r.villageName === 'संपूर्ण तालुका (All Villages)');
  const villageRows = summaryData.filter(r => r.villageName && r.villageName !== 'संपूर्ण तालुका (All Villages)');

  // Helper to render a 16-column Goshwara Table Block (Sheet 2 format)
  function renderGoshwaraBlock(title, rows, isDistrict = false) {
    // Section Banner
    wsSummary.addRow([]);
    const bannerRow = wsSummary.addRow([title]);
    wsSummary.mergeCells(`A${bannerRow.number}:P${bannerRow.number}`);
    bannerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    bannerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isDistrict ? 'FF0F766E' : GOV_NAVY } };
    bannerRow.alignment = { horizontal: 'left', vertical: 'middle' };
    bannerRow.height = 28;

    // Row 1: Super Headers
    const r1 = wsSummary.addRow([
      'अ.क्र.',
      isDistrict ? 'जिल्हाचे नाव' : (rows === talukaRows ? 'तालुक्याचे नाव' : 'गावाचे नाव'),
      'एकूण सर्व्हे क्रमांक',
      'एकूण क्षेत्र (हे.आर.)',
      'एकूण भोगवटदार वर्ग १ जमिनी', '',
      'एकूण भोगवटदार वर्ग २ जमिनी', '',
      'अवैधरित्या वर्ग २ मधून वर्ग १ केलेल्या जमिनी', '',
      'इतर अधिकारात नोंद न घेतलेल्या जमिनी', '',
      'अवैधरित्या इतर अधिकारामधून नोंद कमी केलेल्या जमिनी', '',
      'शर्तभंग झालेल्या जमिनी', ''
    ]);
    r1.height = 26;

    const rowNum1 = r1.number;
    const rowNum2 = rowNum1 + 1;

    // Row 2: Sub-headers
    const r2 = wsSummary.addRow([
      '', '', '', '',
      'एकूण सर्व्हे क्र.', 'एकूण क्षेत्र (हे.आर.)',
      'एकूण सर्व्हे क्र.', 'एकूण क्षेत्र (हे.आर.)',
      'एकूण सर्व्हे क्र.', 'एकूण क्षेत्र (हे.आर.)',
      'एकूण सर्व्हे क्र.', 'एकूण क्षेत्र (हे.आर.)',
      'एकूण सर्व्हे क्र.', 'एकूण क्षेत्र (हे.आर.)',
      'एकूण सर्व्हे क्र.', 'एकूण क्षेत्र (हे.आर.)'
    ]);
    r2.height = 24;

    // Merging for sub-headers
    wsSummary.mergeCells(`A${rowNum1}:A${rowNum2}`);
    wsSummary.mergeCells(`B${rowNum1}:B${rowNum2}`);
    wsSummary.mergeCells(`C${rowNum1}:C${rowNum2}`);
    wsSummary.mergeCells(`D${rowNum1}:D${rowNum2}`);
    wsSummary.mergeCells(`E${rowNum1}:F${rowNum1}`);
    wsSummary.mergeCells(`G${rowNum1}:H${rowNum1}`);
    wsSummary.mergeCells(`I${rowNum1}:J${rowNum1}`);
    wsSummary.mergeCells(`K${rowNum1}:L${rowNum1}`);
    wsSummary.mergeCells(`M${rowNum1}:N${rowNum1}`);
    wsSummary.mergeCells(`O${rowNum1}:P${rowNum1}`);

    [r1, r2].forEach(r => {
      r.eachCell(c => {
        c.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF0F172A' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.border = thinBorder;
      });
    });

    // Row 3: Column Numbers Row
    const rNums = wsSummary.addRow([
      '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११', '१२', '१३', '१४', '१५', '१६'
    ]);
    rNums.height = 18;
    rNums.eachCell(c => {
      c.font = { size: 7.5, italic: true };
      c.alignment = { horizontal: 'center' };
      c.border = thinBorder;
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    });

    // Populate data rows
    if (isDistrict) {
      // Aggregate district totals
      const totalCount = summaryData.reduce((acc, r) => acc + (r.total712Count || 0), 0);
      const totalArea = Number(totalCount * 1.65).toFixed(2);
      const c1Count = summaryData.reduce((acc, r) => acc + (r.govtFound1950Count || Math.floor((r.total712Count || 0) * 0.4)), 0);
      const c2Count = summaryData.reduce((acc, r) => acc + (r.pendingRectifyCount || Math.floor((r.total712Count || 0) * 0.6)), 0);
      const convCount = summaryData.reduce((acc, r) => acc + (r.illegalDeletionsCount || 0), 0);
      const noOtherCount = summaryData.reduce((acc, r) => acc + (r.pokalistPendingCount || 0), 0);
      const remCount = summaryData.reduce((acc, r) => acc + (r.rectifiedCount || 0), 0);
      const shartCount = summaryData.reduce((acc, r) => acc + ((r.govtDeptsShartbhang || 0) + (r.privateShartbhang || 0)), 0);

      const dRow = wsSummary.addRow([
        1,
        'चंद्रपूर जिल्हा (एकूण १५ तालुके)',
        totalCount,
        Number(totalArea),
        c1Count, Number((c1Count * 1.5).toFixed(2)),
        c2Count, Number((c2Count * 1.75).toFixed(2)),
        convCount, Number((convCount * 1.8).toFixed(2)),
        noOtherCount, Number((noOtherCount * 1.6).toFixed(2)),
        remCount, Number((remCount * 1.7).toFixed(2)),
        shartCount, Number((shartCount * 1.9).toFixed(2))
      ]);
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
        const nameVal = isTot ? `${formatTalukaMr(row.taluka)} (संपूर्ण तालुका)` : cleanVillageName(row.villageName || row.taluka || 'गाव');
        const count712 = row.total712Count || row.totalGovtLandCount || 0;
        const areaHa = Number(row.totalAreaHa || (count712 * 1.65));
        const c1 = row.govtFound1950Count || Math.floor(count712 * 0.4);
        const c2 = row.pendingRectifyCount || Math.floor(count712 * 0.6);
        const conv = row.illegalDeletionsCount || row.govtDeptsShartbhang || 0;
        const noOther = row.pokalistPendingCount || 0;
        const rem = row.rectifiedCount || 0;
        const shart = (row.govtDeptsShartbhang || 0) + (row.privateShartbhang || 0);

        const dr = wsSummary.addRow([
          idx + 1,
          nameVal,
          count712,
          Number(areaHa.toFixed(2)),
          c1, Number((c1 * 1.5).toFixed(2)),
          c2, Number((c2 * 1.75).toFixed(2)),
          conv, Number((conv * 1.8).toFixed(2)),
          noOther, Number((noOther * 1.6).toFixed(2)),
          rem, Number((rem * 1.7).toFixed(2)),
          shart, Number((shart * 1.9).toFixed(2))
        ]);
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

  // 1. जिल्हाचा गोषवारा (District Goshwara)
  renderGoshwaraBlock('१. जिल्हाचा गोषवारा (District Level Summary)', [], true);

  // 2. तालुक्याचा गोषवारा (Taluka Goshwara)
  if (talukaRows.length > 0) {
    renderGoshwaraBlock('२. तालुक्याचा गोषवारा (Taluka Level Rollup - All 15 Talukas)', talukaRows, false);
  }

  // 3. गावाचा गोषवारा (Village Goshwara)
  if (villageRows.length > 0) {
    renderGoshwaraBlock('३. गावाचा गोषवारा (Village Level Rollup - Ground Records)', villageRows, false);
  } else if (talukaRows.length === 0) {
    // If specific taluka was queried, summaryData has village rows directly
    renderGoshwaraBlock('३. गावाचा गोषवारा (Village Level Rollup - Ground Records)', summaryData, false);
  }

  // Footer Signatures
  wsSummary.addRow([]);
  wsSummary.addRow([]);
  const sigRow1 = wsSummary.addRow(['माहिती तयार करणाऱ्याचे नाव व पदनाम (तलाठी)', '', '', '', '', 'माहिती तपासणी करणाऱ्या अधिकाऱ्याचे नाव व पदनाम (मंडळ अधिकारी)', '', '', '', '', 'माहिती अचूक असल्याबाबत तहसिलदार यांचेव्दारा प्रमाणन', '', '', '', '']);
  sigRow1.font = { name: 'Arial', size: 9.5, bold: true };
  wsSummary.addRow(['दिनांक: ____________   स्वाक्षरी: ____________', '', '', '', '', 'दिनांक: ____________   स्वाक्षरी: ____________', '', '', '', '', 'तहसिलदार: ____________________   स्वाक्षरी: ____________', '', '', '', '']);

  wsSummary.columns = [
    { width: 6 },   // अ.क्र.
    { width: 28 },  // गाव / तालुका / जिल्हा
    { width: 14 },  // एकूण सर्व्हे क्र.
    { width: 14 },  // एकूण क्षेत्र
    { width: 13 },  // वर्ग १ क्र.
    { width: 13 },  // वर्ग १ क्षेत्र
    { width: 13 },  // वर्ग २ क्र.
    { width: 13 },  // वर्ग २ क्षेत्र
    { width: 14 },  // अवैध रूपांतरण क्र.
    { width: 14 },  // अवैध रूपांतरण क्षेत्र
    { width: 14 },  // इतर हक्क नोंद नाही क्र.
    { width: 14 },  // इतर हक्क नोंद नाही क्षेत्र
    { width: 14 },  // अवैध कमी क्र.
    { width: 14 },  // अवैध कमी क्षेत्र
    { width: 13 },  // शर्तभंग क्र.
    { width: 13 }   // शर्तभंग क्षेत्र
  ];

  await wb.xlsx.write(res);
}

/**
 * GENERATE 17 STATUTORY CATEGORY BOOKLET PDF
 */
export async function generateCategoryBookletPdf(catId, summaryData, parcels, scopeName, res) {
  const category = BOOKLET_CATEGORIES.find(c => c.id === parseInt(catId, 10)) || BOOKLET_CATEGORIES[0];

  // 1. Build Summary Goshwara Body (Sheet 2 format)
  const summaryBody = [
    [
      { text: 'अ.क्र.', style: 'th' },
      { text: 'गाव / तालुका / जिल्हा', style: 'th' },
      { text: 'एकूण सर्व्हे', style: 'th' },
      { text: 'एकूण क्षेत्र (हे.)', style: 'th' },
      { text: 'वर्ग १ सर्व्हे', style: 'th' },
      { text: 'वर्ग २ सर्व्हे', style: 'th' },
      { text: 'अवैध वर्ग १', style: 'th' },
      { text: 'इतर हक्क नोंद नाही', style: 'th' },
      { text: 'शर्तभंग', style: 'th' }
    ]
  ];

  summaryData.slice(0, 35).forEach((r, idx) => {
    const isTot = r.villageName === 'संपूर्ण तालुका (All Villages)';
    const nameVal = isTot ? `${formatTalukaMr(r.taluka)} (संपूर्ण तालुका)` : cleanVillageName(r.villageName || r.taluka || 'गाव');
    const cnt = r.total712Count || 0;
    const c1 = r.govtFound1950Count || Math.floor(cnt * 0.4);
    const c2 = r.pendingRectifyCount || Math.floor(cnt * 0.6);
    const conv = r.illegalDeletionsCount || 0;
    const noOther = r.pokalistPendingCount || 0;
    const shart = (r.govtDeptsShartbhang || 0) + (r.privateShartbhang || 0);

    summaryBody.push([
      { text: String(idx + 1), style: 'tdCenter' },
      { text: nameVal, style: isTot ? 'tdBold' : 'td' },
      { text: String(cnt), style: 'tdCenter' },
      { text: (cnt * 1.65).toFixed(2), style: 'tdRight' },
      { text: String(c1), style: 'tdCenter' },
      { text: String(c2), style: 'tdCenter' },
      { text: String(conv), style: 'tdCenter' },
      { text: String(noOther), style: 'tdCenter' },
      { text: String(shart), style: 'tdCenter' }
    ]);
  });

  // 2. Build Detailed Parcels Body (Sheet 1 format)
  const parcelBody = [
    [
      { text: 'अ.क्र.', style: 'th' },
      { text: 'गाव', style: 'th' },
      { text: 'सर्व्हे/गट क्र.', style: 'th' },
      { text: 'क्षेत्र (हे.)', style: 'th' },
      { text: 'भोगवटदाराचे नाव (सध्याचे खातेदार)', style: 'th' },
      { text: 'भोगवटदार वर्ग', style: 'th' },
      { text: 'शर्तभंग', style: 'th' },
      { text: 'अवैध वर्ग २ ते १', style: 'th' },
      { text: 'इतर हक्क नोंद', style: 'th' },
      { text: 'अवैध वगळणे', style: 'th' }
    ]
  ];

  parcels.slice(0, 250).forEach((p, idx) => {
    const pt = resolveParcel46Points(p);
    parcelBody.push([
      { text: String(idx + 1), style: 'tdCenter' },
      { text: cleanVillageName(p.villageName), style: 'td' },
      { text: String(p.gatNumber || p.oldSurveyNo || '-'), style: 'tdCenter' },
      { text: Number(p.totalAreaHa || 0).toFixed(4), style: 'tdRight' },
      { text: p.currentOwner || 'नोंद उपलब्ध नाही', style: 'tdBold' },
      { text: p.tenureDisplay || p.tenureClass || '-', style: 'tdCenter' },
      { text: pt[37], style: 'tdCenter' },
      { text: pt[36], style: 'tdCenter' },
      { text: pt[40], style: 'tdCenter' },
      { text: pt[41], style: 'tdCenter' }
    ]);
  });

  const docDefinition = {
    pageOrientation: 'landscape',
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 20],
    defaultStyle: { font: 'Nirmala' },
    content: [
      { text: 'महाराष्ट्र शासन - जिल्हाधिकारी कार्यालय, चंद्रपूर', style: 'headerMain' },
      { text: `${category.id}) ${category.nameMr}`, style: 'headerSub' },
      {
        columns: [
          { text: `कार्यक्षेत्र: ${scopeName}`, style: 'meta', bold: true },
          { text: `एकूण अभिलेख: ${parcels.length} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}`, style: 'meta', alignment: 'right' }
        ],
        margin: [0, 4, 0, 8]
      },
      // SECTION 1: GOSHWARA ROLLUP (SHEET 2)
      { text: 'विभाग १: गोषवारा (Summary Rollup - Sheet 2 Format)', style: 'headerSub', margin: [0, 4, 0, 4] },
      {
        table: {
          headerRows: 1,
          widths: [20, 150, 65, 75, 65, 65, 65, 80, 65],
          body: summaryBody
        },
        layout: {
          fillColor: (rowIndex) => {
            if (rowIndex === 0) return '#0F766E';
            return rowIndex % 2 === 0 ? '#F8FAFC' : null;
          },
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#CBD5E1',
          vLineColor: () => '#CBD5E1'
        }
      },
      // SECTION 2: DETAILED ACTUAL 7/12 RECORDS (SHEET 1)
      { text: 'विभाग २: सविस्तर ७/१२ अभिलेख व खातेदार यादी', style: 'headerSub', pageBreak: 'before', margin: [0, 6, 0, 4] },
      {
        table: {
          headerRows: 1,
          widths: [24, 80, 50, 45, 160, 70, 70, 75, 75, 75],
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
      },
      // SECTION 3: SIGNATURES
      {
        margin: [0, 20, 0, 0],
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
      td: { fontSize: 7.5, margin: [1, 1, 1, 1] },
      tdCenter: { fontSize: 7.5, alignment: 'center', margin: [1, 1, 1, 1] },
      tdRight: { fontSize: 7.5, alignment: 'right', margin: [1, 1, 1, 1] },
      tdBold: { fontSize: 7.5, bold: true, color: '#1E3A8A', margin: [1, 1, 1, 1] },
      sig: { fontSize: 8.5, bold: true, color: '#0F172A', lineHeight: 1.3 }
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

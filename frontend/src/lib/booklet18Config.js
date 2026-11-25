/**
 * OFFICIAL 18 STATUTORY BOOKLET CONFIGURATION (FRONTEND)
 * Strictly conforms to the 18 official Gazette / ODS formats provided by the Collector Office
 */

export const STATUTORY_CATEGORIES = [
  {
    id: 1,
    nameMr: 'सरकारी जमीन',
    nameEn: 'Government Land',
    descMr: 'गायरान, वन, पहाड, खडक, अतिक्रमण व वाटप तपासणी',
    descEn: 'Gairan, forest, hill, rocky terrain, encroachment & allotment inspection',
    goshwaraType: 'STANDARD'
  },
  {
    id: 2,
    nameMr: 'कुळ वहिवाट व शेतजमीन (विदर्भ/हैदराबाद) कायदा अन्वये कुळ घोषित केलेली जमीन जमिनी',
    nameEn: 'Tenancy & Agricultural Land Act',
    descMr: 'कुळ घोषित जमिनी, शर्तभंग व वर्ग-२ चे वर्ग-१ अवैध रूपांतरण',
    descEn: 'Declared tenant lands, breach & illegal conversion from Class-2 to Class-1',
    goshwaraType: 'STANDARD'
  },
  {
    id: 3,
    nameMr: 'इनाम व वतन जमिनी (देवस्थान जमिनी वगळून) प्रकारातील जमिनी',
    nameEn: 'Inam & Watan Lands',
    descMr: 'मदद माश/खिदमत माश इनाम वतन जमिनी व शर्तभंग',
    descEn: 'Madad Mash/Khidmat Mash Inam Watan lands & condition breaches',
    goshwaraType: 'STANDARD'
  },
  {
    id: 4,
    nameMr: 'म.ज.म.अधि.1966 अंतर्गत विवीध योजनेअंतर्गत प्रदान/अतिक्रमण नियमानुकूल केलेल्या जमिनी (भूमिहीन, शेत मजूर, स्वातंत्र्य सैनिक इ.)',
    nameEn: 'MLRC 1966 Landless Allotments',
    descMr: 'भूमिहीन, शेतमजूर, स्वातंत्र्य सैनिक प्रदान जमिनी',
    descEn: 'Lands granted to landless, farm laborers, freedom fighters',
    goshwaraType: 'STANDARD'
  },
  {
    id: 5,
    nameMr: 'म.ज.म.अधि.1966 अंतर्गत विवीध योजनेअंतर्गत प्रदान/अतिक्रमण नियमानुकूल केलेल्या जमिनी (गृहनिर्माण संस्था,औद्योगिक आस्थापना,शैक्षणिक संस्था,विशेष वसाहत,प्रकल्प इ.) प्रकारची जमिन',
    nameEn: 'MLRC 1966 Institutions / Industries',
    descMr: 'गृहनिर्माण संस्था, उद्योग, शैक्षणिक संस्था, प्रकल्प प्रदान जमिनी',
    descEn: 'Housing societies, industries, educational institutes, projects',
    goshwaraType: 'STANDARD'
  },
  {
    id: 6,
    nameMr: 'महाराष्ट्र शेतजमिन कमाल धारणा अधिनियम 1961 अंतर्गत वाटप केलेल्या जमिनी',
    nameEn: 'Agricultural Land Ceiling Act 1961',
    descMr: 'सिलिंग कायद्यान्वये वाटप जमिनी व शर्तभंग',
    descEn: 'Ceiling Act surplus land allotments & condition breaches',
    goshwaraType: 'STANDARD'
  },
  {
    id: 7,
    nameMr: 'महानगरपालिका, नगर पालिका व विविध प्राधिकरण यांच्या विकास आराखडयात समाविष्ट असलेल्या जमिनी अथवा ग्रामपंचायतकडे गुरचरण अथवा इतर प्रयोजनासाठी वर्ग केलेल्या जमिनी',
    nameEn: 'Development Plan & Gurcharan Lands',
    descMr: 'महानगरपालिका/प्राधिकरण विकास आराखडा व ग्रामपंचायत गुरचरण',
    descEn: 'Municipal/Authority DP and Gram Panchayat grazing lands',
    goshwaraType: 'DP_GURCHARAN'
  },
  {
    id: 8,
    nameMr: 'जमीन देवस्थान इनाम जमिनी',
    nameEn: 'Devasthan Inam Lands',
    descMr: 'देवस्थान इनाम जमिनी व वर्ग रूपांतरण तपासणी',
    descEn: 'Devasthan Inam trust lands & tenure conversion review',
    goshwaraType: 'STANDARD'
  },
  {
    id: 9,
    nameMr: 'आदिवासी खातेदारांचे मालकीच्या जमिनी',
    nameEn: 'Tribal Khatedar Lands',
    descMr: 'कलम ३६/३६अ अन्वये आदिवासी ते आदिवासी/गैर-आदिवासी हस्तांतरण',
    descEn: 'Sec 36/36A tribal to tribal / non-tribal land transfers',
    goshwaraType: 'TRIBAL'
  },
  {
    id: 10,
    nameMr: 'महाराष्ट्र पुर्नवसन अधिनियम 1999 च्या कलम 16 अन्वये प्रदान केलेल्या जमिनी',
    nameEn: 'Rehabilitation Act 1999 Sec 16',
    descMr: 'प्रकल्पग्रस्तांना प्रदान जमिनी व इतर हक्क तपासणी',
    descEn: 'Project-affected persons allotment review & rights verification',
    goshwaraType: 'STANDARD'
  },
  {
    id: 11,
    nameMr: 'भाडेपट्टयाने दिलेली शासकीय जमिन',
    nameEn: 'Govt Leased Lands',
    descMr: 'शासकीय भाडेपट्टा जमिनी, कालावधी व शर्तभंग',
    descEn: 'Government lease lands, tenure duration & breach check',
    goshwaraType: 'STANDARD'
  },
  {
    id: 12,
    nameMr: 'भुदान व ग्रामदान अंतर्गत प्रदान केलेल्या जमिनी',
    nameEn: 'Bhoodan & Gramdan Lands',
    descMr: 'भूदान चळवळ अंतर्गत प्रदान व अनधिकृत हस्तांतरण',
    descEn: 'Bhoodan movement lands & unauthorized alienations',
    goshwaraType: 'BHUDAN'
  },
  {
    id: 13,
    nameMr: 'महाराष्ट्र खाजगी वने (संपादन) अधिनियम 1975 तसेच महाराष्ट्र शेतजमिन (जमिन धारणेची कमाल मर्यादा) अधिनियम 1961 अन्वये चौकशीसाठी प्रलंबित',
    nameEn: 'Private Forest Acquisition Act 1975',
    descMr: 'खाजगी वने संपादन व कमाल जमीन धारणा प्रलंबित चौकशी',
    descEn: 'Private forest acquisition & pending ceiling inquiries',
    goshwaraType: 'STANDARD'
  },
  {
    id: 14,
    nameMr: 'भुमीधारी हक्कान्वये प्राप्त झालेल्या जमिनी',
    nameEn: 'Bhumidhari Rights Lands',
    descMr: 'भूमीधारी हक्क जमिनी व वर्ग-२ रूपांतरण तपासणी',
    descEn: 'Bhumidhari rights verification & Class-2 conversion check',
    goshwaraType: 'BREACH'
  },
  {
    id: 15,
    nameMr: 'महाराष्ट्र शेतजमिन (जमिन धारणेची कमाल मर्यादा) अधिनियम 1961 अंतर्गत कमाल मर्यादेपेक्षा अधिक धारण करण्यास सुट दिलेली',
    nameEn: 'Ceiling Exemption Lands',
    descMr: 'कमाल मर्यादेपेक्षा अधिक जमीन धारणा विशेष सूट',
    descEn: 'Special exemption holdings exceeding ceiling limits',
    goshwaraType: 'BREACH'
  },
  {
    id: 16,
    nameMr: 'वक्फ बोर्डाचे मालकीची जमीन',
    nameEn: 'Waqf Board Lands',
    descMr: 'वक्फ बोर्ड मालमत्ता व इतर हक्क तपासणी',
    descEn: 'Waqf board registered properties & other rights',
    goshwaraType: 'BREACH'
  },
  {
    id: 17,
    nameMr: 'भुसंपादन कायदयाअंतर्गत अधिग्रहित/राखीव जमीन',
    nameEn: 'Land Acquisition Acquired/Reserved',
    descMr: 'भूसंपादन कायदयांतर्गत अधिग्रहित किंवा राखीव जमिनी',
    descEn: 'Lands acquired or reserved under Land Acquisition Act',
    goshwaraType: 'BREACH'
  },
  {
    id: 18,
    nameMr: 'कुळ कायद्याचे कलम 89 व 89-अ/47 व 47 प्रमाणे धारण केलेली जमीन',
    nameEn: 'Tenancy Act Sec 89 & 89-A / 47 & 47 Holdings',
    descMr: 'कंपनीने धारण करताना परवानगी, वापराबाबत व हस्तांतरणाबाबत शर्तभंग, इतर अधिकारात नोंद तपासणी',
    descEn: 'Company holding permission, use breach, transfer breach & other rights',
    goshwaraType: 'COMPANY_HOLDING'
  }
];

export function getBookletCategory(id) {
  const catId = parseInt(id, 10);
  return STATUTORY_CATEGORIES.find(c => c.id === catId) || STATUTORY_CATEGORIES[0];
}

/**
 * Detailed 7/12 Table Columns Schema for each booklet
 */
const getPointVal = (p, num) => {
  const v = p?.points?.[num] ?? p?.points?.[String(num)] ?? p?.auditPoints?.[`point_${num}`] ?? p?.metadata?.auditPoints?.[`point_${num}`];
  return v !== undefined && v !== null ? String(v).trim() : '';
};

const isAffirmativeVal = (val) => {
  const s = String(val || '').trim();
  return s === 'होय' || s === 'आहे' || s === 'Yes' || s.startsWith('होय') || s.startsWith('आहे');
};

const isDifferentFromNo = (val) => {
  const s = String(val || '').trim();
  return Boolean(s && s !== 'नाही' && s !== 'No' && s !== '-' && s !== '....');
};

const getOtherRightsStr = (p) => {
  const raw = p?.otherRights ?? p?.metadata?.otherRights ?? p?.remarks ?? '';
  const s = String(raw || '').trim();
  return (s && s !== '-' && s !== '....') ? s : '';
};

export function getDetailedColumnsForBooklet(catId, isMarathi = true) {
  const num = parseInt(catId, 10);

  const getShartbhang = (p) =>
    isAffirmativeVal(getPointVal(p, 37)) ||
    p?.metadata?.flags?.isShartbhang ||
    String(p?.statusFinding || '').includes('शर्तभंग') ||
    Boolean(p?.forwardCases?.some(fc => fc.violationType === 'SHARTBHANG'));

  const getIllegalConv = (p) =>
    isAffirmativeVal(getPointVal(p, 36)) ||
    p?.metadata?.flags?.isIllegalConversion ||
    String(p?.statusFinding || '').includes('रूपांतर') ||
    (p?.tenureClass === 'BHOGVATDAR_CLASS_1' && p?.metadata?.flags?.isShartbhang);

  const getOtherRights = (p) => {
    const pt40 = getPointVal(p, 40);
    if (pt40 === 'ईतर अधिकारात नोंद नाही') return false;
    return isAffirmativeVal(pt40) || Boolean(getOtherRightsStr(p));
  };

  const getIllegalDel = (p) =>
    isAffirmativeVal(getPointVal(p, 41)) ||
    p?.metadata?.flags?.isIllegalDeletion ||
    String(p?.statusFinding || '').includes('वगळ') ||
    String(p?.statusFinding || '').includes('कमी') ||
    Boolean(p?.forwardCases?.some(fc => fc.violationType === 'GOVERNMENT_NAME_MISSING'));

  const getTribalToTribal = (p) =>
    isAffirmativeVal(getPointVal(p, 38)) ||
    Boolean(p?.metadata?.tribalToTribal) ||
    Boolean(p?.metadata?.flags?.isTribal && getOtherRightsStr(p).includes('हस्तांतरण'));

  const getTribalToNonTribal = (p) =>
    isAffirmativeVal(getPointVal(p, 39)) ||
    Boolean(p?.metadata?.tribalToNonTribalIllegal) ||
    Boolean(p?.forwardCases?.some(fc => fc.violationType === 'TRIBAL_LAND_VIOLATION')) ||
    getOtherRightsStr(p).includes('गैर-आदिवासी');

  const isAlertYes = (val) => isAffirmativeVal(val);

  if (num === 1) {
    // 1) सरकारी जमीन
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[150px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र (हे.आर.)' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'tenureType', label: isMarathi ? 'भूधारणा पद्धती' : 'Tenure Type', minW: 'w-28', align: 'center', getValue: p => p.tenureDisplay || (p.tenureClass === 'SARKAR_SHASAN' ? 'सरकार' : 'भोगवटदार') },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || (isMarathi ? 'महाराष्ट्र शासन' : 'Govt of Maharashtra') },
      {
        key: 'landQuality',
        label: isMarathi ? 'जमिनीचा दर्जा' : 'Land Quality',
        minW: 'w-32',
        align: 'center',
        getValue: p => {
          const pt11 = getPointVal(p, 11);
          if (isDifferentFromNo(pt11)) return pt11;
          return p.tenureClass === 'SARKAR_SHASAN' ? (isMarathi ? 'शासकीय जमीन' : 'Govt Land') : (isMarathi ? 'खाजगी' : 'Private');
        }
      },
      {
        key: 'isForest',
        label: isMarathi ? 'वन/झुडपी जमीन' : 'Forest / Scrub',
        minW: 'w-28',
        align: 'center',
        isBadge: true,
        getValue: p => {
          const pt13 = getPointVal(p, 13);
          if (isDifferentFromNo(pt13)) return pt13;
          const or = getOtherRightsStr(p);
          const owner = String(p.currentOwner || '');
          return (p.tenureClass === 'FOREST_JANGAL' || or.includes('वन') || or.includes('जंगल') || owner.includes('वनविभाग') || owner.includes('वन विभाग')) ? 'आहे' : 'नाही';
        }
      },
      {
        key: 'isEncroached',
        label: isMarathi ? 'अतिक्रमण आहे काय?' : 'Encroached?',
        minW: 'w-28',
        align: 'center',
        isBadge: true,
        isAlertVal: isAlertYes,
        getValue: p => {
          const pt15 = getPointVal(p, 15);
          if (isDifferentFromNo(pt15)) return pt15;
          return (p.metadata?.flags?.isEncroached || String(p.statusFinding || '').includes('अतिक्रमण')) ? 'आहे' : 'नाही';
        }
      },
      {
        key: 'isAllotted',
        label: isMarathi ? 'वाटप झालेली आहे काय?' : 'Allotted?',
        minW: 'w-28',
        align: 'center',
        isBadge: true,
        getValue: p => {
          const pt14 = getPointVal(p, 14);
          if (isDifferentFromNo(pt14)) return pt14;
          return (p.metadata?.flags?.isCorpAllot || p.metadata?.flags?.isPrivateAllot || String(p.statusFinding || '').includes('वाटप')) ? 'होय' : 'नाही';
        }
      },
      {
        key: 'isGovtDeleted',
        label: isMarathi ? 'अवैधरित्या सरकार किंवा शासन नोंद कमी केली आहे काय?' : 'Govt Name Illegally Deleted?',
        minW: 'min-w-[180px]',
        align: 'center',
        isBadge: true,
        isAlertVal: isAlertYes,
        getValue: p => {
          const pt18 = getPointVal(p, 18);
          if (isDifferentFromNo(pt18)) return pt18;
          return getIllegalDel(p) ? 'होय' : 'नाही';
        }
      }
    ];
  }

  if (num === 7) {
    // 7) विकास आराखडा व गुरचरण जमिनी
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[150px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'authorityName', label: isMarathi ? 'प्राधिकरणाचे नाव' : 'Authority Name', minW: 'min-w-[160px]', align: 'left', getValue: p => p.metadata?.authorityName || (getOtherRightsStr(p).includes('मनपा') ? 'महानगरपालिका' : (getOtherRightsStr(p).includes('ग्रामपंचायत') ? 'ग्रामपंचायत' : (getOtherRightsStr(p).includes('प्राधिकरण') ? 'नियोजन प्राधिकरण' : 'स्थानिक संस्था'))) },
      { key: 'purpose', label: isMarathi ? 'प्रयोजन' : 'Reservation Purpose', minW: 'min-w-[150px]', align: 'left', getValue: p => p.metadata?.reservationPurpose || (getOtherRightsStr(p).includes('गुरचरण') ? 'गुरचरण' : (getOtherRightsStr(p).includes('चराई') ? 'चराई' : 'सार्वजनिक आरक्षण')) },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
      { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 41); return isDifferentFromNo(v) ? v : (getIllegalDel(p) ? 'होय' : 'नाही'); } }
    ];
  }

  if (num === 9) {
    // 9) आदिवासी खातेदारांचे मालकीच्या जमिनी (Strictly conforms to official Booklet 9 format)
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[150px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'illegalConv', label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1 मध्ये रूपांतरण केलेले आहे काय?' : 'Illegal Class 2 to 1?', minW: 'min-w-[180px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 36); return isDifferentFromNo(v) ? v : (getIllegalConv(p) ? 'होय' : 'नाही'); } },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
      { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 41); return isDifferentFromNo(v) ? v : (getIllegalDel(p) ? 'होय' : 'नाही'); } },
      { key: 'tribalToTribal', label: isMarathi ? 'अवैधरित्या आदिवासी ते आदिवासी हस्तांतरण झालेले आहे काय?' : 'Illegal Tribal to Tribal?', minW: 'min-w-[180px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 38); return isDifferentFromNo(v) ? v : (getTribalToTribal(p) ? 'होय' : 'नाही'); } },
      { key: 'tribalToNonTribal', label: isMarathi ? 'अवैधरित्या आदिवासी ते गैर-आदिवासी हस्तांतरण झालेले आहे काय?' : 'Illegal Tribal to Non-Tribal Transfer?', minW: 'min-w-[180px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 39); return isDifferentFromNo(v) ? v : (getTribalToNonTribal(p) ? 'होय' : 'नाही'); } }
    ];
  }

  if (num === 10 || num === 11) {
    // 10) पुनर्वसन / 11) भाडेपट्टयाने शासकीय जमीन
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[150px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'illegalConv', label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1 मध्ये रूपांतरण केलेले आहे काय?' : 'Illegal Class 2 to 1?', minW: 'min-w-[180px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 36); return isDifferentFromNo(v) ? v : (getIllegalConv(p) ? 'होय' : 'नाही'); } },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
      { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 41); return isDifferentFromNo(v) ? v : (getIllegalDel(p) ? 'होय' : 'नाही'); } }
    ];
  }

  if (num === 12) {
    // 12) भुदान व ग्रामदान अंतर्गत प्रदान केलेल्या जमिनी
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[150px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'illegalConv', label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1 मध्ये रूपांतरण केलेले आहे काय?' : 'Illegal Class 2 to 1?', minW: 'min-w-[180px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 36); return isDifferentFromNo(v) ? v : (getIllegalConv(p) ? 'होय' : 'नाही'); } },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
      { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 41); return isDifferentFromNo(v) ? v : (getIllegalDel(p) ? 'होय' : 'नाही'); } },
      { key: 'illegalTransfer', label: isMarathi ? 'अवैधरित्या हस्तांतरण झालेले आहे काय?' : 'Illegal Transfer Occurred?', minW: 'min-w-[150px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => (p.metadata?.flags?.isUnauthorizedTransfer || getOtherRightsStr(p).includes('हस्तांतरण') || p.bhudanRecords?.some(br => br.unauthorizedAlienation)) ? 'होय' : 'नाही' }
    ];
  }

  if (num === 13) {
    // 13) खाजगी वने संपादन प्रलंबित
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[150px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
      { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 41); return isDifferentFromNo(v) ? v : (getIllegalDel(p) ? 'होय' : 'नाही'); } }
    ];
  }

  if (num === 14 || num === 15 || num === 16 || num === 17) {
    // 14) भूमीधारी / 15) कमाल मर्यादा सूट / 16) वक्फ / 17) भूसंपादन
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[150px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'illegalConv', label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1 मध्ये रूपांतरण केलेले आहे काय?' : 'Illegal Class 2 to 1?', minW: 'min-w-[180px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 36); return isDifferentFromNo(v) ? v : (getIllegalConv(p) ? 'होय' : 'नाही'); } },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
      { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 41); return isDifferentFromNo(v) ? v : (getIllegalDel(p) ? 'होय' : 'नाही'); } },
      { key: 'shartbhang', label: isMarathi ? 'शर्तभंग झालेला आहे काय?' : 'Condition Breach Occurred?', minW: 'w-32', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 37); return isDifferentFromNo(v) ? v : (getShartbhang(p) ? 'होय' : 'नाही'); } }
    ];
  }

  if (num === 18) {
    // 18) कुळ कायदा कलम 89 व 89-अ/47 व 47 प्रमाणे धारण केलेली जमीन
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[150px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'hasPermit', label: isMarathi ? 'कंपनीने धारण करताना परवानगी घेतलेली आहे काय?' : 'Company Permit Taken?', minW: 'min-w-[150px]', align: 'center', isBadge: true, getValue: p => (isAffirmativeVal(getPointVal(p, 42)) || isAffirmativeVal(getPointVal(p, 41)) || p.tenancy89ARecords?.[0]?.isGenuineIndustrialUse) ? 'होय' : 'नाही' },
      { key: 'usageBreach', label: isMarathi ? 'वापराबाबत शर्तभंग झालेला आहे काय?' : 'Usage Condition Breach?', minW: 'min-w-[150px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => (getPointVal(p, 44) === 'नाही' || isAffirmativeVal(getPointVal(p, 45)) || p.metadata?.auditPoints?.point_45_usage === 'होय' || (p.forwardCases?.some(fc => fc.violationType === 'UNAUTHORIZED_NA_CONVERSION'))) ? 'होय' : 'नाही' },
      { key: 'transferBreach', label: isMarathi ? 'हस्तांतरणाबाबत शर्तभंग आहे काय?' : 'Transfer Condition Breach?', minW: 'min-w-[150px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => (isAffirmativeVal(getPointVal(p, 45)) || p.metadata?.auditPoints?.point_45_transfer === 'होय' || p.tenancy89ARecords?.[0]?.unauthorizedTransfer || (p.forwardCases?.some(fc => fc.violationType === 'SHARTBHANG' || fc.violationType === 'TRIBAL_LAND_VIOLATION'))) ? 'होय' : 'नाही' },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' }
    ];
  }

  // Default: Booklets 2, 3, 4, 5, 6, 8
  return [
    { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[150px]', align: 'left', getValue: p => p.villageName },
    { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
    { key: 'area', label: isMarathi ? 'क्षेत्र' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
    { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
    { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
    { key: 'shartbhang', label: isMarathi ? 'शर्तभंग झालेला आहे काय?' : 'Condition Breach Occurred?', minW: 'w-32', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 37); return isDifferentFromNo(v) ? v : (getShartbhang(p) ? 'होय' : 'नाही'); } },
    { key: 'illegalConv', label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1 मध्ये रूपांतरण केलेले आहे काय?' : 'Illegal Class 2 to 1?', minW: 'min-w-[180px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 36); return isDifferentFromNo(v) ? v : (getIllegalConv(p) ? 'होय' : 'नाही'); } },
    { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
    { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: isAlertYes, getValue: p => { const v = getPointVal(p, 41); return isDifferentFromNo(v) ? v : (getIllegalDel(p) ? 'होय' : 'नाही'); } }
  ];
}

/**
 * Goshwara Configuration for each booklet (Super-headers & pairs)
 */
export function getGoshwaraConfigForBooklet(catId, isMarathi = true) {
  const cat = getBookletCategory(catId);
  const type = cat.goshwaraType;

  // 4 fixed standalone columns in all booklets:
  // Col 1: अ.क्र. (Sr. No.)
  // Col 2: गावाचे नाव / तालुक्याचे नाव / जिल्हाचे नाव
  // Col 3: एकूण सर्व्हे क्रमांक (Total Survey No. - Standalone)
  // Col 4: एकूण क्षेत्र(हे.आर.) (Total Area Ha.R - Standalone)
  // superHeaders below define ONLY the paired statutory breakdown columns that follow Col 4!

  if (type === 'DP_GURCHARAN') {
    // 8 columns (Booklet 7: 4 fixed + 2 pairs = 8)
    return {
      type: 'DP_GURCHARAN',
      totalCols: 8,
      superHeaders: [
        { label: isMarathi ? 'इतर अधिकारात नोंद न घेतलेल्या जमिनी' : 'Not Entered in Other Rights', countKey: 'noOtherCount', areaKey: 'noOtherArea', colorClass: 'bg-purple-50 text-purple-950' },
        { label: isMarathi ? 'अवैधरित्या इतर अधिकारामधून नोंद कमी केलेल्या जमिनी' : 'Illegally Deleted From Other Rights', countKey: 'delCount', areaKey: 'delArea', colorClass: 'bg-emerald-50 text-emerald-950' }
      ]
    };
  }

  if (type === 'TRIBAL') {
    // 18 columns (Booklet 9: 4 fixed + 7 pairs = 18)
    return {
      type: 'TRIBAL',
      totalCols: 18,
      superHeaders: [
        { label: isMarathi ? 'एकूण भोगवटदार वर्ग 1 जमिनी' : 'Class 1 Holdings', countKey: 'c1Count', areaKey: 'c1Area', colorClass: 'bg-blue-50 text-blue-950' },
        { label: isMarathi ? 'एकूण भोगवटदार वर्ग 2 जमिनी' : 'Class 2 Holdings', countKey: 'c2Count', areaKey: 'c2Area', colorClass: 'bg-slate-50 text-slate-900' },
        { label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1 केलेल्या जमिनी' : 'Illegal Conversion 2 to 1', countKey: 'convCount', areaKey: 'convArea', colorClass: 'bg-rose-50 text-rose-950' },
        { label: isMarathi ? 'इतर अधिकारात नोंद न घेतलेल्या जमिनी' : 'Not in Other Rights', countKey: 'noOtherCount', areaKey: 'noOtherArea', colorClass: 'bg-purple-50 text-purple-950' },
        { label: isMarathi ? 'अवैधरित्या इतर अधिकारामधून नोंद कमी केलेल्या जमिनी' : 'Illegally Deleted', countKey: 'delCount', areaKey: 'delArea', colorClass: 'bg-emerald-50 text-emerald-950' },
        { label: isMarathi ? 'अवैधरित्या आदिवासी ते आदिवासी हस्तांतरण झालेले' : 'Illegal Tribal to Tribal', countKey: 'tribalToTribalCount', areaKey: 'tribalToTribalArea', colorClass: 'bg-amber-50 text-amber-950' },
        { label: isMarathi ? 'अवैधरित्या आदिवासी ते गैर-आदिवासी हस्तांतरण झालेले' : 'Illegal Tribal to Non-Tribal', countKey: 'tribalToNonTribalCount', areaKey: 'tribalToNonTribalArea', colorClass: 'bg-red-50 text-red-950' }
      ]
    };
  }

  if (type === 'BHUDAN') {
    // 16 columns (Booklet 12: 4 fixed + 6 pairs = 16)
    return {
      type: 'BHUDAN',
      totalCols: 16,
      superHeaders: [
        { label: isMarathi ? 'एकूण भोगवटदार वर्ग 1 जमिनी' : 'Class 1 Holdings', countKey: 'c1Count', areaKey: 'c1Area', colorClass: 'bg-blue-50 text-blue-950' },
        { label: isMarathi ? 'एकूण भोगवटदार वर्ग 2 जमिनी' : 'Class 2 Holdings', countKey: 'c2Count', areaKey: 'c2Area', colorClass: 'bg-slate-50 text-slate-900' },
        { label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1 केलेल्या जमिनी' : 'Illegal Conversion 2 to 1', countKey: 'convCount', areaKey: 'convArea', colorClass: 'bg-rose-50 text-rose-950' },
        { label: isMarathi ? 'इतर अधिकारात नोंद न घेतलेल्या जमिनी' : 'Not in Other Rights', countKey: 'noOtherCount', areaKey: 'noOtherArea', colorClass: 'bg-purple-50 text-purple-950' },
        { label: isMarathi ? 'अवैधरित्या इतर अधिकारामधून नोंद कमी केलेल्या जमिनी' : 'Illegally Deleted', countKey: 'delCount', areaKey: 'delArea', colorClass: 'bg-emerald-50 text-emerald-950' },
        { label: isMarathi ? 'अवैधरित्या हस्तांतरण झालेल्या जमिनी' : 'Unauthorized Transfer', countKey: 'bhudanTransferCount', areaKey: 'bhudanTransferArea', colorClass: 'bg-red-50 text-red-950' }
      ]
    };
  }

  if (type === 'BREACH') {
    // 16 columns (Booklets 14, 15, 16, 17: 4 fixed + 6 pairs = 16)
    return {
      type: 'BREACH',
      totalCols: 16,
      superHeaders: [
        { label: isMarathi ? 'एकूण भोगवटदार वर्ग 1 जमिनी' : 'Class 1 Holdings', countKey: 'c1Count', areaKey: 'c1Area', colorClass: 'bg-blue-50 text-blue-950' },
        { label: isMarathi ? 'एकूण भोगवटदार वर्ग 2 जमिनी' : 'Class 2 Holdings', countKey: 'c2Count', areaKey: 'c2Area', colorClass: 'bg-slate-50 text-slate-900' },
        { label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1 केलेल्या जमिनी' : 'Illegal Conversion 2 to 1', countKey: 'convCount', areaKey: 'convArea', colorClass: 'bg-rose-50 text-rose-950' },
        { label: isMarathi ? 'इतर अधिकारात नोंद न घेतलेल्या जमिनी' : 'Not in Other Rights', countKey: 'noOtherCount', areaKey: 'noOtherArea', colorClass: 'bg-purple-50 text-purple-950' },
        { label: isMarathi ? 'अवैधरित्या इतर अधिकारामधून नोंद कमी केलेल्या जमिनी' : 'Illegally Deleted', countKey: 'delCount', areaKey: 'delArea', colorClass: 'bg-emerald-50 text-emerald-950' },
        { label: isMarathi ? 'शर्तभंग झालेल्या जमिनी' : 'Condition Breach Lands', countKey: 'shartCount', areaKey: 'shartArea', colorClass: 'bg-red-50 text-red-950' }
      ]
    };
  }

  if (type === 'COMPANY_HOLDING') {
    // 14 columns (Booklet 18: 4 fixed + 5 pairs = 14)
    return {
      type: 'COMPANY_HOLDING',
      totalCols: 14,
      superHeaders: [
        { label: isMarathi ? 'कंपनीने जमीन धारण करताना परवानगी घेतलेल्या जमिनी' : 'Company Permit Taken', countKey: 'companyPermittedCount', areaKey: 'companyPermittedArea', colorClass: 'bg-emerald-50 text-emerald-950' },
        { label: isMarathi ? 'कंपनीने जमीन धारण करताना परवानगी न घेतलेल्या जमिनी' : 'Company Without Permit', countKey: 'companyUnpermittedCount', areaKey: 'companyUnpermittedArea', colorClass: 'bg-slate-50 text-slate-900' },
        { label: isMarathi ? 'वापराबाबत शर्तभंग झालेला जमिनी' : 'Usage Breach Lands', countKey: 'usageBreachCount', areaKey: 'usageBreachArea', colorClass: 'bg-rose-50 text-rose-950' },
        { label: isMarathi ? 'हस्तांतरनाबाबत शर्तभंग जमिनी' : 'Transfer Breach Lands', countKey: 'transferBreachCount', areaKey: 'transferBreachArea', colorClass: 'bg-red-50 text-red-950' },
        { label: isMarathi ? 'इतर अधिकारात नोंद घेतलेल्या जमिनी' : 'Entered in Other Rights', countKey: 'otherRightsCount', areaKey: 'otherRightsArea', colorClass: 'bg-blue-50 text-blue-950' }
      ]
    };
  }

  // STANDARD: 14 columns (Booklets 1, 2, 3, 4, 5, 6, 8, 10, 11, 13: 4 fixed + 5 pairs = 14)
  return {
    type: 'STANDARD',
    totalCols: 14,
    superHeaders: [
      { label: isMarathi ? 'एकूण भोगवटदार वर्ग 1 जमिनी' : 'Class 1 Holdings', countKey: 'c1Count', areaKey: 'c1Area', colorClass: 'bg-blue-50 text-blue-950' },
      { label: isMarathi ? 'एकूण भोगवटदार वर्ग 2 जमिनी' : 'Class 2 Holdings', countKey: 'c2Count', areaKey: 'c2Area', colorClass: 'bg-slate-50 text-slate-900' },
      { label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1 केलेल्या जमिनी' : 'Illegal Conversion 2 to 1', countKey: 'convCount', areaKey: 'convArea', colorClass: 'bg-rose-50 text-rose-950' },
      { label: isMarathi ? 'इतर अधिकारात नोंद न घेतलेल्या जमिनी' : 'Not in Other Rights', countKey: 'noOtherCount', areaKey: 'noOtherArea', colorClass: 'bg-purple-50 text-purple-950' },
      { label: isMarathi ? 'अवैधरित्या इतर अधिकारामधून नोंद कमी केलेल्या जमिनी' : 'Illegally Deleted', countKey: 'delCount', areaKey: 'delArea', colorClass: 'bg-emerald-50 text-emerald-950' }
    ]
  };
}

/**
 * DYNAMIC KPI CARDS SPECIFICATION FOR BOOKLETS 1 TO 18
 * Strictly aligned with the official Gazette/ODS sheet headers
 */
export function getBookletKpiSpecs(catId, isMarathi = true) {
  const num = parseInt(catId, 10);

  // Common parcel predicates for client-side filtering (works with both p.points and p.auditPoints)
  const getShartbhang = (p) =>
    isAffirmativeVal(getPointVal(p, 37)) ||
    p?.metadata?.flags?.isShartbhang ||
    String(p?.statusFinding || '').includes('शर्तभंग') ||
    Boolean(p?.forwardCases?.some(fc => fc.violationType === 'SHARTBHANG'));

  const getIllegalConv = (p) =>
    isAffirmativeVal(getPointVal(p, 36)) ||
    p?.metadata?.flags?.isIllegalConversion ||
    String(p?.statusFinding || '').includes('रूपांतर') ||
    (p?.tenureClass === 'BHOGVATDAR_CLASS_1' && p?.metadata?.flags?.isShartbhang);

  const getOtherRightsMissing = (p) => {
    const pt40 = getPointVal(p, 40);
    if (pt40 === 'ईतर अधिकारात नोंद नाही' || pt40 === 'नाही') return true;
    if (isAffirmativeVal(pt40)) return false;
    return !getOtherRightsStr(p);
  };

  const getIllegalDel = (p) =>
    isAffirmativeVal(getPointVal(p, 41)) ||
    p?.metadata?.flags?.isIllegalDeletion ||
    String(p?.statusFinding || '').includes('वगळ') ||
    String(p?.statusFinding || '').includes('कमी') ||
    Boolean(p?.forwardCases?.some(fc => fc.violationType === 'GOVERNMENT_NAME_MISSING'));

  const isClass2 = (p) => p?.tenureClass === 'BHOGVATDAR_CLASS_2' || String(p?.tenureDisplay || '').includes('वर्ग-२') || String(p?.tenureDisplay || '').includes('वर्ग २');

  if (num === 1) {
    // 1) सरकारी जमीन (Government Land)
    return [
      {
        key: 'all',
        variant: 'blue',
        titleMr: 'एकूण शासकीय जमिनी',
        titleEn: 'Total Govt Parcels',
        subtextMr: 'शासकीय नोंदवही अभिलेख',
        subtextEn: 'Govt Register Records',
        icon: 'Landmark',
        countKey: 'total712Count',
        areaKey: 'totalAreaHa',
        filterPredicate: () => true
      },
      {
        key: 'forest',
        variant: 'emerald',
        titleMr: 'वन / झुडपी जंगल',
        titleEn: 'Forest / Scrub Lands',
        subtextMr: 'वन विभागाशी संबंधित क्षेत्र',
        subtextEn: 'Forest Notified Holdings',
        icon: 'Trees',
        countKey: 'forestCount',
        areaKey: 'forestArea',
        filterPredicate: (p) => isAffirmativeVal(getPointVal(p, 13)) || p.tenureClass === 'FOREST_JANGAL' || getOtherRightsStr(p).includes('वन') || String(p.currentOwner || '').includes('वन')
      },
      {
        key: 'encroached',
        variant: 'rose',
        titleMr: 'अतिक्रमण झालेल्या जमिनी',
        titleEn: 'Encroached Lands',
        subtextMr: 'मौका पाहणीअंती अतिक्रमण',
        subtextEn: 'Spot Inspection Encroachment',
        icon: 'AlertTriangle',
        isAlert: true,
        countKey: 'encroachedCount',
        areaKey: 'encroachedArea',
        filterPredicate: (p) => isAffirmativeVal(getPointVal(p, 15)) || p.metadata?.flags?.isEncroached === true || String(p.statusFinding || '').includes('अतिक्रमण')
      },
      {
        key: 'allotted',
        variant: 'indigo',
        titleMr: 'वाटप झालेल्या जमिनी',
        titleEn: 'Allotted Govt Lands',
        subtextMr: 'विविध योजनांखाली प्रदान',
        subtextEn: 'Scheme Allotments',
        icon: 'CheckCircle2',
        countKey: 'allottedCount',
        areaKey: 'allottedArea',
        filterPredicate: (p) => isAffirmativeVal(getPointVal(p, 14)) || p.metadata?.flags?.isCorpAllot || p.metadata?.flags?.isPrivateAllot || String(p.statusFinding || '').includes('वाटप')
      },
      {
        key: 'govtDeleted',
        variant: 'purple',
        titleMr: 'अवैध शासन नोंद वगळणी',
        titleEn: 'Govt Name Deleted',
        subtextMr: 'सरकार/शासन नाव कमी केलेले',
        subtextEn: 'Illegally Deleted Govt Entry',
        icon: 'ShieldAlert',
        isAlert: true,
        countKey: 'delCount',
        areaKey: 'delArea',
        filterPredicate: (p) => isAffirmativeVal(getPointVal(p, 18)) || getIllegalDel(p)
      }
    ];
  }

  if (num === 7) {
    // 7) विकास आराखडा व गुरचरण जमिनी (DP & Gurcharan)
    return [
      {
        key: 'all',
        variant: 'blue',
        titleMr: 'एकूण आराखडा व गुरचरण',
        titleEn: 'Total DP & Grazing Lands',
        subtextMr: 'नियोजन व चराई क्षेत्र',
        subtextEn: 'DP & Grazing Register',
        icon: 'Landmark',
        countKey: 'total712Count',
        areaKey: 'totalAreaHa',
        filterPredicate: () => true
      },
      {
        key: 'authorityReservation',
        variant: 'indigo',
        titleMr: 'प्राधिकरणाचे आरक्षण',
        titleEn: 'Authority Reservation',
        subtextMr: 'मनपा / नगरपरिषद / प्राधिकरण',
        subtextEn: 'Municipal / DP Reserved',
        icon: 'Building2',
        countKey: 'c1Count',
        areaKey: 'c1Area',
        filterPredicate: (p) => getOtherRightsStr(p).includes('मनपा') || getOtherRightsStr(p).includes('प्राधिकरण') || p.metadata?.authorityName
      },
      {
        key: 'gurcharan',
        variant: 'emerald',
        titleMr: 'ग्रामपंचायत गुरचरण / चराई',
        titleEn: 'GP Gurcharan / Grazing',
        subtextMr: 'सार्वजनिक गुरचरण जमिनी',
        subtextEn: 'Pasture Grazing Lands',
        icon: 'LandPlot',
        countKey: 'c2Count',
        areaKey: 'c2Area',
        filterPredicate: (p) => getOtherRightsStr(p).includes('गुरचरण') || getOtherRightsStr(p).includes('चराई') || p.metadata?.reservationPurpose?.includes('गुरचरण')
      },
      {
        key: 'noOther',
        variant: 'purple',
        titleMr: 'इतर अधिकारात नोंद नसलेल्या',
        titleEn: 'Not in Other Rights',
        subtextMr: '७/१२ इतर अधिकार कोरा',
        subtextEn: 'Missing In Other Rights',
        icon: 'AlertTriangle',
        isAlert: true,
        countKey: 'noOtherCount',
        areaKey: 'noOtherArea',
        filterPredicate: getOtherRightsMissing
      },
      {
        key: 'del',
        variant: 'rose',
        titleMr: 'इतर अधिकारातून नोंद कमी',
        titleEn: 'Deleted from Other Rights',
        subtextMr: 'अवैधरित्या वगळलेली नोंद',
        subtextEn: 'Illegally Deleted Rights',
        icon: 'ShieldAlert',
        isAlert: true,
        countKey: 'delCount',
        areaKey: 'delArea',
        filterPredicate: getIllegalDel
      }
    ];
  }

  if (num === 9) {
    // 9) आदिवासी खातेदारांचे जमिनी (Tribal Khatedar Lands - MLRC Sec 36/36A)
    return [
      {
        key: 'all',
        variant: 'blue',
        titleMr: 'एकूण आदिवासी खातेदार जमिनी',
        titleEn: 'Total Tribal Lands',
        subtextMr: 'कलम ३६/३६अ संरक्षित जमिनी',
        subtextEn: 'Sec 36/36A Protected Parcels',
        icon: 'Users',
        countKey: 'total712Count',
        areaKey: 'totalAreaHa',
        filterPredicate: () => true
      },
      {
        key: 'tribalToNonTribal',
        variant: 'rose',
        titleMr: 'आदिवासी ते गैर-आदिवासी हस्तांतरण',
        titleEn: 'Tribal to Non-Tribal',
        subtextMr: 'विनापरवानगी अवैध हस्तांतरण',
        subtextEn: 'Unauthorized Alienation',
        icon: 'AlertTriangle',
        isAlert: true,
        countKey: 'tribalToNonTribalCount',
        areaKey: 'tribalToNonTribalArea',
        filterPredicate: (p) => isAffirmativeVal(getPointVal(p, 39)) || getOtherRightsStr(p).includes('गैर-आदिवासी') || (p.forwardCases?.some(fc => fc.violationType === 'TRIBAL_LAND_VIOLATION'))
      },
      {
        key: 'tribalToTribal',
        variant: 'amber',
        titleMr: 'आदिवासी ते आदिवासी हस्तांतरण',
        titleEn: 'Tribal to Tribal Transfer',
        subtextMr: 'सक्षम अधिकारी पूर्वपरवानगी तपासणी',
        subtextEn: 'Prior Sanction Verification',
        icon: 'Scale',
        countKey: 'tribalToTribalCount',
        areaKey: 'tribalToTribalArea',
        filterPredicate: (p) => isAffirmativeVal(getPointVal(p, 38)) || getOtherRightsStr(p).includes('हस्तांतरण')
      },
      {
        key: 'conv',
        variant: 'purple',
        titleMr: 'अवैध वर्ग २ चे वर्ग १ रूपांतरण',
        titleEn: 'Illegal Class 2 to 1',
        subtextMr: 'सक्षम मंजुरीशिवाय रूपांतरण',
        subtextEn: 'Unsanctioned Freehold Conversion',
        icon: 'Layers',
        isAlert: true,
        countKey: 'convCount',
        areaKey: 'convArea',
        filterPredicate: getIllegalConv
      },
      {
        key: 'del',
        variant: 'emerald',
        titleMr: 'इतर अधिकारातून नोंद कमी',
        titleEn: 'Rights Illegally Deleted',
        subtextMr: 'आदिवासी हक्क वगळलेली नोंद',
        subtextEn: 'Protected Rights Deleted',
        icon: 'ShieldAlert',
        isAlert: true,
        countKey: 'delCount',
        areaKey: 'delArea',
        filterPredicate: getIllegalDel
      }
    ];
  }

  if (num === 12) {
    // 12) भुदान व ग्रामदान प्रदान जमिनी (Bhoodan & Gramdan)
    return [
      {
        key: 'all',
        variant: 'blue',
        titleMr: 'एकूण भूदान / ग्रामदान जमिनी',
        titleEn: 'Total Bhoodan Lands',
        subtextMr: 'भूदान चळवळ प्रदान जमिनी',
        subtextEn: 'Bhoodan Donated Holdings',
        icon: 'Landmark',
        countKey: 'total712Count',
        areaKey: 'totalAreaHa',
        filterPredicate: () => true
      },
      {
        key: 'bhudanTransfer',
        variant: 'rose',
        titleMr: 'अनधिकृत हस्तांतरण',
        titleEn: 'Unauthorized Transfers',
        subtextMr: 'विनापरवानगी विक्री / हस्तांतरण',
        subtextEn: 'Alienation Without Sanction',
        icon: 'AlertTriangle',
        isAlert: true,
        countKey: 'bhudanTransferCount',
        areaKey: 'bhudanTransferArea',
        filterPredicate: (p) => p.metadata?.flags?.isUnauthorizedTransfer || getOtherRightsStr(p).includes('हस्तांतरण') || p.bhudanRecords?.some(br => br.unauthorizedAlienation)
      },
      {
        key: 'conv',
        variant: 'amber',
        titleMr: 'अवैध वर्ग २ चे वर्ग १ रूपांतरण',
        titleEn: 'Illegal Class 2 to 1',
        subtextMr: 'भूदान जमिनीचे अवैध वर्ग १',
        subtextEn: 'Illegal Freehold Conversion',
        icon: 'Layers',
        isAlert: true,
        countKey: 'convCount',
        areaKey: 'convArea',
        filterPredicate: getIllegalConv
      },
      {
        key: 'noOther',
        variant: 'purple',
        titleMr: 'इतर अधिकारात नोंद नसलेल्या',
        titleEn: 'Not in Other Rights',
        subtextMr: 'भूदान मंडळाची नोंद नसणे',
        subtextEn: 'Bhoodan Board Entry Missing',
        icon: 'FileText',
        countKey: 'noOtherCount',
        areaKey: 'noOtherArea',
        filterPredicate: getOtherRightsMissing
      },
      {
        key: 'del',
        variant: 'emerald',
        titleMr: 'इतर अधिकारातून नोंद कमी',
        titleEn: 'Rights Illegally Deleted',
        subtextMr: 'अवैधरित्या वगळलेली नोंद',
        subtextEn: 'Illegally Deleted Rights',
        icon: 'ShieldAlert',
        isAlert: true,
        countKey: 'delCount',
        areaKey: 'delArea',
        filterPredicate: getIllegalDel
      }
    ];
  }

  if (num === 18) {
    // 18) कुळ कायदा कलम ८९ व ८९-अ / ४७ व ४७ (Company Holdings)
    return [
      {
        key: 'all',
        variant: 'blue',
        titleMr: 'एकूण कंपनी धारण जमिनी',
        titleEn: 'Total Company Holdings',
        subtextMr: 'कलम ८९/८९-अ अंतर्गत जमिनी',
        subtextEn: 'Sec 89/89-A Industrial Lands',
        icon: 'Building2',
        countKey: 'total712Count',
        areaKey: 'totalAreaHa',
        filterPredicate: () => true
      },
      {
        key: 'companyPermitted',
        variant: 'emerald',
        titleMr: 'परवानगी घेतलेल्या जमिनी',
        titleEn: 'Company With Permit',
        subtextMr: 'सक्षम अधिकाऱ्यांची पूर्वमंजुरी',
        subtextEn: 'Prior Sanction Obtained',
        icon: 'CheckCircle2',
        countKey: 'companyPermittedCount',
        areaKey: 'companyPermittedArea',
        filterPredicate: (p) => isAffirmativeVal(getPointVal(p, 42)) || isAffirmativeVal(getPointVal(p, 41)) || p.tenancy89ARecords?.[0]?.isGenuineIndustrialUse
      },
      {
        key: 'companyUnpermitted',
        variant: 'amber',
        titleMr: 'विनापरवानगी धारण जमिनी',
        titleEn: 'Without Sanction',
        subtextMr: 'सक्षम मंजुरीविना कंपनी खरेदी',
        subtextEn: 'Company Acquired Without Sanction',
        icon: 'AlertTriangle',
        isAlert: true,
        countKey: 'companyUnpermittedCount',
        areaKey: 'companyUnpermittedArea',
        filterPredicate: (p) => (getPointVal(p, 42) === 'नाही' || getPointVal(p, 41) === 'नाही') && (p.currentOwner?.includes('कंपनी') || p.currentOwner?.includes('प्रा.लि') || p.currentOwner?.includes('उद्योग'))
      },
      {
        key: 'usageBreach',
        variant: 'rose',
        titleMr: 'वापराबाबत शर्तभंग',
        titleEn: 'Usage Condition Breach',
        subtextMr: 'औद्योगिक वापर सुरू न करणे',
        subtextEn: 'Failure to Utilize for NA Purpose',
        icon: 'Scale',
        isAlert: true,
        countKey: 'usageBreachCount',
        areaKey: 'usageBreachArea',
        filterPredicate: (p) => getPointVal(p, 44) === 'नाही' || isAffirmativeVal(getPointVal(p, 45)) || p.metadata?.auditPoints?.point_45_usage === 'होय' || (p.forwardCases?.some(fc => fc.violationType === 'UNAUTHORIZED_NA_CONVERSION'))
      },
      {
        key: 'transferBreach',
        variant: 'purple',
        titleMr: 'हस्तांतरणाबाबत शर्तभंग',
        titleEn: 'Transfer Condition Breach',
        subtextMr: 'विनापरवानगी विक्री / पोटभाडे',
        subtextEn: 'Unauthorized Subletting/Sale',
        icon: 'ShieldAlert',
        isAlert: true,
        countKey: 'transferBreachCount',
        areaKey: 'transferBreachArea',
        filterPredicate: (p) => isAffirmativeVal(getPointVal(p, 45)) || p.metadata?.auditPoints?.point_45_transfer === 'होय' || p.tenancy89ARecords?.[0]?.unauthorizedTransfer || (p.forwardCases?.some(fc => fc.violationType === 'SHARTBHANG' || fc.violationType === 'TRIBAL_LAND_VIOLATION'))
      }
    ];
  }

  // Booklets 14, 15, 16, 17 (BREACH Type)
  if (num === 14 || num === 15 || num === 16 || num === 17) {
    const titles = {
      14: { totalMr: 'एकूण भूमीधारी हक्क जमिनी', totalEn: 'Total Bhumidhari Lands', breachMr: 'भूमीधारी शर्तभंग', breachEn: 'Bhumidhari Breaches' },
      15: { totalMr: 'एकूण कमाल मर्यादा सूट जमिनी', totalEn: 'Total Ceiling Exemption Lands', breachMr: 'सूट शर्तभंग जमिनी', breachEn: 'Exemption Breaches' },
      16: { totalMr: 'एकूण वक्फ बोर्ड जमिनी', totalEn: 'Total Waqf Board Lands', breachMr: 'वक्फ कायदा शर्तभंग', breachEn: 'Waqf Act Breaches' },
      17: { totalMr: 'एकूण भूसंपादन अधिग्रहित / राखीव', totalEn: 'Total Land Acquisition Lands', breachMr: 'संपादन शर्तभंग / अवैध व्यवहार', breachEn: 'Acquisition Breaches' }
    }[num];

    return [
      {
        key: 'all',
        variant: 'blue',
        titleMr: titles.totalMr,
        titleEn: titles.totalEn,
        subtextMr: 'वैधानिक नोंदवही अभिलेख',
        subtextEn: 'Statutory Register Records',
        icon: 'Landmark',
        countKey: 'total712Count',
        areaKey: 'totalAreaHa',
        filterPredicate: () => true
      },
      {
        key: 'class2',
        variant: 'indigo',
        titleMr: 'भोगवटदार वर्ग २ जमिनी',
        titleEn: 'Class-2 Restricted',
        subtextMr: 'अविभाज्य शर्तीवरील धारिका',
        subtextEn: 'Restricted Inalienable Holdings',
        icon: 'Layers',
        countKey: 'c2Count',
        areaKey: 'c2Area',
        filterPredicate: isClass2
      },
      {
        key: 'conv',
        variant: 'purple',
        titleMr: 'अवैध वर्ग २ चे वर्ग १ रूपांतरण',
        titleEn: 'Illegal Class 2 to 1',
        subtextMr: 'नजराणा/मंजुरीविना रूपांतरण',
        subtextEn: 'Unsanctioned Freehold Conversion',
        icon: 'Scale',
        isAlert: true,
        countKey: 'convCount',
        areaKey: 'convArea',
        filterPredicate: getIllegalConv
      },
      {
        key: 'shart',
        variant: 'rose',
        titleMr: titles.breachMr,
        titleEn: titles.breachEn,
        subtextMr: 'मौका चौकशीअंती शर्तभंग',
        subtextEn: 'Spot Inquiry Condition Breach',
        icon: 'AlertTriangle',
        isAlert: true,
        countKey: 'shartCount',
        areaKey: 'shartArea',
        filterPredicate: getShartbhang
      },
      {
        key: 'del',
        variant: 'emerald',
        titleMr: 'इतर अधिकारातून नोंद कमी',
        titleEn: 'Rights Illegally Deleted',
        subtextMr: 'अवैधरित्या वगळलेली नोंद',
        subtextEn: 'Illegally Deleted Rights',
        icon: 'ShieldAlert',
        isAlert: true,
        countKey: 'delCount',
        areaKey: 'delArea',
        filterPredicate: getIllegalDel
      }
    ];
  }

  // Standard Booklets: 2, 3, 4, 5, 6, 8, 10, 11, 13
  const bookletSpecificTitles = {
    2: { totalMr: 'एकूण कुळ वहिवाट जमिनी', totalEn: 'Total Tenancy Parcels', breachMr: 'कुळ वहिवाट शर्तभंग' },
    3: { totalMr: 'एकूण इनाम व वतन जमिनी', totalEn: 'Total Inam/Watan Lands', breachMr: 'इनाम वतन शर्तभंग' },
    4: { totalMr: 'एकूण भूमिहीन प्रदान जमिनी', totalEn: 'Total Landless Grants', breachMr: 'भूमिहीन वाटप शर्तभंग' },
    5: { totalMr: 'एकूण संस्था / उद्योग प्रदान जमिनी', totalEn: 'Total Institutional Grants', breachMr: 'वापरात बदल व शर्तभंग' },
    6: { totalMr: 'एकूण कमाल धारणा वाटप जमिनी', totalEn: 'Total Ceiling Allotments', breachMr: 'सिलिंग वाटप शर्तभंग' },
    8: { totalMr: 'एकूण देवस्थान इनाम जमिनी', totalEn: 'Total Devasthan Inam Lands', breachMr: 'देवस्थान नोंद वगळणे व शर्तभंग' },
    10: { totalMr: 'एकूण प्रकल्पग्रस्त प्रदान जमिनी', totalEn: 'Total Rehabilitation Grants', breachMr: 'पुनर्वसन वाटप शर्तभंग' },
    11: { totalMr: 'एकूण शासकीय भाडेपट्टा जमिनी', totalEn: 'Total Leased Govt Lands', breachMr: 'भाडेपट्टा कालावधी व शर्तभंग' },
    13: { totalMr: 'एकूण खाजगी वने / कमाल धारणा चौकशी', totalEn: 'Total Forest / Ceiling Inquiries', breachMr: 'प्रलंबित चौकशी व शर्तभंग' }
  }[num] || { totalMr: 'एकूण तपासणी जमिनी', totalEn: 'Total Audited Parcels', breachMr: 'शर्तभंग झालेल्या जमिनी' };

  return [
    {
      key: 'all',
      variant: 'blue',
      titleMr: bookletSpecificTitles.totalMr,
      titleEn: bookletSpecificTitles.totalEn,
      subtextMr: 'पुस्तिका नोंदवही अभिलेख',
      subtextEn: 'Booklet Register Records',
      icon: 'Landmark',
      countKey: 'total712Count',
      areaKey: 'totalAreaHa',
      filterPredicate: () => true
    },
    {
      key: 'class2',
      variant: 'indigo',
      titleMr: 'भोगवटदार वर्ग २ जमिनी',
      titleEn: 'Class-2 Restricted',
      subtextMr: 'अविभाज्य शर्तीवरील धारिका',
      subtextEn: 'Restricted Inalienable Holdings',
      icon: 'Layers',
      countKey: 'c2Count',
      areaKey: 'c2Area',
      filterPredicate: isClass2
    },
    {
      key: 'conv',
      variant: 'purple',
      titleMr: 'अवैध वर्ग २ चे वर्ग १ रूपांतरण',
      titleEn: 'Illegal Class 2 to 1',
      subtextMr: 'सक्षम मंजुरीविना रूपांतरण',
      subtextEn: 'Unsanctioned Freehold Conversion',
      icon: 'Scale',
      isAlert: true,
      countKey: 'convCount',
      areaKey: 'convArea',
      filterPredicate: getIllegalConv
    },
    {
      key: 'shart',
      variant: 'rose',
      titleMr: bookletSpecificTitles.breachMr,
      titleEn: 'Condition Breaches',
      subtextMr: 'चौकशीअंती आढळलेला शर्तभंग',
      subtextEn: 'Inquiry Condition Breaches',
      icon: 'AlertTriangle',
      isAlert: true,
      countKey: 'delCount',
      areaKey: 'delArea',
      filterPredicate: (p) => getShartbhang(p) || getIllegalDel(p)
    },
    {
      key: 'noOther',
      variant: 'amber',
      titleMr: 'इतर अधिकारात नोंद नसलेल्या',
      titleEn: 'Not in Other Rights',
      subtextMr: 'इतर अधिकार रकाना कोरा',
      subtextEn: 'Missing In Other Rights',
      icon: 'FileText',
      countKey: 'noOtherCount',
      areaKey: 'noOtherArea',
      filterPredicate: getOtherRightsMissing
    }
  ];
}

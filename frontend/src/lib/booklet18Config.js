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
    nameMr: 'कुळ वहिवाट व शेतजमीन कायदा',
    nameEn: 'Tenancy & Agricultural Land Act',
    descMr: 'कुळ घोषित जमिनी, शर्तभंग व वर्ग-२ चे वर्ग-१ अवैध रूपांतरण',
    descEn: 'Declared tenant lands, breach & illegal conversion from Class-2 to Class-1',
    goshwaraType: 'STANDARD'
  },
  {
    id: 3,
    nameMr: 'जमिन इनाम व वतन जमिनी',
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
    nameMr: 'विकास आराखडा व गुरचरण जमिनी',
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
export function getDetailedColumnsForBooklet(catId, isMarathi = true) {
  const num = parseInt(catId, 10);

  const getShartbhang = (p) => p.auditPoints?.point_37 === 'होय' || p.metadata?.auditPoints?.point_37 === 'होय' || p.metadata?.flags?.isShartbhang || (p.forwardCases?.some(fc => fc.violationType === 'SHARTBHANG'));
  const getIllegalConv = (p) => p.auditPoints?.point_36 === 'होय' || p.metadata?.auditPoints?.point_36 === 'होय' || p.metadata?.flags?.isIllegalConversion || (p.tenureClass === 'BHOGVATDAR_CLASS_1' && p.metadata?.flags?.isShartbhang);
  const getOtherRights = (p) => p.auditPoints?.point_40 === 'होय' || p.metadata?.auditPoints?.point_40 === 'होय' || (p.metadata?.otherRights && p.metadata.otherRights !== '-' && p.metadata.otherRights !== '....');
  const getIllegalDel = (p) => p.auditPoints?.point_41 === 'होय' || p.metadata?.auditPoints?.point_41 === 'होय' || p.metadata?.flags?.isIllegalDeletion || (p.forwardCases?.some(fc => fc.violationType === 'GOVERNMENT_NAME_MISSING'));

  if (num === 1) {
    // 1) सरकारी जमीन
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[140px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र (हे.आर.)' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'tenureType', label: isMarathi ? 'भूधारणा पद्धती' : 'Tenure Type', minW: 'w-28', align: 'center', getValue: p => p.tenureDisplay || (p.tenureClass === 'SARKAR_SHASAN' ? 'सरकार' : 'भोगवटदार') },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || (isMarathi ? 'महाराष्ट्र शासन' : 'Govt of Maharashtra') },
      { key: 'landQuality', label: isMarathi ? 'जमिनीचा दर्जा' : 'Land Quality', minW: 'w-28', align: 'center', getValue: p => p.auditPoints?.point_11 || p.metadata?.auditPoints?.point_11 || (p.tenureClass === 'SARKAR_SHASAN' ? (isMarathi ? 'शासकीय जमीन' : 'Govt Land') : (isMarathi ? 'खाजगी' : 'Private')) },
      { key: 'isForest', label: isMarathi ? 'वन/झुडपी जमीन' : 'Forest / Scrub', minW: 'w-28', align: 'center', isBadge: true, getValue: p => (p.auditPoints?.point_13 === 'आहे' || p.metadata?.auditPoints?.point_13 === 'आहे' || p.tenureClass === 'FOREST_JANGAL' || p.metadata?.otherRights?.includes('वन')) ? 'आहे' : 'नाही' },
      { key: 'isEncroached', label: isMarathi ? 'अतिक्रमण आहे काय?' : 'Encroached?', minW: 'w-28', align: 'center', isBadge: true, isAlertVal: val => val === 'आहे' || val === 'होय', getValue: p => (p.auditPoints?.point_15 === 'आहे' || p.metadata?.auditPoints?.point_15 === 'आहे' || p.metadata?.flags?.isEncroached) ? 'आहे' : 'नाही' },
      { key: 'isAllotted', label: isMarathi ? 'वाटप झालेली आहे काय?' : 'Allotted?', minW: 'w-28', align: 'center', isBadge: true, getValue: p => (p.auditPoints?.point_14 === 'होय' || p.metadata?.auditPoints?.point_14 === 'होय' || p.metadata?.flags?.isCorpAllot || p.metadata?.flags?.isPrivateAllot) ? 'होय' : 'नाही' },
      { key: 'isGovtDeleted', label: isMarathi ? 'अवैधरित्या सरकार किंवा शासन नोंद कमी केली आहे काय?' : 'Govt Name Illegally Deleted?', minW: 'min-w-[180px]', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => (p.auditPoints?.point_18 === 'होय' || p.metadata?.auditPoints?.point_18 === 'होय' || p.metadata?.flags?.isIllegalDeletion) ? 'होय' : 'नाही' }
    ];
  }

  if (num === 7) {
    // 7) विकास आराखडा व गुरचरण जमिनी
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[140px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र (हे.आर.)' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'authorityName', label: isMarathi ? 'प्राधिकरणाचे नाव' : 'Authority Name', minW: 'min-w-[160px]', align: 'left', getValue: p => p.metadata?.authorityName || (p.metadata?.otherRights?.includes('मनपा') ? 'महानगरपालिका' : (p.metadata?.otherRights?.includes('ग्रामपंचायत') ? 'ग्रामपंचायत' : (p.metadata?.otherRights?.includes('प्राधिकरण') ? 'नियोजन प्राधिकरण' : 'स्थानिक संस्था'))) },
      { key: 'purpose', label: isMarathi ? 'प्रयोजन' : 'Reservation Purpose', minW: 'min-w-[150px]', align: 'left', getValue: p => p.metadata?.reservationPurpose || (p.metadata?.otherRights?.includes('गुरचरण') ? 'गुरचरण' : (p.metadata?.otherRights?.includes('चराई') ? 'चराई' : 'सार्वजनिक आरक्षण')) },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
      { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getIllegalDel(p) ? 'होय' : 'नाही' }
    ];
  }

  if (num === 9) {
    // 9) आदिवासी खातेदारांचे मालकीच्या जमिनी
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[140px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र (हे.आर.)' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'illegalConv', label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1' : 'Illegal Class 2 to 1?', minW: 'w-32', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getIllegalConv(p) ? 'होय' : 'नाही' },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
      { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getIllegalDel(p) ? 'होय' : 'नाही' },
      { key: 'tribalToTribal', label: isMarathi ? 'अवैधरित्या आदिवासी ते आदिवासी हस्तांतरण झालेले आहे काय?' : 'Illegal Tribal to Tribal Transfer?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => (p.auditPoints?.point_38 === 'होय' || p.metadata?.auditPoints?.point_38 === 'होय' || p.metadata?.tribalToTribalIllegal || (p.metadata?.flags?.isTribal && p.metadata?.otherRights?.includes('हस्तांतरण'))) ? 'होय' : 'नाही' },
      { key: 'tribalToNonTribal', label: isMarathi ? 'अवैधरित्या आदिवासी ते गैर- आदिवासी हस्तांतरण झालेले आहे काय?' : 'Illegal Tribal to Non-Tribal Transfer?', minW: 'min-w-[180px]', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => (p.auditPoints?.point_39 === 'होय' || p.metadata?.auditPoints?.point_39 === 'होय' || p.metadata?.tribalToNonTribalIllegal || (p.metadata?.flags?.isTribal && (p.forwardCases?.some(fc => fc.violationType === 'TRIBAL_LAND_VIOLATION') || p.metadata?.otherRights?.includes('गैर-आदिवासी')))) ? 'होय' : 'नाही' }
    ];
  }

  if (num === 10 || num === 11) {
    // 10) पुनर्वसन / 11) भाडेपट्टयाने शासकीय जमीन
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[140px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र (हे.आर.)' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'illegalConv', label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1' : 'Illegal Class 2 to 1?', minW: 'w-32', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getIllegalConv(p) ? 'होय' : 'नाही' },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
      { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getIllegalDel(p) ? 'होय' : 'नाही' }
    ];
  }

  if (num === 12) {
    // 12) भुदान व ग्रामदान अंतर्गत प्रदान केलेल्या जमिनी
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[140px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र (हे.आर.)' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'illegalConv', label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1' : 'Illegal Class 2 to 1?', minW: 'w-32', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getIllegalConv(p) ? 'होय' : 'नाही' },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
      { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getIllegalDel(p) ? 'होय' : 'नाही' },
      { key: 'illegalTransfer', label: isMarathi ? 'अवैधरित्या हस्तांतरण झालेले आहे काय?' : 'Illegal Transfer Occurred?', minW: 'min-w-[150px]', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => (p.metadata?.flags?.isUnauthorizedTransfer || p.metadata?.otherRights?.includes('हस्तांतरण') || p.bhudanRecords?.some(br => br.unauthorizedAlienation)) ? 'होय' : 'नाही' }
    ];
  }

  if (num === 13) {
    // 13) खाजगी वने संपादन प्रलंबित
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[140px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र (हे.आर.)' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
      { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getIllegalDel(p) ? 'होय' : 'नाही' }
    ];
  }

  if (num === 14 || num === 15 || num === 16 || num === 17) {
    // 14) भूमीधारी / 15) कमाल मर्यादा सूट / 16) वक्फ / 17) भूसंपादन
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[140px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र (हे.आर.)' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'illegalConv', label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1' : 'Illegal Class 2 to 1?', minW: 'w-32', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getIllegalConv(p) ? 'होय' : 'नाही' },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
      { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getIllegalDel(p) ? 'होय' : 'नाही' },
      { key: 'shartbhang', label: isMarathi ? 'शर्तभंग झालेला आहे काय?' : 'Condition Breach Occurred?', minW: 'w-32', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getShartbhang(p) ? 'होय' : 'नाही' }
    ];
  }

  if (num === 18) {
    // 18) कुळ कायदा कलम 89 व 89-अ/47 व 47 प्रमाणे धारण केलेली जमीन
    return [
      { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[140px]', align: 'left', getValue: p => p.villageName },
      { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
      { key: 'area', label: isMarathi ? 'क्षेत्र (हे.आर.)' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
      { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
      { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
      { key: 'hasPermit', label: isMarathi ? 'कंपनीने धारण करताना परवानगी घेतलेली आहे काय?' : 'Company Permit Taken?', minW: 'min-w-[150px]', align: 'center', isBadge: true, getValue: p => (p.auditPoints?.point_42 === 'होय' || p.auditPoints?.point_41 === 'होय' || p.tenancy89ARecords?.[0]?.isGenuineIndustrialUse || p.metadata?.auditPoints?.point_41 === 'होय') ? 'होय' : 'नाही' },
      { key: 'usageBreach', label: isMarathi ? 'वापराबाबत शर्तभंग झालेला आहे काय?' : 'Usage Condition Breach?', minW: 'min-w-[150px]', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => (p.metadata?.auditPoints?.point_44 === 'नाही' || p.metadata?.auditPoints?.point_45_usage === 'होय' || (p.forwardCases?.some(fc => fc.violationType === 'UNAUTHORIZED_NA_CONVERSION'))) ? 'होय' : 'नाही' },
      { key: 'transferBreach', label: isMarathi ? 'हस्तांतरनाबाबत शर्तभंग आहे काय?' : 'Transfer Condition Breach?', minW: 'min-w-[150px]', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => (p.metadata?.auditPoints?.point_45_transfer === 'होय' || p.tenancy89ARecords?.[0]?.unauthorizedTransfer || (p.forwardCases?.some(fc => fc.violationType === 'SHARTBHANG' || fc.violationType === 'TRIBAL_LAND_VIOLATION'))) ? 'होय' : 'नाही' },
      { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => (p.auditPoints?.point_40 === 'होय' || p.auditPoints?.point_39 === 'होय' || (p.metadata?.otherRights && p.metadata?.otherRights !== '-' && p.metadata?.otherRights !== '....')) ? 'होय' : 'नाही' }
    ];
  }

  // Default: Booklets 2, 3, 4, 5, 6, 8
  return [
    { key: 'village', label: isMarathi ? 'गावाचे नाव' : 'Village Name', minW: 'min-w-[140px]', align: 'left', getValue: p => p.villageName },
    { key: 'surveyNo', label: isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.', minW: 'w-24', align: 'center', isMono: true, getValue: p => p.gatNumber || p.oldSurveyNo || '-' },
    { key: 'area', label: isMarathi ? 'क्षेत्र (हे.आर.)' : 'Area (Ha)', minW: 'w-24', align: 'right', isArea: true, getValue: p => Number(p.totalAreaHa || 0).toFixed(4) },
    { key: 'owner', label: isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name', minW: 'min-w-[180px]', align: 'left', isOwner: true, getValue: p => p.currentOwner || p.metadata?.ownerName || '-' },
    { key: 'tenureClass', label: isMarathi ? 'भोगवट्दार वर्ग' : 'Occupant Class', minW: 'w-24', align: 'center', isTenureBadge: true, getValue: p => p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २') },
    { key: 'shartbhang', label: isMarathi ? 'शर्तभंग झालेला आहे काय?' : 'Condition Breach Occurred?', minW: 'w-32', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getShartbhang(p) ? 'होय' : 'नाही' },
    { key: 'illegalConv', label: isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1' : 'Illegal Class 2 to 1?', minW: 'w-32', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getIllegalConv(p) ? 'होय' : 'नाही' },
    { key: 'otherRightsNoted', label: isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Other Rights Noted?', minW: 'w-32', align: 'center', isBadge: true, getValue: p => getOtherRights(p) ? 'होय' : 'नाही' },
    { key: 'illegalDel', label: isMarathi ? 'अवैधरित्या इतर अधिकारातील नोंदी कमी केलेल्या आहे काय?' : 'Other Rights Illegally Deleted?', minW: 'min-w-[160px]', align: 'center', isBadge: true, isAlertVal: val => val === 'होय', getValue: p => getIllegalDel(p) ? 'होय' : 'नाही' }
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

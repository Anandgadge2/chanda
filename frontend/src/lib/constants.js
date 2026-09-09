export const CHANDRAPUR_TALUKAS = [
  { id: 'Warora', nameMr: 'वरोरा', nameEn: 'Warora' },
  { id: 'Rajura', nameMr: 'राजुरा', nameEn: 'Rajura' },
  { id: 'Chandrapur', nameMr: 'चंद्रपूर', nameEn: 'Chandrapur' },
  { id: 'Mul', nameMr: 'मूल', nameEn: 'Mul' },
  { id: 'Chimur', nameMr: 'चिमूर', nameEn: 'Chimur' },
  { id: 'Ballarpur', nameMr: 'बल्लारपूर', nameEn: 'Ballarpur' },
  { id: 'Bhadravati', nameMr: 'भद्रावती', nameEn: 'Bhadravati' },
  { id: 'Sindewahi', nameMr: 'सिंदेवाही', nameEn: 'Sindewahi' },
  { id: 'Brahmapuri', nameMr: 'ब्रह्मपुरी', nameEn: 'Brahmapuri' },
  { id: 'Nagbhid', nameMr: 'नागभीड', nameEn: 'Nagbhid' },
];

export const TENURE_CLASSES = {
  BHOGVATDAR_CLASS_1: {
    labelMr: 'भोगवटादार वर्ग-१',
    labelEn: 'Class-1 (Freehold)',
    description: 'पूर्ण अधिकार, विनापरवानगी विक्री व वाटप अनुज्ञेय',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  BHOGVATDAR_CLASS_2: {
    labelMr: 'भोगवटादार वर्ग-२',
    labelEn: 'Class-2 (Restricted)',
    description: 'शर्तयुक्त धारणाधिकार, हस्तांतरणास जिल्हाधिकारी/SDO पूर्वपरवानगी अनिवार्य',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  SARKAR_SHASAN: {
    labelMr: 'शासकीय / शासन',
    labelEn: 'Government (Sarkar)',
    description: 'महाराष्ट्र शासनाकडे निहित (गायराण, नदीपात्र, सार्वजनिक प्रयोजन)',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  DEVASTHAN_INAM: {
    labelMr: 'देवस्थान / इनाम',
    labelEn: 'Devasthan / Inam',
    description: 'धार्मिक न्यास किंवा सेवा इनाम जमीन, हस्तांतरणास प्रतिबंध',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  FOREST_JANGAL: {
    labelMr: 'वन जमीन',
    labelEn: 'Forest Land',
    description: 'राखीव व संरक्षित वनजमीन',
    badgeClass: 'bg-green-50 text-green-800 border-green-300',
  },
};

export const VIOLATION_TYPES = {
  SHARTBHANG: {
    labelMr: 'शर्तभंग (Breach of Conditions)',
    labelEn: 'Breach of Allotment Conditions',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  TRIBAL_LAND_VIOLATION: {
    labelMr: 'आदिवासी जमीन हस्तांतरण (कलम ३६/३६अ)',
    labelEn: 'Tribal Land Transfer (Sec 36/36A)',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
  },
  UNAUTHORIZED_NA_CONVERSION: {
    labelMr: 'विनापरवानगी अ.कृ. वापर (Unauthorized NA)',
    labelEn: 'Unauthorized Non-Agricultural Use',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  ENCROACHMENT: {
    labelMr: 'गायराण/शासकीय जमिनीवर अतिक्रमण',
    labelEn: 'Encroachment on Govt Land (Sec 50-54)',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  POKALIST_NONDI: {
    labelMr: 'पोकळीस्त नोंदी (Bu.Ga.De / Ta.Ga.De)',
    labelEn: 'Defunct Hollow Mutation Remarks',
    badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  },
  GOVERNMENT_NAME_MISSING: {
    labelMr: 'शासकीय नाव वगळणे / परस्पर बदल',
    labelEn: 'Altered from Shasan to Private',
    badgeClass: 'bg-slate-50 text-slate-800 border-slate-300',
  },
};

export const ENFORCEMENT_STATUSES = {
  FLAGGED_IN_AUDIT: {
    labelMr: 'लेखापरीक्षणात नोंद (Flagged)',
    labelEn: 'Audit Flagged',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  FIELD_PANCHNAMA_COMPLETED: {
    labelMr: 'स्थळ पंचनामा पूर्ण',
    labelEn: 'Panchnama Done',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  NOTICE_ISSUED: {
    labelMr: 'कारणे दाखवा नोटीस बजावली',
    labelEn: 'Notice Issued',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  HEARING_SCHEDULED: {
    labelMr: 'सुनावणी सुरू (SDO/Tehsildar)',
    labelEn: 'Hearing Scheduled',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  FINAL_ORDER_PASSED: {
    labelMr: 'अंतिम आदेश पारित',
    labelEn: 'Final Order Passed',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  RECTIFIED_7_12: {
    labelMr: '७/१२ दुरुस्ती प्रमाणित',
    labelEn: '7/12 Rectified',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  DISMISSED: {
    labelMr: 'प्रकरण निकाली / फेटाळले',
    labelEn: 'Dismissed',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

export const DMS_DOC_TYPES = {
  OLD_7_12_ARCHIVE: {
    labelMr: 'सन १९५० जुना सातबारा उतारा',
    labelEn: '1950 Baseline 7/12 Extract',
    iconName: 'FileArchive',
  },
  FERFAR_REGISTER_COPY: {
    labelMr: 'गाव नमुना ६ फेरफार प्रत',
    labelEn: 'Village Form VI Mutation Extract',
    iconName: 'FileSpreadsheet',
  },
  FIELD_PANCHNAMA: {
    labelMr: 'स्थळ पंचनामा व तपासणी अहवाल',
    labelEn: 'Field Panchnama Report',
    iconName: 'ClipboardCheck',
  },
  SDO_ORDER: {
    labelMr: 'उपविभागीय अधिकारी (SDO) आदेश',
    labelEn: 'SDO Quasi-Judicial Order',
    iconName: 'Scale',
  },
  COLLECTOR_ORDER: {
    labelMr: 'जिल्हाधिकारी शासन जमा आदेश',
    labelEn: 'Collector Resumption Order',
    iconName: 'Landmark',
  },
  SHOW_CAUSE_NOTICE: {
    labelMr: 'कारणे दाखवा नोटीस (Show Cause)',
    labelEn: 'Show-Cause Legal Notice',
    iconName: 'MailWarning',
  },
};

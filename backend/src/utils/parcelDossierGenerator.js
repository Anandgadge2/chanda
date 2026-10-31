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
  if (!name) return '-';
  const clean = String(name).trim();
  return TALUKA_EN_TO_MR[clean] || clean;
};

const TENURE_LABELS = {
  BHOGVATDAR_CLASS_1: 'भोगवटादार वर्ग-१ (मुक्त धारणा)',
  BHOGVATDAR_CLASS_2: 'भोगवटादार वर्ग-२ (शर्तयुक्त - हस्तांतरणास परवानगी आवश्यक)',
  SARKAR_SHASAN: 'शासकीय / शासन (महाराष्ट्र शासनाकडे निहित)',
  DEVASTHAN_INAM: 'देवस्थान / इनाम जमीन',
  FOREST_JANGAL: 'वन जमीन (राखीव / संरक्षित)',
};

const VIOLATION_LABELS = {
  SHARTBHANG: 'शर्तभंग (वाटप अटींचे उल्लंघन)',
  TRIBAL_LAND_VIOLATION: 'आदिवासी जमीन हस्तांतरण (कलम ३६/३६अ)',
  UNAUTHORIZED_NA_CONVERSION: 'विनापरवानगी अ.कृ. वापर',
  ENCROACHMENT: 'गायराण/शासकीय जमिनीवर अतिक्रमण',
  POKALIST_NONDI: 'पोकळीस्त नोंदी',
  GOVERNMENT_NAME_MISSING: 'शासकीय नाव वगळणे / परस्पर बदल',
};

const STATUS_LABELS = {
  FLAGGED_IN_AUDIT: 'लेखापरीक्षणात नोंद',
  FIELD_PANCHNAMA_COMPLETED: 'स्थळ पंचनामा पूर्ण',
  NOTICE_ISSUED: 'कारणे दाखवा नोटीस बजावली',
  HEARING_SCHEDULED: 'सुनावणी सुरू',
  FINAL_ORDER_PASSED: 'अंतिम आदेश पारित',
  RECTIFIED_7_12: '७/१२ अद्ययावत केले',
  DISMISSED: 'फेटाळले',
};

const DOC_TYPE_LABELS = {
  OLD_7_12_ARCHIVE: 'सन १९५० मूळ ७/१२',
  FERFAR_REGISTER_COPY: 'गाव नमुना ६ फेरफार प्रत',
  FIELD_PANCHNAMA: 'स्थळ पंचनामा अहवाल',
  SDO_ORDER: 'उपविभागीय अधिकारी आदेश',
  COLLECTOR_ORDER: 'जिल्हाधिकारी आदेश',
  SHOW_CAUSE_NOTICE: 'कारणे दाखवा नोटीस',
};

/**
 * GENERATE PARCEL PROVENANCE DOSSIER PDF
 * Official Collectorate Dossier matching Chandrapur District Land Records portal
 */
export async function generateParcelDossierPdf(traceData, res) {
  const parcel = traceData?.parcel || {};
  const summary = traceData?.intelligenceSummary || {};
  const baseline = summary?.baseline1950Epoch || parcel?.backwardHistories?.find(b => b.epochYear === 1950);
  const nowStr = new Date().toLocaleString('mr-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  const content = [];

  // ==========================================
  // 1. EXECUTIVE GOVERNMENT HEADER
  // ==========================================
  content.push({
    table: {
      widths: ['100%'],
      body: [
        [
          {
            fillColor: '#1e3a8a',
            margin: [8, 10, 8, 10],
            stack: [
              { text: 'महाराष्ट्र शासन • महसूल व वन विभाग', style: 'docHeaderTop' },
              { text: 'जिल्हाधिकारी कार्यालय, चंद्रपूर', style: 'docHeaderMain' },
              { text: 'ई-अभिलेख कक्ष व भूमी महसूल प्रशासन प्रणाली', style: 'docHeaderSub' },
              {
                text: 'भूखंड तपशील व ३६०° शीर्षक साखळी अहवाल (Land Parcel Provenance Dossier)',
                style: 'docHeaderTitle',
                margin: [0, 4, 0, 0],
              },
            ],
          },
        ],
      ],
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 10],
  });

  // Metadata Bar
  content.push({
    table: {
      widths: ['35%', '35%', '30%'],
      body: [
        [
          {
            text: [
              { text: 'UPI: ', bold: true, color: '#1e3a8a' },
              { text: parcel.upi || '-', font: 'Nirmala', bold: true },
            ],
            style: 'metaCell',
          },
          {
            text: [
              { text: 'अहवाल दिनांक: ', bold: true, color: '#1e3a8a' },
              { text: nowStr, font: 'Nirmala' },
            ],
            style: 'metaCell',
          },
          {
            text: [
              { text: 'वाद स्थिती: ', bold: true, color: '#1e3a8a' },
              {
                text: parcel.hasActiveDispute ? 'सक्रिय वाद (Disputed)' : 'निर्वैध नोंद (Clear Record)',
                bold: true,
                color: parcel.hasActiveDispute ? '#b91c1c' : '#047857',
              },
            ],
            style: 'metaCell',
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#cbd5e1',
      vLineColor: () => '#cbd5e1',
      fillColor: () => '#f8fafc',
    },
    margin: [0, 0, 0, 12],
  });

  // ==========================================
  // 2. STATUTORY ALERTS / RESUMPTION BANNERS
  // ==========================================
  if (summary?.potentialIllegalAlienation) {
    content.push({
      table: {
        widths: ['100%'],
        body: [
          [
            {
              fillColor: '#fffbeb',
              margin: [8, 6, 8, 6],
              stack: [
                {
                  text: '⚠ वैधानिक इशारा: संभाव्य बेकायदेशीर हस्तांतरण (MLRC Sec 36/36A Alert)',
                  bold: true,
                  fontSize: 9.5,
                  color: '#92400e',
                },
                {
                  text: 'हा भूखंड सन १९५० च्या अभिलेखात मूळ आदिवासी खातेदार किंवा शासकीय सदरी नोंदवला होता, परंतु नंतर अनधिकृतपणे खाजगी धारणेवर वर्ग करण्यात आल्याचे संशयित आढळते. चौकशी आवश्यक.',
                  fontSize: 8.5,
                  color: '#78350f',
                  margin: [0, 2, 0, 0],
                },
              ],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => '#f59e0b',
        vLineColor: () => '#f59e0b',
      },
      margin: [0, 0, 0, 10],
    });
  }

  if (summary?.isRepossessedToGovt) {
    content.push({
      table: {
        widths: ['100%'],
        body: [
          [
            {
              fillColor: '#ecfdf5',
              margin: [8, 6, 8, 6],
              stack: [
                {
                  text: '✓ शासन जमा आदेश पारित (Resumed to Government)',
                  bold: true,
                  fontSize: 9.5,
                  color: '#065f46',
                },
                {
                  text: 'जिल्हाधिकारी कार्यालयाच्या अंतिम आदेशानुसार हा भूखंड अनधिकृत कब्जेदारामधून काढून पुन्हा शासकीय सदरी वर्ग करण्यात आला आहे.',
                  fontSize: 8.5,
                  color: '#047857',
                  margin: [0, 2, 0, 0],
                },
              ],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => '#10b981',
        vLineColor: () => '#10b981',
      },
      margin: [0, 0, 0, 10],
    });
  }

  // ==========================================
  // 3. SECTION 1: मूलभूत भूखंड तपशील
  // ==========================================
  content.push({
    text: '१. मूलभूत भूखंड तपशील (Primary Parcel Attributes)',
    style: 'sectionHeading',
  });

  const villageDisplay = cleanVillageName(parcel.villageName);
  const talukaDisplay = formatTalukaMr(parcel.taluka);
  const tenureDisplay = TENURE_LABELS[parcel.tenureClass] || parcel.tenureClass || '-';

  content.push({
    table: {
      widths: ['25%', '25%', '25%', '25%'],
      body: [
        [
          { text: 'जिल्हा:', style: 'labelCell' },
          { text: parcel.district ? (TALUKA_EN_TO_MR[parcel.district] || parcel.district) : 'चंद्रपूर', style: 'valueCell' },
          { text: 'तालुका:', style: 'labelCell' },
          { text: talukaDisplay, style: 'valueCell' },
        ],
        [
          { text: 'गाव:', style: 'labelCell' },
          { text: `${villageDisplay} (${parcel.villageCode || '-'})`, style: 'valueCell' },
          { text: 'महसूल मंडळ:', style: 'labelCell' },
          { text: parcel.revenueCircle || '-', style: 'valueCell' },
        ],
        [
          { text: 'चालू गट क्र.:', style: 'labelCell' },
          { text: parcel.gatNumber ? `${parcel.gatNumber}${parcel.hissaNumber && parcel.hissaNumber !== '0' ? ` (हिस्सा ${parcel.hissaNumber})` : ''}` : '-', style: 'valueCell', bold: true },
          { text: 'जुना सर्व्हे क्र.:', style: 'labelCell' },
          { text: parcel.oldSurveyNo || '-', style: 'valueCell' },
        ],
        [
          { text: 'एकूण क्षेत्र (हे.):', style: 'labelCell' },
          { text: `${Number(parcel.totalAreaHa || 0).toFixed(4)} हे.`, style: 'valueCell', bold: true },
          { text: 'पोटखराबा क्षेत्र (हे.):', style: 'labelCell' },
          { text: `${Number(parcel.potkharabaAreaHa || 0).toFixed(4)} हे.`, style: 'valueCell' },
        ],
        [
          { text: 'धारणा प्रकार (Tenure):', style: 'labelCell' },
          { text: tenureDisplay, style: 'valueCell', colSpan: 3, bold: true, color: '#1e3a8a' },
          {},
          {},
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.75,
      vLineWidth: () => 0.75,
      hLineColor: () => '#cbd5e1',
      vLineColor: () => '#cbd5e1',
      fillColor: (rowIndex) => (rowIndex % 2 === 0 ? '#f8fafc' : '#ffffff'),
    },
    margin: [0, 0, 0, 12],
  });

  // ==========================================
  // 4. SECTION 2: सन १९५० मूळ नोंद तपशील
  // ==========================================
  content.push({
    text: '२. सन १९५० मूळ नोंद व बंदोबस्त आधार (1950 Baseline Record)',
    style: 'sectionHeading',
  });

  content.push({
    table: {
      widths: ['25%', '25%', '25%', '25%'],
      body: [
        [
          { text: '१९५० मूळ खातेदार:', style: 'labelCell' },
          { text: baseline?.ownerName || 'नोंद अनुपलब्ध', style: 'valueCell', bold: true },
          { text: '१९५० खाते क्र.:', style: 'labelCell' },
          { text: baseline?.khataNumber || '-', style: 'valueCell' },
        ],
        [
          { text: '१९५० फेरफार क्र.:', style: 'labelCell' },
          { text: baseline?.ferfarNumber || '-', style: 'valueCell' },
          { text: '१९५० नोंद क्षेत्र:', style: 'labelCell' },
          { text: baseline?.areaHa ? `${Number(baseline.areaHa).toFixed(4)} हे.` : '-', style: 'valueCell' },
        ],
        [
          { text: 'हस्तांतरण प्रकार:', style: 'labelCell' },
          { text: baseline?.mutationType || 'सन १९५० बंदोबस्त नोंद', style: 'valueCell' },
          { text: '१९५० शासकीय जमीन?', style: 'labelCell' },
          { text: baseline?.wasGovtLand ? 'होय (शासकीय)' : 'नाही (खाजगी)', style: 'valueCell', bold: true, color: baseline?.wasGovtLand ? '#b91c1c' : '#1e3a8a' },
        ],
        [
          { text: 'मूळ शेरा:', style: 'labelCell' },
          { text: baseline?.remarks || 'हस्तलिखित अधिकार अभिलेख नोंद', style: 'valueCell', colSpan: 3 },
          {},
          {},
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.75,
      vLineWidth: () => 0.75,
      hLineColor: () => '#cbd5e1',
      vLineColor: () => '#cbd5e1',
      fillColor: (rowIndex) => (rowIndex % 2 === 0 ? '#f8fafc' : '#ffffff'),
    },
    margin: [0, 0, 0, 12],
  });

  // ==========================================
  // 5. SECTION 3: १९५० पासूनची शीर्षक साखळी
  // ==========================================
  content.push({
    text: `३. सन १९५० पासूनची शीर्षक साखळी व फेरफार इतिहास (Backward Title Chain - ${parcel.backwardHistories?.length || 0} नोंदी)`,
    style: 'sectionHeading',
  });

  const timelineHeaders = [
    { text: 'अ.क्र.', style: 'th' },
    { text: 'वर्ष', style: 'th' },
    { text: 'खातेदार / मालकाचे नाव', style: 'th' },
    { text: 'खाते क्र.', style: 'th' },
    { text: 'फेरफार', style: 'th' },
    { text: 'क्षेत्र (हे.)', style: 'th' },
    { text: 'हस्तांतरण प्रकार', style: 'th' },
    { text: 'शासकीय?', style: 'th' },
    { text: 'भौतिक कपाट', style: 'th' },
    { text: 'शेरा', style: 'th' },
  ];

  const timelineRows = [timelineHeaders];

  if (parcel.backwardHistories && parcel.backwardHistories.length > 0) {
    parcel.backwardHistories.forEach((epoch, idx) => {
      const is1950 = epoch.epochYear === 1950;
      const rackLoc = is1950 ? 'R-01/B-01' : epoch.epochYear === 1988 ? 'R-02/B-04' : 'R-03/B-09';
      timelineRows.push([
        { text: String(idx + 1), style: 'tdCenter' },
        { text: `${epoch.epochYear}${is1950 ? ' (मूळ)' : ''}`, style: 'tdCenter', bold: is1950, color: is1950 ? '#1e3a8a' : '#0f172a' },
        { text: epoch.ownerName || '-', style: 'td', bold: is1950 },
        { text: epoch.khataNumber || '-', style: 'tdCenter' },
        { text: epoch.ferfarNumber || '-', style: 'tdCenter' },
        { text: epoch.areaHa ? Number(epoch.areaHa).toFixed(4) : '-', style: 'tdCenter' },
        { text: epoch.mutationType || '-', style: 'td' },
        { text: epoch.wasGovtLand ? 'होय' : 'नाही', style: 'tdCenter', bold: epoch.wasGovtLand, color: epoch.wasGovtLand ? '#b91c1c' : '#0f172a' },
        { text: rackLoc, style: 'tdCenter' },
        { text: epoch.remarks || '-', style: 'tdSmall' },
      ]);
    });
  } else {
    timelineRows.push([
      { text: 'कोणतीही मागील नोंद उपलब्ध नाही.', style: 'tdCenter', colSpan: 10 },
      {}, {}, {}, {}, {}, {}, {}, {}, {},
    ]);
  }

  content.push({
    table: {
      headerRows: 1,
      widths: [18, 38, 105, 34, 38, 42, 55, 38, 48, 72],
      body: timelineRows,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#cbd5e1',
      vLineColor: () => '#cbd5e1',
      fillColor: (rowIndex) => {
        if (rowIndex === 0) return '#1e3a8a';
        return rowIndex % 2 === 1 ? '#ffffff' : '#f8fafc';
      },
    },
    margin: [0, 0, 0, 12],
  });

  // ==========================================
  // 6. SECTION 4: शर्तभंग, अतिक्रमण व सुनावणी प्रकरणे
  // ==========================================
  content.push({
    text: `४. शर्तभंग, अतिक्रमण व सुनावणी प्रकरणे (Violations & Enforcement Hearings - ${parcel.forwardCases?.length || 0} प्रकरणे)`,
    style: 'sectionHeading',
  });

  if (parcel.forwardCases && parcel.forwardCases.length > 0) {
    const caseHeaders = [
      { text: 'अ.क्र.', style: 'th' },
      { text: 'केस क्रमांक', style: 'th' },
      { text: 'उल्लंघनाचा प्रकार', style: 'th' },
      { text: 'अनधिकृत कब्जेदार', style: 'th' },
      { text: 'अतिक्रमीत क्षेत्र', style: 'th' },
      { text: 'तपास अधिकारी', style: 'th' },
      { text: 'नोटीस दिनांक', style: 'th' },
      { text: 'सद्य स्थिती', style: 'th' },
      { text: 'शासन जमा', style: 'th' },
    ];

    const caseRows = [caseHeaders];

    parcel.forwardCases.forEach((item, idx) => {
      const violLabel = VIOLATION_LABELS[item.violationType] || item.violationType || '-';
      const statLabel = STATUS_LABELS[item.status] || item.status || '-';
      const noticeDateStr = item.showCauseNoticeDate ? new Date(item.showCauseNoticeDate).toLocaleDateString('mr-IN') : '-';

      caseRows.push([
        { text: String(idx + 1), style: 'tdCenter' },
        { text: item.caseNumber || '-', style: 'tdCenter', bold: true },
        { text: violLabel, style: 'td' },
        { text: item.occupantName || '-', style: 'td' },
        { text: item.encroachedAreaHa ? `${Number(item.encroachedAreaHa).toFixed(4)} हे.` : '-', style: 'tdCenter' },
        { text: item.investigatingOfficer || '-', style: 'td' },
        { text: noticeDateStr, style: 'tdCenter' },
        { text: statLabel, style: 'tdCenter' },
        { text: item.isRepossessedToGovt ? 'होय' : 'नाही', style: 'tdCenter', bold: item.isRepossessedToGovt, color: item.isRepossessedToGovt ? '#047857' : '#0f172a' },
      ]);
    });

    content.push({
      table: {
        headerRows: 1,
        widths: [18, 65, 80, 75, 50, 60, 45, 55, 40],
        body: caseRows,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#cbd5e1',
        vLineColor: () => '#cbd5e1',
        fillColor: (rowIndex) => {
          if (rowIndex === 0) return '#1e3a8a';
          return rowIndex % 2 === 1 ? '#ffffff' : '#f8fafc';
        },
      },
      margin: [0, 0, 0, 12],
    });
  } else {
    content.push({
      table: {
        widths: ['100%'],
        body: [
          [
            {
              text: '✓ या भूखंडावर कोणतेही सक्रिय वाद, शर्तभंग किंवा अतिक्रमण प्रकरण प्रलंबित नाही (निर्वैध नोंद).',
              style: 'td',
              color: '#065f46',
              fillColor: '#ecfdf5',
              margin: [8, 6, 8, 6],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#a7f3d0',
        vLineColor: () => '#a7f3d0',
      },
      margin: [0, 0, 0, 12],
    });
  }

  // ==========================================
  // 7. SECTION 5: ई-अभिलेख कक्ष संलग्न दस्तऐवज (DMS)
  // ==========================================
  content.push({
    text: `५. ई-अभिलेख कक्ष संलग्न दस्तऐवज (Collectorate DMS Files - ${parcel.documents?.length || 0} फायली)`,
    style: 'sectionHeading',
  });

  if (parcel.documents && parcel.documents.length > 0) {
    const docHeaders = [
      { text: 'अ.क्र.', style: 'th' },
      { text: 'दस्तऐवज शीर्षक', style: 'th' },
      { text: 'प्रकार', style: 'th' },
      { text: 'भौतिक कपाट व गठ्ठा', style: 'th' },
      { text: 'फाईल क्र.', style: 'th' },
      { text: 'अपलोड दिनांक', style: 'th' },
    ];

    const docRows = [docHeaders];

    parcel.documents.forEach((d, idx) => {
      const docTypeStr = DOC_TYPE_LABELS[d.docType] || d.docType || '-';
      const rackStr = d.recordRoomRackNo ? `कपाट ${d.recordRoomRackNo} • गठ्ठा ${d.recordRoomBundleNo || '-'}` : 'डिजिटाईज्ड ई-कक्षा';
      const dateStr = d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('mr-IN') : '-';

      docRows.push([
        { text: String(idx + 1), style: 'tdCenter' },
        { text: d.title || '-', style: 'td', bold: true },
        { text: docTypeStr, style: 'td' },
        { text: rackStr, style: 'tdCenter' },
        { text: d.fileNumber || '-', style: 'tdCenter' },
        { text: dateStr, style: 'tdCenter' },
      ]);
    });

    content.push({
      table: {
        headerRows: 1,
        widths: [20, 150, 100, 100, 50, 68],
        body: docRows,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#cbd5e1',
        vLineColor: () => '#cbd5e1',
        fillColor: (rowIndex) => {
          if (rowIndex === 0) return '#1e3a8a';
          return rowIndex % 2 === 1 ? '#ffffff' : '#f8fafc';
        },
      },
      margin: [0, 0, 0, 15],
    });
  } else {
    content.push({
      table: {
        widths: ['100%'],
        body: [
          [
            {
              text: 'या भूखंडासाठी सध्या स्वतंत्र स्कॅन दस्तऐवज संलग्न नाहीत (भौतिक अभिलेख कपाट R-01, गठ्ठा B-01 मध्ये सुरक्षित संरक्षित).',
              style: 'td',
              color: '#64748b',
              fillColor: '#f8fafc',
              margin: [8, 6, 8, 6],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#cbd5e1',
        vLineColor: () => '#cbd5e1',
      },
      margin: [0, 0, 0, 15],
    });
  }

  // ==========================================
  // 8. OFFICIAL CERTIFICATION & SIGNATURE BLOCK
  // ==========================================
  content.push({
    table: {
      widths: ['60%', '40%'],
      body: [
        [
          {
            stack: [
              { text: 'प्रमाणीकरण (Official Certification)', bold: true, fontSize: 9, color: '#1e3a8a' },
              {
                text: 'हा अहवाल जिल्हाधिकारी कार्यालय चंद्रपूर यांच्या अधिकृत संगणकीकृत ई-अभिलेख व भूमी महसूल प्रणालीद्वारे तयार करण्यात आला असून शासकीय व अर्ध-न्यायिक तपासणीसाठी ग्राह्य आहे.',
                fontSize: 8,
                color: '#475569',
                margin: [0, 2, 0, 0],
              },
              {
                text: `प्रणाली पडताळणी कोड: CH-REV-${(parcel.upi || '000').slice(-8)}-${Date.now().toString(36).toUpperCase()}`,
                fontSize: 7.5,
                color: '#64748b',
                font: 'Nirmala',
                margin: [0, 4, 0, 0],
              },
            ],
            margin: [6, 6, 6, 6],
          },
          {
            stack: [
              { text: 'स्वाक्षरी व शिक्का', bold: true, fontSize: 8.5, alignment: 'center', color: '#1e3a8a' },
              { text: '\n\n\n' },
              { text: 'तहसिलदार / उपविभागीय अधिकारी (प्रांत)', fontSize: 8, bold: true, alignment: 'center' },
              { text: `${talukaDisplay}, जिल्हा चंद्रपूर`, fontSize: 7.5, alignment: 'center', color: '#475569' },
            ],
            margin: [6, 6, 6, 6],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.75,
      vLineWidth: () => 0.75,
      hLineColor: () => '#cbd5e1',
      vLineColor: () => '#cbd5e1',
      fillColor: () => '#f8fafc',
    },
    margin: [0, 5, 0, 0],
  });

  // ==========================================
  // 9. PDF DOCUMENT DEFINITION
  // ==========================================
  const docDefinition = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [28, 24, 28, 28],
    defaultStyle: {
      font: 'Nirmala',
      fontSize: 8.5,
      color: '#1e293b',
    },
    footer: function (currentPage, pageCount) {
      return {
        columns: [
          {
            text: 'जिल्हाधिकारी कार्यालय चंद्रपूर • ई-अभिलेख व भूमी महसूल प्रणाली (चंदा)',
            alignment: 'left',
            fontSize: 7.5,
            color: '#64748b',
            margin: [28, 6, 0, 0],
          },
          {
            text: `पृष्ठ ${currentPage} पैकी ${pageCount}`,
            alignment: 'right',
            fontSize: 7.5,
            color: '#64748b',
            margin: [0, 6, 28, 0],
          },
        ],
      };
    },
    content,
    styles: {
      docHeaderTop: {
        fontSize: 9.5,
        color: '#dbeafe',
        alignment: 'center',
        bold: true,
      },
      docHeaderMain: {
        fontSize: 14,
        color: '#ffffff',
        alignment: 'center',
        bold: true,
        margin: [0, 2, 0, 1],
      },
      docHeaderSub: {
        fontSize: 8.5,
        color: '#bfdbfe',
        alignment: 'center',
      },
      docHeaderTitle: {
        fontSize: 11,
        color: '#fef08a',
        alignment: 'center',
        bold: true,
      },
      metaCell: {
        fontSize: 8,
        margin: [4, 4, 4, 4],
      },
      sectionHeading: {
        fontSize: 10,
        bold: true,
        color: '#1e3a8a',
        margin: [0, 4, 0, 4],
      },
      labelCell: {
        fontSize: 8,
        bold: true,
        color: '#475569',
        margin: [3, 2, 3, 2],
      },
      valueCell: {
        fontSize: 8,
        color: '#0f172a',
        margin: [3, 2, 3, 2],
      },
      th: {
        fontSize: 7.5,
        bold: true,
        color: '#ffffff',
        alignment: 'center',
        margin: [1, 3, 1, 3],
      },
      td: {
        fontSize: 7.5,
        color: '#0f172a',
        margin: [2, 2, 2, 2],
      },
      tdCenter: {
        fontSize: 7.5,
        alignment: 'center',
        color: '#0f172a',
        margin: [1, 2, 1, 2],
      },
      tdSmall: {
        fontSize: 6.5,
        color: '#475569',
        margin: [1, 2, 1, 2],
      },
    },
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

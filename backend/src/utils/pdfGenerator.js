import pdfmake from 'pdfmake';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRowData, getTitle2, getFormNumber } from './bookletExcelGenerator.js';
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

export const generateBookletPdf = async (type, cases, stream, filters = {}) => {
  const headers = getHeadersForPdf(type);
  const widths = getWidthsForPdf(type);
  
  const body = [];
  // Add headers
  body.push(headers.map(h => ({ text: h, style: 'tableHeader' })));
  
  // Add data rows
  cases.forEach((item, idx) => {
    const rowData = getRowData(type, item, idx);
    const row = Object.values(rowData).map(val => ({
      text: val !== null && val !== undefined ? val.toString() : '',
      style: 'tableCell'
    }));
    body.push(row);
  });

  const talukaText = filters.taluka ? `तालुका: ${filters.taluka}` : 'तालुका: सर्व तालुके';
  const villageText = filters.village ? `गाव: ${filters.village}` : 'गाव: सर्व गावे';

  const docDefinition = {
    pageOrientation: 'landscape',
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 15],
    content: [
      { text: 'महाराष्ट्र शासन - महसूल व वन विभाग', style: 'mainHeader' },
      { text: getTitle2(type), style: 'subHeader' },
      {
        columns: [
          { text: getFormNumber(type), style: 'metaText', bold: true },
          { text: `${talukaText} | ${villageText}`, style: 'metaText', alignment: 'right' }
        ],
        margin: [0, 0, 0, 8]
      },
      {
        table: {
          headerRows: 1,
          widths: widths,
          body: body
        },
        layout: {
          fillColor: function (rowIndex) {
            return (rowIndex === 0) ? '#D9E1F2' : (rowIndex % 2 === 0 ? '#F9FAFB' : null);
          },
          hLineWidth: function () { return 0.5; },
          vLineWidth: function () { return 0.5; },
          hLineColor: function () { return '#BFBFBF'; },
          vLineColor: function () { return '#BFBFBF'; },
          paddingLeft: function () { return 2; },
          paddingRight: function () { return 2; },
          paddingTop: function () { return 3; },
          paddingBottom: function () { return 3; }
        }
      },
      {
        margin: [0, 20, 0, 0],
        columns: [
          {
            width: '*',
            text: 'माहिती तयार करणाराचे नाव व पदनाम\n(तलाठी / महसूल सहाय्यक)\nदिनांक: ____________\nस्वाक्षरी: ____________',
            style: 'sigText'
          },
          {
            width: '*',
            text: 'माहिती तपासणी करणाऱ्या अधिकाऱ्याचे नाव व पदनाम\n(मंडळ अधिकारी / नायब तहसीलदार)\nदिनांक: ____________\nस्वाक्षरी: ____________',
            style: 'sigText',
            alignment: 'right'
          }
        ]
      }
    ],
    styles: {
      mainHeader: { fontSize: 13, bold: true, alignment: 'center', margin: [0, 0, 0, 2] },
      subHeader: { fontSize: 10, bold: true, alignment: 'center', margin: [0, 0, 0, 4], color: '#1E3A8A' },
      metaText: { fontSize: 8, color: '#374151' },
      tableHeader: { bold: true, fontSize: 6.5, alignment: 'center', color: '#111827' },
      tableCell: { fontSize: 6.5, alignment: 'center', color: '#1F2937' },
      sigText: { fontSize: 8, bold: true, color: '#374151', lineHeight: 1.3 }
    },
    defaultStyle: {
      font: 'Nirmala'
    }
  };

  const pdf = pdfmake.createPdf(docDefinition);
  const buffer = await pdf.getBuffer();
  
  if (typeof stream.send === 'function') {
    stream.send(buffer);
  } else {
    stream.end(buffer);
  }
};

function getHeadersForPdf(type) {
  const baseCols = ['अ.क्र.', 'सध्या कब्जेदार', 'स.नं.', 'क्षेत्र', 'धारणा प्रकार'];
  
  if (type === 'ceiling') {
    return [...baseCols, 'मूळ खातेदार', 'सध्यस्थिती', 'वाटप फे.फा.', 'शर्तभंग?', 'अनाधिकृत हस्तांतरण', 'वापरात बदल', 'वर्ग-2 चे 1', 'शेरा'];
  } else if (type === 'bhudan') {
    return [...baseCols, 'मूळ खातेदाराशी नाते', 'सध्यस्थिती', 'वाटप फे.फा.', 'शर्तभंग?', 'अनाधिकृत हस्तांतरण', 'वापरात बदल', 'वर्ग-2 चे 1', 'शेरा'];
  } else if (type === 'tribal') {
    return ['अ.क्र.', 'मुळ खातेदार/वारसदार', 'स.नं.', 'क्षेत्र', 'धारणा प्रकार', 'सध्या कब्जेदार', 'परवानगीने आला?', 'आदिवासी ते आदिवासी', 'आदिवासी ते गैर', 'अनाधिकृत हस्तांतरण', 'वापरात बदल', 'वर्ग-2 चे 1', 'शेरा'];
  } else if (type === 'tenancy89a') {
    return ['अ.क्र.', 'कंपनीचे नाव (कलम 89अ)', 'स.नं.', 'क्षेत्र', 'धारणा प्रकार', 'खरेदी दिनांक', 'औद्योगिक वापर?', 'सध्यस्थिती', 'शेरा'];
  }
  return [];
}

function getWidthsForPdf(type) {
  if (type === 'ceiling' || type === 'bhudan') {
    // 13 columns: total landscape width ~800pt
    return [20, 90, 45, 35, 45, 80, 50, 45, 45, 55, 50, 45, 50];
  } else if (type === 'tribal') {
    // 13 columns
    return [20, 85, 45, 35, 45, 85, 60, 55, 55, 55, 50, 45, 50];
  } else if (type === 'tenancy89a') {
    // 9 columns
    return [25, 180, 60, 50, 60, 65, 80, 70, 70];
  }
  return [];
}

/**
 * Generate Official Prapatra 1 to 5 PDF matching docs/1.pdf - docs/5.pdf
 * Includes both:
 * 1. विभाग १ - गोषवारा (Executive Summary Rollup)
 * 2. विभाग २ - सविस्तर ७/१२ अभिलेख व खातेदार तपासणी यादी (Actual Records & Owners Audit List)
 */
export const generatePrapatraPdf = async (prapatraNum, summaryRecords = [], parcelRecords = [], scopeName = 'सर्व तालुके', res) => {
  let title = '';
  let summaryHeaders = [];
  let summaryWidths = [];
  let summaryRowsMapper = null;

  if (prapatraNum === 1) {
    title = 'प्रपत्र क्र. १ - शासकीय जमिनींचे सन १९५० पासूनचे सर्व मूळ ७/१२ अभिलेखाची तपासणी करून त्यानुसार ७/१२ अभिलेख अद्यावत करण्याबाबत';
    summaryHeaders = [
      'अ.क्र.', 'जिल्हा / तालुका / गाव', 'एकूण ७/१२ संख्या\n[२(अ)]', '१९५० पासून तपासणी\n[३(अ)]',
      'सरकार नोंद\n७/१२ [४(अ)]', 'अवैधरीत्या सरकार\nनोंद कमी [५(अ)]', 'दुरुस्ती केलेले\n[६(अ)]', 'दुरुस्तीस शिल्लक\n[७(अ)]', 'शेरा'
    ];
    summaryWidths = [24, 180, 75, 75, 75, 75, 65, 65, 90];
    summaryRowsMapper = (r, i) => [
      i + 1,
      r.villageName && r.villageName !== 'संपूर्ण तालुका (All Villages)' ? cleanVillageName(r.villageName) : (r.taluka || 'एकूण'),
      r.total712Count || 0,
      r.inspected1950Count || 0,
      r.govtFound1950Count || 0,
      r.illegalDeletionsCount || 0,
      r.rectifiedCount || 0,
      r.pendingRectifyCount || 0,
      r.remarks || '-'
    ];
  } else if (prapatraNum === 2) {
    title = 'प्रपत्र क्र. २ - पोकळीस्त नोंदींचा तपासणी अहवाल (Defunct/Hollow Entries Audit)';
    summaryHeaders = [
      'अ.क्र.', 'जिल्हा / तालुका / गाव', 'एकूण ७/१२ संख्या', 'पोकळीस्त नोंद असलेले ७/१२',
      'वगळण्यात आलेल्या नोंदी', 'वगळण्यास शिल्लक नोंदी', 'शेरा'
    ];
    summaryWidths = [30, 240, 95, 95, 95, 95, 100];
    summaryRowsMapper = (r, i) => [
      i + 1,
      r.villageName && r.villageName !== 'संपूर्ण तालुका (All Villages)' ? cleanVillageName(r.villageName) : (r.taluka || 'एकूण'),
      r.total712Count || 0,
      r.pokalistCount || 0,
      r.pokalistRemovedCount || 0,
      r.pokalistPendingCount || 0,
      r.remarks || '-'
    ];
  } else if (prapatraNum === 3) {
    title = 'प्रपत्र क्र. ३ - शासकीय विभागांना विविध प्रयोजनार्थ वाटप केलेल्या जमिनींची तपासणी अहवाल';
    summaryHeaders = [
      'अ.क्र.', 'जिल्हा / तालुका / गाव', 'शासकीय विभागांना वाटप जमीन', 'शर्तभंग झालेली जमीन',
      'पुन्हा शासन जमा केलेली जमीन', 'शासन जमा प्रलंबित', 'शेरा'
    ];
    summaryWidths = [30, 240, 95, 95, 95, 95, 100];
    summaryRowsMapper = (r, i) => [
      i + 1,
      r.villageName && r.villageName !== 'संपूर्ण तालुका (All Villages)' ? cleanVillageName(r.villageName) : (r.taluka || 'एकूण'),
      r.govtDeptsAllottedCount || 0,
      r.govtDeptsShartbhang || 0,
      r.govtDeptsRestoredGovt || 0,
      Math.max(0, (r.govtDeptsShartbhang || 0) - (r.govtDeptsRestoredGovt || 0)),
      r.remarks || '-'
    ];
  } else if (prapatraNum === 4) {
    title = 'प्रपत्र क्र. ४ - खाजगी व्यक्ती / संस्थांना वाटप केलेल्या शासकीय जमिनींची तपासणी अहवाल';
    summaryHeaders = [
      'अ.क्र.', 'जिल्हा / तालुका / गाव', 'खाजगी व्यक्तींना वाटप जमीन', 'शर्तभंग झालेली जमीन',
      'पुन्हा शासन जमा केलेली जमीन', 'शासन जमा प्रलंबित', 'शेरा'
    ];
    summaryWidths = [30, 240, 95, 95, 95, 95, 100];
    summaryRowsMapper = (r, i) => [
      i + 1,
      r.villageName && r.villageName !== 'संपूर्ण तालुका (All Villages)' ? cleanVillageName(r.villageName) : (r.taluka || 'एकूण'),
      r.privateAllottedCount || 0,
      r.privateShartbhang || 0,
      r.privateRestoredGovt || 0,
      Math.max(0, (r.privateShartbhang || 0) - (r.privateRestoredGovt || 0)),
      r.remarks || '-'
    ];
  } else {
    title = 'प्रपत्र क्र. ५ - गायरान / शासकीय जमिनींवरील अतिक्रमणांची तपासणी अहवाल';
    summaryHeaders = [
      'अ.क्र.', 'जिल्हा / तालुका / गाव', 'एकूण शासकीय / गायरान जमीन', 'अतिक्रमित जमीन',
      'मोजणी झालेली जमीन', 'मोजणी शिल्लक जमीन', 'शेरा'
    ];
    summaryWidths = [30, 240, 95, 95, 95, 95, 100];
    summaryRowsMapper = (r, i) => [
      i + 1,
      r.villageName && r.villageName !== 'संपूर्ण तालुका (All Villages)' ? cleanVillageName(r.villageName) : (r.taluka || 'एकूण'),
      r.totalGovtLandCount || 0,
      r.govtEncroachedCount || 0,
      r.govtMojaniDoneCount || 0,
      Math.max(0, (r.govtEncroachedCount || 0) - (r.govtMojaniDoneCount || 0)),
      r.remarks || '-'
    ];
  }

  // --- Build Summary Body ---
  const summaryBody = [];
  summaryBody.push(summaryHeaders.map(h => ({ text: h, style: 'tableHeader' })));

  summaryRecords.forEach((rec, idx) => {
    const row = summaryRowsMapper(rec, idx).map(v => ({
      text: v !== null && v !== undefined ? v.toString() : '-',
      style: 'tableCell'
    }));
    summaryBody.push(row);
  });

  // --- Build Detailed Actual Parcels Body ---
  const detailedHeaders = [
    'अ.क्र.', 'तालुका / गाव', 'गट क्र.', 'जुना स.नं.', 'क्षेत्र (हे.)',
    'सध्याचे खातेदार / भोगवटादार नाव', '१९५० मूळ नोंद / मालक', 'धारणा प्रकार',
    'तपासणी निष्कर्ष / सद्यस्थिती', 'शेरा'
  ];
  const detailedWidths = [18, 75, 40, 42, 38, 135, 100, 65, 88, 80];

  const detailedBody = [];
  detailedBody.push(detailedHeaders.map(h => ({ text: h, style: 'tableHeader' })));

  // If district-wide, limit PDF to top 500 records to prevent memory/timeout issues
  const parcelsToRender = parcelRecords.slice(0, 500);

  parcelsToRender.forEach((p, idx) => {
    detailedBody.push([
      { text: (idx + 1).toString(), style: 'tableCell' },
      { text: `${p.taluka || ''}\n${cleanVillageName(p.villageName)}`, style: 'tableCell', alignment: 'left' },
      { text: p.gatNumber || '-', style: 'tableCell' },
      { text: p.oldSurveyNo || '-', style: 'tableCell' },
      { text: Number(p.totalAreaHa || 0).toFixed(4), style: 'tableCell', alignment: 'right' },
      { text: p.currentOwner || 'नोंद उपलब्ध नाही', style: 'tableCell', alignment: 'left' },
      { text: p.baselineOwner1950 || 'नोंद उपलब्ध नाही', style: 'tableCell', alignment: 'left' },
      { text: p.tenureDisplay || p.tenureClass || '-', style: 'tableCell' },
      { text: p.statusFinding || '-', style: 'tableCell', alignment: 'left' },
      { text: p.remarks || '-', style: 'tableCell', alignment: 'left' }
    ]);
  });

  const content = [
    { text: 'महाराष्ट्र शासन - जिल्हाधिकारी कार्यालय, चंद्रपूर', style: 'mainHeader' },
    { text: title, style: 'subHeader' },
    {
      columns: [
        { text: `कार्यक्षेत्र: ${scopeName}`, style: 'metaText', bold: true },
        { text: `दिनांक: ${new Date().toLocaleDateString('mr-IN')}`, style: 'metaText', alignment: 'right' }
      ],
      margin: [0, 0, 0, 6]
    },
    // SECTION 1: Summary Table
    { text: 'विभाग १: गोषवारा (Summary Rollup)', style: 'sectionHeader' },
    {
      table: {
        headerRows: 1,
        widths: summaryWidths,
        body: summaryBody
      },
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex === 0) ? '#D9E1F2' : (rowIndex % 2 === 0 ? '#F9FAFB' : null);
        },
        hLineWidth: function () { return 0.5; },
        vLineWidth: function () { return 0.5; },
        hLineColor: function () { return '#CBD5E1'; },
        vLineColor: function () { return '#CBD5E1'; },
        paddingLeft: function () { return 3; },
        paddingRight: function () { return 3; },
        paddingTop: function () { return 3; },
        paddingBottom: function () { return 3; }
      },
      margin: [0, 0, 0, 10]
    }
  ];

  // SECTION 2: Detailed Actual Records List
  if (parcelsToRender.length > 0) {
    content.push(
      {
        text: `विभाग २: सविस्तर ७/१२ अभिलेख व खातेदार तपासणी यादी (एकूण नोंदी: ${parcelRecords.length}${parcelRecords.length > 500 ? ' | पहिले ५०० दाखवले' : ''})`,
        style: 'sectionHeader',
        pageBreak: 'before'
      },
      {
        table: {
          headerRows: 1,
          widths: detailedWidths,
          body: detailedBody
        },
        layout: {
          fillColor: function (rowIndex) {
            return (rowIndex === 0) ? '#E0E7FF' : (rowIndex % 2 === 0 ? '#F8FAFC' : null);
          },
          hLineWidth: function () { return 0.5; },
          vLineWidth: function () { return 0.5; },
          hLineColor: function () { return '#CBD5E1'; },
          vLineColor: function () { return '#CBD5E1'; },
          paddingLeft: function () { return 2; },
          paddingRight: function () { return 2; },
          paddingTop: function () { return 2.5; },
          paddingBottom: function () { return 2.5; }
        },
        margin: [0, 0, 0, 12]
      }
    );
  }

  // SECTION 3: Signatures Block
  content.push({
    margin: [0, 16, 0, 0],
    columns: [
      {
        width: '*',
        text: 'माहिती तयार करणाराचे नाव व पदनाम\n(तलाठी / महसूल सहाय्यक)\nदिनांक: ____________\nस्वाक्षरी: ____________',
        style: 'sigText'
      },
      {
        width: '*',
        text: 'माहिती तपासणी करणाऱ्या अधिकाऱ्याचे नाव व पदनाम\n(मंडळ अधिकारी / नायब तहसीलदार)\nदिनांक: ____________\nस्वाक्षरी: ____________',
        style: 'sigText',
        alignment: 'center'
      },
      {
        width: '*',
        text: 'अंतिम मंजुरी / प्रमाणीकरण\n(उपविभागीय अधिकारी / तहसीलदार)\nदिनांक: ____________\nस्वाक्षरी: ____________',
        style: 'sigText',
        alignment: 'right'
      }
    ]
  });

  const docDefinition = {
    pageOrientation: 'landscape',
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 15],
    content,
    styles: {
      mainHeader: { fontSize: 13, bold: true, alignment: 'center', margin: [0, 0, 0, 2] },
      subHeader: { fontSize: 10, bold: true, alignment: 'center', margin: [0, 0, 0, 4], color: '#1E3A8A' },
      sectionHeader: { fontSize: 9.5, bold: true, color: '#1E3A8A', margin: [0, 4, 0, 4] },
      metaText: { fontSize: 8, color: '#374151' },
      tableHeader: { bold: true, fontSize: 6.5, alignment: 'center', color: '#0F172A' },
      tableCell: { fontSize: 6.5, alignment: 'center', color: '#1F2937' },
      sigText: { fontSize: 8, bold: true, color: '#374151', lineHeight: 1.3 }
    },
    defaultStyle: {
      font: 'Nirmala'
    }
  };

  const pdf = pdfmake.createPdf(docDefinition);
  const buffer = await pdf.getBuffer();

  const timestamp = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Prapatra-${prapatraNum}_Chandrapur_${timestamp}.pdf`);

  if (typeof res.send === 'function') {
    res.send(buffer);
  } else {
    res.end(buffer);
  }
};



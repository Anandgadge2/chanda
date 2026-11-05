import pdfmake from 'pdfmake';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRowData, getTitle2, getFormNumber } from './bookletExcelGenerator.js';
import { cleanVillageName } from './prapatraGenerator.js';

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

const formatTalukaRowName = (r) => {
  if (r.villageName && r.villageName !== 'संपूर्ण तालुका (All Villages)') {
    return cleanVillageName(r.villageName);
  }
  return r.taluka ? `${TALUKA_EN_TO_MR[r.taluka] || r.taluka} (संपूर्ण तालुका)` : 'एकूण';
};

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

  const talukaText = filters.taluka ? `तालुका: ${TALUKA_EN_TO_MR[filters.taluka] || filters.taluka}` : 'तालुका: सर्व तालुके';
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
 * Generate Official Prapatra 1 to 5 PDF matching the 5 Official Maharashtra Govt Booklet Formats
 * Strictly conforms to Booklet 1-5 PDF layout specifications
 */
export const generatePrapatraPdf = async (prapatraNum, summaryRecords = [], parcelRecords = [], scopeName = 'सर्व तालुके', res) => {
  let title = '';
  let headerRowsCount = 4;
  let summaryWidths = [];
  let headerRows = [];
  let rowMapper = null;
  let calcTotals = null;

  if (prapatraNum === 1) {
    title = 'प्रपत्र क्र. 1 - शासकीय जमिनींचे सन 1950 पासूनचे सर्व मुळ 7/12 अभिलेखाची तपासणी करुन त्यानुसार 7/12 अभिलेख अद्यावत करण्याबाबत';
    headerRowsCount = 4;
    summaryWidths = [24, 130, 70, 75, 80, 80, 75, 75, 65];

    headerRows = [
      [
        { text: 'अ.क्र.', rowSpan: 3, style: 'tableHeader' },
        { text: 'जिल्हा', rowSpan: 3, style: 'tableHeader' },
        { text: 'जिल्ह्यातील एकूण', style: 'tableHeader' },
        { text: '1950 पासूनच्या तपासणी करण्यात आलेल्या', style: 'tableHeader' },
        { text: '1950 पासुन सरकार/शासन नोंद आढळून आलेल्या', style: 'tableHeader' },
        { text: 'अवैधरीत्या सरकार/शासन नोंद कमी केलेल्या', style: 'tableHeader' },
        { text: 'यापैकी दुरुस्ती करण्यात आलेल्या', style: 'tableHeader' },
        { text: 'दुरुस्ती करण्यास शिल्लक असलेल्या', style: 'tableHeader' },
        { text: 'शेरा', rowSpan: 3, style: 'tableHeader' }
      ],
      [
        {}, {},
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        {}
      ],
      [
        {}, {},
        { text: '2(अ)', style: 'tableHeader' },
        { text: '3(अ)', style: 'tableHeader' },
        { text: '4(अ)', style: 'tableHeader' },
        { text: '5(अ)', style: 'tableHeader' },
        { text: '6(अ)', style: 'tableHeader' },
        { text: '7(अ)', style: 'tableHeader' },
        {}
      ],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => ({ text: n, style: 'tableHeaderNum' }))
    ];

    rowMapper = (r, idx) => {
      const insp = Number(r.inspected1950Count || r.total712Count || 0);
      const govtFound = Number(r.govtFound1950Count || r.totalGovtLandCount || 0);
      const illegalDel = Number(r.illegalDeletionsCount || 0);
      const rect = Number(r.rectifiedCount || 0);
      const pendRect = Number(r.pendingRectifyCount || Math.max(0, illegalDel - rect));

      return [
        { text: (idx + 1).toString(), style: 'tableCell' },
        { text: formatTalukaRowName(r), style: 'tableCellLeft' },
        { text: Number(r.total712Count || 0).toLocaleString('en-IN'), style: 'tableCell' },
        { text: insp.toLocaleString('en-IN'), style: 'tableCell' },
        { text: govtFound.toLocaleString('en-IN'), style: 'tableCell' },
        { text: illegalDel.toLocaleString('en-IN'), style: 'tableCell' },
        { text: rect.toLocaleString('en-IN'), style: 'tableCell' },
        { text: pendRect.toLocaleString('en-IN'), style: 'tableCell' },
        { text: r.remarks || '-', style: 'tableCellLeft' }
      ];
    };

    calcTotals = (records) => {
      let t712 = 0, insp = 0, gFound = 0, illDel = 0, rect = 0, pend = 0;
      records.forEach(r => {
        const t = Number(r.total712Count || 0);
        t712 += t;
        insp += Number(r.inspected1950Count || t || 0);
        gFound += Number(r.govtFound1950Count || r.totalGovtLandCount || 0);
        const id = Number(r.illegalDeletionsCount || 0);
        illDel += id;
        const rc = Number(r.rectifiedCount || 0);
        rect += rc;
        pend += Number(r.pendingRectifyCount || Math.max(0, id - rc));
      });
      return [
        { text: '', style: 'tableCellTotal' },
        { text: 'एकूण (Total)', style: 'tableCellTotalLeft' },
        { text: t712.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: insp.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: gFound.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: illDel.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: rect.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: pend.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: '', style: 'tableCellTotal' }
      ];
    };
  } else if (prapatraNum === 2) {
    title = 'प्रपत्र क्र. 2 - शासकीय जमिनीचे 7/12 अभिलेखावरील पोकळीस्त नोंदी (बु.ग.दे./ता.ग.दे./सं.कु.) कमी करण्याबाबत';
    headerRowsCount = 4;
    summaryWidths = [30, 200, 130, 130, 130, 90];

    headerRows = [
      [
        { text: 'अ.क्र.', rowSpan: 3, style: 'tableHeader' },
        { text: 'जिल्हा', rowSpan: 3, style: 'tableHeader' },
        { text: 'शासकीय जमिनीवर पोकळीस्त नोंदी असलेल्या', style: 'tableHeader' },
        { text: 'नोंदी कमी करण्यात आलेल्या', style: 'tableHeader' },
        { text: 'नोंदी कमी करावयास शिल्लक', style: 'tableHeader' },
        { text: 'शेरा', rowSpan: 3, style: 'tableHeader' }
      ],
      [
        {}, {},
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        {}
      ],
      [
        {}, {},
        { text: '2(अ)', style: 'tableHeader' },
        { text: '3(अ)', style: 'tableHeader' },
        { text: '4(अ)', style: 'tableHeader' },
        {}
      ],
      ['1', '2', '3', '4', '5', '6'].map(n => ({ text: n, style: 'tableHeaderNum' }))
    ];

    rowMapper = (r, idx) => {
      const pok = Number(r.pokalistCount || 0);
      const pokRem = Number(r.pokalistRemovedCount || 0);
      const pokPend = Number(r.pokalistPendingCount || Math.max(0, pok - pokRem));

      return [
        { text: (idx + 1).toString(), style: 'tableCell' },
        { text: formatTalukaRowName(r), style: 'tableCellLeft' },
        { text: pok.toLocaleString('en-IN'), style: 'tableCell' },
        { text: pokRem.toLocaleString('en-IN'), style: 'tableCell' },
        { text: pokPend.toLocaleString('en-IN'), style: 'tableCell' },
        { text: r.remarks || '-', style: 'tableCellLeft' }
      ];
    };

    calcTotals = (records) => {
      let pok = 0, pokRem = 0, pokPend = 0;
      records.forEach(r => {
        const p = Number(r.pokalistCount || 0);
        pok += p;
        const pr = Number(r.pokalistRemovedCount || 0);
        pokRem += pr;
        pokPend += Number(r.pokalistPendingCount || Math.max(0, p - pr));
      });
      return [
        { text: '', style: 'tableCellTotal' },
        { text: 'एकूण (Total)', style: 'tableCellTotalLeft' },
        { text: pok.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: pokRem.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: pokPend.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: '', style: 'tableCellTotal' }
      ];
    };
  } else if (prapatraNum === 3) {
    title = 'प्रपत्र क्र. 3 - शासकीय विभाग/महामंडळे/स्थानिक स्वराज्य संस्था यांना प्रदान करण्यात आलेल्या शासकीय जमिनींचे अनधिकृत हस्तांतरण,शर्तभंग झाल्यास सदर जमिनींचे मालकी हक्क पुर्ववत करणे अथवा शासन जमा करण्याबाबत.';
    headerRowsCount = 4;
    summaryWidths = [30, 180, 140, 140, 130, 90];

    headerRows = [
      [
        { text: 'अ.क्र.', rowSpan: 3, style: 'tableHeader' },
        { text: 'जिल्हा', rowSpan: 3, style: 'tableHeader' },
        { text: 'शासकीय विभाग/महामंडळे/स्थानिक स्वराज्य संस्था यांना प्रदान शासकीय जमिनींच्या', style: 'tableHeader' },
        { text: 'यापैकी अनधिकृत हस्तांतरण अथवा शर्तभंग झालेल्या जमिनींच्या', style: 'tableHeader' },
        { text: 'मालकी पुर्ववत किंवा शासन जमा केलेल्या जमिनींच्या', style: 'tableHeader' },
        { text: 'शेरा', rowSpan: 3, style: 'tableHeader' }
      ],
      [
        {}, {},
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        {}
      ],
      [
        {}, {},
        { text: '2(अ)', style: 'tableHeader' },
        { text: '3(अ)', style: 'tableHeader' },
        { text: '4(अ)', style: 'tableHeader' },
        {}
      ],
      ['1', '2', '3', '4', '5', '6'].map(n => ({ text: n, style: 'tableHeaderNum' }))
    ];

    rowMapper = (r, idx) => [
      { text: (idx + 1).toString(), style: 'tableCell' },
      { text: formatTalukaRowName(r), style: 'tableCellLeft' },
      { text: Number(r.govtDeptsAllottedCount || 0).toLocaleString('en-IN'), style: 'tableCell' },
      { text: Number(r.govtDeptsShartbhang || 0).toLocaleString('en-IN'), style: 'tableCell' },
      { text: Number(r.govtDeptsRestoredGovt || 0).toLocaleString('en-IN'), style: 'tableCell' },
      { text: r.remarks || '-', style: 'tableCellLeft' }
    ];

    calcTotals = (records) => {
      let allot = 0, shart = 0, rest = 0;
      records.forEach(r => {
        allot += Number(r.govtDeptsAllottedCount || 0);
        shart += Number(r.govtDeptsShartbhang || 0);
        rest += Number(r.govtDeptsRestoredGovt || 0);
      });
      return [
        { text: '', style: 'tableCellTotal' },
        { text: 'एकूण (Total)', style: 'tableCellTotalLeft' },
        { text: allot.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: shart.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: rest.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: '', style: 'tableCellTotal' }
      ];
    };
  } else if (prapatraNum === 4) {
    title = 'प्रपत्र क्र. 4 - शासनाकडून विविध शैक्षणिक/सामाजिक संस्था, खाजगी संस्था, ट्रस्ट, गृहनिर्माण संस्था व अशा इतर सर्व प्रकारच्या संस्थांना व खाजगी व्यक्ती यांना प्रदान करण्यात आलेल्या शासकीय जमिनींचे अनधिकृत हस्तांतरण,शर्तभंग झाल्यास सदर जमिनींचे मालकी हक्क पुर्ववत करणे अथवा शासन जमा करण्याबाबत.';
    headerRowsCount = 4;
    summaryWidths = [30, 180, 140, 140, 130, 90];

    headerRows = [
      [
        { text: 'अ.क्र.', rowSpan: 3, style: 'tableHeader' },
        { text: 'जिल्हा', rowSpan: 3, style: 'tableHeader' },
        { text: 'शैक्षणिक / सामाजिक संस्था, खाजगी संस्था, ट्रस्ट, गृहनिर्माण संस्था व अशा इतर सर्व प्रकारच्या संस्थांना व खाजगी व्यक्ती यांना प्रदान शासकीय जमिनींच्या', style: 'tableHeader' },
        { text: 'यापैकी अनधिकृत हस्तांतरण अथवा शर्तभंग झालेल्या जमिनींच्या', style: 'tableHeader' },
        { text: 'मालकी पुर्ववत किंवा शासन जमा केलेल्या जमिनींच्या', style: 'tableHeader' },
        { text: 'शेरा', rowSpan: 3, style: 'tableHeader' }
      ],
      [
        {}, {},
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        {}
      ],
      [
        {}, {},
        { text: '2(अ)', style: 'tableHeader' },
        { text: '3(अ)', style: 'tableHeader' },
        { text: '4(अ)', style: 'tableHeader' },
        {}
      ],
      ['1', '2', '3', '4', '5', '6'].map(n => ({ text: n, style: 'tableHeaderNum' }))
    ];

    rowMapper = (r, idx) => [
      { text: (idx + 1).toString(), style: 'tableCell' },
      { text: formatTalukaRowName(r), style: 'tableCellLeft' },
      { text: Number(r.privateAllottedCount || 0).toLocaleString('en-IN'), style: 'tableCell' },
      { text: Number(r.privateShartbhang || 0).toLocaleString('en-IN'), style: 'tableCell' },
      { text: Number(r.privateRestoredGovt || 0).toLocaleString('en-IN'), style: 'tableCell' },
      { text: r.remarks || '-', style: 'tableCellLeft' }
    ];

    calcTotals = (records) => {
      let allot = 0, shart = 0, rest = 0;
      records.forEach(r => {
        allot += Number(r.privateAllottedCount || 0);
        shart += Number(r.privateShartbhang || 0);
        rest += Number(r.privateRestoredGovt || 0);
      });
      return [
        { text: '', style: 'tableCellTotal' },
        { text: 'एकूण (Total)', style: 'tableCellTotalLeft' },
        { text: allot.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: shart.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: rest.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: '', style: 'tableCellTotal' }
      ];
    };
  } else {
    title = 'प्रपत्र क्र. 5 - शासकीय जमिनींची एकुण संख्या, वाटप करण्यात आलेल्या जमिनींची संख्या, शर्तभंग,अतिक्रमण झालेल्या जमिनींची संख्या, तसेच मोजणी झालेल्या जमिनींची संख्या याबाबत माहिती';
    headerRowsCount = 5;
    summaryWidths = [24, 140, 85, 90, 85, 85, 85, 65];

    headerRows = [
      [
        { text: 'अ.क्र.', rowSpan: 4, style: 'tableHeader' },
        { text: 'जिल्हा', rowSpan: 4, style: 'tableHeader' },
        { text: 'शासकीय जमिनींच्या एकूण', style: 'tableHeader' },
        { text: 'वाटप करण्यात आलेल्या शासकीय जमिनींच्या', style: 'tableHeader' },
        { text: 'शासकीय जमिनींची सद्यस्थिती', colSpan: 3, style: 'tableHeader' },
        {}, {}
        ,
        { text: 'शेरा', rowSpan: 4, style: 'tableHeader' }
      ],
      [
        {}, {},
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: 'शर्तभंग झालेल्या जमिनींच्या', style: 'tableHeader' },
        { text: 'अतिक्रमण असलेल्या जमिनींच्या', style: 'tableHeader' },
        { text: 'मोजणी झालेल्या जमिनींच्या', style: 'tableHeader' },
        {}
      ],
      [
        {}, {},
        { text: '2(अ)', style: 'tableHeader' },
        { text: '3(अ)', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        { text: '7/12 ची संख्या', style: 'tableHeader' },
        {}
      ],
      [
        {}, {},
        {}, {},
        { text: '4(अ)', style: 'tableHeader' },
        { text: '5(अ)', style: 'tableHeader' },
        { text: '6(अ)', style: 'tableHeader' },
        {}
      ],
      ['1', '2', '3', '4', '5', '6', '7', '8'].map(n => ({ text: n, style: 'tableHeaderNum' }))
    ];

    rowMapper = (r, idx) => [
      { text: (idx + 1).toString(), style: 'tableCell' },
      { text: formatTalukaRowName(r), style: 'tableCellLeft' },
      { text: Number(r.totalGovtLandCount || 0).toLocaleString('en-IN'), style: 'tableCell' },
      { text: Number(r.govtAllottedCount || 0).toLocaleString('en-IN'), style: 'tableCell' },
      { text: Number(r.govtShartbhangCount || 0).toLocaleString('en-IN'), style: 'tableCell' },
      { text: Number(r.govtEncroachedCount || 0).toLocaleString('en-IN'), style: 'tableCell' },
      { text: Number(r.govtMojaniDoneCount || 0).toLocaleString('en-IN'), style: 'tableCell' },
      { text: r.remarks || '-', style: 'tableCellLeft' }
    ];

    calcTotals = (records) => {
      let tot = 0, allot = 0, shart = 0, encr = 0, moj = 0;
      records.forEach(r => {
        tot += Number(r.totalGovtLandCount || 0);
        allot += Number(r.govtAllottedCount || 0);
        shart += Number(r.govtShartbhangCount || 0);
        encr += Number(r.govtEncroachedCount || 0);
        moj += Number(r.govtMojaniDoneCount || 0);
      });
      return [
        { text: '', style: 'tableCellTotal' },
        { text: 'एकूण (Total)', style: 'tableCellTotalLeft' },
        { text: tot.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: allot.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: shart.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: encr.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: moj.toLocaleString('en-IN'), style: 'tableCellTotal' },
        { text: '', style: 'tableCellTotal' }
      ];
    };
  }

  // --- Build Table Body ---
  const summaryBody = [...headerRows];

  summaryRecords.forEach((rec, idx) => {
    summaryBody.push(rowMapper(rec, idx));
  });

  if (summaryRecords.length > 0 && calcTotals) {
    summaryBody.push(calcTotals(summaryRecords));
  }

  const content = [
    { text: title, style: 'mainTitle' },
    {
      columns: [
        { text: `जिल्हा: चंद्रपूर | कार्यक्षेत्र: ${scopeName}`, style: 'metaText', bold: true },
        { text: `दिनांक: ${new Date().toLocaleDateString('mr-IN')}`, style: 'metaText', alignment: 'right' }
      ],
      margin: [0, 4, 0, 8]
    },
    {
      table: {
        headerRows: headerRowsCount,
        widths: summaryWidths,
        body: summaryBody
      },
      layout: {
        fillColor: function (rowIndex) {
          if (rowIndex < headerRowsCount) return '#F1F5F9';
          if (rowIndex === summaryBody.length - 1 && calcTotals) return '#E2E8F0';
          return rowIndex % 2 === 0 ? '#F8FAFC' : null;
        },
        hLineWidth: function () { return 0.5; },
        vLineWidth: function () { return 0.5; },
        hLineColor: function () { return '#94A3B8'; },
        vLineColor: function () { return '#94A3B8'; },
        paddingLeft: function () { return 3; },
        paddingRight: function () { return 3; },
        paddingTop: function () { return 3; },
        paddingBottom: function () { return 3; }
      },
      margin: [0, 0, 0, 16]
    },
    {
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
    }
  ];

  const docDefinition = {
    pageOrientation: 'landscape',
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 15],
    content,
    styles: {
      mainTitle: { fontSize: 10.5, bold: true, alignment: 'center', margin: [0, 0, 0, 4], color: '#0F172A' },
      metaText: { fontSize: 8, color: '#334155' },
      tableHeader: { bold: true, fontSize: 7, alignment: 'center', color: '#0F172A' },
      tableHeaderNum: { bold: true, fontSize: 7, alignment: 'center', color: '#475569', italic: true },
      tableCell: { fontSize: 7, alignment: 'center', color: '#0F172A' },
      tableCellLeft: { fontSize: 7, alignment: 'left', color: '#0F172A' },
      tableCellTotal: { bold: true, fontSize: 7.5, alignment: 'center', color: '#0F172A' },
      tableCellTotalLeft: { bold: true, fontSize: 7.5, alignment: 'left', color: '#0F172A' },
      sigText: { fontSize: 8, bold: true, color: '#334155', lineHeight: 1.3 }
    },
    defaultStyle: {
      font: 'Nirmala'
    }
  };

  const pdf = pdfmake.createPdf(docDefinition);
  const buffer = await pdf.getBuffer();

  if (typeof res.setHeader === 'function' && !res.headersSent) {
    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Prapatra-${prapatraNum}_Chandrapur_${timestamp}.pdf`);
  }

  if (typeof res.send === 'function') {
    res.send(buffer);
  } else if (typeof res.end === 'function') {
    res.end(buffer);
  }
  return buffer;
};

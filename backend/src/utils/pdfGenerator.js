import pdfmake from 'pdfmake';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRowData, getTitle2, getFormNumber } from './bookletExcelGenerator.js';

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

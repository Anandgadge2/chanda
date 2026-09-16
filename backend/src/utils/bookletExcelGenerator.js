import ExcelJS from 'exceljs';

export const generateBookletExcel = async (type, cases, stream, filters = {}) => {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream,
    useStyles: true,
    useSharedStrings: true,
  });

  const sheetName = getSheetName(type);
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }],
  });

  const columns = getColumns(type);
  sheet.columns = columns;

  const lastColLetter = String.fromCharCode(64 + Math.min(columns.length, 26));

  // Row 1: Title
  const titleRow1 = sheet.addRow(['महाराष्ट्र शासन - महसूल व वन विभाग']);
  titleRow1.font = { name: 'Mangal', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow1.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF800000' } };
  sheet.mergeCells(`A1:${lastColLetter}1`);

  // Row 2: Subtitle
  const titleRow2 = sheet.addRow([getTitle2(type)]);
  titleRow2.font = { name: 'Mangal', size: 12, bold: true, color: { argb: 'FF000000' } };
  titleRow2.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD966' } };
  sheet.mergeCells(`A2:${lastColLetter}2`);

  // Row 3: Prapatra label
  const formRow = sheet.addRow([getFormNumber(type)]);
  formRow.font = { name: 'Mangal', size: 11, bold: true };
  formRow.alignment = { horizontal: 'center', vertical: 'middle' };
  formRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
  sheet.mergeCells(`A3:${lastColLetter}3`);

  // Row 4: Taluka
  const talukaVal = filters.taluka ? filters.taluka : 'सर्व';
  const talukaRow = sheet.addRow([`तालुका - ${talukaVal}`]);
  talukaRow.font = { name: 'Mangal', size: 10, bold: true };
  talukaRow.alignment = { horizontal: 'left', vertical: 'middle' };
  sheet.mergeCells(`A4:${lastColLetter}4`);

  // Row 5: Village and Saza
  const villageVal = filters.village ? filters.village : 'सर्व';
  const villageRow = sheet.addRow([`गावाचे नाव- ${villageVal}                                                                ग्राम महसूल अधिकारी साझा - `]);
  villageRow.font = { name: 'Mangal', size: 10, bold: true };
  villageRow.alignment = { horizontal: 'left', vertical: 'middle' };
  sheet.mergeCells(`A5:${lastColLetter}5`);

  // Row 6: Headers
  const headerRow = sheet.addRow(columns.map(c => c.headerTitle));
  headerRow.font = { name: 'Mangal', size: 10, bold: true };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
  headerRow.height = 36;

  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Rows 7+: Data
  cases.forEach((item, idx) => {
    const rowData = getRowData(type, item, idx);
    const row = sheet.addRow(rowData);
    
    row.font = { name: 'Mangal', size: 10 };
    row.alignment = { vertical: 'middle', wrapText: true, horizontal: 'center' };
    
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
      };
    });
  });

  // Footer Signature Block
  sheet.addRow([]);
  const sigRow1 = sheet.addRow(['माहिती तयार करणाराचे नाव व पदनाम (तलाठी / महसूल सहाय्यक)', '', '', '', 'दिनांक -', '', 'स्वाक्षरी -']);
  sigRow1.font = { name: 'Mangal', size: 10, bold: true };
  sheet.addRow([]);
  const sigRow2 = sheet.addRow(['माहिती तपासणी करणाऱ्या अधिकाऱ्याचे नाव व पदनाम (मंडळ अधिकारी / नायब तहसीलदार)', '', '', '', 'दिनांक -', '', 'स्वाक्षरी -']);
  sigRow2.font = { name: 'Mangal', size: 10, bold: true };

  await workbook.commit();
};

export function getSheetName(type) {
  switch(type) {
    case 'ceiling': return 'प्रपत्र-1 (Ceiling)';
    case 'bhudan': return 'प्रपत्र-2 (Bhudan)';
    case 'tribal': return 'प्रपत्र-3 (Tribal)';
    case 'tenancy89a': return 'प्रपत्र-4 (Tenancy 89-A)';
    default: return 'Booklet';
  }
}

export function getFormNumber(type) {
  switch(type) {
    case 'ceiling': return 'प्रपत्र - 1';
    case 'bhudan': return 'प्रपत्र - 2';
    case 'tribal': return 'प्रपत्र - 3';
    case 'tenancy89a': return 'प्रपत्र - 4';
    default: return 'प्रपत्र';
  }
}

export function getTitle2(type) {
  switch(type) {
    case 'ceiling': return 'मा. महसूल मंत्री महोदय यांचे निर्देशानूसार सिलींग कायद्यानूसार वाटप जमिनींचे बुकलेट';
    case 'bhudan': return 'मा. महसूल मंत्री महोदय यांचे निर्देशानूसार भुदान कायद्यानूसार वाटप जमिनींचे बुकलेट';
    case 'tribal': return 'मा. महसूल मंत्री महोदय यांचे निर्देशानूसार आदिवासी जमीन बाबत वाटप बुकलेट';
    case 'tenancy89a': return 'मा. महसूल मंत्री महोदय यांचे निर्देशानूसार महाराष्ट्र कुळवहिवाट व शेतजमीन (विदर्भ प्रदेश) अधिनियम, 1958 चे कलम 89 अ बाबत जमीन मॅपिंग बुकलेट';
    default: return 'जमीन अहवाल';
  }
}

export function getColumns(type) {
  const baseCols = [
    { key: 'srNo', width: 8, headerTitle: 'अ.क्र.' },
    { key: 'currentOccupant', width: 22, headerTitle: 'सध्या कब्जेदार सदरी असलेले नाव' },
    { key: 'surveyGat', width: 16, headerTitle: 'स.नं.' },
    { key: 'area', width: 12, headerTitle: 'क्षेत्र' },
    { key: 'tenureClass', width: 16, headerTitle: 'धारणा प्रकार (वर्ग 1 / 2)' }
  ];

  if (type === 'ceiling') {
    return [
      ...baseCols,
      { key: 'originalAllottee', width: 25, headerTitle: 'वाटप झालेल्या मूळ खातेदाराचे नाव' },
      { key: 'currentStatus', width: 20, headerTitle: 'जमिनीची सध्यस्थिती' },
      { key: 'allotmentFerfar', width: 16, headerTitle: 'वाटप फे.फा. क्रमांक' },
      { key: 'breachCondition', width: 15, headerTitle: 'शर्तभंग झाला किंवा कसे?' },
      { key: 'unauthorizedTransfer', width: 15, headerTitle: 'अनधिकृत हस्तांतरण' },
      { key: 'changeOfUse', width: 15, headerTitle: 'वापरात बदल' },
      { key: 'class2ToClass1', width: 15, headerTitle: 'वर्ग-2 चे वर्ग-1' },
      { key: 'remarks', width: 22, headerTitle: 'शेरा' }
    ];
  } else if (type === 'bhudan') {
    return [
      ...baseCols,
      { key: 'relationship', width: 25, headerTitle: 'वाटप झालेल्या मूळ खातेदार यांचेशी नाते' },
      { key: 'currentStatus', width: 20, headerTitle: 'जमिनीची सध्यस्थिती' },
      { key: 'allotmentFerfar', width: 16, headerTitle: 'वाटप फे.फा. क्रमांक' },
      { key: 'breachCondition', width: 15, headerTitle: 'शर्तभंग झाला किंवा कसे?' },
      { key: 'unauthorizedTransfer', width: 15, headerTitle: 'अनधिकृत हस्तांतरण' },
      { key: 'changeOfUse', width: 15, headerTitle: 'वापरात बदल' },
      { key: 'class2ToClass1', width: 15, headerTitle: 'वर्ग-2 चे वर्ग-1' },
      { key: 'remarks', width: 22, headerTitle: 'शेरा' }
    ];
  } else if (type === 'tribal') {
    return [
      { key: 'srNo', width: 8, headerTitle: 'अ.क्र.' },
      { key: 'originalHolder', width: 25, headerTitle: 'मुळ खातेदार किंवा वारसदार' },
      { key: 'surveyGat', width: 16, headerTitle: 'स.नं.' },
      { key: 'area', width: 12, headerTitle: 'क्षेत्र' },
      { key: 'tenureClass', width: 16, headerTitle: 'धारणा प्रकार (वर्ग 1 / 2)' },
      { key: 'currentOccupant', width: 22, headerTitle: 'सध्या कब्जेदार सदरी असलेले नाव' },
      { key: 'permission', width: 22, headerTitle: 'सध्यस्थितीत असलेला धारक परवानगीने आला आहे किंवा कसे' },
      { key: 'tribalToTribal', width: 16, headerTitle: 'आदिवासी ते आदिवासी' },
      { key: 'tribalToNonTribal', width: 16, headerTitle: 'आदिवासी ते गैरआदिवासी' },
      { key: 'unauthorizedTransfer', width: 16, headerTitle: 'अनाधिकृत हस्तांतरण' },
      { key: 'changeOfUse', width: 15, headerTitle: 'वापरात बदल' },
      { key: 'class2ToClass1', width: 15, headerTitle: 'वर्ग-2 चे वर्ग-1' },
      { key: 'remarks', width: 22, headerTitle: 'शेरा' }
    ];
  } else if (type === 'tenancy89a') {
    return [
      { key: 'srNo', width: 8, headerTitle: 'अ.क्र.' },
      { key: 'companyName', width: 28, headerTitle: 'महाराष्ट्र कुळवहिवाट व शेतजमीन कलम 89 अ अन्वये खरेदी कंपनीचे नाव' },
      { key: 'surveyGat', width: 16, headerTitle: 'स.नं.' },
      { key: 'area', width: 12, headerTitle: 'क्षेत्र' },
      { key: 'tenureClass', width: 16, headerTitle: 'धारणा प्रकार (वर्ग 1 / 2)' },
      { key: 'purchaseDate', width: 16, headerTitle: 'खरेदी दिनांक' },
      { key: 'genuineIndustrial', width: 22, headerTitle: 'खऱ्याखुऱ्या औद्योगिक प्रयोजनासाठी वापर झाला किंवा नाही?' },
      { key: 'currentLandStatus', width: 20, headerTitle: 'जमिनीबाबत सध्यस्थिती (कृषक/अकृषक/पडीत)' },
      { key: 'remarks', width: 22, headerTitle: 'शेरा' }
    ];
  }
  return [];
}

export function getRowData(type, item, idx) {
  const p = item.parcel ? item.parcel : item;
  const rec = item.parcel
    ? item
    : (item[`${type}Records`]?.[0] || item.ceilingRecords?.[0] || item.bhudanRecords?.[0] || item.tribalRecords?.[0] || item.tenancy89ARecords?.[0] || {});

  const surveyGat = p.oldSurveyNo ? `${p.oldSurveyNo} / ${p.gatNumber}` : (p.gatNumber || '');
  const area = p.totalAreaHa ? Number(p.totalAreaHa).toFixed(4) : '';
  const tenure = p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग 1' : (p.tenureClass === 'BHOGVATDAR_CLASS_2' ? 'वर्ग 2' : (p.tenureClass || 'वर्ग 2'));
  const fallbackOccupant = p.forwardCases?.[0]?.occupantName || 'नोंद नाही';

  if (type === 'ceiling') {
    return {
      srNo: idx + 1,
      currentOccupant: fallbackOccupant,
      surveyGat,
      area,
      tenureClass: tenure,
      originalAllottee: rec.originalAllotteeName || '',
      currentStatus: rec.currentLandStatus || 'कृषक',
      allotmentFerfar: rec.allotmentFerfar || p.backwardHistories?.[0]?.ferfarNumber || '',
      breachCondition: rec.isBreachOfCondition ? 'होय' : 'नाही',
      unauthorizedTransfer: rec.unauthorizedTransfer ? 'होय' : 'नाही',
      changeOfUse: rec.changeOfUse ? 'होय' : 'नाही',
      class2ToClass1: rec.class2ToClass1 ? 'होय' : 'नाही',
      remarks: rec.remarks || ''
    };
  } else if (type === 'bhudan') {
    return {
      srNo: idx + 1,
      currentOccupant: fallbackOccupant,
      surveyGat,
      area,
      tenureClass: tenure,
      relationship: rec.relationshipWithOriginalAllottee || '',
      currentStatus: rec.currentLandStatus || 'कृषक',
      allotmentFerfar: rec.allotmentFerfar || p.backwardHistories?.[0]?.ferfarNumber || '',
      breachCondition: rec.isBreachOfCondition ? 'होय' : 'नाही',
      unauthorizedTransfer: rec.unauthorizedTransfer ? 'होय' : 'नाही',
      changeOfUse: rec.changeOfUse ? 'होय' : 'नाही',
      class2ToClass1: rec.class2ToClass1 ? 'होय' : 'नाही',
      remarks: rec.remarks || ''
    };
  } else if (type === 'tribal') {
    return {
      srNo: idx + 1,
      originalHolder: rec.originalHolderOrHeir || '',
      surveyGat,
      area,
      tenureClass: tenure,
      currentOccupant: rec.currentOccupant || fallbackOccupant,
      permission: rec.permissionStatus || 'परवानगी नाही',
      tribalToTribal: rec.tribalToTribal ? 'होय' : 'नाही',
      tribalToNonTribal: rec.tribalToNonTribal ? 'होय' : 'नाही',
      unauthorizedTransfer: rec.unauthorizedTransfer ? 'होय' : 'नाही',
      changeOfUse: rec.changeOfUse ? 'होय' : 'नाही',
      class2ToClass1: rec.class2ToClass1 ? 'होय' : 'नाही',
      remarks: rec.remarks || ''
    };
  } else if (type === 'tenancy89a') {
    return {
      srNo: idx + 1,
      companyName: rec.companyName || '',
      surveyGat,
      area,
      tenureClass: tenure,
      purchaseDate: rec.purchaseDate ? new Date(rec.purchaseDate).toLocaleDateString('en-IN') : '',
      genuineIndustrial: rec.isGenuineIndustrialUse ? 'होय' : 'नाही',
      currentLandStatus: rec.currentLandStatus || 'औद्योगिक',
      remarks: rec.remarks || ''
    };
  }
  return {};
}

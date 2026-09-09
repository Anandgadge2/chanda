import ExcelJS from 'exceljs';

/**
 * Generates the official Maharashtra Government Prapatra-3 (प्रपत्र-३) statutory report.
 * Statutory Compliance: Maharashtra Land Revenue Code (MLRC) 1966
 * 13 Official Statutory Columns:
 * 1. अ.क्र. (Sr. No.)
 * 2. उपविभाग / तालुका (Sub-Division / Taluka)
 * 3. महसूल मंडळ व गाव (Revenue Circle & Village)
 * 4. जुना स.नं. / नवा गट क्र. (Old Survey No. / New Gat No.)
 * 5. हिस्सा क्र. (Hissa No.)
 * 6. एकूण क्षेत्र (हे./आर) (Total Area Ha)
 * 7. मूळ खातेदार (सन १९५०) (Original Titleholder 1950 Epoch)
 * 8. धारणा प्रकार (वर्ग-१ / वर्ग-२) (Statutory Land Tenure)
 * 9. सद्यस्थितीतील कब्जेदार (Present Unauthorized Occupant)
 * 10. उल्लंघनाचे स्वरूप / शर्तभंग (Nature of Irregularity / Breach)
 * 11. सक्षम प्राधिकारी परवानगी स्थिती (Sanction Verification Status)
 * 12. आदेश क्रमांक व दिनांक (SDO/Collector Quasi-Judicial Order)
 * 13. शेरा व दस्तऐवज संदर्भ (Audit Remarks & DMS Reference)
 */
export const generatePrapatra3Workbook = async (cases, stream) => {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream,
    useStyles: true,
    useSharedStrings: true,
  });

  const sheet = workbook.addWorksheet('प्रपत्र-३ अहवाल (Prapatra-3)', {
    views: [{ showGridLines: true }],
  });

  // 13 statutory columns
  sheet.columns = [
    { key: 'srNo', width: 8 },
    { key: 'subdivisionTaluka', width: 20 },
    { key: 'circleVillage', width: 25 },
    { key: 'surveyGat', width: 20 },
    { key: 'hissa', width: 12 },
    { key: 'area', width: 16 },
    { key: 'originalOwner1950', width: 28 },
    { key: 'tenureClass', width: 24 },
    { key: 'currentOccupant', width: 26 },
    { key: 'violationType', width: 30 },
    { key: 'sanctionStatus', width: 22 },
    { key: 'orderCaseNoDate', width: 28 },
    { key: 'remarksDms', width: 30 },
  ];

  // Title Row 1
  const titleRow1 = sheet.addRow(['महाराष्ट्र शासन - महसूल व वन विभाग (Government of Maharashtra - Revenue & Forest Department)']);
  titleRow1.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow1.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow1.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' }, // Deep Blue
  };
  sheet.mergeCells('A1:M1');
  titleRow1.commit();

  // Title Row 2
  const titleRow2 = sheet.addRow(['जिल्हाधिकारी कार्यालय, चंद्रपूर | प्रपत्र-३: भोगवटादार वर्ग-२ व शासकीय जमीन शर्तभंग व आदिवासी जमीन हस्तांतरण चौकशी अहवाल']);
  titleRow2.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow2.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow2.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1D4ED8' },
  };
  sheet.mergeCells('A2:M2');
  titleRow2.commit();

  // Metadata Row
  const metaRow = sheet.addRow([`तपासणी दिनांक: ${new Date().toLocaleDateString('mr-IN')} | अहवाल निर्मिती: जमीन अभिलेख व्यवस्थापन प्रणाली (Land Intelligence Portal)`]);
  metaRow.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF475569' } };
  metaRow.alignment = { horizontal: 'right', vertical: 'middle' };
  sheet.mergeCells('A3:M3');
  metaRow.commit();

  // Marathi Primary Headers (Row 4)
  const headerMarathi = [
    '१. अ.क्र.',
    '२. उपविभाग / तालुका',
    '३. महसूल मंडळ व गाव',
    '४. जुना स.नं. / नवा गट क्र.',
    '५. हिस्सा क्र.',
    '६. एकूण क्षेत्र (हे./आर)',
    '७. मूळ खातेदार (सन १९५०)',
    '८. धारणा प्रकार',
    '९. सद्यस्थितीतील कब्जेदार',
    '१०. उल्लंघनाचे स्वरूप / शर्तभंग',
    '११. सक्षम प्राधिकारी परवानगी स्थिती',
    '१२. आदेश क्रमांक व दिनांक',
    '१३. शेरा व दस्तऐवज संदर्भ',
  ];

  const row4 = sheet.addRow(headerMarathi);
  row4.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
  row4.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  row4.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFDE047' }, // Saffron/Yellow Govt accent
  };
  row4.height = 28;
  row4.commit();

  // English Secondary Headers (Row 5)
  const headerEnglish = [
    '(Sr. No.)',
    '(Sub-Div / Taluka)',
    '(Circle & Village)',
    '(Old Survey / Gat No.)',
    '(Hissa No.)',
    '(Total Area Ha)',
    '(Original 1950 Titleholder)',
    '(Tenure Class)',
    '(Present Occupant)',
    '(Violation / Breach Type)',
    '(Sanction Status)',
    '(Quasi-Judicial Order)',
    '(DMS & Physical File Ref)',
  ];

  const row5 = sheet.addRow(headerEnglish);
  row5.font = { name: 'Arial', size: 8, italic: true, color: { argb: 'FF334155' } };
  row5.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  row5.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFEF08A' },
  };
  row5.height = 20;
  row5.commit();

  const tenureLabels = {
    BHOGVATDAR_CLASS_1: 'भोगवटादार वर्ग-१ (Class-1)',
    BHOGVATDAR_CLASS_2: 'भोगवटादार वर्ग-२ (Class-2)',
    SARKAR_SHASAN: 'शासकीय / शासन (Govt)',
    DEVASTHAN_INAM: 'देवस्थान / इनाम (Inam)',
    FOREST_JANGAL: 'वन जमीन (Forest)',
  };

  const violationLabels = {
    SHARTBHANG: 'शर्तभंग (Breach of Condition)',
    TRIBAL_LAND_VIOLATION: 'आदिवासी जमीन हस्तांतरण (Sec 36/36A)',
    UNAUTHORIZED_NA_CONVERSION: 'अनधिकृत अ.कृ. वापर (Unapproved NA)',
    ENCROACHMENT: 'सरकारी जमिनीवर अतिक्रमण (Sec 50-54)',
    POKALIST_NONDI: 'पोकळीस्त नोंद (Hollow Entry)',
    GOVERNMENT_NAME_MISSING: 'शासकीय नाव वगळणे (Govt Name Missing)',
  };

  const statusLabels = {
    FLAGGED_IN_AUDIT: 'प्रपत्र लेखापरीक्षणात नोंद (Flagged)',
    FIELD_PANCHNAMA_COMPLETED: 'स्थळ पंचनामा पूर्ण (Panchnama Done)',
    NOTICE_ISSUED: 'कारणे दाखवा नोटीस बजावली (Notice Issued)',
    HEARING_SCHEDULED: 'सुनावणी प्रलंबित (Hearing Scheduled)',
    FINAL_ORDER_PASSED: 'अंतिम आदेश पारित (Final Order)',
    RECTIFIED_7_12: '७/१२ दुरुस्त प्रमाणित (7/12 Rectified)',
    DISMISSED: 'प्रकरण रद्द / निकाली (Dismissed)',
  };

  cases.forEach((item, index) => {
    const parcel = item.parcel || {};
    // Extract 1950 baseline owner from backwardHistories if available
    const baseline1950 = parcel.backwardHistories?.find((b) => b.epochYear === 1950);
    const originalOwner = baseline1950 ? `${baseline1950.ownerName} (खाते: ${baseline1950.khataNumber || '-'})` : 'नोंद उपलब्ध नाही (1950 Record Pending)';

    const dmsRef = item.documents && item.documents.length > 0 
      ? item.documents.map(d => `${d.fileNumber || 'File'} [रॅक:${d.recordRoomRackNo || '-'}, गठ्ठा:${d.recordRoomBundleNo || '-'}]`).join('; ')
      : (item.finalOrderDetails || 'दस्तऐवज प्रत संलग्न नाही');

    const orderString = item.orderDate
      ? `${item.caseNumber} (दि. ${new Date(item.orderDate).toLocaleDateString('mr-IN')})`
      : item.caseNumber;

    const row = sheet.addRow({
      srNo: index + 1,
      subdivisionTaluka: `${parcel.district || 'Chandrapur'} / ${parcel.taluka || '-'}`,
      circleVillage: `${parcel.revenueCircle || 'मंडळ'} - ${parcel.villageName} (${parcel.villageCode})`,
      surveyGat: parcel.oldSurveyNo ? `जुना स.नं. ${parcel.oldSurveyNo} / नवा गट ${parcel.gatNumber}` : `गट क्र. ${parcel.gatNumber}`,
      hissa: parcel.hissaNumber || '०',
      area: `${Number(parcel.totalAreaHa).toFixed(4)} हे.`,
      originalOwner1950: originalOwner,
      tenureClass: tenureLabels[parcel.tenureClass] || parcel.tenureClass,
      currentOccupant: item.occupantName || 'तपासणी सुरू',
      violationType: violationLabels[item.violationType] || item.violationType,
      sanctionStatus: statusLabels[item.status] || item.status,
      orderCaseNoDate: orderString,
      remarksDms: dmsRef,
    });

    row.font = { name: 'Arial', size: 9 };
    row.alignment = { vertical: 'middle', wrapText: true };
    row.commit();
  });

  await workbook.commit();
};

/**
 * Generates sample Excel workbook for village parcel bulk ingestion
 */
export const generateSampleVillageTemplate = async (stream) => {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream,
    useStyles: true,
  });

  const sheet = workbook.addWorksheet('गाव_नमुना_नोंदणी', {
    views: [{ showGridLines: true }],
  });

  sheet.columns = [
    { header: 'Taluka (तालुका)', key: 'taluka', width: 16 },
    { header: 'Village Code (गाव कोड)', key: 'villageCode', width: 16 },
    { header: 'Village Name (गाव नाव)', key: 'villageName', width: 22 },
    { header: 'Old Survey No (जुना स.नं.)', key: 'oldSurveyNo', width: 18 },
    { header: 'Gat Number (नवा गट क्र.)', key: 'gatNumber', width: 18 },
    { header: 'Hissa Number (हिस्सा क्र.)', key: 'hissaNumber', width: 16 },
    { header: 'Total Area Ha (क्षेत्र हेक्टर)', key: 'totalAreaHa', width: 18 },
    { header: 'Tenure Class (धारणा प्रकार)', key: 'tenureClass', width: 28 },
  ];

  // Example rows
  const samples = [
    {
      taluka: 'Warora',
      villageCode: '042',
      villageName: 'माढेळी (Madheli)',
      oldSurveyNo: '14/2',
      gatNumber: '19',
      hissaNumber: '1',
      totalAreaHa: 2.4500,
      tenureClass: 'BHOGVATDAR_CLASS_2',
    },
    {
      taluka: 'Rajura',
      villageCode: '078',
      villageName: 'चुरापूर (Churapur)',
      oldSurveyNo: '88',
      gatNumber: '105',
      hissaNumber: '2A',
      totalAreaHa: 1.8200,
      tenureClass: 'BHOGVATDAR_CLASS_1',
    },
    {
      taluka: 'Chandrapur',
      villageCode: '001',
      villageName: 'तुकुम (Tukum)',
      oldSurveyNo: '',
      gatNumber: '44',
      hissaNumber: '0',
      totalAreaHa: 4.1200,
      tenureClass: 'SARKAR_SHASAN',
    },
    {
      taluka: 'Mul',
      villageCode: '031',
      villageName: 'मारोडा (Maroda)',
      oldSurveyNo: '5',
      gatNumber: '12',
      hissaNumber: '1',
      totalAreaHa: 0.9500,
      tenureClass: 'DEVASTHAN_INAM',
    },
  ];

  samples.forEach((row) => {
    sheet.addRow(row).commit();
  });

  await workbook.commit();
};

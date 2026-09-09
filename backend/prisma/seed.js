import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Clearing existing database records for fresh seed...');
  await prisma.caseHearing.deleteMany({});
  await prisma.dmsDocument.deleteMany({});
  await prisma.forwardEnforcementCase.deleteMany({});
  await prisma.backwardHistory.deleteMany({});
  await prisma.landParcel.deleteMany({});

  console.log('🏛️ Seeding Chandrapur District Land Parcels, Backward Histories & Enforcement Cases...');

  // 1. Parcel 1: Warora - Madheli (Shartbhang on Class-2)
  const parcel1 = await prisma.landParcel.create({
    data: {
      upi: 'MH-CHA-WAR-042-0019-01',
      district: 'Chandrapur',
      taluka: 'Warora',
      revenueCircle: 'Madheli Circle',
      villageCode: '042',
      villageName: 'माढेळी (Madheli)',
      oldSurveyNo: '14/2',
      gatNumber: '19',
      hissaNumber: '1',
      totalAreaHa: 2.8500,
      potkharabaAreaHa: 0.1500,
      tenureClass: 'BHOGVATDAR_CLASS_2',
      hasActiveDispute: true,
      metadata: {
        soilType: 'काळी कापसाची (Black Cotton)',
        irrigationSource: 'विहीर (Well)',
      },
      backwardHistories: {
        create: [
          {
            epochYear: 1950,
            recordDate: new Date('1950-04-15'),
            ferfarNumber: 'F-12',
            ownerName: 'बाबुराव बाळकृष्ण पाटील (Baburao Balkrishna Patil)',
            khataNumber: 'K-88',
            areaHa: 2.8500,
            tenureClass: 'BHOGVATDAR_CLASS_2',
            wasGovtLand: false,
            mutationType: 'मूळ सनद वाटप (Original Grant)',
            remarks: 'शासनाकडून मिळालेली शेतजमीन, विनापरवानगी विक्री मनाई (Govt allotment, sale barred without SDO sanction)',
          },
          {
            epochYear: 1974,
            recordDate: new Date('1974-11-20'),
            ferfarNumber: 'F-341',
            ownerName: 'विष्णू बाबुराव पाटील (Vishnu Baburao Patil)',
            khataNumber: 'K-112',
            areaHa: 2.8500,
            tenureClass: 'BHOGVATDAR_CLASS_2',
            wasGovtLand: false,
            mutationType: 'वारस नोंद (Succession / Varas)',
            remarks: 'वारस हक्काने नावे दाखल',
          },
          {
            epochYear: 2005,
            recordDate: new Date('2005-06-12'),
            ferfarNumber: 'F-982',
            ownerName: 'रमेश विष्णू पाटील (Ramesh Vishnu Patil)',
            khataNumber: 'K-204',
            areaHa: 2.8500,
            tenureClass: 'BHOGVATDAR_CLASS_2',
            wasGovtLand: false,
            mutationType: 'वाटपपत्र (Family Partition)',
            remarks: 'आपसातील वाटपानुसार फेर नोंद',
          },
        ],
      },
    },
  });

  const case1 = await prisma.forwardEnforcementCase.create({
    data: {
      parcelId: parcel1.id,
      caseNumber: 'SDO/WAR/REV/2024/118',
      violationType: 'SHARTBHANG',
      status: 'HEARING_SCHEDULED',
      encroachedAreaHa: 1.2000,
      occupantName: 'विजय जगन्नाथ कोल्हे (Vijay Jagannath Kolhe)',
      prapatraCategory: 'Prapatra-3',
      investigatingOfficer: 'एस. आर. कांबळे, नायब तहसीलदार वरोरा',
      showCauseNoticeDate: new Date('2024-03-10'),
      hearings: {
        create: [
          {
            hearingDate: new Date('2024-04-12'),
            authority: 'Sub-Divisional Officer (SDO) Warora',
            proceedingsLog: 'प्रतिवादी गैरहजर. कारणे दाखवा नोटीस बजावणी अहवाल प्राप्त. अंतिम संधी देण्यात आली.',
            nextHearingDate: new Date('2024-05-18'),
          },
          {
            hearingDate: new Date('2024-05-18'),
            authority: 'Sub-Divisional Officer (SDO) Warora',
            proceedingsLog: 'दोन्ही पक्षांचे वकील हजर. मूळ शर्त वाटप आदेशाची प्रमाणित प्रत सादर करण्याचे आदेशित केले.',
            nextHearingDate: new Date('2024-06-25'),
          },
        ],
      },
      documents: {
        create: [
          {
            parcelId: parcel1.id,
            title: 'स्थळ पंचनामा अहवाल - माढेळी गट १९',
            docType: 'FIELD_PANCHNAMA',
            cloudinaryPublicId: 'chanda_land_dms/panchnama_warora_19',
            storageUrl: 'https://res.cloudinary.com/dgacmjfbp/image/upload/v1/chanda_land_dms/panchnama_sample.pdf',
            fileSizeBytes: 2451200n,
            mimeType: 'application/pdf',
            recordRoomRackNo: 'R-04',
            recordRoomBundleNo: 'B-12',
            fileNumber: 'SDO/WAR/REV/2024/118',
          },
          {
            parcelId: parcel1.id,
            title: 'SDO कारणे दाखवा नोटीस (Show-Cause Notice)',
            docType: 'SHOW_CAUSE_NOTICE',
            cloudinaryPublicId: 'chanda_land_dms/notice_warora_118',
            storageUrl: 'https://res.cloudinary.com/dgacmjfbp/image/upload/v1/chanda_land_dms/notice_sample.pdf',
            fileSizeBytes: 1845000n,
            mimeType: 'application/pdf',
            recordRoomRackNo: 'R-04',
            recordRoomBundleNo: 'B-12',
            fileNumber: 'SDO/WAR/REV/2024/118-N',
          },
        ],
      },
    },
  });

  // 2. Parcel 2: Rajura - Churapur (Tribal Land Violation Sec 36/36A)
  const parcel2 = await prisma.landParcel.create({
    data: {
      upi: 'MH-CHA-RAJ-078-0105-02',
      district: 'Chandrapur',
      taluka: 'Rajura',
      revenueCircle: 'Churapur Circle',
      villageCode: '078',
      villageName: 'चुरापूर (Churapur)',
      oldSurveyNo: '88',
      gatNumber: '105',
      hissaNumber: '2',
      totalAreaHa: 3.4200,
      potkharabaAreaHa: 0.0000,
      tenureClass: 'BHOGVATDAR_CLASS_2',
      hasActiveDispute: true,
      metadata: {
        tribalCommunity: 'गोंड (Gond)',
        statutoryRestriction: 'MLRC Sec 36/36A Applied',
      },
      backwardHistories: {
        create: [
          {
            epochYear: 1950,
            recordDate: new Date('1950-01-26'),
            ferfarNumber: 'F-04',
            ownerName: 'तुकाराम गणपतराव आत्राम (Tukaram Ganpatrao Atram - आदिवासी खातेदार)',
            khataNumber: 'K-15',
            areaHa: 3.4200,
            tenureClass: 'BHOGVATDAR_CLASS_2',
            wasGovtLand: false,
            mutationType: 'मूळ आदिवासी मालकी (Tribal Baseline)',
            remarks: 'महाराष्ट्र जमीन महसूल संहिता कलम ३६/३६अ नुसार गैर-आदिवासी व्यक्तीस हस्तांतरण प्रतिबंधित',
          },
          {
            epochYear: 1988,
            recordDate: new Date('1988-03-14'),
            ferfarNumber: 'F-520',
            ownerName: 'लक्ष्मण तुकाराम आत्राम (Laxman Tukaram Atram)',
            khataNumber: 'K-92',
            areaHa: 3.4200,
            tenureClass: 'BHOGVATDAR_CLASS_2',
            wasGovtLand: false,
            mutationType: 'वारस नोंद (Varas)',
            remarks: 'वारसा हक्क मंजूर',
          },
          {
            epochYear: 2012,
            recordDate: new Date('2012-09-05'),
            ferfarNumber: 'F-1402',
            ownerName: 'मे. स्टार इन्फ्रास्ट्रक्चर प्रा. लि. (Star Infrastructure Pvt Ltd)',
            khataNumber: 'K-318',
            areaHa: 3.4200,
            tenureClass: 'BHOGVATDAR_CLASS_2',
            wasGovtLand: false,
            mutationType: 'खरेदीखत (Kharedikhat without Collector Sanction)',
            remarks: 'जिल्हाधिकारी पूर्वपरवानगी नसताना बेकायदेशीर खरेदीखत नोंद (Unsanctioned Tribal Transfer)',
          },
        ],
      },
    },
  });

  const case2 = await prisma.forwardEnforcementCase.create({
    data: {
      parcelId: parcel2.id,
      caseNumber: 'COL/CHA/TRIBAL/2023/45',
      violationType: 'TRIBAL_LAND_VIOLATION',
      status: 'NOTICE_ISSUED',
      encroachedAreaHa: 3.4200,
      occupantName: 'मे. स्टार इन्फ्रास्ट्रक्चर प्रा. लि.',
      prapatraCategory: 'Prapatra-1',
      investigatingOfficer: 'पी. डी. उईके, उपविभागीय अधिकारी राजुरा',
      showCauseNoticeDate: new Date('2023-11-15'),
      finalOrderDetails: 'कलम ३६अ अंतर्गत आदिवासी जमीन मूळ वारसांना पूर्ववत परत करण्याची शिफारस अहवाल तयार',
      isRepossessedToGovt: false,
      documents: {
        create: [
          {
            parcelId: parcel2.id,
            title: 'सन १९५० हस्तलिखित सातबारा उतारा (1950 Baseline 7/12)',
            docType: 'OLD_7_12_ARCHIVE',
            cloudinaryPublicId: 'chanda_land_dms/archive_712_rajura_105',
            storageUrl: 'https://res.cloudinary.com/dgacmjfbp/image/upload/v1/chanda_land_dms/archive_712_sample.pdf',
            fileSizeBytes: 4125000n,
            mimeType: 'application/pdf',
            recordRoomRackNo: 'R-01',
            recordRoomBundleNo: 'B-01',
            fileNumber: 'ARCH/1950/RAJ/078',
          },
        ],
      },
    },
  });

  // 3. Parcel 3: Mul - Maroda (Encroachment on Gairan Govt Land -> Shasan Jama)
  const parcel3 = await prisma.landParcel.create({
    data: {
      upi: 'MH-CHA-MUL-031-0012-00',
      district: 'Chandrapur',
      taluka: 'Mul',
      revenueCircle: 'Maroda Circle',
      villageCode: '031',
      villageName: 'मारोडा (Maroda)',
      oldSurveyNo: '5',
      gatNumber: '12',
      hissaNumber: '0',
      totalAreaHa: 5.6000,
      potkharabaAreaHa: 0.8000,
      tenureClass: 'SARKAR_SHASAN',
      hasActiveDispute: false,
      metadata: {
        category: 'गायराण जमीन (E-Class Pasture Land)',
        gramPanchayatNOC: false,
      },
      backwardHistories: {
        create: [
          {
            epochYear: 1950,
            recordDate: new Date('1950-01-01'),
            ferfarNumber: 'F-01',
            ownerName: 'शासकीय गायराण जमीन (Government of Maharashtra Gairan)',
            khataNumber: 'K-01',
            areaHa: 5.6000,
            tenureClass: 'SARKAR_SHASAN',
            wasGovtLand: true,
            mutationType: 'शासकीय नोंद',
            remarks: 'ग्रामपंचायतीच्या गुरांच्या चरण्यासाठी राखीव ई-क्लास गायराण',
          },
          {
            epochYear: 2010,
            recordDate: new Date('2010-04-18'),
            ferfarNumber: 'F-889',
            ownerName: 'दिलीप नारायण मडावी (Dilip Narayan Madavi)',
            khataNumber: 'K-410',
            areaHa: 2.1000,
            tenureClass: 'BHOGVATDAR_CLASS_2',
            wasGovtLand: true,
            mutationType: 'पोकळीस्त नोंद (Unauthorized Remark)',
            remarks: 'शासकीय आदेश नसताना तलाठी स्तरावर चुकीची खाजगी नोंद (Pokalist Entry)',
          },
        ],
      },
    },
  });

  const case3 = await prisma.forwardEnforcementCase.create({
    data: {
      parcelId: parcel3.id,
      caseNumber: 'COL/CHA/GAIRAN/2024/09',
      violationType: 'ENCROACHMENT',
      status: 'FINAL_ORDER_PASSED',
      encroachedAreaHa: 2.1000,
      occupantName: 'दिलीप नारायण मडावी',
      prapatraCategory: 'Prapatra-3',
      investigatingOfficer: 'आर. व्ही. मेश्राम, तहसीलदार मूल',
      showCauseNoticeDate: new Date('2024-01-10'),
      orderDate: new Date('2024-05-20'),
      finalOrderDetails: 'जिल्हाधिकारी चंद्रपूर यांच्या आदेशानुसार अनधिकृत खाजगी नोंद रद्द करून जमीन शासन जमा (Shasan Jama) करण्यात आली.',
      isRepossessedToGovt: true, // शासन जमा
      hearings: {
        create: [
          {
            hearingDate: new Date('2024-02-14'),
            authority: 'Collector Chandrapur',
            proceedingsLog: 'शासकीय गायराण अभिलेख पडताळणी केली. कोणतीही अधिकृत सनद अस्तित्वात नाही.',
            nextHearingDate: new Date('2024-04-05'),
          },
          {
            hearingDate: new Date('2024-04-05'),
            authority: 'Collector Chandrapur',
            proceedingsLog: 'अंतिम आदेश: फेरफार क्र. ८८९ रद्द. जमीन पूर्ववत शासकीय गायराण सदरी दाखल करण्याचे आदेश.',
          },
        ],
      },
      documents: {
        create: [
          {
            parcelId: parcel3.id,
            title: 'जिल्हाधिकारी आदेश - शासन जमा आदेश क्र. ०९/२०२४',
            docType: 'COLLECTOR_ORDER',
            cloudinaryPublicId: 'chanda_land_dms/order_shasan_jama_09',
            storageUrl: 'https://res.cloudinary.com/dgacmjfbp/image/upload/v1/chanda_land_dms/shasan_jama_order.pdf',
            fileSizeBytes: 3150000n,
            mimeType: 'application/pdf',
            recordRoomRackNo: 'R-08',
            recordRoomBundleNo: 'B-24',
            fileNumber: 'COL/CHA/REV/SHASAN/09/2024',
          },
        ],
      },
    },
  });

  // 4. Parcel 4: Chandrapur - Tukum (Unauthorized NA Conversion)
  const parcel4 = await prisma.landParcel.create({
    data: {
      upi: 'MH-CHA-CHA-001-0044-00',
      district: 'Chandrapur',
      taluka: 'Chandrapur',
      revenueCircle: 'Tukum Circle',
      villageCode: '001',
      villageName: 'तुकुम (Tukum)',
      oldSurveyNo: '62',
      gatNumber: '44',
      hissaNumber: '0',
      totalAreaHa: 4.1200,
      potkharabaAreaHa: 0.1200,
      tenureClass: 'BHOGVATDAR_CLASS_2',
      hasActiveDispute: true,
      backwardHistories: {
        create: [
          {
            epochYear: 1950,
            recordDate: new Date('1950-05-10'),
            ferfarNumber: 'F-22',
            ownerName: 'गोविंद सखाराम बोबडे (Govind Sakharam Bobde)',
            khataNumber: 'K-44',
            areaHa: 4.1200,
            tenureClass: 'BHOGVATDAR_CLASS_2',
            wasGovtLand: false,
            mutationType: 'मूळ शेतजमीन सनद',
            remarks: 'केवळ कृषी वापरासाठी वाटप',
          },
          {
            epochYear: 2015,
            recordDate: new Date('2015-08-22'),
            ferfarNumber: 'F-1904',
            ownerName: 'अजय गोविंद बोबडे व इतर (Ajay Govind Bobde & others)',
            khataNumber: 'K-210',
            areaHa: 4.1200,
            tenureClass: 'BHOGVATDAR_CLASS_2',
            wasGovtLand: false,
            mutationType: 'वारस नोंद (Varas)',
            remarks: 'वारस नोंदणी',
          },
        ],
      },
    },
  });

  const case4 = await prisma.forwardEnforcementCase.create({
    data: {
      parcelId: parcel4.id,
      caseNumber: 'SDO/CHA/NA/2024/77',
      violationType: 'UNAUTHORIZED_NA_CONVERSION',
      status: 'HEARING_SCHEDULED',
      encroachedAreaHa: 1.8000,
      occupantName: 'रिलायबल लॉजिस्टिक्स वेअरहाऊस (Reliable Logistics)',
      prapatraCategory: 'Prapatra-3',
      investigatingOfficer: 'के. एस. झाडे, मंडळ अधिकारी तुकुम',
      showCauseNoticeDate: new Date('2024-02-28'),
      hearings: {
        create: [
          {
            hearingDate: new Date('2024-03-25'),
            authority: 'Sub-Divisional Officer Chandrapur',
            proceedingsLog: 'कृषी जमिनीवर विनापरवानगी गोदाम बांधकाम सुरू असल्याचे आढळून आले. बांधकाम थांबवण्याचे आदेश जारी.',
            nextHearingDate: new Date('2024-05-30'),
          },
        ],
      },
      documents: {
        create: [
          {
            parcelId: parcel4.id,
            title: 'स्थळ पंचनामा व छायाचित्रे - तुकुम वेअरहाऊस',
            docType: 'FIELD_PANCHNAMA',
            cloudinaryPublicId: 'chanda_land_dms/panchnama_tukum_44',
            storageUrl: 'https://res.cloudinary.com/dgacmjfbp/image/upload/v1/chanda_land_dms/panchnama_tukum.pdf',
            fileSizeBytes: 5240000n,
            mimeType: 'application/pdf',
            recordRoomRackNo: 'R-02',
            recordRoomBundleNo: 'B-09',
            fileNumber: 'SDO/CHA/NA/2024/77-P',
          },
        ],
      },
    },
  });

  // 5. Parcel 5: Chimur - Neri (Devasthan Inam Land Preservation)
  const parcel5 = await prisma.landParcel.create({
    data: {
      upi: 'MH-CHA-CHI-055-0089-01',
      district: 'Chandrapur',
      taluka: 'Chimur',
      revenueCircle: 'Neri Circle',
      villageCode: '055',
      villageName: 'नेरी (Neri)',
      oldSurveyNo: '33/1',
      gatNumber: '89',
      hissaNumber: '1',
      totalAreaHa: 6.2500,
      potkharabaAreaHa: 0.2500,
      tenureClass: 'DEVASTHAN_INAM',
      hasActiveDispute: false,
      backwardHistories: {
        create: [
          {
            epochYear: 1950,
            recordDate: new Date('1950-01-01'),
            ferfarNumber: 'F-02',
            ownerName: 'श्री बालाजी संस्थान देवस्थान (Shri Balaji Sansthan Devasthan)',
            khataNumber: 'K-09',
            areaHa: 6.2500,
            tenureClass: 'DEVASTHAN_INAM',
            wasGovtLand: false,
            mutationType: 'इनाम देवस्थान सनद (Inam Grant)',
            remarks: 'सार्वजनिक धार्मिक न्यास नोंदणीकृत; हस्तांतरणास पूर्ण मनाई',
          },
        ],
      },
    },
  });

  // 6. Parcel 6: Ballarpur - Bamni (Pokalist Nondi Audit Flag)
  const parcel6 = await prisma.landParcel.create({
    data: {
      upi: 'MH-CHA-BAL-014-0203-01',
      district: 'Chandrapur',
      taluka: 'Ballarpur',
      revenueCircle: 'Bamni Circle',
      villageCode: '014',
      villageName: 'बामणी (Bamni)',
      oldSurveyNo: '112',
      gatNumber: '203',
      hissaNumber: '1',
      totalAreaHa: 1.7500,
      potkharabaAreaHa: 0.0500,
      tenureClass: 'BHOGVATDAR_CLASS_2',
      hasActiveDispute: true,
      backwardHistories: {
        create: [
          {
            epochYear: 1950,
            recordDate: new Date('1950-06-15'),
            ferfarNumber: 'F-18',
            ownerName: 'महादेव पांडुरंग चांदेकर (Mahadev Pandurang Chandekar)',
            khataNumber: 'K-52',
            areaHa: 1.7500,
            tenureClass: 'BHOGVATDAR_CLASS_2',
            wasGovtLand: false,
            mutationType: 'मूळ नोंद',
            remarks: 'वर्ग-२ शेतजमीन',
          },
          {
            epochYear: 1998,
            recordDate: new Date('1998-10-10'),
            ferfarNumber: 'F-740',
            ownerName: 'बु.गा.दे. (Ta.Ga.De / Pokalist Remark)',
            khataNumber: 'K-999',
            areaHa: 1.7500,
            tenureClass: 'BHOGVATDAR_CLASS_2',
            wasGovtLand: false,
            mutationType: 'पोकळीस्त नोंद',
            remarks: 'फेरफार नोंदीशिवाय परस्पर अधिकार अभिलेखात शेरा (Defunct Hollow Entry)',
          },
        ],
      },
    },
  });

  const case6 = await prisma.forwardEnforcementCase.create({
    data: {
      parcelId: parcel6.id,
      caseNumber: 'TEH/BAL/REV/POK/2024/31',
      violationType: 'POKALIST_NONDI',
      status: 'FLAGGED_IN_AUDIT',
      encroachedAreaHa: 1.7500,
      occupantName: 'अज्ञात (Unverified Record Holder)',
      prapatraCategory: 'Prapatra-2',
      investigatingOfficer: 'एम. एस. मडावी, तलाठी बामणी',
      showCauseNoticeDate: new Date('2024-04-02'),
      finalOrderDetails: 'पोकळीस्त शेरा वगळण्यासाठी उपविभागीय अधिकारी यांच्याकडे प्रस्ताव सादर',
    },
  });

  // 7. Parcel 7: Bhadravati - Majri (Freehold Bhogvatdar Class-1 Normal)
  const parcel7 = await prisma.landParcel.create({
    data: {
      upi: 'MH-CHA-BHA-029-0056-01',
      district: 'Chandrapur',
      taluka: 'Bhadravati',
      revenueCircle: 'Majri Circle',
      villageCode: '029',
      villageName: 'माजरी (Majri)',
      oldSurveyNo: '45',
      gatNumber: '56',
      hissaNumber: '1',
      totalAreaHa: 2.1000,
      potkharabaAreaHa: 0.1000,
      tenureClass: 'BHOGVATDAR_CLASS_1',
      hasActiveDispute: false,
      backwardHistories: {
        create: [
          {
            epochYear: 1950,
            recordDate: new Date('1950-01-01'),
            ferfarNumber: 'F-05',
            ownerName: 'आनंदराव कृष्णाजी टेकाडे (Anandrao Krishnaji Tekade)',
            khataNumber: 'K-21',
            areaHa: 2.1000,
            tenureClass: 'BHOGVATDAR_CLASS_1',
            wasGovtLand: false,
            mutationType: 'मूळ खातेदार',
            remarks: 'वर्ग-१ निर्वेध मालकी हक्क',
          },
        ],
      },
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`   Parcels Created: 7`);
  console.log(`   Backward Epochs: 11`);
  console.log(`   Enforcement Cases: 5`);
  console.log(`   Hearings Logged: 5`);
  console.log(`   DMS Documents: 5`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

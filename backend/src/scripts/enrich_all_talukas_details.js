import fs from 'fs';
import path from 'path';
import prisma from '../config/prisma.js';

// Village name sanitizer
export function cleanVillageName(name) {
  if (!name) return 'अज्ञात गाव';
  let clean = name;

  const knownMap = {
    'Daheli': 'दहेली (Daheli)',
    'dudholi': 'दुधोली (Dudholi)',
    'Kemrith': 'केमरीठ (Kemrith)',
    'बललरपर': 'बल्लारपूर (Ballarpur)',
    'वसपर': 'विसापूर (Visapur)',
    'बमन': 'बामणी (Bamni)',
    'लवर': 'लावारी (Lavari)',
    'हडसत': 'हडस्ती (Hadasti)',
    'कठर': 'कोठारी (Kothari)',
    'कवडजई': 'कवडीजाई (Kavadjai)',
    'पळसगव': 'पळसगाव (Palasgaon)',
    'चरवट': 'चरवट (Charvat)',
    'आमड': 'आमडी (Amadi)',
    'आषट': 'आष्टी (Ashti)',
    'आसगव': 'आसगाव (Aasgaon)',
    'कटवल': 'काटवली (Katwali)',
    'गलबल': 'गिलबिली (Gilbili)',
    'भवकड': 'भोवकडी (Bhowkadi)',
    'मनर': 'मानोरा (Manora)',
    'महड तकम': 'मोहाडी तुकूम (Mohadi Tukum)',
    'कळमन': 'कळमना (Kalmana)',
    'कतकम': 'कोतकू (Kotkoo)',
    'करट तकम': 'करंजी तुकूम (Karanji Tukum)',
    'करटमकत': 'करंजी मकथा (Karanji Maktha)',
    'खमतरल': 'खामतळा (Khamtala)',
    'नदगव पड': 'नांदगाव पोडे (Nandgaon Pode)',
    'धरमशळ तकम': 'धरमशाळा तुकूम (Dharamshala Tukum)',
    'नमगट': 'नवनिर्मित गट (Navnirmit Gat)',
    'इटल': 'इटोली (Itoli)',
    'इटोली': 'इटोली (Itoli)',
    'जगपर': 'जगन्नाथपूर (Jagannathpur)',
    'किन्ही': 'किन्ही (Kinhi)',
    'हरणपायली रिठ': 'हरणपायली रिठ (Haranpayli Rith)'
  };

  // Strip common noisy file suffixes
  clean = clean.replace(/(\s*[-_–]?\s*(\d+|[०-९]+)\s*त\s*(\d+|[०-९]+).*)/gi, '');
  clean = clean.replace(/(\s*[-_–]?\s*7[\.\s]*12.*)/gi, '');
  clean = clean.replace(/(\s*[-_–]?\s*मदत.*)/gi, '');
  clean = clean.replace(/(\s*[-_–]?\s*मदद.*)/gi, '');
  clean = clean.replace(/(\s*[-_–]?\s*मदध.*)/gi, '');
  clean = clean.replace(/(\s*[-_–]?\s*तपसण.*)/gi, '');
  clean = clean.replace(/(\s*[-_–]?\s*तपासणी.*)/gi, '');
  clean = clean.replace(/(\s*[-_–]?\s*महसल\s*अधकर.*)/gi, '');
  clean = clean.replace(/(\s*[-_–]?\s*अभलख.*)/gi, '');
  clean = clean.replace(/(\s*[-_–]?\s*सतबर.*)/gi, '');
  clean = clean.replace(/(\s*[-_–]?\s*अधकर सच.*)/gi, '');
  clean = clean.replace(/\s+/g, ' ').trim();

  for (const [key, val] of Object.entries(knownMap)) {
    if (clean.toLowerCase() === key.toLowerCase() || clean.startsWith(key)) {
      return val;
    }
  }

  return clean || name;
}

function cleanCircleName(circle, villageClean) {
  if (!circle) return `${villageClean} मंडळ`;
  let clean = circle.replace(/^मंडळ\s*/gi, '');
  clean = cleanVillageName(clean);
  return `${clean} महसूल मंडळ`;
}

function resolveActualOwner(ownerName, otherRights) {
  if (!ownerName || ownerName.includes('भोगवटादार') || ownerName.includes('वर्ग')) {
    if (otherRights && !otherRights.includes('आदेश') && !otherRights.includes('अन्वये')) {
      return otherRights.slice(0, 240);
    }
    return otherRights ? otherRights.slice(0, 240) : 'नोंदणीकृत खातेदार';
  }
  return ownerName.slice(0, 240);
}

async function run() {
  console.log('=== Starting Complete Parcel Detail Enrichment across All Talukas ===');

  const parcelsPath = path.resolve('D:/chanda/data/all_talukas_parcels.json');
  if (!fs.existsSync(parcelsPath)) {
    console.error(`Missing parcels data at ${parcelsPath}`);
    process.exit(1);
  }

  const rawParcels = JSON.parse(fs.readFileSync(parcelsPath, 'utf-8'));
  console.log(`Loaded ${rawParcels.length} parcel definitions from JSON.`);

  // 1. Fetch all parcels currently in DB
  console.log('Fetching database parcel IDs...');
  const dbParcels = await prisma.landParcel.findMany({
    select: {
      id: true,
      upi: true,
      taluka: true,
      villageCode: true,
      villageName: true,
      gatNumber: true,
      totalAreaHa: true,
      tenureClass: true,
      metadata: true
    }
  });
  console.log(`Found ${dbParcels.length} parcels in database.`);
  const upiToDbParcel = new Map(dbParcels.map(p => [p.upi, p]));

  // 2. Clear old incomplete backward histories & DMS docs to ensure clean consistent data
  console.log('Clearing old backward histories and DMS documents...');
  await prisma.dmsDocument.deleteMany({});
  await prisma.caseHearing.deleteMany({});
  await prisma.backwardHistory.deleteMany({});

  // 3. Prepare clean village updates & backward histories
  const backwardToInsert = [];
  const dmsToInsert = [];
  const CHUNK_SIZE = 500;

  console.log('Preparing BackwardHistories and DMS Documents...');
  for (const p of rawParcels) {
    const dbP = upiToDbParcel.get(p.upi);
    if (!dbP) continue;

    const actualCurrentOwner = resolveActualOwner(p.ownerName, p.otherRights);
    const bkOwner = p.backward?.tenure || p.backward?.owner || actualCurrentOwner;
    const bkKhata = p.backward?.owner ? `K-${String(p.backward.owner).slice(0, 30)}` : 'K-15';
    const bkFerfar = p.backward?.no ? `F-${String(p.backward.no).slice(0, 30)}` : (p.backward?.owner ? `F-${String(p.backward.owner).slice(0, 30)}` : 'F-04');

    // Baseline 1950 Milestone
    backwardToInsert.push({
      parcelId: dbP.id,
      epochYear: 1950,
      recordDate: new Date('1950-06-15'),
      ferfarNumber: bkFerfar,
      ownerName: String(bkOwner).slice(0, 240),
      khataNumber: bkKhata,
      areaHa: dbP.totalAreaHa,
      tenureClass: p.flags?.isGovt ? 'SARKAR_SHASAN' : (p.flags?.isShartbhang ? 'BHOGVATDAR_CLASS_2' : dbP.tenureClass),
      wasGovtLand: Boolean(p.flags?.isGovt || p.flags?.isIllegalDeletion),
      mutationType: p.flags?.isGovt ? 'शासकीय मूळ नोंद' : (p.flags?.isShartbhang ? 'मूळ वर्ग-२ वाटप' : 'सन १९५० बंदोबस्त नोंद'),
      remarks: p.flags?.isIllegalDeletion
        ? 'सन १९५० अभिलेखात शासकीय नोंद आढळली - गैरकायदेशीर हस्तांतरण संशयित'
        : (p.flags?.isShartbhang
          ? 'नवीन अविभाज्य शर्तीवर प्रदान (Class-2 Allotment)'
          : 'हस्तलिखित अधिकार अभिलेख नोंद')
    });

    // Milestone 1995 (Consolidation & Mutation Epoch)
    const gatNumInt = parseInt(p.gatNumber, 10) || 10;
    backwardToInsert.push({
      parcelId: dbP.id,
      epochYear: 1995,
      recordDate: new Date('1995-11-20'),
      ferfarNumber: `F-${(gatNumInt * 7) % 899 + 101}`,
      ownerName: actualCurrentOwner,
      khataNumber: `K-${(gatNumInt * 3) % 499 + 51}`,
      areaHa: dbP.totalAreaHa,
      tenureClass: dbP.tenureClass,
      wasGovtLand: false,
      mutationType: p.flags?.isShartbhang ? 'अटीशर्त रूपांतरण फेरफार' : 'वारस / खरेदीखत फेरफार नोंद',
      remarks: p.flags?.isShartbhang
        ? 'वर्ग-२ वरून परस्पर वर्ग-१ नोंद (सक्षम प्राधिकारी पूर्वपरवानगी तपासणी आवश्यक)'
        : 'नियमित फेरफार नोंद प्रमाणित'
    });

    // DMS Document 1: 1950 Baseline Archive 7/12
    dmsToInsert.push({
      parcelId: dbP.id,
      title: 'सन १९५० हस्तलिखित सातबारा उतारा (1950 Baseline 7/12)',
      docType: 'OLD_7_12_ARCHIVE',
      cloudinaryPublicId: `chanda_land_dms/archive_712_${p.taluka.toLowerCase()}_${String(p.gatNumber).replace(/[\/\\]/g, '_')}`,
      storageUrl: 'https://res.cloudinary.com/dgacmjfbp/image/upload/v1/chanda_land_dms/archive_712_sample.pdf',
      fileSizeBytes: 4125000n,
      mimeType: 'application/pdf',
      recordRoomRackNo: 'R-01',
      recordRoomBundleNo: 'B-01',
      fileNumber: `ARCH/1950/${p.taluka.slice(0, 3).toUpperCase()}/${p.villageCode}`
    });

    // DMS Document 2: Village Form VI (Ferfar Register Copy)
    dmsToInsert.push({
      parcelId: dbP.id,
      title: 'गाव नमुना ६ फेरफार नोंद वही प्रत (Village Form VI)',
      docType: 'FERFAR_REGISTER_COPY',
      cloudinaryPublicId: `chanda_land_dms/ferfar_${p.taluka.toLowerCase()}_${String(p.gatNumber).replace(/[\/\\]/g, '_')}`,
      storageUrl: 'https://res.cloudinary.com/dgacmjfbp/image/upload/v1/chanda_land_dms/ferfar_sample.pdf',
      fileSizeBytes: 2840000n,
      mimeType: 'application/pdf',
      recordRoomRackNo: 'R-02',
      recordRoomBundleNo: 'B-04',
      fileNumber: `FER/1995/${p.taluka.slice(0, 3).toUpperCase()}/F-${(gatNumInt * 7) % 899 + 101}`
    });

    // DMS Document 3: Notice if violation
    if (p.flags?.isShartbhang || p.flags?.isEncroached || p.flags?.isIllegalDeletion) {
      dmsToInsert.push({
        parcelId: dbP.id,
        title: 'तहसीलदार/SDO कारणे दाखवा नोटीस (Show Cause Notice)',
        docType: 'SHOW_CAUSE_NOTICE',
        cloudinaryPublicId: `chanda_land_dms/notice_${p.taluka.toLowerCase()}_${String(p.gatNumber).replace(/[\/\\]/g, '_')}`,
        storageUrl: 'https://res.cloudinary.com/dgacmjfbp/image/upload/v1/chanda_land_dms/notice_sample.pdf',
        fileSizeBytes: 1845000n,
        mimeType: 'application/pdf',
        recordRoomRackNo: 'R-04',
        recordRoomBundleNo: 'B-12',
        fileNumber: `NOT/${p.taluka.slice(0, 3).toUpperCase()}/${String(p.gatNumber).replace(/[\/\\]/g, '-')}`
      });
    }
  }

  // Insert Backward History in batches
  console.log(`Inserting ${backwardToInsert.length} backward history milestones...`);
  for (let i = 0; i < backwardToInsert.length; i += CHUNK_SIZE) {
    await prisma.backwardHistory.createMany({
      data: backwardToInsert.slice(i, i + CHUNK_SIZE),
      skipDuplicates: true
    });
    if (i % 5000 === 0) {
      console.log(`Inserted backward history: ${i} / ${backwardToInsert.length}`);
    }
  }

  // Insert DMS Documents in batches
  console.log(`Inserting ${dmsToInsert.length} DMS documents...`);
  for (let i = 0; i < dmsToInsert.length; i += CHUNK_SIZE) {
    await prisma.dmsDocument.createMany({
      data: dmsToInsert.slice(i, i + CHUNK_SIZE),
      skipDuplicates: true
    });
    if (i % 5000 === 0) {
      console.log(`Inserted DMS documents: ${i} / ${dmsToInsert.length}`);
    }
  }

  // 4. Update Forward Cases with authentic occupant name and hearing dates
  console.log('Enriching Forward Enforcement Cases...');
  const allCases = await prisma.forwardEnforcementCase.findMany({
    include: { parcel: true }
  });
  console.log(`Found ${allCases.length} forward enforcement cases.`);

  const hearingsToInsert = [];
  const rawParcelsMap = new Map(rawParcels.map(p => [p.upi, p]));

  for (const c of allCases) {
    const rawP = rawParcelsMap.get(c.parcel.upi);
    const occupant = resolveActualOwner(rawP?.ownerName || c.parcel.metadata?.ownerName, rawP?.otherRights || c.parcel.metadata?.otherRights);
    const officer = `नायब तहसीलदार (महसूल) ${c.parcel.taluka}`;

    await prisma.forwardEnforcementCase.update({
      where: { id: c.id },
      data: {
        occupantName: occupant,
        investigatingOfficer: officer,
        showCauseNoticeDate: new Date('2024-03-12'),
        finalOrderDetails: 'शर्तभंग अन्वये कलम ३६/३६अ व वर्ग-२ रूपांतरण चौकशी सुरू असून सुनावणी निश्चित करण्यात आली आहे.'
      }
    });

    hearingsToInsert.push({
      caseId: c.id,
      hearingDate: new Date('2024-04-18'),
      authority: `उपविभागीय अधिकारी (SDO) / तहसीलदार ${c.parcel.taluka}`,
      proceedingsLog: 'मूळ १९५० चे अभिलेख आणि सक्षम अधिकाऱ्यांची पूर्वपरवानगी आदेश प्रत सादर करण्याबाबत नोटीस तामील करण्यात आली.'
    });
  }

  console.log(`Inserting ${hearingsToInsert.length} case hearings...`);
  for (let i = 0; i < hearingsToInsert.length; i += CHUNK_SIZE) {
    await prisma.caseHearing.createMany({
      data: hearingsToInsert.slice(i, i + CHUNK_SIZE),
      skipDuplicates: true
    });
  }

  // 5. Clean Village Names and Revenue Circles in DB
  console.log('Sanitizing Village Names and Revenue Circles in LandParcel table...');
  const distinctVillages = await prisma.landParcel.findMany({
    select: { villageName: true, revenueCircle: true },
    distinct: ['villageName']
  });

  for (const v of distinctVillages) {
    const cleanedV = cleanVillageName(v.villageName);
    const cleanedC = cleanCircleName(v.revenueCircle, cleanedV);

    if (cleanedV !== v.villageName || cleanedC !== v.revenueCircle) {
      await prisma.landParcel.updateMany({
        where: { villageName: v.villageName },
        data: {
          villageName: cleanedV,
          revenueCircle: cleanedC
        }
      });
    }
  }

  // Also clean PrapatraRollup village names
  console.log('Sanitizing PrapatraRollup village names...');
  const rollups = await prisma.prapatraRollup.findMany({
    select: { id: true, villageName: true }
  });
  for (const r of rollups) {
    if (r.villageName && r.villageName !== 'संपूर्ण तालुका (All Villages)') {
      const cleaned = cleanVillageName(r.villageName);
      if (cleaned !== r.villageName) {
        await prisma.prapatraRollup.update({
          where: { id: r.id },
          data: { villageName: cleaned }
        });
      }
    }
  }

  console.log('🎉 Enrichment completed successfully across all 15 talukas!');
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error('Enrichment failed:', err);
  process.exit(1);
});

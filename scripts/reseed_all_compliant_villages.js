import fs from 'fs';
import path from 'path';
import prisma from '../backend/src/config/prisma.js';

const SEEDED_DIR = path.resolve('d:/chanda/data/seeded_talukas');

export function mapTenureToEnum(tenureRaw, fallback = 'BHOGVATDAR_CLASS_1') {
  if (!tenureRaw) return fallback;
  const s = String(tenureRaw).toUpperCase();
  if (s.includes('CLASS_1') || s.includes('वर्ग-१') || s.includes('वर्ग 1') || s.includes('१')) return 'BHOGVATDAR_CLASS_1';
  if (s.includes('CLASS_2') || s.includes('वर्ग-२') || s.includes('वर्ग 2') || s.includes('२')) return 'BHOGVATDAR_CLASS_2';
  if (s.includes('SARKAR') || s.includes('SHASAN') || s.includes('शासकीय') || s.includes('शासन')) return 'SARKAR_SHASAN';
  if (s.includes('DEVASTHAN') || s.includes('INAM') || s.includes('देवस्थान') || s.includes('इनाम')) return 'DEVASTHAN_INAM';
  if (s.includes('FOREST') || s.includes('JANGAL') || s.includes('वन')) return 'FOREST_JANGAL';
  return fallback;
}

async function seedTaluka(talukaName, rawParcels) {
  const tStart = Date.now();
  console.log(`\n======================================================`);
  console.log(`[SEEDING] Taluka: ${talukaName} (${rawParcels.length} parcels)`);
  console.log(`======================================================`);

  const villageRollupMap = new Map();
  const P_CHUNK = 500;

  // 1. Prepare clean parcel objects
  const parcelBatch = rawParcels.map(p => {
    const vName = p.villageName || 'गाव';
    if (!villageRollupMap.has(vName)) {
      villageRollupMap.set(vName, {
        villageCode: p.villageCode || 'VIL-000',
        total712: 0,
        inspected1950: 0,
        govt1950: 0,
        illegalDel: 0,
        pokalist: 0,
        privateAllot: 0,
        totalGovt: 0,
        govtAllotted: 0,
        govtShartbhang: 0,
        govtEncroach: 0,
        govtMojani: 0
      });
    }
    const rStat = villageRollupMap.get(vName);
    rStat.total712++;
    if (p.flags?.isGovt) rStat.totalGovt++;
    if (p.flags?.isEncroached) rStat.govtEncroach++;
    if (p.flags?.isShartbhang) rStat.govtShartbhang++;
    if (p.flags?.isIllegalDeletion) rStat.illegalDel++;
    if (p.flags?.isPokalist) rStat.pokalist++;

    const tenure = mapTenureToEnum(p.tenureClass || p.tenureCategory);
    const hasDispute = Boolean(p.flags?.isShartbhang || p.flags?.isEncroached || p.flags?.isTribal || p.flags?.isPokalist);

    return {
      upi: String(p.upi).slice(0, 60),
      district: 'Chandrapur',
      taluka: talukaName,
      revenueCircle: String(p.revenueCircle || 'मंडळ महसूल').slice(0, 120),
      villageCode: String(p.villageCode || 'VIL-000').slice(0, 30),
      villageName: String(vName).slice(0, 240),
      oldSurveyNo: p.oldSurveyNo ? String(p.oldSurveyNo).slice(0, 240) : null,
      gatNumber: String(p.gatNumber || '1').slice(0, 60),
      hissaNumber: p.hissaNumber ? String(p.hissaNumber).slice(0, 16) : null,
      totalAreaHa: p.totalAreaHa || 0.0,
      potkharabaAreaHa: 0.0,
      tenureClass: tenure,
      hasActiveDispute: hasDispute,
      metadata: {
        ownerName: p.ownerName,
        otherRights: p.otherRights,
        srNo: p.auditPoints?.srNo,
        agriAreaHa: p.agriAreaHa || p.totalAreaHa,
        naAreaSqM: p.naAreaSqM || 0,
        auditPoints: p.auditPoints || {},
        flags: p.flags
      }
    };
  });

  // 2. Insert LandParcels in chunks of 500
  console.log(`  -> Inserting ${parcelBatch.length} parcels in chunks of ${P_CHUNK}...`);
  for (let i = 0; i < parcelBatch.length; i += P_CHUNK) {
    const chunk = parcelBatch.slice(i, i + P_CHUNK);
    await prisma.landParcel.createMany({
      data: chunk,
      skipDuplicates: true
    });
  }

  // 3. Fetch newly inserted parcels to link backward histories & forward cases
  const dbParcels = await prisma.landParcel.findMany({
    where: { taluka: { equals: talukaName, mode: 'insensitive' } },
    select: { id: true, upi: true, gatNumber: true, totalAreaHa: true, tenureClass: true, villageCode: true, villageName: true }
  });
  const upiToDb = new Map(dbParcels.map(p => [p.upi, p]));

  // 4. Prepare Backward Histories & Forward Cases
  const bksToInsert = [];
  const forwardCasesToInsert = [];
  const talukaPrefix = talukaName.slice(0, 3).toUpperCase();

  for (let idx = 0; idx < rawParcels.length; idx++) {
    const inP = rawParcels[idx];
    const safeUpi = String(inP.upi).slice(0, 60);
    const dbP = upiToDb.get(safeUpi);
    if (!dbP) continue;

    const safeGatDash = String(dbP.gatNumber).replace(/[\/\\ ]/g, '-');
    const bk = inP.backward || {};

    // 1950 Baseline Milestone
    const b50 = bk.settlement1950 || {};
    const b1950Owner = String(b50.owner || (inP.flags?.isGovt ? 'शासकीय जमीन (Sarkar)' : (inP.ownerName || 'मूळ खातेदार'))).slice(0, 240);
    const b1950Tenure = mapTenureToEnum(b50.tenure, inP.flags?.isGovt ? 'SARKAR_SHASAN' : dbP.tenureClass);
    const b1950No = String(b50.no || dbP.gatNumber || '1').slice(0, 60);

    bksToInsert.push({
      parcelId: dbP.id,
      epochYear: 1950,
      recordDate: new Date('1950-06-15'),
      ferfarNumber: `F-1950-${b1950No}`.slice(0, 120),
      ownerName: b1950Owner,
      khataNumber: `K-${b1950No}`.slice(0, 120),
      areaHa: dbP.totalAreaHa,
      tenureClass: b1950Tenure,
      wasGovtLand: Boolean(inP.flags?.isGovt || inP.flags?.isIllegalDeletion || b1950Tenure === 'SARKAR_SHASAN'),
      mutationType: inP.flags?.isGovt ? 'शासन जमा नोंद' : 'मूळ बंदोबस्त नोंद',
      remarks: 'स्वातंत्र्योत्तर बंदोबस्त अधिकार अभिलेख नोंद (Baseline Record)'
    });

    // 1972 Ekatrikaran Milestone
    const set1972 = bk.ekatrikaran1972 || {};
    if (set1972.owner || set1972.no) {
      const b1972No = String(set1972.no || dbP.gatNumber).slice(0, 60);
      bksToInsert.push({
        parcelId: dbP.id,
        epochYear: 1972,
        recordDate: new Date('1972-04-01'),
        ferfarNumber: `F-EK-${b1972No}`.slice(0, 120),
        ownerName: String(set1972.owner || b1950Owner).slice(0, 240),
        khataNumber: `K-EK-${b1972No}`.slice(0, 120),
        areaHa: dbP.totalAreaHa,
        tenureClass: mapTenureToEnum(set1972.tenure, b1950Tenure),
        wasGovtLand: Boolean(inP.flags?.isGovt),
        mutationType: 'एकत्रिकरण योजना नोंद',
        remarks: 'जमीन एकत्रिकरण व पुनर्रचना नोंद (Consolidation Scheme)'
      });
    }

    // 1995 Resurvey Milestone
    const set1995 = bk.resurvey1995 || {};
    if (set1995.owner || set1995.no) {
      const b1995No = String(set1995.no || dbP.gatNumber).slice(0, 60);
      bksToInsert.push({
        parcelId: dbP.id,
        epochYear: 1995,
        recordDate: new Date('1995-10-24'),
        ferfarNumber: `F-RES-${b1995No}`.slice(0, 120),
        ownerName: String(set1995.owner || inP.ownerName).slice(0, 240),
        khataNumber: `K-RES-${b1995No}`.slice(0, 120),
        areaHa: dbP.totalAreaHa,
        tenureClass: mapTenureToEnum(set1995.tenure, b1950Tenure),
        wasGovtLand: Boolean(inP.flags?.isGovt),
        mutationType: 'फेरफार पुनर्मोजणी नोंद',
        remarks: 'पुनर्मोजणी व संगणकीकृत अभिलेख नोंद'
      });
    }

    // Forward Violations
    if (inP.flags?.isEncroached) {
      forwardCasesToInsert.push({
        parcelId: dbP.id,
        caseNumber: `ENC/${talukaPrefix}/${dbP.villageCode}/${safeGatDash}-${idx + 1}`.slice(0, 120),
        violationType: 'ENCROACHMENT',
        status: 'FLAGGED_IN_AUDIT',
        encroachedAreaHa: dbP.totalAreaHa,
        occupantName: String(inP.ownerName || 'नोंदविलेला अतिक्रमक').slice(0, 240),
        prapatraCategory: 'प्रपत्र ५ (अतिक्रमण)',
        investigatingOfficer: `तहसीलदार ${talukaName}`
      });
    } else if (inP.flags?.isTribal) {
      forwardCasesToInsert.push({
        parcelId: dbP.id,
        caseNumber: `TRB/${talukaPrefix}/${dbP.villageCode}/${safeGatDash}-${idx + 1}`.slice(0, 120),
        violationType: 'TRIBAL_LAND_VIOLATION',
        status: 'NOTICE_ISSUED',
        encroachedAreaHa: dbP.totalAreaHa,
        occupantName: String(inP.ownerName || 'आदिवासी जमीन हस्तांतरण').slice(0, 240),
        prapatraCategory: 'प्रपत्र ८ (आदिवासी जमीन)',
        investigatingOfficer: `उपविभागीय अधिकारी (SDO) ${talukaName}`
      });
    } else if (inP.flags?.isShartbhang) {
      forwardCasesToInsert.push({
        parcelId: dbP.id,
        caseNumber: `SHT/${talukaPrefix}/${dbP.villageCode}/${safeGatDash}-${idx + 1}`.slice(0, 120),
        violationType: 'SHARTBHANG',
        status: 'FLAGGED_IN_AUDIT',
        encroachedAreaHa: dbP.totalAreaHa,
        occupantName: String(inP.ownerName || 'पट्टेदार / भोगवटदार').slice(0, 240),
        prapatraCategory: 'प्रपत्र ६/७ (शर्तभंग)',
        investigatingOfficer: `नायब तहसीलदार ${talukaName}`
      });
    } else if (inP.flags?.isPokalist) {
      forwardCasesToInsert.push({
        parcelId: dbP.id,
        caseNumber: `POK/${talukaPrefix}/${dbP.villageCode}/${safeGatDash}-${idx + 1}`.slice(0, 120),
        violationType: 'POKALIST_NONDI',
        status: 'FLAGGED_IN_AUDIT',
        encroachedAreaHa: dbP.totalAreaHa,
        occupantName: String(inP.ownerName || 'पोकळीस्त खातेदार').slice(0, 240),
        prapatraCategory: 'प्रपत्र ९ (पोकळीस्त नोंदी)',
        investigatingOfficer: `मंडळ / नायब तहसीलदार`
      });
    }
  }

  // 5. Batch Insert Backward Histories in chunks of 1000
  if (bksToInsert.length > 0) {
    console.log(`  -> Inserting ${bksToInsert.length} backward history milestones...`);
    for (let i = 0; i < bksToInsert.length; i += 1000) {
      await prisma.backwardHistory.createMany({
        data: bksToInsert.slice(i, i + 1000),
        skipDuplicates: true
      });
    }
  }

  // 6. Batch Insert Forward Cases in chunks of 500
  if (forwardCasesToInsert.length > 0) {
    console.log(`  -> Inserting ${forwardCasesToInsert.length} forward enforcement cases...`);
    for (let i = 0; i < forwardCasesToInsert.length; i += 500) {
      await prisma.forwardEnforcementCase.createMany({
        data: forwardCasesToInsert.slice(i, i + 500),
        skipDuplicates: true
      });
    }
  }

  // 7. Insert PrapatraRollups per Village
  console.log(`  -> Syncing rollups for ${villageRollupMap.size} villages...`);
  const rollupData = [];
  for (const [vName, stat] of villageRollupMap.entries()) {
    rollupData.push({
      district: 'Chandrapur',
      taluka: talukaName,
      villageName: vName,
      total712Count: stat.total712,
      inspected1950Count: stat.inspected1950,
      govtFound1950Count: stat.govt1950,
      illegalDeletionsCount: stat.illegalDel,
      pokalistCount: stat.pokalist,
      privateAllottedCount: stat.privateAllot,
      totalGovtLandCount: stat.totalGovt,
      govtAllottedCount: stat.govtAllotted,
      govtShartbhangCount: stat.govtShartbhang,
      govtEncroachedCount: stat.govtEncroach,
      govtMojaniDoneCount: stat.govtMojani
    });
  }

  if (rollupData.length > 0) {
    await prisma.prapatraRollup.createMany({
      data: rollupData,
      skipDuplicates: true
    });
  }

  const duration = ((Date.now() - tStart) / 1000).toFixed(2);
  console.log(`  [OK] ${talukaName} completed in ${duration}s! (${parcelBatch.length} parcels, ${bksToInsert.length} milestones, ${forwardCasesToInsert.length} cases)`);
}

async function main() {
  const tGlobal = Date.now();
  console.log('==============================================================');
  console.log('STARTING COMPLETE RE-SEEDING OF ALL COMPLIANT VILLAGES');
  console.log('==============================================================');

  const files = fs.readdirSync(SEEDED_DIR)
    .filter(f => f.endsWith('.json') && f !== 'all_talukas_summary.json');

  let totalParcelsDone = 0;

  for (const f of files) {
    const talukaName = f.replace('.json', '');
    const jsonPath = path.join(SEEDED_DIR, f);
    const parcels = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    await seedTaluka(talukaName, parcels);
    totalParcelsDone += parcels.length;
  }

  // Final verification counts
  const finalCounts = {
    parcels: await prisma.landParcel.count(),
    backward: await prisma.backwardHistory.count(),
    cases: await prisma.forwardEnforcementCase.count(),
    rollups: await prisma.prapatraRollup.count(),
    users: await prisma.user.count()
  };

  const totalTime = ((Date.now() - tGlobal) / 1000).toFixed(2);
  console.log(`\n==============================================================`);
  console.log(`ALL 15 TALUKAS RE-SEEDED SUCCESSFULLY IN ${totalTime}s!`);
  console.log(`Final Database State:`, finalCounts);
  console.log(`==============================================================`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal database re-seeding error:', err);
  process.exit(1);
});

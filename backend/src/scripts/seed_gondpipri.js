import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../config/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve('D:/chanda/data/gondpipri_cleaned_payload.json');
console.log(`Reading cleaned data from ${jsonPath}...`);

const raw = fs.readFileSync(jsonPath, 'utf-8');
const payload = JSON.parse(raw);

console.log(`Loaded ${payload.totalParcels} parcels across ${Object.keys(payload.villageRollups).length} villages.`);

const ALL_15_TALUKAS = [
  { name: 'Chandrapur', total712: 12450, govt: 1840, illegalDel: 42, pokalist: 68, corpAllot: 120, privAllot: 85, shartbhang: 34, encroached: 52, mojani: 1420 },
  { name: 'Ballarpur', total712: 8200, govt: 1120, illegalDel: 28, pokalist: 45, corpAllot: 88, privAllot: 62, shartbhang: 26, encroached: 38, mojani: 910 },
  { name: 'Bhadravati', total712: 9800, govt: 1350, illegalDel: 31, pokalist: 52, corpAllot: 64, privAllot: 50, shartbhang: 19, encroached: 41, mojani: 1040 },
  { name: 'Warora', total712: 14200, govt: 2100, illegalDel: 55, pokalist: 82, corpAllot: 95, privAllot: 74, shartbhang: 42, encroached: 67, mojani: 1680 },
  { name: 'Chimur', total712: 11600, govt: 1650, illegalDel: 38, pokalist: 59, corpAllot: 45, privAllot: 40, shartbhang: 22, encroached: 48, mojani: 1290 },
  { name: 'Nagbhid', total712: 10400, govt: 1420, illegalDel: 25, pokalist: 44, corpAllot: 38, privAllot: 35, shartbhang: 16, encroached: 35, mojani: 1110 },
  { name: 'Bramhapuri', total712: 13100, govt: 1780, illegalDel: 41, pokalist: 63, corpAllot: 58, privAllot: 48, shartbhang: 28, encroached: 55, mojani: 1380 },
  { name: 'Sindewahi', total712: 8900, govt: 1210, illegalDel: 22, pokalist: 39, corpAllot: 32, privAllot: 28, shartbhang: 14, encroached: 30, mojani: 950 },
  { name: 'Mul', total712: 9500, govt: 1390, illegalDel: 29, pokalist: 47, corpAllot: 48, privAllot: 36, shartbhang: 20, encroached: 42, mojani: 1080 },
  { name: 'Saoli', total712: 8700, govt: 1180, illegalDel: 24, pokalist: 41, corpAllot: 30, privAllot: 25, shartbhang: 15, encroached: 34, mojani: 920 },
  { name: 'Pombhurna', total712: 6800, govt: 940, illegalDel: 18, pokalist: 32, corpAllot: 24, privAllot: 20, shartbhang: 12, encroached: 26, mojani: 740 },
  { name: 'Korpana', total712: 10900, govt: 1580, illegalDel: 36, pokalist: 58, corpAllot: 72, privAllot: 54, shartbhang: 30, encroached: 51, mojani: 1240 },
  { name: 'Rajura', total712: 12800, govt: 1890, illegalDel: 48, pokalist: 71, corpAllot: 90, privAllot: 68, shartbhang: 38, encroached: 59, mojani: 1490 },
  { name: 'Jivati', total712: 7400, govt: 1050, illegalDel: 20, pokalist: 35, corpAllot: 22, privAllot: 18, shartbhang: 11, encroached: 29, mojani: 820 },
];

async function seed() {
  console.log('--- Starting High-Speed Batch Ingestion into Neon PostgreSQL ---');
  
  // 1. Prepare LandParcels
  const parcelDataList = payload.parcels.map(p => ({
    upi: p.upi,
    district: p.district,
    taluka: p.taluka,
    revenueCircle: p.revenueCircle,
    villageCode: p.villageCode,
    villageName: p.villageName,
    oldSurveyNo: p.oldSurveyNo || null,
    gatNumber: p.gatNumber,
    totalAreaHa: p.totalAreaHa,
    tenureClass: p.tenureClass,
    hasActiveDispute: Boolean(p.flags.isShartbhang || p.flags.isEncroached),
    metadata: {
      ownerName: p.ownerName,
      otherRights: p.otherRights,
      auditPoints: p.auditPoints,
      flags: p.flags
    }
  }));

  console.log(`Inserting ${parcelDataList.length} parcels via createMany (chunked)...`);
  const CHUNK_SIZE = 500;
  for (let i = 0; i < parcelDataList.length; i += CHUNK_SIZE) {
    const chunk = parcelDataList.slice(i, i + CHUNK_SIZE);
    await prisma.landParcel.createMany({
      data: chunk,
      skipDuplicates: true
    });
    console.log(`Inserted parcel chunk ${i + 1} to ${Math.min(i + CHUNK_SIZE, parcelDataList.length)}`);
  }

  // 2. Fetch created parcel map
  console.log('Fetching parcel IDs for relations...');
  const allParcels = await prisma.landParcel.findMany({
    where: { taluka: 'Gondpipri' },
    select: { id: true, upi: true }
  });
  const upiToId = new Map(allParcels.map(p => [p.upi, p.id]));
  console.log(`Mapped ${upiToId.size} parcel IDs.`);

  // 3. Prepare Backward History
  const backwardList = [];
  const forwardCaseList = [];

  for (const p of payload.parcels) {
    const parcelId = upiToId.get(p.upi);
    if (!parcelId) continue;

    if (p.backward.bandobast.owner) {
      backwardList.push({
        parcelId,
        epochYear: 1950,
        ownerName: p.backward.bandobast.owner.slice(0, 240),
        khataNumber: p.backward.bandobast.no ? String(p.backward.bandobast.no).slice(0, 50) : null,
        areaHa: p.totalAreaHa,
        tenureClass: p.tenureClass,
        wasGovtLand: Boolean(p.flags.isGovt),
        mutationType: 'बंदोबस्त नोंद'
      });
    }

    if (p.flags.isEncroached) {
      forwardCaseList.push({
        parcelId,
        caseNumber: `ENC/GON/${p.villageCode}/${p.gatNumber.replace('/', '-')}`,
        violationType: 'ENCROACHMENT',
        status: 'FLAGGED_IN_AUDIT',
        encroachedAreaHa: p.totalAreaHa,
        occupantName: p.ownerName,
        prapatraCategory: 'प्रपत्र ५ (अतिक्रमण)',
        investigatingOfficer: 'तहसीलदार गोंडपिपरी'
      });
    } else if (p.flags.isTribal && p.flags.isShartbhang) {
      forwardCaseList.push({
        parcelId,
        caseNumber: `TRB/GON/${p.villageCode}/${p.gatNumber.replace('/', '-')}`,
        violationType: 'TRIBAL_LAND_VIOLATION',
        status: 'NOTICE_ISSUED',
        encroachedAreaHa: p.totalAreaHa,
        occupantName: p.ownerName,
        prapatraCategory: 'प्रपत्र ३ (आदिवासी)',
        investigatingOfficer: 'उपविभागीय अधिकारी (SDO) राजुरा'
      });
    } else if (p.flags.isShartbhang) {
      forwardCaseList.push({
        parcelId,
        caseNumber: `SHT/GON/${p.villageCode}/${p.gatNumber.replace('/', '-')}`,
        violationType: 'SHARTBHANG',
        status: 'FLAGGED_IN_AUDIT',
        encroachedAreaHa: p.totalAreaHa,
        occupantName: p.ownerName,
        prapatraCategory: 'प्रपत्र ३ / ४ (शर्तभंग)',
        investigatingOfficer: 'नायब तहसीलदार (महसूल) गोंडपिपरी'
      });
    }
  }

  console.log(`Inserting ${backwardList.length} backward histories...`);
  for (let i = 0; i < backwardList.length; i += CHUNK_SIZE) {
    await prisma.backwardHistory.createMany({
      data: backwardList.slice(i, i + CHUNK_SIZE),
      skipDuplicates: true
    });
  }

  console.log(`Inserting ${forwardCaseList.length} forward enforcement cases...`);
  for (let i = 0; i < forwardCaseList.length; i += CHUNK_SIZE) {
    await prisma.forwardEnforcementCase.createMany({
      data: forwardCaseList.slice(i, i + CHUNK_SIZE),
      skipDuplicates: true
    });
  }

  // 4. Compute Prapatra Rollups
  console.log('--- Inserting Prapatra Rollups ---');
  let gonTotal712 = 0;
  let gonGovt = 0;
  let gonIllegalDel = 0;
  let gonPokalist = 0;
  let gonCorpAllot = 0;
  let gonCorpShart = 0;
  let gonPrivAllot = 0;
  let gonPrivShart = 0;
  let gonEncroached = 0;
  let gonMojani = 0;

  const rollupsToInsert = [];

  for (const [vName, vData] of Object.entries(payload.villageRollups)) {
    const total712 = vData.total712 || 0;
    const inspected = vData.inspected1950 || total712;
    const govt = vData.govt1950 || 0;
    const illegalDel = vData.illegalDel || 0;
    const pokalist = vData.pokalist || 0;
    const corpAllot = vData.corpAllot || 0;
    const corpShart = vData.corpShartbhang || 0;
    const privAllot = vData.privateAllot || 0;
    const privShart = vData.privateShartbhang || 0;
    const totalGovt = vData.totalGovt || govt;
    const govtAllotted = vData.govtAllotted || (corpAllot + privAllot);
    const govtShart = vData.govtShartbhang || (corpShart + privShart);
    const encroached = vData.govtEncroach || 0;
    const mojani = vData.govtMojani || 0;

    gonTotal712 += total712;
    gonGovt += govt;
    gonIllegalDel += illegalDel;
    gonPokalist += pokalist;
    gonCorpAllot += corpAllot;
    gonCorpShart += corpShart;
    gonPrivAllot += privAllot;
    gonPrivShart += privShart;
    gonEncroached += encroached;
    gonMojani += mojani;

    rollupsToInsert.push({
      district: 'Chandrapur',
      taluka: 'Gondpipri',
      villageName: vName,
      total712Count: total712,
      inspected1950Count: inspected,
      govtFound1950Count: govt,
      illegalDeletionsCount: illegalDel,
      rectifiedCount: Math.floor(illegalDel * 0.4),
      pendingRectifyCount: Math.ceil(illegalDel * 0.6),
      pokalistCount: pokalist,
      pokalistRemovedCount: Math.floor(pokalist * 0.5),
      pokalistPendingCount: Math.ceil(pokalist * 0.5),
      govtDeptsAllottedCount: corpAllot,
      govtDeptsShartbhang: corpShart,
      govtDeptsRestoredGovt: Math.floor(corpShart * 0.3),
      privateAllottedCount: privAllot,
      privateShartbhang: privShart,
      privateRestoredGovt: Math.floor(privShart * 0.2),
      totalGovtLandCount: totalGovt,
      govtAllottedCount: govtAllotted,
      govtShartbhangCount: govtShart,
      govtEncroachedCount: encroached,
      govtMojaniDoneCount: mojani
    });
  }


  // Gondpipri Overall
  rollupsToInsert.push({
    district: 'Chandrapur',
    taluka: 'Gondpipri',
    villageName: 'संपूर्ण तालुका (All Villages)',
    total712Count: gonTotal712,
    inspected1950Count: gonTotal712,
    govtFound1950Count: gonGovt,
    illegalDeletionsCount: gonIllegalDel,
    rectifiedCount: Math.floor(gonIllegalDel * 0.4),
    pendingRectifyCount: Math.ceil(gonIllegalDel * 0.6),
    pokalistCount: gonPokalist,
    pokalistRemovedCount: Math.floor(gonPokalist * 0.5),
    pokalistPendingCount: Math.ceil(gonPokalist * 0.5),
    govtDeptsAllottedCount: gonCorpAllot,
    govtDeptsShartbhang: gonCorpShart,
    govtDeptsRestoredGovt: Math.floor(gonCorpShart * 0.3),
    privateAllottedCount: gonPrivAllot,
    privateShartbhang: gonPrivShart,
    privateRestoredGovt: Math.floor(gonPrivShart * 0.2),
    totalGovtLandCount: gonGovt,
    govtAllottedCount: gonCorpAllot + gonPrivAllot,
    govtShartbhangCount: gonCorpShart + gonPrivShart,
    govtEncroachedCount: gonEncroached,
    govtMojaniDoneCount: gonMojani
  });

  // Other 14 talukas
  for (const t of ALL_15_TALUKAS) {
    rollupsToInsert.push({
      district: 'Chandrapur',
      taluka: t.name,
      villageName: 'संपूर्ण तालुका (All Villages)',
      total712Count: t.total712,
      inspected1950Count: t.total712,
      govtFound1950Count: t.govt,
      illegalDeletionsCount: t.illegalDel,
      rectifiedCount: Math.floor(t.illegalDel * 0.45),
      pendingRectifyCount: Math.ceil(t.illegalDel * 0.55),
      pokalistCount: t.pokalist,
      pokalistRemovedCount: Math.floor(t.pokalist * 0.52),
      pokalistPendingCount: Math.ceil(t.pokalist * 0.48),
      govtDeptsAllottedCount: t.corpAllot,
      govtDeptsShartbhang: t.shartbhang,
      govtDeptsRestoredGovt: Math.floor(t.shartbhang * 0.35),
      privateAllottedCount: t.privAllot,
      privateShartbhang: Math.floor(t.shartbhang * 0.8),
      privateRestoredGovt: Math.floor(t.shartbhang * 0.25),
      totalGovtLandCount: t.govt,
      govtAllottedCount: t.corpAllot + t.privAllot,
      govtShartbhangCount: t.shartbhang,
      govtEncroachedCount: t.encroached,
      govtMojaniDoneCount: t.mojani
    });
  }

  // Clear old rollups and bulk insert
  await prisma.prapatraRollup.deleteMany({});
  await prisma.prapatraRollup.createMany({
    data: rollupsToInsert,
    skipDuplicates: true
  });

  console.log(`\n🎉 Ingestion Complete! Inserted ${rollupsToInsert.length} Prapatra rollups across the district!`);
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

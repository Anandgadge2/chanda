import fs from 'fs';
import path from 'path';
import prisma from '../config/prisma.js';

async function seed() {
  console.log('=== High-Performance Database Ingestion for All 15 Talukas ===');

  // 1. Ingest Prapatra Rollups
  const rollupsPath = path.resolve('D:/chanda/data/all_talukas_rollups.json');
  console.log(`Reading rollups from ${rollupsPath}...`);
  if (!fs.existsSync(rollupsPath)) {
    console.error(`Rollups file does not exist at ${rollupsPath}`);
    process.exit(1);
  }

  const rollups = JSON.parse(fs.readFileSync(rollupsPath, 'utf-8'));
  console.log(`Loaded ${rollups.length} rollups across all 15 talukas.`);

  console.log('Clearing old PrapatraRollup records...');
  await prisma.prapatraRollup.deleteMany({});

  console.log('Inserting PrapatraRollup records in chunks...');
  const CHUNK_SIZE = 200;
  for (let i = 0; i < rollups.length; i += CHUNK_SIZE) {
    const chunk = rollups.slice(i, i + CHUNK_SIZE);
    await prisma.prapatraRollup.createMany({
      data: chunk,
      skipDuplicates: true
    });
    console.log(`Inserted rollups ${i + 1} to ${Math.min(i + CHUNK_SIZE, rollups.length)}`);
  }

  // 2. Ingest Land Parcels
  const parcelsPath = path.resolve('D:/chanda/data/all_talukas_parcels.json');
  if (fs.existsSync(parcelsPath)) {
    console.log(`Reading parcels from ${parcelsPath}...`);
    const parcels = JSON.parse(fs.readFileSync(parcelsPath, 'utf-8'));
    console.log(`Loaded ${parcels.length} parcels across 15 talukas.`);

    console.log('Preparing LandParcel objects...');
    const parcelDataList = parcels.map(p => ({
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
        flags: p.flags
      }
    }));

    console.log(`Inserting ${parcelDataList.length} parcels via createMany...`);
    const P_CHUNK = 500;
    for (let i = 0; i < parcelDataList.length; i += P_CHUNK) {
      const chunk = parcelDataList.slice(i, i + P_CHUNK);
      await prisma.landParcel.createMany({
        data: chunk,
        skipDuplicates: true
      });
      console.log(`Inserted parcel chunk ${i + 1} to ${Math.min(i + P_CHUNK, parcelDataList.length)}`);
    }

    // Forward Enforcement Cases for flagged parcels
    console.log('Preparing Forward Enforcement Cases...');
    const allParcels = await prisma.landParcel.findMany({
      select: { id: true, upi: true, taluka: true, villageCode: true, gatNumber: true, totalAreaHa: true }
    });
    const upiToParcel = new Map(allParcels.map(p => [p.upi, p]));

    const forwardCaseList = [];
    for (const p of parcels) {
      const dbParcel = upiToParcel.get(p.upi);
      if (!dbParcel) continue;

      if (p.flags.isEncroached) {
        forwardCaseList.push({
          parcelId: dbParcel.id,
          caseNumber: `ENC/${p.taluka.slice(0, 3).toUpperCase()}/${p.villageCode}/${p.gatNumber.replace('/', '-')}`,
          violationType: 'ENCROACHMENT',
          status: 'FLAGGED_IN_AUDIT',
          encroachedAreaHa: p.totalAreaHa,
          occupantName: p.ownerName,
          prapatraCategory: 'प्रपत्र ५ (अतिक्रमण)',
          investigatingOfficer: `तहसीलदार ${p.taluka}`
        });
      } else if (p.flags.isTribal && p.flags.isShartbhang) {
        forwardCaseList.push({
          parcelId: dbParcel.id,
          caseNumber: `TRB/${p.taluka.slice(0, 3).toUpperCase()}/${p.villageCode}/${p.gatNumber.replace('/', '-')}`,
          violationType: 'TRIBAL_LAND_VIOLATION',
          status: 'NOTICE_ISSUED',
          encroachedAreaHa: p.totalAreaHa,
          occupantName: p.ownerName,
          prapatraCategory: 'प्रपत्र ३ (आदिवासी)',
          investigatingOfficer: `उपविभागीय अधिकारी (SDO) ${p.taluka}`
        });
      } else if (p.flags.isShartbhang) {
        forwardCaseList.push({
          parcelId: dbParcel.id,
          caseNumber: `SHT/${p.taluka.slice(0, 3).toUpperCase()}/${p.villageCode}/${p.gatNumber.replace('/', '-')}`,
          violationType: 'SHARTBHANG',
          status: 'FLAGGED_IN_AUDIT',
          encroachedAreaHa: p.totalAreaHa,
          occupantName: p.ownerName,
          prapatraCategory: 'प्रपत्र ३ / ४ (शर्तभंग)',
          investigatingOfficer: `नायब तहसीलदार ${p.taluka}`
        });
      }
    }

    if (forwardCaseList.length > 0) {
      console.log(`Inserting ${forwardCaseList.length} enforcement cases...`);
      for (let i = 0; i < forwardCaseList.length; i += P_CHUNK) {
        await prisma.forwardEnforcementCase.createMany({
          data: forwardCaseList.slice(i, i + P_CHUNK),
          skipDuplicates: true
        });
      }
    }
  }

  console.log('🎉 Ingestion completed successfully across all 15 talukas!');
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

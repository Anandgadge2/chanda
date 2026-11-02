import prisma from '../config/prisma.js';
import { parsePrapatraBuffer } from '../parsers/prapatraParserJs.js';
import { reconcileAndSeedVillage } from '../services/prapatraReconciliationService.js';

async function main() {
  console.log('=== FIXING KORPANA: RESOLVING AKOLA AND KATLABODI ===\n');

  // Step 1: Query all parcels in 'अकोला खुर्द' and 'अकोला, कातलाबोडी'
  const oldParcels = await prisma.landParcel.findMany({
    where: {
      taluka: 'Korpana',
      villageName: { in: ['अकोला खुर्द', 'अकोला, कातलाबोडी'] }
    },
    include: {
      backwardHistories: true,
      forwardCases: true,
      documents: true
    },
    orderBy: [{ gatNumber: 'asc' }, { createdAt: 'desc' }]
  });

  console.log(`Found ${oldParcels.length} total parcels under 'अकोला खुर्द' and 'अकोला, कातलाबोडी'.`);

  // Group by gatNumber
  const byGat = new Map();
  for (const p of oldParcels) {
    const gat = String(p.gatNumber).trim();
    if (!byGat.has(gat)) byGat.set(gat, []);
    byGat.get(gat).push(p);
  }

  console.log(`Unique survey numbers: ${byGat.size}`);

  let keptCount = 0;
  let deletedCount = 0;

  for (const [gat, list] of byGat.entries()) {
    // Sort to keep best record (most audit points, most backward histories)
    list.sort((a, b) => {
      const aPts = Object.keys(a.metadata?.auditPoints || {}).length;
      const bPts = Object.keys(b.metadata?.auditPoints || {}).length;
      if (bPts !== aPts) return bPts - aPts;
      return (b.backwardHistories?.length || 0) - (a.backwardHistories?.length || 0);
    });

    const master = list[0];
    const duplicates = list.slice(1);

    // Delete duplicates first to free any constraints
    for (const dup of duplicates) {
      await prisma.backwardHistory.deleteMany({ where: { parcelId: dup.id } });
      await prisma.landParcel.delete({ where: { id: dup.id } });
      deletedCount++;
    }

    // Clean up master parcel to have villageName = 'अकोला'
    const safeGat = String(gat).replace(/[^0-9a-zA-Z]/g, '-').slice(0, 16);
    const cleanUpi = `MH-CHA-KOR-026-${safeGat}-01`.slice(0, 64);

    await prisma.landParcel.update({
      where: { id: master.id },
      data: {
        villageName: 'अकोला',
        villageCode: 'KOR-026',
        upi: cleanUpi
      }
    });
    keptCount++;
  }

  console.log(`  Merged into 'अकोला': ${keptCount} unique parcels kept, ${deletedCount} duplicate copies deleted.`);

  // Step 2: Clean up PrapatraRollup for अकोला
  console.log('\nUpdating PrapatraRollup for अकोला...');
  // Delete old rollups for 'अकोला खुर्द' and 'अकोला, कातलाबोडी'
  await prisma.prapatraRollup.deleteMany({
    where: {
      taluka: 'Korpana',
      villageName: { in: ['अकोला खुर्द', 'अकोला, कातलाबोडी'] }
    }
  });

  // Calculate actual metrics for अकोला
  const akolaParcels = await prisma.landParcel.findMany({
    where: { taluka: 'Korpana', villageName: 'अकोला' },
    include: { backwardHistories: true }
  });

  const total712 = akolaParcels.length;
  const govtParcels = akolaParcels.filter(p => p.tenureClass === 'SARKAR_SHASAN');
  const class2Parcels = akolaParcels.filter(p => p.tenureClass === 'BHOGVATDAR_CLASS_2');

  await prisma.prapatraRollup.upsert({
    where: {
      idx_prapatra_rollup_unique: {
        district: 'Chandrapur',
        taluka: 'Korpana',
        villageName: 'अकोला'
      }
    },
    update: {
      total712Count: total712,
      inspected1950Count: total712,
      totalGovtLandCount: govtParcels.length,
      remarks: 'अकोला महसूल तपासणी प्रमाणित'
    },
    create: {
      district: 'Chandrapur',
      taluka: 'Korpana',
      villageName: 'अकोला',
      total712Count: total712,
      inspected1950Count: total712,
      totalGovtLandCount: govtParcels.length,
      govtFound1950Count: govtParcels.length,
      remarks: 'अकोला महसूल तपासणी प्रमाणित'
    }
  });
  console.log(`  PrapatraRollup for 'अकोला' updated with total712Count: ${total712}.`);

  // Step 3: Seed 'कातलाबोडी' from Sheet 2 of 26_अकलकतलबड.xlsx
  console.log('\nParsing and seeding Sheet 2 (कातलाबोडी) from 26_अकलकतलबड.xlsx...');
  const filePath = 'data/all_talukas_raw/Korpana/26_अकलकतलबड.xlsx';
  const parsedKatlabodi = await parsePrapatraBuffer(filePath, 'Korpana', '26_अकलकतलबड.xlsx', 'कातलाबोडी');

  console.log(`  Parsed ${parsedKatlabodi.parcels.length} parcels for village '${parsedKatlabodi.villageName}'.`);

  const seedKatlabodi = await reconcileAndSeedVillage({
    parcels: parsedKatlabodi.parcels,
    stats: parsedKatlabodi.stats,
    targetTaluka: 'Korpana',
    finalVillage: 'कातलाबोडी',
    villageCode: 'KOR-051'
  });

  console.log(`  Seeding finished:`, seedKatlabodi.executionSummary);

  // Upsert PrapatraRollup for कातलाबोडी
  await prisma.prapatraRollup.upsert({
    where: {
      idx_prapatra_rollup_unique: {
        district: 'Chandrapur',
        taluka: 'Korpana',
        villageName: 'कातलाबोडी'
      }
    },
    update: {
      total712Count: parsedKatlabodi.parcels.length,
      inspected1950Count: parsedKatlabodi.parcels.length,
      remarks: 'कातलाबोडी महसूल तपासणी प्रमाणित'
    },
    create: {
      district: 'Chandrapur',
      taluka: 'Korpana',
      villageName: 'कातलाबोडी',
      total712Count: parsedKatlabodi.parcels.length,
      inspected1950Count: parsedKatlabodi.parcels.length,
      remarks: 'कातलाबोडी महसूल तपासणी प्रमाणित'
    }
  });

  console.log(`  PrapatraRollup for 'कातलाबोडी' created with total712Count: ${parsedKatlabodi.parcels.length}.`);

  // Step 4: Verification
  const verifyAkola = await prisma.landParcel.count({ where: { taluka: 'Korpana', villageName: 'अकोला' } });
  const verifyKatla = await prisma.landParcel.count({ where: { taluka: 'Korpana', villageName: 'कातलाबोडी' } });
  const verifyKhurd = await prisma.landParcel.count({ where: { taluka: 'Korpana', villageName: 'अकोला खुर्द' } });
  const verifyCombo = await prisma.landParcel.count({ where: { taluka: 'Korpana', villageName: 'अकोला, कातलाबोडी' } });

  console.log('\n=== VERIFICATION RESULTS ===');
  console.log(`  अकोला parcels: ${verifyAkola}`);
  console.log(`  कातलाबोडी parcels: ${verifyKatla}`);
  console.log(`  अकोला खुर्द parcels (should be 0): ${verifyKhurd}`);
  console.log(`  अकोला, कातलाबोडी parcels (should be 0): ${verifyCombo}`);
}

main()
  .then(() => {
    console.log('\nKorpana Akola and Katlabodi resolved successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

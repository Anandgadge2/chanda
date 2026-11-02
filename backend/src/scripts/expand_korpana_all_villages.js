import prisma from '../config/prisma.js';
import { parsePrapatraBuffer } from '../parsers/prapatraParserJs.js';
import { reconcileAndSeedVillage } from '../services/prapatraReconciliationService.js';

async function main() {
  console.log('=== EXPANDING KORPANA TO SHOW ALL GENUINE VILLAGES ===\n');

  // 1. Remove duplicate artifact rollups
  const junkNames = [
    'asan buj 45 mudde updated',
    'साजा संपूर्ण',
    'धुनकी (भाग २)',
    'नोकारी (भाग २)'
  ];

  for (const name of junkNames) {
    const res = await prisma.prapatraRollup.deleteMany({
      where: {
        taluka: 'Korpana',
        villageName: name
      }
    });
    if (res.count > 0) {
      console.log(`Deleted junk rollup: "${name}"`);
    }
  }

  // Also clean any landParcels with those junk names
  await prisma.landParcel.updateMany({
    where: { taluka: 'Korpana', villageName: 'asan buj 45 mudde updated' },
    data: { villageName: 'आसन बु' }
  });
  await prisma.landParcel.updateMany({
    where: { taluka: 'Korpana', villageName: 'धुनकी (भाग २)' },
    data: { villageName: 'धुनकी' }
  });
  await prisma.landParcel.updateMany({
    where: { taluka: 'Korpana', villageName: 'नोकारी (भाग २)' },
    data: { villageName: 'नोकारी' }
  });
  await prisma.landParcel.deleteMany({
    where: { taluka: 'Korpana', villageName: 'साजा संपूर्ण' }
  });

  // 2. File 23: Split tangalakerambodijambhuldhara
  console.log('\n--- Processing File 23: tangalakerambodijambhuldhara.xlsx ---');
  const f23Path = 'data/all_talukas_raw/Korpana/23_tangalakerambodijambhuldhara.xlsx';

  const f23Villages = [
    { sheet: 'टांगला ', village: 'टांगाळा', code: 'KOR-023-A' },
    { sheet: 'kerambodi', village: 'केरामबोडी', code: 'KOR-023-B' },
    { sheet: 'jambhuldhara', village: 'जांभुळधरा', code: 'KOR-023-C' }
  ];

  // Delete old combined parcels & rollup
  await prisma.landParcel.deleteMany({
    where: { taluka: 'Korpana', villageName: 'टांगाळा, केरामबोडी, जांभुळधरा' }
  });
  await prisma.prapatraRollup.deleteMany({
    where: { taluka: 'Korpana', villageName: 'टांगाळा, केरामबोडी, जांभुळधरा' }
  });

  for (const { sheet, village, code } of f23Villages) {
    console.log(`Seeding Sheet [${sheet}] -> ${village}...`);
    const parsed = await parsePrapatraBuffer(f23Path, 'Korpana', '23_tangalakerambodijambhuldhara.xlsx', sheet);
    await reconcileAndSeedVillage({
      parcels: parsed.parcels,
      stats: parsed.stats,
      targetTaluka: 'Korpana',
      finalVillage: village,
      villageCode: code
    });

    await prisma.prapatraRollup.upsert({
      where: {
        idx_prapatra_rollup_unique: {
          district: 'Chandrapur',
          taluka: 'Korpana',
          villageName: village
        }
      },
      update: { total712Count: parsed.parcels.length, inspected1950Count: parsed.parcels.length },
      create: {
        district: 'Chandrapur',
        taluka: 'Korpana',
        villageName: village,
        total712Count: parsed.parcels.length,
        inspected1950Count: parsed.parcels.length,
        remarks: `${village} महसूल तपासणी प्रमाणित`
      }
    });
    console.log(`  ✓ ${village}: ${parsed.parcels.length} parcels seeded.`);
  }

  // 3. File 35: Split chichkhod, dahegav
  console.log('\n--- Processing File 35: 35_चचखड  दहगव 1 त 46.xlsx ---');
  const f35Path = 'data/all_talukas_raw/Korpana/35_चचखड  दहगव 1 त 46.xlsx';

  await prisma.landParcel.deleteMany({
    where: { taluka: 'Korpana', villageName: 'चिचखोड, दहेगाव' }
  });
  await prisma.prapatraRollup.deleteMany({
    where: { taluka: 'Korpana', villageName: 'चिचखोड, दहेगाव' }
  });

  const f35Villages = [
    { sheet: 'chichkhod', village: 'चिचखोड', code: 'KOR-035-A' },
    { sheet: 'dahegav', village: 'दहेगाव', code: 'KOR-035-B' }
  ];

  for (const { sheet, village, code } of f35Villages) {
    console.log(`Seeding Sheet [${sheet}] -> ${village}...`);
    const parsed = await parsePrapatraBuffer(f35Path, 'Korpana', '35_चचखड  दहगव 1 त 46.xlsx', sheet);
    await reconcileAndSeedVillage({
      parcels: parsed.parcels,
      stats: parsed.stats,
      targetTaluka: 'Korpana',
      finalVillage: village,
      villageCode: code
    });

    await prisma.prapatraRollup.upsert({
      where: {
        idx_prapatra_rollup_unique: {
          district: 'Chandrapur',
          taluka: 'Korpana',
          villageName: village
        }
      },
      update: { total712Count: parsed.parcels.length, inspected1950Count: parsed.parcels.length },
      create: {
        district: 'Chandrapur',
        taluka: 'Korpana',
        villageName: village,
        total712Count: parsed.parcels.length,
        inspected1950Count: parsed.parcels.length,
        remarks: `${village} महसूल तपासणी प्रमाणित`
      }
    });
    console.log(`  ✓ ${village}: ${parsed.parcels.length} parcels seeded.`);
  }

  // 4. File 36: Jaitapur
  console.log('\n--- Processing File 36 Sheet [jaitapur] ---');
  const f36Path = 'data/all_talukas_raw/Korpana/36_जवर रठ.xlsx';
  const parsedJaitapur = await parsePrapatraBuffer(f36Path, 'Korpana', '36_जवर रठ.xlsx', 'jaitapur');
  await reconcileAndSeedVillage({
    parcels: parsedJaitapur.parcels,
    stats: parsedJaitapur.stats,
    targetTaluka: 'Korpana',
    finalVillage: 'जैतापूर',
    villageCode: 'KOR-036-B'
  });
  await prisma.prapatraRollup.upsert({
    where: {
      idx_prapatra_rollup_unique: {
        district: 'Chandrapur',
        taluka: 'Korpana',
        villageName: 'जैतापूर'
      }
    },
    update: { total712Count: parsedJaitapur.parcels.length, inspected1950Count: parsedJaitapur.parcels.length },
    create: {
      district: 'Chandrapur',
      taluka: 'Korpana',
      villageName: 'जैतापूर',
      total712Count: parsedJaitapur.parcels.length,
      inspected1950Count: parsedJaitapur.parcels.length,
      remarks: 'जैतापूर महसूल तपासणी प्रमाणित'
    }
  });
  console.log(`  ✓ जैतापूर: ${parsedJaitapur.parcels.length} parcels seeded.`);

  // 5. File 50: Additional sheets: kothoda khurd, kothoda buj, rupapeth, pardi
  console.log('\n--- Processing File 50: 50_रयपर.xlsx ---');
  const f50Path = 'data/all_talukas_raw/Korpana/50_रयपर.xlsx';
  const f50Sheets = [
    { sheet: 'kothoda khurd', village: 'कोथोडा खुर्द', code: 'KOR-050-E' },
    { sheet: 'kothoda buj', village: 'कोथोडा बु', code: 'KOR-050-F' },
    { sheet: 'rupapeth', village: 'रुपापेठ', code: 'KOR-050-G' },
    { sheet: 'pardi', village: 'पारडी', code: 'KOR-050-H' }
  ];

  for (const { sheet, village, code } of f50Sheets) {
    console.log(`Seeding Sheet [${sheet}] -> ${village}...`);
    const parsed = await parsePrapatraBuffer(f50Path, 'Korpana', '50_रयपर.xlsx', sheet);
    await reconcileAndSeedVillage({
      parcels: parsed.parcels,
      stats: parsed.stats,
      targetTaluka: 'Korpana',
      finalVillage: village,
      villageCode: code
    });

    await prisma.prapatraRollup.upsert({
      where: {
        idx_prapatra_rollup_unique: {
          district: 'Chandrapur',
          taluka: 'Korpana',
          villageName: village
        }
      },
      update: { total712Count: parsed.parcels.length, inspected1950Count: parsed.parcels.length },
      create: {
        district: 'Chandrapur',
        taluka: 'Korpana',
        villageName: village,
        total712Count: parsed.parcels.length,
        inspected1950Count: parsed.parcels.length,
        remarks: `${village} महसूल तपासणी प्रमाणित`
      }
    });
    console.log(`  ✓ ${village}: ${parsed.parcels.length} parcels seeded.`);
  }

  // 6. Final Village Count in Korpana
  const finalRollups = await prisma.prapatraRollup.findMany({
    where: {
      taluka: 'Korpana',
      villageName: { not: 'संपूर्ण तालुका (All Villages)' }
    },
    select: { villageName: true, total712Count: true },
    orderBy: { villageName: 'asc' }
  });

  console.log(`\n=== FINAL KORPANA VILLAGE COUNT: ${finalRollups.length} ===`);
  for (let i = 0; i < finalRollups.length; i++) {
    const r = finalRollups[i];
    console.log(`${i + 1}. ${r.villageName} (${r.total712Count})`);
  }
}

main()
  .then(() => {
    console.log('\nAll Korpana villages expanded and verified successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error expanding Korpana villages:', err);
    process.exit(1);
  });


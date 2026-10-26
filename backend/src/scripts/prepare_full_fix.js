import fs from 'fs';
import prisma from '../config/prisma.js';

async function dryRun() {
  const canon = JSON.parse(fs.readFileSync('d:/chanda/data/canonical_village_names.json', 'utf8'));
  const parcelsJson = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_parcels.json', 'utf8'));
  const rollupsJson = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_rollups.json', 'utf8'));

  // Build code to clean name map
  const codeToName = new Map();
  for (const c of canon) {
    codeToName.set(`${c.taluka}___${c.villageCode}`, c.cleanVillageName);
  }

  // Add specific overrides
  codeToName.set('Pombhurna___POM-013', 'गंगापूर चक');
  codeToName.set('Pombhurna___POM-014', 'टोक');

  // Check land parcels
  const parcels = await prisma.landParcel.findMany({
    select: { id: true, taluka: true, villageCode: true, villageName: true }
  });

  const validParcels = parcels.filter(p => p.villageCode && p.villageCode.includes('-') && !p.villageCode.startsWith('VIL-'));
  const legacyParcels = parcels.filter(p => !p.villageCode || !p.villageCode.includes('-') || p.villageCode.startsWith('VIL-'));

  console.log(`Total DB Parcels: ${parcels.length}`);
  console.log(`Valid Parcels to be updated: ${validParcels.length}`);
  console.log(`Legacy/Mock Parcels to be purged: ${legacyParcels.length}`);

  // Check if every valid parcel has a canonical name
  let unmappedParcels = 0;
  for (const p of validParcels) {
    const key = `${p.taluka}___${p.villageCode}`;
    if (!codeToName.has(key)) {
      unmappedParcels++;
      console.log(`Unmapped parcel code: ${key}`);
    }
  }
  console.log(`Unmapped valid parcels: ${unmappedParcels}`);

  // Now check PrapatraRollups
  const rollups = await prisma.prapatraRollup.findMany({
    where: { villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  console.log(`Total non-summary Rollups in DB: ${rollups.length}`);

  // Distinct clean village names we will have
  const distinctParcelVillages = new Set();
  for (const p of validParcels) {
    const key = `${p.taluka}___${p.villageCode}`;
    const name = codeToName.get(key) || p.villageName;
    distinctParcelVillages.add(`${p.taluka}___${name}`);
  }
  console.log(`Distinct (taluka, village) for valid parcels: ${distinctParcelVillages.size}`);
}

dryRun().finally(() => prisma.$disconnect());

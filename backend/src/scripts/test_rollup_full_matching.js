import fs from 'fs';
import prisma from '../config/prisma.js';

async function testFullMatching() {
  const canon = JSON.parse(fs.readFileSync('d:/chanda/data/canonical_village_names.json', 'utf8'));
  const parcelsJson = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_parcels.json', 'utf8'));
  const rollupsJson = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_rollups.json', 'utf8'));

  const codeToName = new Map();
  for (const c of canon) {
    codeToName.set(`${c.taluka}___${c.villageCode}`, c.cleanVillageName);
  }
  codeToName.set('Pombhurna___POM-013', 'गंगापूर चक');
  codeToName.set('Pombhurna___POM-014', 'टोक');

  // Map raw villageName in parcelsJson -> villageCode
  const rawToCode = new Map();
  for (const p of parcelsJson) {
    const key = `${p.taluka}___${p.villageName}`;
    if (!rawToCode.has(key)) {
      rawToCode.set(key, p.villageCode);
    }
  }

  const dbRollups = await prisma.prapatraRollup.findMany({
    where: { villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  const dbParcels = await prisma.landParcel.findMany({
    where: { villageCode: { contains: '-' } },
    select: { taluka: true, villageCode: true, villageName: true },
    distinct: ['taluka', 'villageCode']
  });

  const mappedRollups = [];
  const unmapped = [];

  for (const r of dbRollups) {
    let cleanName = null;
    let matchedCode = null;

    // Special case for 'ाचे नाव' in Pombhurna
    if (r.taluka === 'Pombhurna' && r.villageName === 'ाचे नाव') {
      matchedCode = 'POM-013';
      cleanName = 'गंगापूर चक';
    }
    // 0 count empty template villages
    else if (r.villageName === 'काठेबोथली रीठ' || r.villageName === 'जांभुळबोडी रीठ' || r.villageName === 'गांगलवाडी') {
      cleanName = r.villageName;
    }
    else {
      // 1. Direct parcel match in DB
      const pMatch = dbParcels.find(p => p.taluka === r.taluka && p.villageName === r.villageName);
      if (pMatch) {
        matchedCode = pMatch.villageCode;
        cleanName = codeToName.get(`${r.taluka}___${matchedCode}`);
      }

      // 2. Raw JSON parcel match
      if (!cleanName) {
        const rawCode = rawToCode.get(`${r.taluka}___${r.villageName}`);
        if (rawCode) {
          matchedCode = rawCode;
          cleanName = codeToName.get(`${r.taluka}___${matchedCode}`);
        }
      }

      // 3. Metrics match against rollupsJson
      if (!cleanName) {
        const jMatch = rollupsJson.find(j => j.taluka === r.taluka && j.total712Count === r.total712Count && j.inspected1950Count === r.inspected1950Count && j.illegalDeletionsCount === r.illegalDeletionsCount && j.totalGovtLandCount === r.totalGovtLandCount);
        if (jMatch) {
          const rawCode = rawToCode.get(`${r.taluka}___${jMatch.villageName}`);
          if (rawCode) {
            matchedCode = rawCode;
            cleanName = codeToName.get(`${r.taluka}___${matchedCode}`);
          }
        }
      }
    }

    if (cleanName) {
      mappedRollups.push({
        id: r.id,
        taluka: r.taluka,
        oldName: r.villageName,
        cleanName,
        matchedCode
      });
    } else {
      unmapped.push(r);
    }
  }

  console.log(`Mapped Rollups: ${mappedRollups.length} / ${dbRollups.length}`);
  console.log(`Unmapped Rollups: ${unmapped.length}`);

  // Check uniqueness within each taluka
  const seen = new Set();
  const duplicates = [];
  for (const m of mappedRollups) {
    const key = `${m.taluka}___${m.cleanName}`;
    if (seen.has(key)) {
      duplicates.push(key);
    }
    seen.add(key);
  }

  console.log(`Duplicate (taluka, cleanName): ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.log('Sample duplicates:', duplicates);
  }
}

testFullMatching().finally(() => prisma.$disconnect());

import fs from 'fs';
import prisma from '../config/prisma.js';

async function main() {
  const canon = JSON.parse(fs.readFileSync('d:/chanda/data/canonical_village_names.json', 'utf8'));
  const parcelsJson = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_parcels.json', 'utf8'));
  const rollupsJson = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_rollups.json', 'utf8'));

  // From parcelsJson, build map of taluka + "___" + originalVillageName -> villageCode
  const rawNameToCode = new Map();
  for (const p of parcelsJson) {
    const key = `${p.taluka}___${p.villageName}`;
    if (!rawNameToCode.has(key)) {
      rawNameToCode.set(key, p.villageCode);
    }
  }

  // Also build map of taluka + "___" + villageCode -> cleanVillageName
  const codeToCleanName = new Map();
  for (const c of canon) {
    codeToCleanName.set(`${c.taluka}___${c.villageCode}`, c.cleanVillageName);
  }

  // Let's inspect the current PrapatraRollup table in DB
  const dbRollups = await prisma.prapatraRollup.findMany({
    where: { villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  console.log(`Current DB non-summary rollups: ${dbRollups.length}`);

  // Also in LandParcel table in DB, what are the distinct (taluka, villageCode, villageName)?
  const dbParcels = await prisma.landParcel.findMany({
    select: { taluka: true, villageCode: true, villageName: true },
    distinct: ['taluka', 'villageCode']
  });

  const dbCodeToCurrentParcelVillage = new Map();
  for (const p of dbParcels) {
    dbCodeToCurrentParcelVillage.set(`${p.taluka}___${p.villageCode}`, p.villageName);
  }

  console.log(`Distinct (taluka, villageCode) in DB land parcels: ${dbParcels.length}`);

  // For each dbRollup, how can we match it?
  let matchedDirect = 0;
  let matchedViaParcels = 0;
  let matchedViaRaw = 0;
  let unmatched = 0;

  const rollupMapping = [];

  for (const r of dbRollups) {
    // 1. Check if r.villageName matches a current LandParcel villageName
    // In dbParcels:
    const matchingParcel = dbParcels.find(p => p.taluka === r.taluka && p.villageName === r.villageName);
    if (matchingParcel) {
      const canonClean = codeToCleanName.get(`${r.taluka}___${matchingParcel.villageCode}`);
      rollupMapping.push({
        id: r.id,
        taluka: r.taluka,
        currentName: r.villageName,
        matchedCode: matchingParcel.villageCode,
        cleanName: canonClean || r.villageName,
        method: 'direct_parcel_match'
      });
      matchedDirect++;
      continue;
    }

    // 2. Check if r.villageName was the raw name in parcelsJson
    const codeFromRaw = rawNameToCode.get(`${r.taluka}___${r.villageName}`);
    if (codeFromRaw) {
      const canonClean = codeToCleanName.get(`${r.taluka}___${codeFromRaw}`);
      rollupMapping.push({
        id: r.id,
        taluka: r.taluka,
        currentName: r.villageName,
        matchedCode: codeFromRaw,
        cleanName: canonClean || r.villageName,
        method: 'raw_json_match'
      });
      matchedViaRaw++;
      continue;
    }

    // 3. Check if r metrics match rollupsJson
    const jsonMatch = rollupsJson.find(j => j.taluka === r.taluka && j.total712Count === r.total712Count && j.inspected1950Count === r.inspected1950Count && j.illegalDeletionsCount === r.illegalDeletionsCount && j.totalGovtLandCount === r.totalGovtLandCount);
    if (jsonMatch) {
      const codeFromRawMetrics = rawNameToCode.get(`${r.taluka}___${jsonMatch.villageName}`);
      if (codeFromRawMetrics) {
        const canonClean = codeToCleanName.get(`${r.taluka}___${codeFromRawMetrics}`);
        rollupMapping.push({
          id: r.id,
          taluka: r.taluka,
          currentName: r.villageName,
          matchedCode: codeFromRawMetrics,
          cleanName: canonClean || r.villageName,
          method: 'metrics_match'
        });
        matchedViaParcels++;
        continue;
      }
    }

    unmatched++;
    console.log(`Unmatched rollup: ${r.taluka} - "${r.villageName}" (712 count: ${r.total712Count})`);
  }

  console.log(`Matched Direct: ${matchedDirect}`);
  console.log(`Matched via Raw: ${matchedViaRaw}`);
  console.log(`Matched via Metrics: ${matchedViaParcels}`);
  console.log(`Total mapped: ${rollupMapping.length} / ${dbRollups.length}`);
  console.log(`Unmatched: ${unmatched}`);
}

main().finally(() => prisma.$disconnect());

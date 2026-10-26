import fs from 'fs';
import prisma from '../config/prisma.js';
import { syncTalukaTotalRollup } from '../controllers/prapatraController.js';

async function syncRollupsToParcels() {
  console.log('=== SYNCHRONIZING PRAPATRA ROLLUPS TO AUTHENTIC LAND PARCELS ===\n');

  // 1. Delete the duplicate Kosarsar record in Warora
  const delWarora = await prisma.prapatraRollup.deleteMany({
    where: {
      taluka: 'Warora',
      villageName: 'कोसरसार १ ते ४५'
    }
  });
  console.log(`[1/4] Deleted ${delWarora.count} duplicate Warora Kosarsar record.`);

  // 2. Fix Pombhurna 'ाचे नाव'
  const pombhurnaFix = await prisma.prapatraRollup.updateMany({
    where: {
      taluka: 'Pombhurna',
      villageName: 'ाचे नाव'
    },
    data: {
      villageName: 'गंगापूर चक'
    }
  });
  console.log(`[2/4] Fixed ${pombhurnaFix.count} Pombhurna 'ाचे नाव' -> 'गंगापूर चक'.`);

  // 3. Load all canonical and raw mappings
  const canon = JSON.parse(fs.readFileSync('d:/chanda/data/canonical_village_names.json', 'utf8'));
  const parcelsJson = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_parcels.json', 'utf8'));
  const rollupsJson = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_rollups.json', 'utf8'));

  const codeToCanon = new Map();
  for (const c of canon) {
    codeToCanon.set(`${c.taluka}___${c.villageCode}`, c.cleanVillageName);
  }
  codeToCanon.set('Pombhurna___POM-013', 'गंगापूर चक');
  codeToCanon.set('Pombhurna___POM-014', 'टोक');

  const rawToCode = new Map();
  for (const p of parcelsJson) {
    const key = `${p.taluka}___${p.villageName}`;
    if (!rawToCode.has(key)) {
      rawToCode.set(key, p.villageCode);
    }
  }

  // Get current distinct (taluka, villageCode, villageName) from DB land parcels
  const activeParcels = await prisma.landParcel.findMany({
    select: { taluka: true, villageCode: true, villageName: true },
    distinct: ['taluka', 'villageCode']
  });

  const parcelVillageNamesByTaluka = {};
  for (const p of activeParcels) {
    parcelVillageNamesByTaluka[p.taluka] = parcelVillageNamesByTaluka[p.taluka] || new Set();
    parcelVillageNamesByTaluka[p.taluka].add(p.villageName);
  }

  const rollups = await prisma.prapatraRollup.findMany({
    where: { villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  console.log(`[3/4] Aligning ${rollups.length} rollups with active LandParcel names...`);

  let updatedCount = 0;
  let alreadyMatched = 0;

  for (const r of rollups) {
    const talukaParcelNames = parcelVillageNamesByTaluka[r.taluka] || new Set();

    // If rollup villageName is already in active parcels for this taluka, perfect!
    if (talukaParcelNames.has(r.villageName)) {
      alreadyMatched++;
      continue;
    }

    // Otherwise, find the authentic target name
    let targetName = null;

    // Check if raw name in parcelsJson maps to a code
    const rawCode = rawToCode.get(`${r.taluka}___${r.villageName}`);
    if (rawCode) {
      targetName = codeToCanon.get(`${r.taluka}___${rawCode}`);
    }

    // Check if matching in rollupsJson by metrics
    if (!targetName) {
      const jMatch = rollupsJson.find(j => j.taluka === r.taluka && j.total712Count === r.total712Count && j.inspected1950Count === r.inspected1950Count && j.totalGovtLandCount === r.totalGovtLandCount);
      if (jMatch) {
        const cCode = rawToCode.get(`${r.taluka}___${jMatch.villageName}`);
        if (cCode) {
          targetName = codeToCanon.get(`${r.taluka}___${cCode}`);
        }
      }
    }

    // Check if canon has matching raw title
    if (!targetName) {
      const cMatch = canon.find(c => c.taluka === r.taluka && (c.rawTitle.includes(r.villageName) || r.villageName.includes(c.cleanVillageName)));
      if (cMatch) {
        targetName = cMatch.cleanVillageName;
      }
    }

    // If targetName found and doesn't collide with existing rollups
    if (targetName && targetName !== r.villageName) {
      try {
        await prisma.prapatraRollup.update({
          where: { id: r.id },
          data: { villageName: targetName }
        });
        updatedCount++;
      } catch (err) {
        console.warn(`Could not update rollup "${r.villageName}" to "${targetName}": ${err.message}`);
      }
    }
  }

  console.log(`  Already matched: ${alreadyMatched}`);
  console.log(`  Updated: ${updatedCount}`);

  // 4. Re-sync all 15 Taluka Total Summaries
  console.log('[4/4] Synchronizing all 15 taluka totals ("संपूर्ण तालुका (All Villages)")...');
  const talukas = [
    'Warora', 'Rajura', 'Chandrapur', 'Mul', 'Chimur',
    'Ballarpur', 'Bhadravati', 'Sindewahi', 'Brahmapuri',
    'Nagbhid', 'Gondpipri', 'Korpana', 'Pombhurna', 'Saoli', 'Jivati'
  ];

  for (const t of talukas) {
    await syncTalukaTotalRollup(t);
  }
  console.log('  All 15 taluka totals synced perfectly.\n');

  console.log('=== SYNC COMPLETE ===');
}

syncRollupsToParcels().catch(err => {
  console.error(err);
  process.exit(1);
}).finally(() => prisma.$disconnect());

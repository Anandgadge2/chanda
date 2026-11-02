import prisma from '../config/prisma.js';
import { cleanVillageName } from '../utils/prapatraGenerator.js';

const KORPANA_NAME_MAP = {
  'अकोला': 'अकोला, कातलाबोडी',
  'अकोला, कातलाबोडी': 'अकोला, कातलाबोडी',
  'अंतरगाव बु.': 'अंतरगाव बु',
  'अंतरगाव बु': 'अंतरगाव बु',
  'कढोली खु.': 'कढोली खु',
  'कढोली खु': 'कढोली खु',
  'शेरज ( खुर्द )': 'शेराज खुर्द',
  'शेराज खुर्द': 'शेराज खुर्द',
  'सोनुर्ली (गाडे)': 'सोनुर्ली गाडेगाव',
  'सोनुर्ली गाडेगाव': 'सोनुर्ली गाडेगाव',
  'दानोदा(रिठ)': 'दानोदा रिठ',
  'दानोदा रिठ': 'दानोदा रिठ',
  'उपरावाही': 'उपरवाही',
  'उपरवाही': 'उपरवाही',
  'निमणी': 'निमाणी',
  'निमाणी': 'निमाणी',
  'asan buj 45 mudde updated': 'आसन बु',
  'आसन बु': 'आसन बु',
  'tangalakerambodijambhuldhara': 'टांगाळा, केरामबोडी, जांभुळधरा',
  'केरामबोडी': 'टांगाळा, केरामबोडी, जांभुळधरा',
  'टांगाळा, केरामबोडी, जांभुळधरा': 'टांगाळा, केरामबोडी, जांभुळधरा'
};

async function consolidate() {
  console.log('=== STARTING VILLAGE DUPLICATE CONSOLIDATION ===\n');

  // Step 1: Update Land Parcels in Korpana
  console.log('[1/4] Consolidating Land Parcels in Korpana...');
  for (const [oldName, targetName] of Object.entries(KORPANA_NAME_MAP)) {
    if (oldName !== targetName) {
      const res = await prisma.landParcel.updateMany({
        where: {
          taluka: 'Korpana',
          villageName: oldName
        },
        data: {
          villageName: targetName
        }
      });
      if (res.count > 0) {
        console.log(`  Updated ${res.count} parcels in Korpana: "${oldName}" -> "${targetName}"`);
      }
    }
  }

  // Step 2: Consolidate Land Parcels across all talukas with trailing dots or abbreviations
  console.log('\n[2/4] Consolidating Land Parcels with trailing abbreviation dots across all talukas...');
  const distinctVillages = await prisma.landParcel.findMany({
    select: { taluka: true, villageName: true },
    distinct: ['taluka', 'villageName']
  });

  let generalUpdated = 0;
  for (const v of distinctVillages) {
    if (!v.villageName) continue;
    const clean = cleanVillageName(v.villageName);
    if (clean !== v.villageName) {
      const res = await prisma.landParcel.updateMany({
        where: {
          taluka: v.taluka,
          villageName: v.villageName
        },
        data: {
          villageName: clean
        }
      });
      if (res.count > 0) {
        console.log(`  [${v.taluka}] Updated ${res.count} parcels: "${v.villageName}" -> "${clean}"`);
        generalUpdated += res.count;
      }
    }
  }
  console.log(`  Total other parcels updated: ${generalUpdated}`);

  // Step 3: Consolidate Prapatra Rollups
  console.log('\n[3/4] Consolidating Prapatra Rollups...');
  const rollups = await prisma.prapatraRollup.findMany({
    where: { villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  const byTaluka = {};
  for (const r of rollups) {
    if (!byTaluka[r.taluka]) byTaluka[r.taluka] = [];
    byTaluka[r.taluka].push(r);
  }

  let rollupsMerged = 0;
  for (const [taluka, list] of Object.entries(byTaluka)) {
    const cleanGroups = new Map();
    for (const r of list) {
      let cName = cleanVillageName(r.villageName);
      if (taluka === 'Korpana' && KORPANA_NAME_MAP[r.villageName]) {
        cName = KORPANA_NAME_MAP[r.villageName];
      }
      if (!cleanGroups.has(cName)) cleanGroups.set(cName, []);
      cleanGroups.get(cName).push(r);
    }

    for (const [targetName, items] of cleanGroups.entries()) {
      if (items.length > 1) {
        console.log(`\nTaluka ${taluka}: Merging ${items.length} rollups into "${targetName}"`);
        // Find the best master item (prefer item with remarks or highest 712 count)
        items.sort((a, b) => {
          if (a.remarks && !b.remarks) return -1;
          if (!a.remarks && b.remarks) return 1;
          return (b.total712Count || 0) - (a.total712Count || 0);
        });

        const master = items[0];
        const duplicates = items.slice(1);

        // Maximum values across the merged set
        const max712 = Math.max(...items.map(i => i.total712Count || 0));
        const maxGovt = Math.max(...items.map(i => i.totalGovtLandCount || 0));
        const maxShartbhang = Math.max(...items.map(i => i.govtShartbhangCount || 0));
        const maxEncroached = Math.max(...items.map(i => i.govtEncroachedCount || 0));

        // DELETE duplicate records FIRST to free up the unique constraint on (district, taluka, village_name)
        for (const dup of duplicates) {
          console.log(`  Deleting duplicate rollup id: ${dup.id} ("${dup.villageName}")`);
          await prisma.prapatraRollup.delete({
            where: { id: dup.id }
          });
          rollupsMerged++;
        }

        // Now update master record to target name and merged counts
        await prisma.prapatraRollup.update({
          where: { id: master.id },
          data: {
            villageName: targetName,
            total712Count: max712,
            totalGovtLandCount: maxGovt,
            govtShartbhangCount: maxShartbhang,
            govtEncroachedCount: maxEncroached
          }
        });
      } else {
        // Single item, ensure its villageName is cleaned
        const single = items[0];
        if (single.villageName !== targetName) {
          // Check if targetName already exists in DB for this taluka
          const existing = await prisma.prapatraRollup.findFirst({
            where: {
              taluka,
              villageName: targetName,
              id: { not: single.id }
            }
          });
          if (!existing) {
            await prisma.prapatraRollup.update({
              where: { id: single.id },
              data: { villageName: targetName }
            });
            console.log(`  Updated single rollup name [${taluka}]: "${single.villageName}" -> "${targetName}"`);
          }
        }
      }
    }
  }

  console.log(`\n[4/4] Finished. Total duplicate rollups removed: ${rollupsMerged}`);
  process.exit(0);
}

consolidate().catch(err => {
  console.error('Consolidation failed:', err);
  process.exit(1);
});

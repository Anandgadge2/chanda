import prisma from '../config/prisma.js';
import { cleanVillageName } from '../utils/prapatraGenerator.js';

async function migrate() {
  console.log('=== STARTING COMPLETE VILLAGE NAME NORMALIZATION MIGRATION ===\n');

  // 1. Group parcels by taluka and villageName
  console.log('Step 1: Identifying uncleaned village names in landParcel...');
  const parcelsGroup = await prisma.landParcel.groupBy({
    by: ['taluka', 'villageName'],
    _count: { id: true }
  });

  let parcelGroupsUpdated = 0;
  let totalParcelsUpdated = 0;

  for (const g of parcelsGroup) {
    const cleaned = cleanVillageName(g.villageName);
    if (cleaned !== g.villageName) {
      console.log(`Updating [${g.taluka}] "${g.villageName}" -> "${cleaned}" (${g._count.id} parcels)`);
      const res = await prisma.landParcel.updateMany({
        where: {
          taluka: g.taluka,
          villageName: g.villageName
        },
        data: {
          villageName: cleaned
        }
      });
      parcelGroupsUpdated++;
      totalParcelsUpdated += res.count;
    }
  }
  console.log(`\nStep 1 Done: Updated ${parcelGroupsUpdated} groups, total ${totalParcelsUpdated} parcels in landParcel.\n`);

  // 2. Update prapatraRollup records
  console.log('Step 2: Updating prapatraRollup village names...');
  const rollups = await prisma.prapatraRollup.findMany({
    where: {
      villageName: { not: 'संपूर्ण तालुका (All Villages)' }
    }
  });

  let rollupsUpdated = 0;
  for (const r of rollups) {
    const cleaned = cleanVillageName(r.villageName);
    if (cleaned !== r.villageName) {
      console.log(`Updating Rollup [${r.taluka}] "${r.villageName}" -> "${cleaned}"`);
      await prisma.prapatraRollup.update({
        where: { id: r.id },
        data: { villageName: cleaned }
      });
      rollupsUpdated++;
    }
  }
  console.log(`\nStep 2 Done: Updated ${rollupsUpdated} prapatraRollup records.\n`);

  // 3. Verification
  console.log('Step 3: Verification...');
  const antapurParcels = await prisma.landParcel.findMany({
    where: {
      taluka: 'Warora',
      villageName: 'अंतापूर रिठ'
    },
    select: { id: true, gatNumber: true, totalAreaHa: true, tenureClass: true }
  });
  console.log(`Verification - Warora / अंतापूर रिठ now has: ${antapurParcels.length} parcels!`);
  antapurParcels.forEach(p => {
    console.log(`  Gat ${p.gatNumber} | Tenure: ${p.tenureClass} | Area: ${p.totalAreaHa} Ha`);
  });

  const antapurRollup = await prisma.prapatraRollup.findFirst({
    where: {
      taluka: 'Warora',
      villageName: 'अंतापूर रिठ'
    }
  });
  console.log(`Verification - Warora / अंतापूर रिठ Rollup total712Count: ${antapurRollup?.total712Count}`);

  // Test across all 648 villages now
  const [newRollups, newParcelsGroup] = await Promise.all([
    prisma.prapatraRollup.findMany({
      where: { villageName: { not: 'संपूर्ण तालुका (All Villages)' } },
      select: { taluka: true, villageName: true, total712Count: true }
    }),
    prisma.landParcel.groupBy({
      by: ['taluka', 'villageName'],
      _count: { id: true }
    })
  ]);

  const pMap = new Map();
  for (const p of newParcelsGroup) {
    const k = `${p.taluka.toLowerCase()}:::${p.villageName.toLowerCase().trim()}`;
    pMap.set(k, p._count.id);
  }

  const dropdownMap = new Map();
  for (const r of [...newParcelsGroup, ...newRollups]) {
    if (!r.villageName || r.villageName === 'Unspecified') continue;
    const cName = cleanVillageName(r.villageName);
    if (!cName || cName === 'अज्ञात गाव') continue;
    const normKey = `${r.taluka.toLowerCase()}:::${cName.toLowerCase().replace(/[.,_)\-–—\s]/g, '')}`;
    if (!dropdownMap.has(normKey)) {
      dropdownMap.set(normKey, { taluka: r.taluka, villageName: cName });
    }
  }

  let zeroCount = 0;
  for (const v of dropdownMap.values()) {
    const k = `${v.taluka.toLowerCase()}:::${v.villageName.toLowerCase().trim()}`;
    const count = pMap.get(k) || 0;
    if (count === 0) zeroCount++;
  }

  console.log(`\nFinal Check: Dropdown villages with 0 parcels: ${zeroCount} (out of ${dropdownMap.size})!`);
  console.log('=== MIGRATION COMPLETED SUCCESSFULLY ===');
  process.exit(0);
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});


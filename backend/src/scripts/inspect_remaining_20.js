import prisma from '../config/prisma.js';

async function main() {
  const rollups = await prisma.prapatraRollup.findMany({
    where: { villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  const parcels = await prisma.landParcel.findMany({
    select: { taluka: true, villageName: true, villageCode: true },
    distinct: ['taluka', 'villageName']
  });

  const parcelVillageSet = new Set(parcels.map(p => `${p.taluka}___${p.villageName}`));

  const remaining = [];
  for (const r of rollups) {
    const key = `${r.taluka}___${r.villageName}`;
    const hasParcels = parcelVillageSet.has(key);
    const hasPrefix = /^\s*(1\s*त[े]?\s*4[56]|45\s*म|तप[ा]?सण|सतबर|गवगन्न|मौज[ा]?[\s_\.-])/i.test(r.villageName);
    const has0_712 = r.total712Count === 0;

    if (!hasParcels || hasPrefix || has0_712) {
      remaining.push({
        id: r.id,
        taluka: r.taluka,
        villageName: r.villageName,
        total712: r.total712Count,
        hasParcels,
        hasPrefix,
        has0_712
      });
    }
  }

  console.log(`Remaining villages needing resolution: ${remaining.length}`);
  console.table(remaining);
}

main().finally(() => prisma.$disconnect());

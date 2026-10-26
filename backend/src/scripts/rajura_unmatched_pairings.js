import prisma from '../config/prisma.js';

async function main() {
  const rollups = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Rajura', villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  const parcels = await prisma.landParcel.groupBy({
    by: ['villageName', 'villageCode'],
    where: { taluka: 'Rajura' },
    _count: { id: true }
  });

  const matched = [];
  const unmatchedR = [];
  const parcelMap = new Map(parcels.map(p => [p.villageName, p]));

  for (const r of rollups) {
    if (parcelMap.has(r.villageName)) {
      matched.push({ name: r.villageName, total712: r.total712Count, parcelRows: parcelMap.get(r.villageName)._count.id, code: parcelMap.get(r.villageName).villageCode });
    } else {
      unmatchedR.push(r);
    }
  }

  const rollupNames = new Set(rollups.map(r => r.villageName));
  const unmatchedP = parcels.filter(p => !rollupNames.has(p.villageName));

  console.log(`Matched pairs in Rajura: ${matched.length}`);
  console.log(`Unmatched rollups in Rajura: ${unmatchedR.length}`);
  console.log(`Unmatched parcels in Rajura: ${unmatchedP.length}`);

  console.log('\nUnmatched rollups:');
  console.table(unmatchedR.map(r => ({ id: r.id, name: r.villageName, total712: r.total712Count })));

  console.log('\nUnmatched parcels:');
  console.table(unmatchedP.map(p => ({ code: p.villageCode, name: p.villageName, rows: p._count.id })));
}

main().finally(() => prisma.$disconnect());

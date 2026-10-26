import prisma from '../config/prisma.js';

async function main() {
  const rollups = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Bhadravati', villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  const parcels = await prisma.landParcel.groupBy({
    by: ['villageName', 'villageCode'],
    where: { taluka: 'Bhadravati' },
    _count: { id: true }
  });

  const rollupNames = new Set(rollups.map(r => r.villageName));
  const parcelMap = new Map(parcels.map(p => [p.villageName, p]));

  const unmatchedR = rollups.filter(r => !parcelMap.has(r.villageName));
  const unmatchedP = parcels.filter(p => !rollupNames.has(p.villageName));

  console.log(`Unmatched rollups in Bhadravati: ${unmatchedR.length}`);
  console.table(unmatchedR.map(r => ({ id: r.id, name: r.villageName, total712: r.total712Count })));

  console.log(`Unmatched parcels in Bhadravati: ${unmatchedP.length}`);
  console.table(unmatchedP.map(p => ({ code: p.villageCode, name: p.villageName, rows: p._count.id })));
}

main().finally(() => prisma.$disconnect());

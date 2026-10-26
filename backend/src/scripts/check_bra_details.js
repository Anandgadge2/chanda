import prisma from '../config/prisma.js';

async function main() {
  const rollups = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Brahmapuri', villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  const parcels = await prisma.landParcel.groupBy({
    by: ['villageName', 'villageCode'],
    where: { taluka: 'Brahmapuri' },
    _count: { id: true }
  });

  console.log(`Brahmapuri rollups: ${rollups.length}`);
  console.log(`Brahmapuri parcels: ${parcels.length}`);

  const rollupNames = new Set(rollups.map(r => r.villageName));
  const parcelNames = new Set(parcels.map(p => p.villageName));

  console.log('Rollups not in parcels:', rollups.filter(r => !parcelNames.has(r.villageName)).map(r => ({ name: r.villageName, total: r.total712Count, id: r.id })));
  console.log('Parcels not in rollups:', parcels.filter(p => !rollupNames.has(p.villageName)).map(p => ({ code: p.villageCode, name: p.villageName, rows: p._count.id })));
}

main().finally(() => prisma.$disconnect());

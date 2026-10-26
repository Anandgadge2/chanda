import prisma from '../config/prisma.js';

async function main() {
  const rollups = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Chandrapur', villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  const parcels = await prisma.landParcel.groupBy({
    by: ['villageName', 'villageCode'],
    where: { taluka: 'Chandrapur' },
    _count: { id: true }
  });

  const parcelNames = new Set(parcels.map(p => p.villageName));
  const rollupNames = new Set(rollups.map(r => r.villageName));

  const missingParcelsInRollups = rollups.filter(r => !parcelNames.has(r.villageName));
  const missingRollupsInParcels = parcels.filter(p => !rollupNames.has(p.villageName));

  console.log('Chandrapur rollups without parcels:');
  console.table(missingParcelsInRollups.map(r => ({ id: r.id, name: r.villageName, total: r.total712Count })));

  console.log('\nChandrapur parcels without rollups:');
  console.table(missingRollupsInParcels.map(p => ({ code: p.villageCode, name: p.villageName, rows: p._count.id })));
}

main().finally(() => prisma.$disconnect());

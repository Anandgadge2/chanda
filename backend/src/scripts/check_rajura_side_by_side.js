import prisma from '../config/prisma.js';

async function main() {
  const rollups = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Rajura', villageName: { not: 'संपूर्ण तालुका (All Villages)' } },
    select: { id: true, villageName: true, total712Count: true }
  });

  const parcels = await prisma.landParcel.groupBy({
    by: ['villageName', 'villageCode'],
    where: { taluka: 'Rajura' },
    _count: { id: true }
  });

  console.log('--- ALL RAJURA ROLLUPS (48) ---');
  console.table(rollups);

  console.log('\n--- ALL RAJURA PARCEL GROUPS (48) ---');
  console.table(parcels);
}

main().finally(() => prisma.$disconnect());

import prisma from '../config/prisma.js';

async function main() {
  const weirdParcels = await prisma.landParcel.findMany({
    where: {
      OR: [
        { villageCode: { startsWith: 'VIL-' } },
        { villageCode: { not: { contains: '-' } } }
      ]
    },
    select: { id: true, taluka: true, villageCode: true, villageName: true, gatNumber: true, upi: true },
    take: 20
  });

  console.log(`Found ${weirdParcels.length} sample mock/legacy parcels:`, weirdParcels);

  const totalWeird = await prisma.landParcel.count({
    where: {
      OR: [
        { villageCode: { startsWith: 'VIL-' } },
        { villageCode: { not: { contains: '-' } } }
      ]
    }
  });
  console.log('Total mock/legacy parcels without standard code:', totalWeird);
}

main().finally(() => prisma.$disconnect());

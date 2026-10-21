import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rollups = await prisma.prapatraRollup.findMany({
    select: { villageName: true, taluka: true },
    take: 30
  });
  console.log('Sample Rollup villageNames:', rollups.slice(0, 15));

  const pimpardand = await prisma.prapatraRollup.findMany({
    where: {
      OR: [
        { villageName: { contains: 'पपर' } },
        { villageName: { contains: 'पिपर' } },
        { villageName: { contains: 'पिंपर' } },
        { villageName: { contains: 'चक' } }
      ]
    },
    select: { id: true, villageName: true, taluka: true }
  });
  console.log('Matching rollups:', pimpardand);

  const parcelMatches = await prisma.landParcel.findMany({
    where: {
      OR: [
        { villageName: { contains: 'पपर' } },
        { villageName: { contains: 'पिपर' } },
        { villageName: { contains: 'पिंपर' } },
        { villageName: { contains: 'चक' } }
      ]
    },
    select: { villageName: true, taluka: true },
    distinct: ['villageName'],
    take: 20
  });
  console.log('Matching parcels:', parcelMatches);
}

main().catch(console.error).finally(() => prisma.$disconnect());

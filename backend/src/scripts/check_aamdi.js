import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const parcels = await prisma.landParcel.findMany({
    where: {
      taluka: { equals: 'Warora', mode: 'insensitive' },
      villageName: { contains: 'आमडी', mode: 'insensitive' }
    },
    take: 5
  });
  console.log('Parcels in Warora/Aamdi count:', parcels.length);
  if (parcels.length > 0) {
    console.log('Sample parcel:', {
      gatNumber: parcels[0].gatNumber,
      villageName: parcels[0].villageName,
      tenureClass: parcels[0].tenureClass,
      totalAreaHa: parcels[0].totalAreaHa,
      metadata: parcels[0].metadata
    });
  }

  // Check category 18 query specifically
  const cat18Parcels = await prisma.landParcel.findMany({
    where: {
      taluka: { equals: 'Warora', mode: 'insensitive' },
      villageName: { contains: 'आमडी', mode: 'insensitive' },
      OR: [
        { tenancy89ARecords: { some: {} } },
        { metadata: { path: ['otherRights'], string_contains: '89' } },
        { metadata: { path: ['otherRights'], string_contains: '47' } },
        { metadata: { path: ['otherRights'], string_contains: 'कंपनी' } },
        { metadata: { path: ['subTypeCategory'], string_contains: '89' } },
        { metadata: { path: ['subTypeCategory'], string_contains: 'कंपनी' } },
        { metadata: { path: ['auditPoints', 'point_41'], equals: 'होय' } },
        { metadata: { path: ['auditPoints', 'point_42'], equals: 'होय' } }
      ]
    }
  });
  console.log('Cat 18 parcels count in Warora/Aamdi:', cat18Parcels.length);

  // Check prapatraRollup
  const rollups = await prisma.prapatraRollup.findMany({
    where: {
      taluka: { equals: 'Warora', mode: 'insensitive' },
      villageName: { contains: 'आमडी', mode: 'insensitive' }
    }
  });
  console.log('Rollups for Warora/Aamdi:', rollups);
}

main().catch(console.error).finally(() => prisma.$disconnect());

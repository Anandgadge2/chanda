import prisma from '../backend/src/config/prisma.js';

async function test() {
  const sample = await prisma.landParcel.findFirst({
    where: { metadata: { not: null } },
    include: { backwardHistories: true }
  });
  console.log('Sample Parcel:', JSON.stringify(sample, null, 2));
  const count = await prisma.landParcel.count();
  console.log('Total parcels:', count);
  await prisma.$disconnect();
}
test();

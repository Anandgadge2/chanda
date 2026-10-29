import prisma from '../backend/src/config/prisma.js';

async function test() {
  const sample = await prisma.landParcel.findFirst({
    where: { metadata: { not: null } }
  });
  console.log('metadata:', JSON.stringify(sample.metadata, null, 2));
  await prisma.$disconnect();
}
test();

import prisma from '../config/prisma.js';

async function main() {
  const rollups = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Brahmapuri', villageName: { not: 'संपूर्ण तालुका (All Villages)' } },
    select: { villageName: true, total712Count: true, id: true }
  });
  console.table(rollups);
}

main().finally(() => prisma.$disconnect());

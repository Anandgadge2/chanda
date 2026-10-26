import prisma from '../config/prisma.js';

async function main() {
  const rollups = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Korpana', villageName: { not: 'संपूर्ण तालुका (All Villages)' } },
    select: { id: true, villageName: true, total712Count: true }
  });
  console.table(rollups);
}

main().finally(() => prisma.$disconnect());

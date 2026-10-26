import prisma from '../config/prisma.js';

async function main() {
  const r = await prisma.prapatraRollup.findUnique({
    where: { id: '704a1846-c0a7-4faf-a46a-d331ada6f61d' }
  });
  console.log('Rollup रीमतमजरा:', r);

  const allChimurRollups = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Chimur', villageName: { not: 'संपूर्ण तालुका (All Villages)' } },
    select: { villageName: true, total712Count: true }
  });
  console.log('All Chimur rollups:', allChimurRollups);
}

main().finally(() => prisma.$disconnect());

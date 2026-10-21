import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const pimpardandRollup = await prisma.prapatraRollup.findMany({
    where: {
      OR: [
        { villageName: { contains: 'पपरदड' } },
        { villageName: { contains: 'पिपरदंड' } },
        { villageName: { contains: 'पिंपरदंड' } }
      ]
    },
    select: { villageName: true, taluka: true }
  });
  console.log('Pimpardand Rollup currently in DB:', pimpardandRollup);

  const sindewahiRollups = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Sindewahi' },
    select: { villageName: true },
    take: 10
  });
  console.log('Sindewahi sample in DB:', sindewahiRollups.slice(0, 10).map(r => r.villageName));
}

check().finally(() => prisma.$disconnect());

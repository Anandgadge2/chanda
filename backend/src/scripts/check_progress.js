import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const talukas = ['Korpana', 'Chandrapur', 'Chimur', 'Jivati', 'Nagbhid', 'Pombhurna', 'Ballarpur', 'Brahmapuri', 'Bhadravati', 'Mul', 'Rajura', 'Warora', 'Saoli', 'Sindewahi', 'Gondpipri'];
  for (const t of talukas) {
    const s = await prisma.prapatraRollup.findMany({ where: { taluka: t }, select: { villageName: true }, take: 3 });
    console.log(`${t}:`, s.map(r => r.villageName));
  }
}

check().finally(() => prisma.$disconnect());

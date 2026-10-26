import prisma from '../config/prisma.js';

async function main() {
  const kosarsar = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Warora', villageName: { contains: 'कोसरसार' } }
  });
  console.log('Warora Kosarsar records in DB:');
  console.table(kosarsar.map(r => ({
    id: r.id,
    taluka: r.taluka,
    villageName: r.villageName,
    total712: r.total712Count,
    illegal: r.illegalDeletionsCount,
    govt: r.govtFound1950Count
  })));
}

main().finally(() => prisma.$disconnect());

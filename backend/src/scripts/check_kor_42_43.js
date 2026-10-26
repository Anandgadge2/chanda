import prisma from '../config/prisma.js';

async function main() {
  const p42 = await prisma.landParcel.count({ where: { taluka: 'Korpana', villageCode: 'KOR-042' } });
  const p43 = await prisma.landParcel.count({ where: { taluka: 'Korpana', villageCode: 'KOR-043' } });
  console.log(`Korpana KOR-042: ${p42}, KOR-043: ${p43}`);
}

main().finally(() => prisma.$disconnect());

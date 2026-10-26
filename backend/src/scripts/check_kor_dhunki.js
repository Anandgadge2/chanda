import prisma from '../config/prisma.js';

async function main() {
  const kor40 = await prisma.landParcel.count({ where: { villageCode: 'KOR-040' } });
  const kor41 = await prisma.landParcel.count({ where: { villageCode: 'KOR-041' } });
  console.log(`KOR-040 parcels: ${kor40}, KOR-041 parcels: ${kor41}`);

  const p40 = await prisma.landParcel.findFirst({ where: { villageCode: 'KOR-040' } });
  const p41 = await prisma.landParcel.findFirst({ where: { villageCode: 'KOR-041' } });
  console.log('KOR-040:', p40?.villageName);
  console.log('KOR-041:', p41?.villageName);
}

main().finally(() => prisma.$disconnect());

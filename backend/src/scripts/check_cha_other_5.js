import prisma from '../config/prisma.js';

async function main() {
  const codes = ['CHA-002', 'CHA-003', 'CHA-046', 'CHA-048', 'CHA-049'];
  for (const c of codes) {
    const p = await prisma.landParcel.findFirst({
      where: { taluka: 'Chandrapur', villageCode: c },
      select: { villageCode: true, villageName: true }
    });
    console.log(c, '->', p?.villageName);
  }
}

main().finally(() => prisma.$disconnect());

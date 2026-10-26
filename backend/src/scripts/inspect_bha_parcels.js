import prisma from '../config/prisma.js';

async function main() {
  const codes = ['BHA-017', 'BHA-023', 'BHA-037', 'BHA-039', 'BHA-056', 'BHA-057'];
  for (const c of codes) {
    const p = await prisma.landParcel.findFirst({
      where: { villageCode: c },
      select: { villageCode: true, villageName: true, taluka: true, metadata: true }
    });
    console.log(c, p?.villageName, p?.metadata);
  }
}

main().finally(() => prisma.$disconnect());

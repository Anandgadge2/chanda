import prisma from '../config/prisma.js';

async function main() {
  const rollups = await prisma.prapatraRollup.findMany({
    where: { villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  const parcels = await prisma.landParcel.findMany({
    select: { taluka: true, villageName: true, villageCode: true },
    distinct: ['taluka', 'villageName', 'villageCode']
  });

  const junkRegex = /(\.xls|1\s*त[े]?\s*4|1\s*to\s*4|1-4|१\s*ते\s*४|महसूल अधिकार|मुद्या|तपासणी|तपसण|सतबर|सजा\s*|मौज[ा]?[\s_\.-])/i;

  const dirtyRollups = rollups.filter(r => junkRegex.test(r.villageName) || !/^[\u0900-\u097F\s\(\)\-\d\.\/]+$/.test(r.villageName));
  const dirtyParcels = parcels.filter(p => junkRegex.test(p.villageName) || !/^[\u0900-\u097F\s\(\)\-\d\.\/]+$/.test(p.villageName));

  console.log(`Dirty / English rollups found: ${dirtyRollups.length}`);
  console.table(dirtyRollups.map(r => ({ taluka: r.taluka, name: r.villageName, total: r.total712Count, id: r.id })));

  console.log(`\nDirty / English parcels found: ${dirtyParcels.length}`);
  console.table(dirtyParcels.map(p => ({ taluka: p.taluka, code: p.villageCode, name: p.villageName })));
}

main().finally(() => prisma.$disconnect());

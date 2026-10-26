import prisma from '../config/prisma.js';
import fs from 'fs';

async function main() {
  const canonicalData = JSON.parse(fs.readFileSync('d:/chanda/data/canonical_village_names.json', 'utf8'));

  const rollups = await prisma.prapatraRollup.findMany({
    where: { villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  const parcels = await prisma.landParcel.findMany({
    select: { taluka: true, villageName: true, villageCode: true },
    distinct: ['taluka', 'villageName', 'villageCode']
  });

  const rollupMap = new Map();
  for (const r of rollups) {
    rollupMap.set(`${r.taluka}___${r.villageName}`, r);
  }

  const unmatchedParcels = [];
  for (const p of parcels) {
    if (!rollupMap.has(`${p.taluka}___${p.villageName}`)) {
      unmatchedParcels.push(p);
    }
  }

  console.log(`Unmatched parcels (${unmatchedParcels.length}):`);
  console.table(unmatchedParcels);

  // Group unmatched parcels by taluka
  const unmatchedByTaluka = {};
  for (const p of unmatchedParcels) {
    if (!unmatchedByTaluka[p.taluka]) unmatchedByTaluka[p.taluka] = [];
    unmatchedByTaluka[p.taluka].push(p);
  }

  console.log('\nUnmatched parcels grouped by taluka:');
  console.log(JSON.stringify(unmatchedByTaluka, null, 2));
}

main().finally(() => prisma.$disconnect());

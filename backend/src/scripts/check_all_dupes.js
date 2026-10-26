import prisma from '../config/prisma.js';

async function main() {
  const rollups = await prisma.prapatraRollup.findMany({
    where: { villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  // Group by taluka and metrics: total712Count, govtFound1950Count, totalGovtLandCount
  const map = new Map();
  const dupes = [];

  for (const r of rollups) {
    const key = `${r.taluka}___${r.total712Count}___${r.govtFound1950Count}___${r.illegalDeletionsCount}___${r.totalGovtLandCount}`;
    if (map.has(key)) {
      dupes.push({
        existing: map.get(key),
        duplicate: r
      });
    } else {
      map.set(key, r);
    }
  }

  console.log(`Potential metric duplicates in PrapatraRollup: ${dupes.length}`);
  for (const d of dupes) {
    console.log(`[${d.existing.taluka}]`);
    console.log(`  Row 1: "${d.existing.villageName}" (ID: ${d.existing.id})`);
    console.log(`  Row 2: "${d.duplicate.villageName}" (ID: ${d.duplicate.id})`);
  }
}

main().finally(() => prisma.$disconnect());

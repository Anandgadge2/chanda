import prisma from '../config/prisma.js';

async function main() {
  const rollups = await prisma.prapatraRollup.findMany({
    where: { villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  console.log(`Total non-summary rollups: ${rollups.length}`);

  // Group by taluka and villageName
  const counts = {};
  for (const r of rollups) {
    const key = `${r.taluka}___${r.villageName}`;
    counts[key] = (counts[key] || 0) + 1;
  }

  for (const [k, v] of Object.entries(counts)) {
    if (v > 1) {
      console.log(`Duplicate in DB: ${k} (${v} times)`);
    }
  }

  // Specifically check Warora, Bhadravati
  for (const t of ['Warora', 'Bhadravati', 'Pombhurna']) {
    const tRollups = rollups.filter(r => r.taluka === t);
    console.log(`\n${t} (${tRollups.length} rollups):`);
    console.log(tRollups.map(r => r.villageName));
  }
}

main().finally(() => prisma.$disconnect());

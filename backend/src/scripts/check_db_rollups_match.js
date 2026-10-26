import fs from 'fs';
import prisma from '../config/prisma.js';

async function main() {
  const jsonRollups = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_rollups.json', 'utf8'));
  const dbRollups = await prisma.prapatraRollup.findMany({
    where: { villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  console.log(`JSON non-summary rollups: ${jsonRollups.filter(r => r.villageName !== 'संपूर्ण तालुका (All Villages)').length}`);
  console.log(`DB non-summary rollups: ${dbRollups.length}`);

  // In DB, how many match jsonRollups by taluka and total712Count?
  let exactMatchCount = 0;
  for (const dbR of dbRollups) {
    const found = jsonRollups.find(j => j.taluka === dbR.taluka && j.total712Count === dbR.total712Count && j.inspected1950Count === dbR.inspected1950Count && j.illegalDeletionsCount === dbR.illegalDeletionsCount);
    if (found) {
      exactMatchCount++;
    }
  }
  console.log(`DB rollups matching JSON rollups by metrics: ${exactMatchCount} / ${dbRollups.length}`);
}

main().finally(() => prisma.$disconnect());

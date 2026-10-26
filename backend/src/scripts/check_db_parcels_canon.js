import prisma from '../config/prisma.js';
import fs from 'fs';

async function main() {
  const canon = JSON.parse(fs.readFileSync('d:/chanda/data/canonical_village_names.json', 'utf8'));
  const canonMap = new Map();
  for (const c of canon) {
    canonMap.set(`${c.taluka}___${c.villageCode}`, c.cleanVillageName);
  }

  const parcels = await prisma.landParcel.findMany({
    select: { id: true, taluka: true, villageCode: true, villageName: true }
  });

  console.log(`Total LandParcels in DB: ${parcels.length}`);
  let matched = 0;
  let missing = 0;
  const missingCodes = new Set();

  for (const p of parcels) {
    const key = `${p.taluka}___${p.villageCode}`;
    if (canonMap.has(key)) {
      matched++;
    } else {
      missing++;
      missingCodes.add(key);
    }
  }

  console.log(`Parcels matching canonical mapping: ${matched}`);
  console.log(`Parcels missing from canonical mapping: ${missing}`);
  if (missingCodes.size > 0) {
    console.log('Sample missing codes:', [...missingCodes].slice(0, 10));
  }
}

main().finally(() => prisma.$disconnect());

import prisma from '../config/prisma.js';
import fs from 'fs';

async function main() {
  const jsonRollups = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_rollups.json', 'utf8'))
    .filter(r => r.taluka === 'Rajura' && r.villageName !== 'संपूर्ण तालुका (All Villages)');

  const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'))['राजुरा'];

  const dbRollups = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Rajura', villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  const dbParcels = await prisma.landParcel.groupBy({
    by: ['villageName', 'villageCode'],
    where: { taluka: 'Rajura' },
    _count: { id: true }
  });
  const parcelMap = new Map(dbParcels.map(p => [p.villageCode, p]));

  console.log(`JSON count: ${jsonRollups.length}, Master files: ${master.length}, DB rollups: ${dbRollups.length}`);

  // Let's print index 0 to 47
  for (let i = 0; i < jsonRollups.length; i++) {
    const jr = jsonRollups[i];
    const mf = master[i];
    const code = `RAJ-${String(i + 1).padStart(3, '0')}`;
    const p = parcelMap.get(code);
    
    // Find matching db rollup by total712Count or name
    const matchingDbRollup = dbRollups.find(r => r.total712Count === jr.total712Count);

    console.log(`[${i + 1}] ${code} | MasterFile: "${mf ? mf.title.substring(0, 30) : 'NONE'}" | JSON: "${jr.villageName}" (${jr.total712Count}) | DB Parcel: "${p?.villageName}" (${p?._count.id}) | Matched DB Rollup: "${matchingDbRollup?.villageName}"`);
  }
}

main().finally(() => prisma.$disconnect());

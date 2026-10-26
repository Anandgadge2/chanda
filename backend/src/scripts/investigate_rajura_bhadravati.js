import prisma from '../config/prisma.js';
import fs from 'fs';

async function main() {
  const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));

  console.log('=== INVESTIGATING RAJURA ===');
  const rajFiles = master['राजुरा'];
  const rajRollups = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Rajura', villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });
  const rajParcels = await prisma.landParcel.groupBy({
    by: ['villageName', 'villageCode'],
    where: { taluka: 'Rajura' },
    _count: { id: true }
  });

  console.log(`Rajura Master Files: ${rajFiles.length}, Rollups: ${rajRollups.length}, Parcel Groups: ${rajParcels.length}`);

  // Print rollups in Rajura sorted by total712Count
  console.log('\nRajura rollups:');
  rajRollups.forEach(r => {
    console.log(`Rollup: "${r.villageName}" | total712: ${r.total712Count} | id: ${r.id}`);
  });

  console.log('\nRajura parcels:');
  rajParcels.forEach(p => {
    console.log(`Parcel: code=${p.villageCode} | name="${p.villageName}" | rows: ${p._count.id}`);
  });
}

main().finally(() => prisma.$disconnect());

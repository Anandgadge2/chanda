import prisma from '../config/prisma.js';
import fs from 'fs';

async function main() {
  const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'))['भद्रावती'];

  const rollups = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Bhadravati', villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  const parcels = await prisma.landParcel.groupBy({
    by: ['villageName', 'villageCode'],
    where: { taluka: 'Bhadravati' },
    _count: { id: true }
  });
  const parcelMap = new Map(parcels.map(p => [p.villageCode, p]));

  for (let i = 0; i < master.length; i++) {
    const code = `BHA-${String(i + 1).padStart(3, '0')}`;
    const p = parcelMap.get(code);
    const mf = master[i];
    console.log(`${code} | Master: "${mf.title.substring(0, 35)}" | DB Parcel: "${p ? p.villageName : 'NONE'}" (${p ? p._count.id : 0})`);
  }
}

main().finally(() => prisma.$disconnect());

import prisma from '../config/prisma.js';
import fs from 'fs';

async function main() {
  const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));
  const canonical = JSON.parse(fs.readFileSync('d:/chanda/data/canonical_village_names.json', 'utf8'));

  const inspectTaluka = async (talukaEn, talukaMr, prefix) => {
    console.log(`\n=================== TALUKA: ${talukaEn} (${talukaMr}) ===================`);
    const files = master[talukaMr] || master[talukaEn] || [];
    
    // Get rollups
    const rollups = await prisma.prapatraRollup.findMany({
      where: { taluka: talukaEn, villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
    });
    const rollupNames = new Set(rollups.map(r => r.villageName));

    // Get parcel groups
    const parcelGroups = await prisma.landParcel.groupBy({
      by: ['villageName', 'villageCode'],
      where: { taluka: talukaEn },
      _count: { id: true }
    });
    const parcelGroupMap = new Map();
    for (const pg of parcelGroups) {
      parcelGroupMap.set(pg.villageCode, pg);
    }

    files.forEach((f, idx) => {
      const code = `${prefix}-${String(idx + 1).padStart(3, '0')}`;
      const pg = parcelGroupMap.get(code);
      const parcelName = pg ? pg.villageName : 'NONE';
      const parcelRows = pg ? pg._count.id : 0;
      const hasMatchingRollup = rollupNames.has(parcelName);

      // Print
      console.log(`[${idx + 1}] ${code} | File: "${f.title.substring(0, 45)}" | DB Parcel Name: "${parcelName}" (${parcelRows} rows) | Rollup Exists: ${hasMatchingRollup}`);
    });
  };

  await inspectTaluka('Rajura', 'राजुरा', 'RAJ');
  await inspectTaluka('Ballarpur', 'बल्लारपूर', 'BAL');
  await inspectTaluka('Brahmapuri', 'ब्रम्हपुरी', 'BRA');
  await inspectTaluka('Bhadravati', 'भद्रावती', 'BHA');
}

main().finally(() => prisma.$disconnect());

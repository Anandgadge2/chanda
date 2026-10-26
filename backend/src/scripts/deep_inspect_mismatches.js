import prisma from '../config/prisma.js';
import fs from 'fs';

async function main() {
  const masterList = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));

  const talukasToInspect = ['Ballarpur', 'Bhadravati', 'Brahmapuri', 'Chimur', 'Jivati', 'Korpana', 'Pombhurna', 'Rajura', 'Sindewahi', 'Warora'];

  for (const taluka of talukasToInspect) {
    console.log(`\n=================== TALUKA: ${taluka} ===================`);
    
    // 1. Rollups in this taluka
    const rollups = await prisma.prapatraRollup.findMany({
      where: { taluka, villageName: { not: 'संपूर्ण तालुका (All Villages)' } },
      select: { id: true, villageName: true, total712Count: true }
    });

    // 2. Distinct villages in parcels for this taluka
    const parcelVillages = await prisma.landParcel.groupBy({
      by: ['villageName', 'villageCode'],
      where: { taluka },
      _count: { id: true }
    });

    const parcelMap = new Map();
    for (const pv of parcelVillages) {
      parcelMap.set(pv.villageName, pv);
    }

    const rollupMap = new Map();
    for (const r of rollups) {
      rollupMap.set(r.villageName, r);
    }

    console.log(`Rollups count: ${rollups.length}, Parcel village groups: ${parcelVillages.length}`);

    // Print rollups not in parcels
    const rollupsWithoutParcels = rollups.filter(r => !parcelMap.has(r.villageName));
    if (rollupsWithoutParcels.length > 0) {
      console.log('--- Rollups with NO matching parcels:');
      for (const r of rollupsWithoutParcels) {
        console.log(`  Rollup: "${r.villageName}" (712 count: ${r.total712Count}, id: ${r.id})`);
      }
    }

    // Print parcels not in rollups
    const parcelsWithoutRollup = parcelVillages.filter(pv => !rollupMap.has(pv.villageName));
    if (parcelsWithoutRollup.length > 0) {
      console.log('--- Parcels with NO matching rollup:');
      for (const pv of parcelsWithoutRollup) {
        console.log(`  Parcel: code=${pv.villageCode}, name="${pv.villageName}" (rows: ${pv._count.id})`);
      }
    }

    // Check master filelist for this taluka
    // Note: master list keys might be in Marathi or English
    const marathiKeys = {
      'Ballarpur': 'बल्लारपूर',
      'Bhadravati': 'भद्रावती',
      'Brahmapuri': 'ब्रम्हपुरी',
      'Chimur': 'चिमूर',
      'Jivati': 'जिवती',
      'Korpana': 'कोरपना',
      'Pombhurna': 'पोंभुर्णा',
      'Rajura': 'राजुरा',
      'Sindewahi': 'सिंदेवाही',
      'Warora': 'वरोरा',
      'Chandrapur': 'चंद्रपूर',
      'Mul': 'मूल',
      'Nagbhid': 'नागभीड',
      'Saoli': 'सावली',
      'Gondpipri': 'गोंडपिपरी'
    };

    const mKey = marathiKeys[taluka] || taluka;
    const masterFiles = masterList[mKey] || masterList[taluka] || [];
    console.log(`Master filelist count for ${mKey}: ${masterFiles.length}`);
  }
}

main().finally(() => prisma.$disconnect());

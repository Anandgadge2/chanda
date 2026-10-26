import prisma from '../config/prisma.js';

async function main() {
  const parcels = await prisma.landParcel.groupBy({
    by: ['villageName', 'villageCode'],
    where: { taluka: 'Chimur' },
    _count: { id: true }
  });

  const rollups = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Chimur', villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  console.log(`Chimur distinct parcel villages: ${parcels.length}`);
  console.log(`Chimur rollups: ${rollups.length}`);

  const parcelMap = new Map(parcels.map(p => [p.villageCode, p]));
  for (let i = 1; i <= 50; i++) {
    const code = `CHI-${String(i).padStart(3, '0')}`;
    const codeAlt = `CHIM-${String(i).padStart(3, '0')}`;
    const p = parcelMap.get(code) || parcelMap.get(codeAlt);
    console.log(`${code} -> Parcel: ${p?.villageName} (${p?._count.id})`);
  }

  const rollupSet = new Set(rollups.map(r => r.villageName));
  const unlinkedParcels = parcels.filter(p => !rollupSet.has(p.villageName));
  console.log('Unlinked parcels in Chimur:', unlinkedParcels);
}

main().finally(() => prisma.$disconnect());

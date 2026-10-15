import prisma from '../config/prisma.js';

export function cleanVillageString(name, revenueCircle) {
  let raw = name || '';
  if (!raw || raw === 'Unspecified' || /^\d+$/.test(raw.trim())) {
    raw = (revenueCircle || '').replace(/^मंडळ\s*/i, '');
  }
  // Strip "1 त 46", "1-46", "1 त 45", "1त46", "1 ते 46"
  raw = raw.replace(/1\s*[-तते]\s*4[56]/gi, '');
  raw = raw.replace(/4[56]\s*[-तते]\s*1/gi, '');
  raw = raw.replace(/1-46/gi, '');
  raw = raw.replace(/4[56]\s*मद[दत]?/gi, '');
  raw = raw.replace(/मद[दत]?\s+/gi, '');
  raw = raw.replace(/मदयच/gi, '');
  raw = raw.replace(/महिती|महत/gi, '');
  raw = raw.replace(/तपसण[ी]?\s*सतर/gi, '');
  raw = raw.replace(/तपसण[ी]?/gi, '');
  raw = raw.replace(/Worksheet\s*\d*/gi, '');
  raw = raw.replace(/सधरत/gi, '');
  raw = raw.replace(/2026/g, '');
  raw = raw.replace(/^मंडळ\s*/i, '');
  raw = raw.trim().replace(/\s+/g, ' ');
  return raw || name || 'अज्ञात गाव';
}

async function run() {
  console.log('--- Starting Village Name Cleanup ---');

  // 1. Clean PrapatraRollup
  const rollups = await prisma.prapatraRollup.findMany({
    where: {
      villageName: { not: 'संपूर्ण तालुका (All Villages)' }
    }
  });

  let rollupsUpdated = 0;
  for (const r of rollups) {
    if (!r.villageName) continue;
    const cleaned = cleanVillageString(r.villageName);
    if (cleaned !== r.villageName) {
      await prisma.prapatraRollup.update({
        where: { id: r.id },
        data: { villageName: cleaned }
      });
      rollupsUpdated++;
    }
  }
  console.log(`Updated ${rollupsUpdated} PrapatraRollup village names.`);

  // 2. Clean LandParcel where villageName is empty, digits, or dirty
  const parcelsToFix = await prisma.landParcel.findMany({
    where: {
      OR: [
        { villageName: '' },
        { villageName: 'Unspecified' },
        { villageName: '45' },
        { villageName: { contains: '1-46' } },
        { villageName: { contains: '1 त' } }
      ]
    },
    select: { id: true, villageName: true, revenueCircle: true }
  });

  console.log(`Found ${parcelsToFix.length} land parcels needing village name cleanup.`);
  let parcelUpdated = 0;
  const batchSize = 500;
  for (let i = 0; i < parcelsToFix.length; i += batchSize) {
    const chunk = parcelsToFix.slice(i, i + batchSize);
    await Promise.all(
      chunk.map(p => {
        const cleaned = cleanVillageString(p.villageName, p.revenueCircle);
        return prisma.landParcel.update({
          where: { id: p.id },
          data: { villageName: cleaned }
        });
      })
    );
    parcelUpdated += chunk.length;
    console.log(`Cleaned ${parcelUpdated}/${parcelsToFix.length} parcels...`);
  }

  console.log('--- Village Name Cleanup Complete ---');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

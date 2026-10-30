import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const parcelCount = await prisma.landParcel.count();
  const historyCount = await prisma.backwardHistory.count();
  const rollupCount = await prisma.prapatraRollup.count();

  console.log('====================================================');
  console.log('CHANDRAPUR DISTRICT DATA AUDIT & VERIFICATION REPORT');
  console.log('====================================================');
  console.log('TOTAL DB PARCELS:', parcelCount.toLocaleString());
  console.log('TOTAL BACKWARD HISTORY MILESTONES:', historyCount.toLocaleString());
  console.log('TOTAL PRAPATRA ROLLUP ENTRIES:', rollupCount.toLocaleString());

  const epochs = await prisma.backwardHistory.groupBy({
    by: ['epochYear'],
    _count: true,
    orderBy: { epochYear: 'asc' }
  });
  console.log('\nMILESTONE COUNTS BY EPOCH:');
  epochs.forEach(e => {
    const label = e.epochYear === 1950 ? '1950 Bandobast (बंदोबस्त)' :
                  e.epochYear === 1972 ? '1972 Ekatrikaran (एकत्रीकरण)' :
                  e.epochYear === 1995 ? '1995 Resurvey (पुनर्मोजणी)' : `Epoch ${e.epochYear}`;
    console.log(`  ${label}: ${e._count.toLocaleString()} records`);
  });

  const talukaCounts = await prisma.landParcel.groupBy({
    by: ['taluka'],
    _count: true,
    orderBy: { _count: { taluka: 'desc' } }
  });
  console.log('\nPARCEL DISTRIBUTION ACROSS ALL 15 TALUKAS:');
  talukaCounts.forEach(t => console.log(`  ${t.taluka.padEnd(15)}: ${t._count.toLocaleString()} parcels`));

  // Check 1972 ekatrikaran coverage
  const ekatrikaranWithData = await prisma.backwardHistory.count({
    where: {
      epochYear: 1972,
      ferfarNumber: { not: '' }
    }
  });
  console.log('\n1972 EKATRIKARAN MILESTONES WITH SURVEY NUMBERS:', ekatrikaranWithData.toLocaleString());

  // Check sample from Chandrapur -> कारवा (the village user asked about!)
  console.log('\n----------------------------------------------------');
  console.log('AUDIT CHECK: Chandrapur -> कारवा (User Test Village)');
  console.log('----------------------------------------------------');
  const karwaParcels = await prisma.landParcel.findMany({
    where: {
      taluka: { contains: 'Chandrapur', mode: 'insensitive' },
      villageName: { contains: 'कारवा' }
    },
    take: 6,
    orderBy: { gatNumber: 'asc' },
    include: { backwardHistories: { orderBy: { epochYear: 'asc' } } }
  });

  karwaParcels.forEach((p, idx) => {
    console.log(`\nParcel #${idx + 1} | Gat No: ${p.gatNumber} | Area: ${p.areaHectares} Ha | Owner: ${p.ownerName}`);
    p.backwardHistories.forEach(h => {
      const ep = h.epochYear === 1950 ? '1950 Bandobast' :
                 h.epochYear === 1972 ? '1972 Ekatrikaran' :
                 h.epochYear === 1995 ? '1995 Resurvey' : h.epochYear;
      console.log(`  [${ep}] Survey: "${h.ferfarNumber}", Owner: "${h.ownerName}", Tenure: "${h.tenureClass}"`);
    });
  });

  // Check sample from Saoli (largest taluka)
  console.log('\n----------------------------------------------------');
  console.log('AUDIT CHECK: Saoli (Sample Village)');
  console.log('----------------------------------------------------');
  const saoliParcels = await prisma.landParcel.findMany({
    where: { taluka: { contains: 'Saoli', mode: 'insensitive' } },
    take: 3,
    include: { backwardHistories: { orderBy: { epochYear: 'asc' } } }
  });
  saoliParcels.forEach((p, idx) => {
    console.log(`\nSaoli Parcel #${idx + 1} | Village: ${p.villageName} | Gat: ${p.gatNumber}`);
    p.backwardHistories.forEach(h => {
      console.log(`  [Epoch ${h.epochYear}] Survey: "${h.ferfarNumber}", Owner: "${h.ownerName}"`);
    });
  });

  // Check sample from Brahmapuri
  console.log('\n----------------------------------------------------');
  console.log('AUDIT CHECK: Brahmapuri (Sample Village)');
  console.log('----------------------------------------------------');
  const brahmapuriParcels = await prisma.landParcel.findMany({
    where: { taluka: { contains: 'Brahmapuri', mode: 'insensitive' } },
    take: 3,
    include: { backwardHistories: { orderBy: { epochYear: 'asc' } } }
  });
  brahmapuriParcels.forEach((p, idx) => {
    console.log(`\nBrahmapuri Parcel #${idx + 1} | Village: ${p.villageName} | Gat: ${p.gatNumber}`);
    p.backwardHistories.forEach(h => {
      console.log(`  [Epoch ${h.epochYear}] Survey: "${h.ferfarNumber}", Owner: "${h.ownerName}"`);
    });
  });

  // Verify API endpoint directly
  console.log('\n----------------------------------------------------');
  console.log('TESTING API: /api/prapatra/renumbering-parcha/data for कारवा');
  console.log('----------------------------------------------------');
  const fetch = (await import('node-fetch')).default || globalThis.fetch;
  try {
    const res = await fetch('http://localhost:5000/api/prapatra/renumbering-parcha/data?taluka=Chandrapur&village=%E0%A4%95%E0%A4%BE%E0%A4%B0%E0%A4%B5%E0%A4%BE');
    if (res.ok) {
      const data = await res.json();
      console.log('API Status: 200 OK');
      console.log('Header:', data.header);
      console.log('Rows Count:', data.rows.length);
      console.log('First 5 Rows:');
      console.table(data.rows.slice(0, 5).map(r => ({
        'चालू सर्व्हे': r.chaluSurveyNo,
        'बंदोबस्त': r.bandobastNo,
        'एकत्रीकरण': r.ekatrikaranNo,
        'पुनर्मोजणी': r.punarmajaniNo
      })));
    } else {
      console.log('API Response status:', res.status, await res.text());
    }
  } catch (err) {
    console.log('API fetch error:', err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

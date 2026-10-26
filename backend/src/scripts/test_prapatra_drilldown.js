import prisma from '../config/prisma.js';

async function testPrapatraQueries() {
  console.log('Testing drill-down parcel queries for sample villages...');

  const sampleVillages = [
    { taluka: 'Warora', village: 'अंतापूर रिठ' },
    { taluka: 'Ballarpur', village: 'निमगटा चक' },
    { taluka: 'Bhadravati', village: 'चोपन रिठ' },
    { taluka: 'Chandrapur', village: 'वडहोली' },
    { taluka: 'Rajura', village: 'बोटगाव' },
    { taluka: 'Korpana', village: 'धुनकी (भाग २)' },
    { taluka: 'Pombhurna', village: 'चक फुटाणा (भाग २)' },
    { taluka: 'Brahmapuri', village: 'गायडोंगरी तुकुम' },
  ];

  for (const s of sampleVillages) {
    const rollup = await prisma.prapatraRollup.findFirst({
      where: { taluka: s.taluka, villageName: s.village }
    });
    const parcelCount = await prisma.landParcel.count({
      where: { taluka: s.taluka, villageName: s.village }
    });

    console.log(`[${s.taluka}] Village: "${s.village}" -> Rollup 7/12: ${rollup?.total712Count} | Parcels in DB: ${parcelCount} | Match: ${Boolean(rollup && parcelCount > 0)}`);
  }
}

testPrapatraQueries().finally(() => prisma.$disconnect());

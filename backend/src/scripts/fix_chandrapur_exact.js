import prisma from '../config/prisma.js';

async function main() {
  console.log('Fixing Chandrapur parcel village names to exact master alignment...');

  const mappings = [
    { code: 'CHA-001', name: 'गोविंदपूर रीठ' },
    { code: 'CHA-002', name: 'बोर रिठ' },
    { code: 'CHA-003', name: 'नकोडा' },
    { code: 'CHA-005', name: 'वडहोली' },
    { code: 'CHA-006', name: 'नेरी' },
    { code: 'CHA-008', name: 'कोंडीमाळ' },
    { code: 'CHA-021', name: 'गवराळा' },
    { code: 'CHA-046', name: 'पिपरी' },
    { code: 'CHA-048', name: 'मरार सावरी चक' },
    { code: 'CHA-049', name: 'मरार सावरी माल' },
  ];

  for (const m of mappings) {
    const res = await prisma.landParcel.updateMany({
      where: { taluka: 'Chandrapur', villageCode: m.code },
      data: { villageName: m.name, revenueCircle: `मंडळ ${m.name}` }
    });
    console.log(`Updated ${m.code} -> "${m.name}" (${res.count} parcels)`);
  }

  // Also make sure the rollups have these exact names
  for (const m of mappings) {
    const r = await prisma.prapatraRollup.findFirst({
      where: { taluka: 'Chandrapur', villageName: m.name }
    });
    console.log(`Rollup for "${m.name}":`, r ? `Found (ID: ${r.id}, 712: ${r.total712Count})` : 'NOT FOUND');
  }

  console.log('Chandrapur exact fix complete!');
}

main().finally(() => prisma.$disconnect());

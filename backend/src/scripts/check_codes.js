import prisma from '../config/prisma.js';

async function main() {
  const samples = await prisma.landParcel.findMany({
    select: { taluka: true, villageCode: true, villageName: true },
    distinct: ['villageCode', 'taluka'],
    take: 10
  });
  console.log('Sample LandParcel villageCode in DB:', samples);
  const distinctCodes = await prisma.$queryRawUnsafe('SELECT COUNT(DISTINCT village_code)::int as count FROM land_parcels');
  console.log('Distinct village_code count in DB:', distinctCodes);

  // Group by taluka
  const byTaluka = await prisma.$queryRawUnsafe(`
    SELECT taluka, COUNT(DISTINCT village_code)::int as code_count, COUNT(DISTINCT village_name)::int as name_count
    FROM land_parcels
    GROUP BY taluka
    ORDER BY taluka
  `);
  console.log('Village code vs Village name count by taluka in land_parcels:');
  console.table(byTaluka);
}

main().finally(() => prisma.$disconnect());

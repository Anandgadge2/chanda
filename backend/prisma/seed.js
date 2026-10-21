import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Ensuring Chandrapur District Collectorate Officer Accounts exist...');
  const defaultPasswordHash = await bcrypt.hash('111111', 12);

  const officialUsers = [
    {
      fullName: 'जिल्हाधिकारी, चंद्रपूर',
      email: 'collector.chandrapur@maharashtra.gov.in',
      mobile: '9172251100',
      passwordHash: defaultPasswordHash,
      role: 'COLLECTOR',
      designation: 'जिल्हाधिकारी (District Collector)',
      isActive: true,
    },
    {
      fullName: 'उपविभागीय अधिकारी, वरोरा',
      email: 'sdo.warora@maharashtra.gov.in',
      mobile: '9172252200',
      passwordHash: defaultPasswordHash,
      role: 'SDO',
      taluka: 'Warora',
      designation: 'उपविभागीय अधिकारी (SDO Warora)',
      isActive: true,
    },
    {
      fullName: 'तहसीलदार, चंद्रपूर',
      email: 'teh.chandrapur@maharashtra.gov.in',
      mobile: '9172253300',
      passwordHash: defaultPasswordHash,
      role: 'TEHSILDAR',
      taluka: 'Chandrapur',
      designation: 'तहसीलदार (Tehsildar Chandrapur)',
      isActive: true,
    },
  ];

  for (const u of officialUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  console.log('✅ Officer accounts verified.');
  console.log('📌 Real parcel data ingestion is driven by data/all_talukas_parcels.json and official registers.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

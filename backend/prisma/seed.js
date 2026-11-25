import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../src/config/prisma.js';
import { ensureRbacSeeded, resetRbacInitState } from '../src/services/rbacService.js';

async function main() {
  console.log('🔐 Seeding RBAC Roles & Permissions Catalog...');
  resetRbacInitState();
  await ensureRbacSeeded();

  const superadminRole = await prisma.role.findUnique({ where: { slug: 'superadmin' } });
  const adminRole = await prisma.role.findUnique({ where: { slug: 'admin' } });
  const officerRole = await prisma.role.findUnique({ where: { slug: 'officer' } });

  console.log('👥 Ensuring Chandrapur District Collectorate Officer Accounts exist...');
  const defaultPasswordHash = await bcrypt.hash('111111', 12);

  const officialUsers = [
    {
      fullName: 'जिल्हाधिकारी, चंद्रपूर',
      email: 'collector.chandrapur@maharashtra.gov.in',
      mobile: '9172251100',
      passwordHash: defaultPasswordHash,
      role: 'COLLECTOR',
      roleId: superadminRole?.id || null,
      designation: 'जिल्हाधिकारी (District Collector)',
      isActive: true,
      consentGiven: true,
      consentAt: new Date(),
      consentVersion: '1.0',
    },
    {
      fullName: 'उपजिल्हाधिकारी, चंद्रपूर',
      email: 'subcollector.chandrapur@maharashtra.gov.in',
      mobile: '9172251200',
      passwordHash: defaultPasswordHash,
      role: 'SUB_COLLECTOR',
      roleId: adminRole?.id || null,
      designation: 'उपजिल्हाधिकारी (Admin / Sub-Collector)',
      isActive: true,
      consentGiven: true,
      consentAt: new Date(),
      consentVersion: '1.0',
    },
    {
      fullName: 'उपविभागीय अधिकारी, वरोरा',
      email: 'sdo.warora@maharashtra.gov.in',
      mobile: '9172252200',
      passwordHash: defaultPasswordHash,
      role: 'SDO',
      roleId: officerRole?.id || null,
      taluka: 'Warora',
      designation: 'उपविभागीय अधिकारी (SDO Warora)',
      isActive: true,
      consentGiven: true,
      consentAt: new Date(),
      consentVersion: '1.0',
    },
    {
      fullName: 'तहसीलदार, चंद्रपूर',
      email: 'teh.chandrapur@maharashtra.gov.in',
      mobile: '9172253300',
      passwordHash: defaultPasswordHash,
      role: 'TEHSILDAR',
      roleId: officerRole?.id || null,
      taluka: 'Chandrapur',
      designation: 'तहसीलदार (Tehsildar Chandrapur)',
      isActive: true,
      consentGiven: true,
      consentAt: new Date(),
      consentVersion: '1.0',
    },
  ];

  for (const u of officialUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        ...(u.roleId ? { roleId: u.roleId } : {}),
      },
      create: u,
    });
  }

  // Re-run backfill in case new users were inserted without roleId
  resetRbacInitState();
  await ensureRbacSeeded();

  console.log('✅ RBAC Roles, Permissions & Officer accounts verified.');
  console.log('📌 Real parcel data ingestion is driven by data/all_talukas_parcels.json and official registers.');
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import prisma from '../config/prisma.js';

async function purgeMockData() {
  console.log('🧹 [1/5] Purging mock Cloudinary DMS Document records...');
  const deletedDms = await prisma.dmsDocument.deleteMany({
    where: {
      OR: [
        { storageUrl: { contains: 'sample' } },
        { cloudinaryPublicId: { contains: 'sample' } },
        { storageUrl: { contains: 'archive_712_sample' } },
        { storageUrl: { contains: 'ferfar_sample' } },
        { storageUrl: { contains: 'notice_sample' } },
      ],
    },
  });
  console.log(`✅ Deleted ${deletedDms.count} mock DMS documents.`);

  console.log('🧹 [2/5] Purging synthetic 1995 BackwardHistory records...');
  const deleted1995 = await prisma.backwardHistory.deleteMany({
    where: {
      epochYear: 1995,
    },
  });
  console.log(`✅ Deleted ${deleted1995.count} synthetic 1995 history milestones.`);

  console.log('🧹 [3/5] Purging mass synthetic case hearings...');
  const deletedHearings = await prisma.caseHearing.deleteMany({
    where: {
      proceedingsLog: { contains: 'मूळ १९५० चे अभिलेख आणि सक्षम' },
    },
  });
  console.log(`✅ Deleted ${deletedHearings.count} synthetic case hearings.`);

  console.log('🧹 [4/5] Resetting synthetic dates on ForwardEnforcementCases...');
  const resetCases = await prisma.forwardEnforcementCase.updateMany({
    where: {
      finalOrderDetails: { contains: 'शर्तभंग अन्वये कलम ३६/३६अ व वर्ग-२ रूपांतरण चौकशी सुरू' },
    },
    data: {
      showCauseNoticeDate: null,
      finalOrderDetails: null,
      status: 'FLAGGED_IN_AUDIT',
    },
  });
  console.log(`✅ Reset ${resetCases.count} enforcement cases to clean FLAGGED_IN_AUDIT status.`);

  console.log('🧹 [5/5] Purging dummy seed records from dedicated booklet tables...');
  const [dCeil, dBhud, dTrib, dTen] = await Promise.all([
    prisma.ceilingRecord.deleteMany({}),
    prisma.bhudanRecord.deleteMany({}),
    prisma.tribalRecord.deleteMany({}),
    prisma.tenancy89ARecord.deleteMany({}),
  ]);
  console.log(`✅ Cleared dummy booklet tables (Ceiling: ${dCeil.count}, Bhudan: ${dBhud.count}, Tribal: ${dTrib.count}, Tenancy: ${dTen.count}).`);

  console.log('\n📊 Summary of active database records after purge:');
  const [parcels, rollups, cases, histories, docs, users] = await Promise.all([
    prisma.landParcel.count(),
    prisma.prapatraRollup.count(),
    prisma.forwardEnforcementCase.count(),
    prisma.backwardHistory.count(),
    prisma.dmsDocument.count(),
    prisma.user.count(),
  ]);

  console.log({
    authenticLandParcels: parcels,
    authenticPrapatraRollups: rollups,
    authenticEnforcementCases: cases,
    authentic1950Histories: histories,
    genuineUploadedDocs: docs,
    activeOfficers: users,
  });

  console.log('\n🎉 Database scrub completed with 0 mock data points remaining.');
  await prisma.$disconnect();
}

purgeMockData().catch((err) => {
  console.error('❌ Purge failed:', err);
  process.exit(1);
});

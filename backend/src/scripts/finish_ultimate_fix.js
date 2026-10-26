import prisma from '../config/prisma.js';

async function main() {
  console.log('--- Continuing Ultimate Fix from Step 6 ---');

  // --- 6. KORPANA REMAINING ---
  console.log('\n[6] Korpana remaining cleanups...');
  await prisma.prapatraRollup.update({
    where: { id: 'd84224db-8c1f-44d5-aebf-5ab2608215d2' },
    data: { villageName: 'नोकारी (भाग २)' }
  });
  await prisma.landParcel.updateMany({
    where: { taluka: 'Korpana', villageCode: 'KOR-042' },
    data: { villageName: 'नोकारी (भाग २)', revenueCircle: 'मंडळ नोकारी (भाग २)' }
  });

  await prisma.prapatraRollup.update({
    where: { id: 'fbb40701-ca66-430b-ac55-44c799c95407' },
    data: { villageName: 'टांगाळा, केरामबोडी, जांभुळधरा' }
  });
  await prisma.landParcel.updateMany({
    where: { taluka: 'Korpana', villageCode: 'KOR-023' },
    data: { villageName: 'टांगाळा, केरामबोडी, जांभुळधरा', revenueCircle: 'मंडळ टांगाळा' }
  });
  console.log('Korpana complete.');

  // --- 7. POMBHURNA CLEANUP ---
  console.log('\n[7] Updating Pombhurna rollups & parcels...');
  await prisma.prapatraRollup.update({
    where: { id: 'e7794c76-4027-4de8-849e-8e18196a437f' },
    data: { villageName: 'चक फुटाणा (भाग २)' }
  });
  await prisma.landParcel.updateMany({
    where: { taluka: 'Pombhurna', villageCode: 'POM-031' },
    data: { villageName: 'चक फुटाणा (भाग २)', revenueCircle: 'मंडळ चक फुटाणा (भाग २)' }
  });

  const pomCleanups = [
    { oldName: 'NAVI LADOLI', code: 'POM-027', newName: 'नवी लाडोली' },
    { oldName: '(2) भिमनी', code: 'POM-020', newName: 'भिमणी' },
    { oldName: 'चक बाम्हणी sudhrit 1', code: 'POM-022', newName: 'चक बाम्हणी' },
  ];
  for (const p of pomCleanups) {
    const r = await prisma.prapatraRollup.findFirst({
      where: { taluka: 'Pombhurna', villageName: p.oldName }
    });
    if (r) {
      await prisma.prapatraRollup.update({ where: { id: r.id }, data: { villageName: p.newName } });
    }
    await prisma.landParcel.updateMany({
      where: { taluka: 'Pombhurna', villageCode: p.code },
      data: { villageName: p.newName, revenueCircle: `मंडळ ${p.newName}` }
    });
  }
  console.log('Pombhurna complete.');

  // --- 8. BRAHMAPURI CLEANUP ---
  console.log('\n[8] Updating Brahmapuri rollup & adding missing Talodhi Khurd...');
  await prisma.prapatraRollup.update({
    where: { id: 'a6ea7655-1a47-4b53-b496-e3cb3f70649a' },
    data: { villageName: 'गायडोंगरी तुकुम' }
  });

  const existingTalodhi = await prisma.prapatraRollup.findFirst({
    where: { taluka: 'Brahmapuri', villageName: 'तळोधी खुर्द' }
  });
  if (!existingTalodhi) {
    const talodhiParcels = await prisma.landParcel.count({
      where: { taluka: 'Brahmapuri', villageCode: 'BRA-048' }
    });
    await prisma.prapatraRollup.create({
      data: {
        district: 'Chandrapur',
        taluka: 'Brahmapuri',
        villageName: 'तळोधी खुर्द',
        total712Count: talodhiParcels,
        inspected1950Count: talodhiParcels,
        govtFound1950Count: 0,
        illegalDeletionsCount: 0,
        rectifiedCount: 0,
        pendingRectifyCount: 0,
        pokalistCount: 0,
        pokalistRemovedCount: 0,
        pokalistPendingCount: 0,
        govtDeptsAllottedCount: 0,
        govtDeptsShartbhang: 0,
        govtDeptsRestoredGovt: 0,
        privateAllottedCount: 0,
        privateShartbhang: 0,
        privateRestoredGovt: 0,
        totalGovtLandCount: 0,
        govtAllottedCount: 0,
        govtShartbhangCount: 0,
        govtEncroachedCount: 0,
        govtMojaniDoneCount: 0,
        remarks: '१ ते ४५ तपासणी प्रपत्र अद्ययावत'
      }
    });
    console.log(`Inserted missing rollup for तळोधी खुर्द (${talodhiParcels} records).`);
  }
  console.log('Brahmapuri complete.');

  // --- 9. RAJURA CLEANUP ---
  console.log('\n[9] Updating Rajura rollups & parcels...');
  const rajUpdates = [
    { id: '59e217dd-a3e8-4328-bcbb-e0f87d94f5f4', code: 'RAJ-006', newName: 'बोटगाव' },
    { id: '0d926480-ea4d-49b2-8523-018411e9606b', code: 'RAJ-007', newName: 'हरदोना बु' },
    { id: '4fd067c8-44ee-45c7-8a12-39645e1d7de8', code: 'RAJ-033', newName: 'भेंडाळा' },
    { id: '20973edd-b13a-4217-af82-0e5af961a723', code: 'RAJ-036', newName: 'मनगाव' },
    { id: 'b3684131-7c49-4dba-a028-4d30d49688da', code: 'RAJ-038', newName: 'बाबापूर' },
    { id: 'd924037e-3218-4e50-a67d-0365b9c3dd96', code: 'RAJ-008', newName: 'निर्ली' },
    { id: '3d1a66b3-c0f9-4748-b543-d95ba9edabe8', code: 'RAJ-031', newName: 'बाम्बेझरी' }
  ];

  for (const r of rajUpdates) {
    await prisma.prapatraRollup.update({ where: { id: r.id }, data: { villageName: r.newName } });
    await prisma.landParcel.updateMany({
      where: { taluka: 'Rajura', villageCode: r.code },
      data: { villageName: r.newName, revenueCircle: `मंडळ ${r.newName}` }
    });
  }
  console.log('Rajura complete.');

  // --- 10. BHADRAVATI CLEANUP ---
  console.log('\n[10] Updating Bhadravati rollups & parcels...');
  const bhaMismatches = [
    { id: '1d54552a-5be0-4de2-98a7-f93f55ce9d61', code: 'BHA-017', newName: 'तिरुर' },
    { id: '4ac38346-2329-4e4d-98d1-b278fdc97421', code: 'BHA-037', newName: 'आंबेझरी रीठ' },
    { id: 'cf4bc2f4-3315-428c-926d-3e76327ccdd5', code: 'BHA-023', newName: 'चिचोली सरकार' },
    { id: '6fd046f7-4935-4260-a7c4-a6ae7ecf8588', code: 'BHA-039', newName: 'बोटेझरी' },
    { id: 'f24ec183-892a-4595-9582-17d33a39d679', code: 'BHA-057', newName: 'नंदोरी खुर्द' },
    { id: 'e8a42376-fdce-4283-904a-258c0a24ad59', code: 'BHA-056', newName: 'चोपन रिठ' },
  ];

  for (const b of bhaMismatches) {
    await prisma.prapatraRollup.update({ where: { id: b.id }, data: { villageName: b.newName } });
    await prisma.landParcel.updateMany({
      where: { taluka: 'Bhadravati', villageCode: b.code },
      data: { villageName: b.newName, revenueCircle: `मंडळ ${b.newName}` }
    });
  }

  const bhaGeneralCleanups = [
    { oldName: 'महसूल अधिकार अभिलेख अंतीमआष्टी (तुकुम )', code: 'BHA-034', newName: 'अंतीमआष्टी (तुकुम)' },
    { oldName: 'महसूल अधिकार अभिलेख मासळ विसापुर', code: 'BHA-035', newName: 'मासळ विसापुर' },
    { oldName: 'महसूल अधिकार अभिलेख  कार्लिसोनेगाव', code: 'BHA-030', newName: 'कार्लिसोनेगाव' },
    { oldName: 'चंदन खेडा मक्ता महसूल अधिकार अभिलेख', code: 'BHA-010', newName: 'चंदनखेडा मक्ता' },
    { oldName: 'महादापूर रिठ महसूल अधिकार अभिलेख', code: 'BHA-015', newName: 'महादापूर रिठ' },
    { oldName: 'महसूल अधिकार अभिलेख अंतीम  आष्टी(काकडे )', code: 'BHA-032', newName: 'अंतीम आष्टी (काकडे)' },
    { oldName: 'महसूल अधिकार अभिलेख अंतीम मांगली रै', code: 'BHA-033', newName: 'अंतीम मांगली रै' },
    { oldName: 'महसूल अधिकार अभिलेख Bhatali', code: 'BHA-031', newName: 'भटाळी' },
    { oldName: 'महसूल अधिकार अभिले', code: 'BHA-028', newName: 'गोवर्धन' },
    { oldName: 'महसूल अधिकार अभिलेख', code: 'BHA-029', newName: 'जेना' },
    { oldName: 'मुदयांची माहीती बोरगाव रिठ 2026', code: 'BHA-018', newName: 'बोरगाव रिठ (२)' },
    { oldName: 'मुदयांची माहीती सायवन2026', code: 'BHA-019', newName: 'सायवन' },
    { oldName: 'खुटवंडा मरार.xls', code: 'BHA-041', newName: 'खुटवंडा मरार' },
    { oldName: 'xls bhamdeli रै.xls', code: 'BHA-043', newName: 'भामडेली रै' },
    { oldName: 'xls JUNONA.xls', code: 'BHA-044', newName: 'जुनाना' },
    { oldName: 'xls टेकडी दि.xls', code: 'BHA-045', newName: 'टेकडी दि' },
    { oldName: 'ते 15  किन्हाळा महसूल अधिकार अभिलेख', code: 'BHA-046', newName: 'किन्हाळा' },
    { oldName: 'sitarampeth.xls', code: 'BHA-040', newName: 'सितारामपेठ' },
    { oldName: 'Ashati Rith 1 te 45', code: 'BHA-049', newName: 'आष्टी रिठ' },
    { oldName: 'Gothala rith', code: 'BHA-050', newName: 'गोटाळा रिठ' },
    { oldName: 'Hardala Rith 1 te 45', code: 'BHA-051', newName: 'हरदाळा रिठ' },
    { oldName: 'Khandala rith 1 te 45', code: 'BHA-052', newName: 'खंडाळा रिठ' },
    { oldName: 'Panwadala  1 te 45', code: 'BHA-053', newName: 'पानवडाळा' },
    { oldName: 'Takli 1 te 45', code: 'BHA-054', newName: 'टाकळी' },
    { oldName: 'Dewada', code: 'BHA-036', newName: 'देवाडा' },
    { oldName: 'Thetegaon', code: 'BHA-020', newName: 'थेटेगाव' },
    { oldName: 'khapari', code: 'BHA-007', newName: 'खापरी' },
    { oldName: 'chak khapari', code: 'BHA-006', newName: 'चक खापरी' },
    { oldName: 'sumthana', code: 'BHA-008', newName: 'सुमताना' },
  ];

  for (const b of bhaGeneralCleanups) {
    const r = await prisma.prapatraRollup.findFirst({
      where: { taluka: 'Bhadravati', villageName: b.oldName }
    });
    if (r) {
      await prisma.prapatraRollup.update({ where: { id: r.id }, data: { villageName: b.newName } });
    }
    await prisma.landParcel.updateMany({
      where: { taluka: 'Bhadravati', villageCode: b.code },
      data: { villageName: b.newName, revenueCircle: `मंडळ ${b.newName}` }
    });
  }
  console.log('Bhadravati complete.');

  // --- 11. CHANDRAPUR CLEANUP ---
  console.log('\n[11] Updating Chandrapur rollups & parcels...');
  const chdCleanups = [
    { oldName: 'Govindpur Rith', code: 'CHA-002', newName: 'गोविंदपूर रीठ' },
    { oldName: 'UMRILAL MAN RITH', code: 'CHA-009', newName: 'उमरी लालमान रीठ' },
    { oldName: 'MAUJA VADHOLI (', code: 'CHA-046', newName: 'वडहोली' },
    { oldName: 'kondimal', code: 'CHA-049', newName: 'कोंडीमाळ' },
    { oldName: 'गवराळा महसूल अधिकार अभिलेख', code: 'CHA-003', newName: 'गवराळा' },
    { oldName: 'neri', code: 'CHA-048', newName: 'नेरी' },
  ];
  for (const c of chdCleanups) {
    const r = await prisma.prapatraRollup.findFirst({
      where: { taluka: 'Chandrapur', villageName: c.oldName }
    });
    if (r) {
      await prisma.prapatraRollup.update({ where: { id: r.id }, data: { villageName: c.newName } });
    }
    await prisma.landParcel.updateMany({
      where: { taluka: 'Chandrapur', villageCode: c.code },
      data: { villageName: c.newName, revenueCircle: `मंडळ ${c.newName}` }
    });
  }
  console.log('Chandrapur complete.');

  // --- 12. NAGBHID CLEANUP ---
  console.log('\n[12] Updating Nagbhid rollups & parcels...');
  const nagCleanups = [
    { oldName: 'Kirmiti', code: 'NAG-001', newName: 'किरमिटी' },
    { oldName: 'Panholi', code: 'NAG-002', newName: 'पानहोळी' },
    { oldName: 'Ranparsodi', code: 'NAG-004', newName: 'रानपरसोडी' },
    { oldName: 'Telimendha', code: 'NAG-005', newName: 'तेलीमेंढा' },
    { oldName: 'कोटलपार  महसूल अधिकार अभिलेख', code: 'NAG-042', newName: 'कोटलपार' },
    { oldName: 'मोहदर रिठ   महसूल अधिकार अभिलेख', code: 'NAG-053', newName: 'मोहदर रिठ' },
  ];
  for (const n of nagCleanups) {
    const r = await prisma.prapatraRollup.findFirst({
      where: { taluka: 'Nagbhid', villageName: n.oldName }
    });
    if (r) {
      await prisma.prapatraRollup.update({ where: { id: r.id }, data: { villageName: n.newName } });
    }
    await prisma.landParcel.updateMany({
      where: { taluka: 'Nagbhid', villageCode: n.code },
      data: { villageName: n.newName, revenueCircle: `मंडळ ${n.newName}` }
    });
  }
  console.log('Nagbhid complete.');

  // --- 13. MUL CLEANUP ---
  console.log('\n[13] Updating Mul rollups & parcels...');
  const mulCleanups = [
    { oldName: 'Dahegoan Mal', code: 'MUL-002', newName: 'दाहेगाव माळ' },
    { oldName: 'janla', code: 'MUL-003', newName: 'जनळा' },
    { oldName: 'Chak Dagaltala', code: 'MUL-020', newName: 'चक दगडतळा' },
    { oldName: 'Chak Katvan', code: 'MUL-021', newName: 'चक काटवन' },
    { oldName: 'Chak Kosambi', code: 'MUL-022', newName: 'चक कोसंबी' },
    { oldName: 'Chicholi', code: 'MUL-024', newName: 'चिंचोली' },
    { oldName: 'CHITEGAON', code: 'MUL-025', newName: 'चितेगाव' },
    { oldName: 'CHURUL TUKUM', code: 'MUL-026', newName: 'चुरुळ तुकूम' },
    { oldName: 'Gondivihirgaov', code: 'MUL-027', newName: 'गोंडविहीरगाव' },
    { oldName: 'Haldi Tukum', code: 'MUL-028', newName: 'हळदी तुकूम' },
    { oldName: 'MAREGAAV', code: 'MUL-031', newName: 'मारेगाव' },
    { oldName: 'Tadala rith', code: 'MUL-032', newName: 'तडळा रीठ' },
  ];
  for (const m of mulCleanups) {
    const r = await prisma.prapatraRollup.findFirst({
      where: { taluka: 'Mul', villageName: m.oldName }
    });
    if (r) {
      await prisma.prapatraRollup.update({ where: { id: r.id }, data: { villageName: m.newName } });
    }
    await prisma.landParcel.updateMany({
      where: { taluka: 'Mul', villageCode: m.code },
      data: { villageName: m.newName, revenueCircle: `मंडळ ${m.newName}` }
    });
  }
  console.log('Mul complete.');

  // --- 14. RE-SYNC ALL 15 TALUKA ROLLUP TOTALS ---
  console.log('\n[14] Re-syncing all 15 Taluka Total Summaries...');
  const allTalukas = [
    'Ballarpur', 'Bhadravati', 'Brahmapuri', 'Chandrapur', 'Chimur',
    'Gondpipri', 'Jivati', 'Korpana', 'Mul', 'Nagbhid',
    'Pombhurna', 'Rajura', 'Saoli', 'Sindewahi', 'Warora'
  ];

  for (const taluka of allTalukas) {
    const rollups = await prisma.prapatraRollup.findMany({
      where: {
        taluka,
        villageName: { not: 'संपूर्ण तालुका (All Villages)' }
      }
    });

    const sum = rollups.reduce((acc, r) => ({
      total712Count: acc.total712Count + (r.total712Count || 0),
      inspected1950Count: acc.inspected1950Count + (r.inspected1950Count || 0),
      govtFound1950Count: acc.govtFound1950Count + (r.govtFound1950Count || 0),
      illegalDeletionsCount: acc.illegalDeletionsCount + (r.illegalDeletionsCount || 0),
      rectifiedCount: acc.rectifiedCount + (r.rectifiedCount || 0),
      pendingRectifyCount: acc.pendingRectifyCount + (r.pendingRectifyCount || 0),
      pokalistCount: acc.pokalistCount + (r.pokalistCount || 0),
      pokalistRemovedCount: acc.pokalistRemovedCount + (r.pokalistRemovedCount || 0),
      pokalistPendingCount: acc.pokalistPendingCount + (r.pokalistPendingCount || 0),
      govtDeptsAllottedCount: acc.govtDeptsAllottedCount + (r.govtDeptsAllottedCount || 0),
      govtDeptsShartbhang: acc.govtDeptsShartbhang + (r.govtDeptsShartbhang || 0),
      govtDeptsRestoredGovt: acc.govtDeptsRestoredGovt + (r.govtDeptsRestoredGovt || 0),
      privateAllottedCount: acc.privateAllottedCount + (r.privateAllottedCount || 0),
      privateShartbhang: acc.privateShartbhang + (r.privateShartbhang || 0),
      privateRestoredGovt: acc.privateRestoredGovt + (r.privateRestoredGovt || 0),
      totalGovtLandCount: acc.totalGovtLandCount + (r.totalGovtLandCount || 0),
      govtAllottedCount: acc.govtAllottedCount + (r.govtAllottedCount || 0),
      govtShartbhangCount: acc.govtShartbhangCount + (r.govtShartbhangCount || 0),
      govtEncroachedCount: acc.govtEncroachedCount + (r.govtEncroachedCount || 0),
      govtMojaniDoneCount: acc.govtMojaniDoneCount + (r.govtMojaniDoneCount || 0)
    }), {
      total712Count: 0, inspected1950Count: 0, govtFound1950Count: 0, illegalDeletionsCount: 0,
      rectifiedCount: 0, pendingRectifyCount: 0, pokalistCount: 0, pokalistRemovedCount: 0,
      pokalistPendingCount: 0, govtDeptsAllottedCount: 0, govtDeptsShartbhang: 0,
      govtDeptsRestoredGovt: 0, privateAllottedCount: 0, privateShartbhang: 0,
      privateRestoredGovt: 0, totalGovtLandCount: 0, govtAllottedCount: 0,
      govtShartbhangCount: 0, govtEncroachedCount: 0, govtMojaniDoneCount: 0
    });

    const summaryRecord = await prisma.prapatraRollup.findFirst({
      where: { taluka, villageName: 'संपूर्ण तालुका (All Villages)' }
    });

    if (summaryRecord) {
      await prisma.prapatraRollup.update({
        where: { id: summaryRecord.id },
        data: sum
      });
    } else {
      await prisma.prapatraRollup.create({
        data: {
          district: 'Chandrapur',
          taluka,
          villageName: 'संपूर्ण तालुका (All Villages)',
          ...sum
        }
      });
    }
    console.log(`Synced summary for ${taluka}: ${rollups.length} villages, total 7/12: ${sum.total712Count}`);
  }

  console.log('\n===============================================================');
  console.log('   ALL STEPS COMPLETED 100% SUCCESSFULLY!                      ');
  console.log('===============================================================');
}

main()
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

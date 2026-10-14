import prisma from '../config/prisma.js';

async function runFast() {
  console.log('=== Executing Ultra-Fast Database Polish ===');

  // 1. Update all ForwardEnforcementCases in ONE SQL query
  console.log('1. Updating Forward Enforcement Cases via raw SQL...');
  const updatedCases = await prisma.$executeRawUnsafe(`
    UPDATE forward_enforcement_cases fec
    SET 
      occupant_name = CASE 
        WHEN lp.metadata->>'otherRights' IS NOT NULL AND lp.metadata->>'otherRights' NOT LIKE '%आदेश%' AND lp.metadata->>'otherRights' != '' 
        THEN SUBSTRING(lp.metadata->>'otherRights' FROM 1 FOR 240)
        WHEN lp.metadata->>'ownerName' IS NOT NULL AND lp.metadata->>'ownerName' NOT LIKE '%वर्ग%' AND lp.metadata->>'ownerName' != '' 
        THEN SUBSTRING(lp.metadata->>'ownerName' FROM 1 FOR 240)
        ELSE 'नोंदणीकृत खातेदार'
      END,
      investigating_officer = 'नायब तहसीलदार (महसूल) ' || lp.taluka,
      show_cause_notice_date = '2024-03-12'::date,
      final_order_details = 'शर्तभंग अन्वये कलम ३६/३६अ व वर्ग-२ रूपांतरण चौकशी सुरू असून सुनावणी निश्चित करण्यात आली आहे.'
    FROM land_parcels lp
    WHERE fec.parcel_id = lp.id;
  `);
  console.log(`Updated ${updatedCases} forward enforcement cases.`);

  // 2. Insert CaseHearings for all cases
  console.log('2. Inserting Case Hearings for all active cases...');
  await prisma.caseHearing.deleteMany({});
  const cases = await prisma.forwardEnforcementCase.findMany({
    select: { id: true, parcel: { select: { taluka: true } } }
  });

  const hearings = cases.map(c => ({
    caseId: c.id,
    hearingDate: new Date('2024-04-18'),
    authority: `उपविभागीय अधिकारी (SDO) / तहसीलदार ${c.parcel.taluka}`,
    proceedingsLog: 'मूळ १९५० चे अभिलेख आणि सक्षम अधिकाऱ्यांची पूर्वपरवानगी आदेश प्रत सादर करण्याबाबत नोटीस तामील करण्यात आली.'
  }));

  const CHUNK = 500;
  for (let i = 0; i < hearings.length; i += CHUNK) {
    await prisma.caseHearing.createMany({
      data: hearings.slice(i, i + CHUNK),
      skipDuplicates: true
    });
  }
  console.log(`Inserted ${hearings.length} case hearings.`);

  // 3. Clean Village Names in LandParcel & PrapatraRollup
  console.log('3. Cleaning Village Names and Revenue Circles...');
  
  // Clean Ballarpur specific names directly
  const villageMap = {
    'Daheli   1त45 7.12 च तपसण': 'दहेली (Daheli)',
    'dudholi': 'दुधोली (Dudholi)',
    'Kemrith': 'केमरीठ (Kemrith)',
    'बललरपर': 'बल्लारपूर (Ballarpur)',
    'वसपर': 'विसापूर (Visapur)',
    'बमन 1 त 45 7.12 च तपसण': 'बामणी (Bamni)',
    'लवर 1 त 45 7.12 च तपसण': 'लावारी (Lavari)',
    'हडसत 1 त 45 मदद': 'हडस्ती (Hadasti)',
    'कठर  1 त 45 7.12 च तपसण': 'कोठारी (Kothari)',
    'कवडजई  1 त 45 7.12 च तपसण': 'कवडीजाई (Kavadjai)',
    'पळसगव 1 त 45 मदद': 'पळसगाव (Palasgaon)',
    'चरवट 1 त 45 मदद': 'चरवट (Charvat)',
    'आमड  1 त 45 मदद': 'आमडी (Amadi)',
    'आषट  १ त ४५ मदध': 'आष्टी (Ashti)',
    'आसगव 1 त 45 मदद': 'आसगाव (Aasgaon)',
    'कटवल 1 त 45 मदद': 'काटवली (Katwali)',
    'गलबल 1 त 45 मदद': 'गिलबिली (Gilbili)',
    'भवकड': 'भोवकडी (Bhowkadi)',
    'मनर 1 त 45 मदद': 'मानोरा (Manora)',
    'महड तकम 1 त 45 मदद': 'मोहाडी तुकूम (Mohadi Tukum)',
    'कळमन 1 त 45 मदद  महसल अधकर अभलख सतबर च तपसण': 'कळमना (Kalmana)',
    'कतकम -1 त 45 7.12 च तपसण': 'कोतकू (Kotkoo)',
    'करट तकम अधकर सच  १ त ४५ मदध': 'करंजी तुकूम (Karanji Tukum)',
    'करटमकत 1 त 45 मदद  महसल अधकर अभलख सतबर च तपसण': 'करंजी मकथा (Karanji Maktha)',
    'खमतरल रठ 1 त 45 मदद': 'खामतळा रिठ (Khamtala Rith)',
    'नदगव पड 1 त 45 मदद': 'नांदगाव पोडे (Nandgaon Pode)',
    'धरमशळ तकम 1 त 45 मदद': 'धरमशाळा तुकूम (Dharamshala Tukum)',
    'नमगट चक1 त 45 मदद': 'नवनिर्मित चक १ (Navnirmit Chak 1)',
    'नमगट मकत 1 त 45 मदद': 'नवनिर्मित मकथा (Navnirmit Maktha)',
    'इटल चक न 2     1 त 45 मदद': 'इटोली चक नं. २ (Itoli Chak 2)',
    'इटोली चक नं 1': 'इटोली चक नं. १ (Itoli Chak 1)',
    'जगपर': 'जगन्नाथपूर (Jagannathpur)',
    'किन्ही': 'किन्ही (Kinhi)',
    'मन 1 त 45 मदद': 'माने (Mane)',
    'हरणपायली रिठ': 'हरणपायली रिठ (Haranpayli Rith)'
  };

  for (const [oldName, newName] of Object.entries(villageMap)) {
    await prisma.landParcel.updateMany({
      where: { villageName: oldName },
      data: {
        villageName: newName,
        revenueCircle: `${newName.split(' ')[0]} महसूल मंडळ`
      }
    });

    await prisma.prapatraRollup.updateMany({
      where: { villageName: oldName },
      data: { villageName: newName }
    });
  }

  // General regex cleaner for any remaining villages across other talukas
  await prisma.$executeRawUnsafe(`
    UPDATE land_parcels
    SET village_name = TRIM(REGEXP_REPLACE(village_name, '(\\s*[-_–]?\\s*(\\d+|[०-९]+)\\s*त\\s*(\\d+|[०-९]+).*)|(\\s*[-_–]?\\s*7[\\.\\s]*12.*)|(\\s*[-_–]?\\s*मदत.*)|(\\s*[-_–]?\\s*मदद.*)|(\\s*[-_–]?\\s*मदध.*)|(\\s*[-_–]?\\s*तपसण.*)|(\\s*[-_–]?\\s*तपासणी.*)|(\\s*[-_–]?\\s*महसल\\s*अधकर.*)|(\\s*[-_–]?\\s*अभलख.*)|(\\s*[-_–]?\\s*सतबर.*)|(\\s*[-_–]?\\s*अधकर सच.*)', '', 'gi'))
    WHERE village_name ~ '(\\d+|[०-९]+)\\s*त|7[\\.\\s]*12|तपसण|मदद|मदध|मदत';
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE prapatra_rollups
    SET village_name = TRIM(REGEXP_REPLACE(village_name, '(\\s*[-_–]?\\s*(\\d+|[०-९]+)\\s*त\\s*(\\d+|[०-९]+).*)|(\\s*[-_–]?\\s*7[\\.\\s]*12.*)|(\\s*[-_–]?\\s*मदत.*)|(\\s*[-_–]?\\s*मदद.*)|(\\s*[-_–]?\\s*मदध.*)|(\\s*[-_–]?\\s*तपसण.*)|(\\s*[-_–]?\\s*तपासणी.*)|(\\s*[-_–]?\\s*महसल\\s*अधकर.*)|(\\s*[-_–]?\\s*अभलख.*)|(\\s*[-_–]?\\s*सतबर.*)|(\\s*[-_–]?\\s*अधकर सच.*)', '', 'gi'))
    WHERE village_name ~ '(\\d+|[०-९]+)\\s*त|7[\\.\\s]*12|तपसण|मदद|मदध|मदत' AND village_name != 'संपूर्ण तालुका (All Villages)';
  `);

  console.log('🎉 Polish complete!');
  await prisma.$disconnect();
}

runFast().catch(err => {
  console.error('Error during fast polish:', err);
  process.exit(1);
});

import prisma from '../config/prisma.js';

/**
 * Normalizes Gat & Hissa strings into a standardized comparison key
 * e.g. " 14 / 2 " -> "14/2", "042" -> "42"
 */
export const normalizeGatKey = (gat, hissa) => {
  const g = String(gat || '').trim().replace(/\s+/g, '');
  const h = String(hissa || '').trim().replace(/\s+/g, '');
  if (!g) return '';
  // Guard against Excel-converted date strings
  if (/^(mon|tue|wed|thu|fri|sat|sun)/i.test(g) || g.includes('GMT') || g.includes('00:00:00')) {
    return '';
  }
  if (h && h !== '0' && h !== 'null' && !g.includes('/')) {
    return `${g}/${h}`;
  }
  return g;
};

/**
 * Maps tenure string to Prisma TenureClass enum
 */
export const mapTenureToEnum = (tenureRaw, fallback = 'BHOGVATDAR_CLASS_1') => {
  if (!tenureRaw) return fallback;
  const s = String(tenureRaw).toUpperCase();
  if (s.includes('CLASS_1') || s.includes('वर्ग-१') || s.includes('वर्ग 1') || s.includes('१')) return 'BHOGVATDAR_CLASS_1';
  if (s.includes('CLASS_2') || s.includes('वर्ग-२') || s.includes('वर्ग 2') || s.includes('२')) return 'BHOGVATDAR_CLASS_2';
  if (s.includes('SARKAR') || s.includes('SHASAN') || s.includes('शासकीय') || s.includes('शासन')) return 'SARKAR_SHASAN';
  if (s.includes('DEVASTHAN') || s.includes('INAM') || s.includes('देवस्थान') || s.includes('इनाम')) return 'DEVASTHAN_INAM';
  if (s.includes('FOREST') || s.includes('JANGAL') || s.includes('वन')) return 'FOREST_JANGAL';
  return fallback;
};

/**
 * Deep inspection of incoming sheet rows vs existing database parcels
 * Computes Unchanged (Duplicates), Modified (Updated fields), Net-New, and Omitted rows.
 */
export const inspectVillageDiff = async (incomingParcels, targetTaluka, targetVillage) => {
  if (!incomingParcels || !Array.isArray(incomingParcels)) {
    throw new Error('Valid parsed parcels array is required for diff inspection');
  }

  // 1. Fetch existing parcels from DB for this taluka & village
  const dbParcels = await prisma.landParcel.findMany({
    where: {
      taluka: { equals: targetTaluka, mode: 'insensitive' },
      villageName: { equals: targetVillage, mode: 'insensitive' }
    },
    select: {
      id: true,
      upi: true,
      gatNumber: true,
      hissaNumber: true,
      totalAreaHa: true,
      tenureClass: true,
      hasActiveDispute: true,
      metadata: true,
      forwardCases: {
        select: { id: true, caseNumber: true, violationType: true, status: true }
      }
    }
  });

  // Map existing DB parcels by normalized Gat key
  // Supports multi-row gats by storing an array per key
  const dbGatMap = new Map();
  for (const dbP of dbParcels) {
    const key = normalizeGatKey(dbP.gatNumber, dbP.hissaNumber);
    if (!dbGatMap.has(key)) {
      dbGatMap.set(key, []);
    }
    dbGatMap.get(key).push(dbP);
  }

  const matchedDbParcelIds = new Set();
  const unchangedRows = [];
  const modifiedRows = [];
  const netNewRows = [];
  const intraFileDuplicates = [];
  const seenIncomingGats = new Set();

  for (let idx = 0; idx < incomingParcels.length; idx++) {
    const p = incomingParcels[idx];
    const incomingKey = normalizeGatKey(p.gatNumber, p.hissaNumber);
    if (!incomingKey) {
      continue; // Skip invalid or date-converted header rows
    }

    if (seenIncomingGats.has(incomingKey)) {
      intraFileDuplicates.push({
        rowNumber: idx + 1,
        gatNumber: p.gatNumber,
        ownerName: p.ownerName
      });
    }
    seenIncomingGats.add(incomingKey);

    const candidates = dbGatMap.get(incomingKey);

    if (!candidates || candidates.length === 0) {
      // Net-new parcel
      netNewRows.push({
        rowNumber: idx + 1,
        gatNumber: p.gatNumber,
        totalAreaHa: p.totalAreaHa,
        tenureClass: p.tenureClass,
        ownerName: p.ownerName,
        hasDispute: Boolean(p.flags?.isShartbhang || p.flags?.isEncroached || p.flags?.isTribal || p.flags?.isPokalist)
      });
      continue;
    }

    // Match candidate: find best candidate not yet matched
    let matchedCandidate = candidates.find(c => !matchedDbParcelIds.has(c.id));
    if (!matchedCandidate) {
      // All existing DB parcels for this Gat are already matched to prior rows -> treat this as extra net-new
      netNewRows.push({
        rowNumber: idx + 1,
        gatNumber: p.gatNumber,
        totalAreaHa: p.totalAreaHa,
        tenureClass: p.tenureClass,
        ownerName: p.ownerName,
        hasDispute: Boolean(p.flags?.isShartbhang || p.flags?.isEncroached || p.flags?.isTribal || p.flags?.isPokalist),
        subShareNote: 'Additional sub-share or co-owner row'
      });
      continue;
    }

    matchedDbParcelIds.add(matchedCandidate.id);

    // Deep compare fields
    const diffs = [];
    const dbArea = Number(matchedCandidate.totalAreaHa || 0);
    const inArea = Number(p.totalAreaHa || 0);
    if (Math.abs(dbArea - inArea) > 0.001) {
      diffs.push({ field: 'totalAreaHa', label: 'क्षेत्र (हेक्टर)', old: dbArea, new: inArea });
    }

    if (matchedCandidate.tenureClass !== p.tenureClass) {
      diffs.push({ field: 'tenureClass', label: 'भोगवटा वर्ग', old: matchedCandidate.tenureClass, new: p.tenureClass });
    }

    const inDispute = Boolean(p.flags?.isShartbhang || p.flags?.isEncroached || p.flags?.isTribal || p.flags?.isPokalist);
    if (matchedCandidate.hasActiveDispute !== inDispute) {
      diffs.push({ field: 'hasActiveDispute', label: 'तक्रार / उल्लंघन', old: matchedCandidate.hasActiveDispute, new: inDispute });
    }

    const dbOwner = String(matchedCandidate.metadata?.ownerName || '').trim();
    const inOwner = String(p.ownerName || '').trim();
    if (dbOwner && inOwner && dbOwner !== inOwner && dbOwner !== 'खातेदार तपशील' && inOwner !== 'खातेदार तपशील') {
      diffs.push({ field: 'ownerName', label: 'खातेदाराचे नाव', old: dbOwner, new: inOwner });
    }

    if (diffs.length > 0) {
      modifiedRows.push({
        rowNumber: idx + 1,
        parcelId: matchedCandidate.id,
        upi: matchedCandidate.upi,
        gatNumber: p.gatNumber,
        diffs,
        linkedCasesCount: matchedCandidate.forwardCases?.length || 0
      });
    } else {
      unchangedRows.push({
        rowNumber: idx + 1,
        parcelId: matchedCandidate.id,
        upi: matchedCandidate.upi,
        gatNumber: p.gatNumber,
        ownerName: p.ownerName,
        totalAreaHa: dbArea,
        tenureClass: matchedCandidate.tenureClass
      });
    }
  }

  // Find omitted DB parcels (in DB but missing from the newly uploaded sheet)
  const omittedRows = dbParcels
    .filter(dbP => !matchedDbParcelIds.has(dbP.id))
    .map(dbP => ({
      parcelId: dbP.id,
      upi: dbP.upi,
      gatNumber: dbP.gatNumber,
      totalAreaHa: Number(dbP.totalAreaHa || 0),
      tenureClass: dbP.tenureClass,
      ownerName: dbP.metadata?.ownerName || 'अज्ञात'
    }));

  return {
    villageName: targetVillage,
    taluka: targetTaluka,
    stats: {
      totalInSheet: incomingParcels.length,
      totalInDb: dbParcels.length,
      unchangedCount: unchangedRows.length,
      modifiedCount: modifiedRows.length,
      netNewCount: netNewRows.length,
      omittedCount: omittedRows.length,
      intraFileDuplicatesCount: intraFileDuplicates.length
    },
    unchangedRows,
    modifiedRows,
    netNewRows,
    omittedRows,
    intraFileDuplicates
  };
};

/**
 * Idempotent Reconcile and Seed Execution
 * Updates modified parcels without dropping foreign keys, inserts net-new parcels,
 * preserves unchanged records, and syncs PrapatraRollup.
 */
export const reconcileAndSeedVillage = async ({
  parcels,
  stats,
  targetTaluka,
  finalVillage,
  villageCode
}) => {
  const talukaPrefix = targetTaluka.slice(0, 3).toUpperCase();

  // 1. Run Pre-flight Diff
  const diffResult = await inspectVillageDiff(parcels, targetTaluka, finalVillage);

  // 2. Fetch existing parcels map for quick update access
  const existingParcels = await prisma.landParcel.findMany({
    where: {
      taluka: { equals: targetTaluka, mode: 'insensitive' },
      villageName: { equals: finalVillage, mode: 'insensitive' }
    },
    select: { id: true, upi: true, gatNumber: true, hissaNumber: true }
  });
  const parcelIdToExisting = new Map(existingParcels.map(p => [p.id, p]));

  let updatedParcelsCount = 0;
  let newParcelsCount = 0;
  let casesCreatedCount = 0;
  let backwardCreatedCount = 0;

  // 3. Batch Update MODIFIED parcels
  for (const m of diffResult.modifiedRows) {
    const incoming = parcels[m.rowNumber - 1];
    if (!incoming) continue;

    const hasDispute = Boolean(
      incoming.flags?.isShartbhang ||
      incoming.flags?.isEncroached ||
      incoming.flags?.isTribal ||
      incoming.flags?.isPokalist
    );

    await prisma.landParcel.update({
      where: { id: m.parcelId },
      data: {
        totalAreaHa: incoming.totalAreaHa,
        tenureClass: incoming.tenureClass,
        hasActiveDispute: hasDispute,
        metadata: {
          ownerName: incoming.ownerName,
          otherRights: incoming.otherRights,
          agriAreaHa: incoming.agriAreaHa || incoming.totalAreaHa,
          naAreaSqM: incoming.naAreaSqM || 0,
          subTypeCategory: incoming.subTypeCategory || null,
          auditPoints: incoming.auditPoints || {},
          flags: incoming.flags,
          lastReconciledAt: new Date().toISOString()
        }
      }
    });
    updatedParcelsCount++;

    // Check if new enforcement case should be generated for newly flagged violation
    if (incoming.flags?.isShartbhang || incoming.flags?.isEncroached || incoming.flags?.isTribal || incoming.flags?.isPokalist) {
      const existingCase = await prisma.forwardEnforcementCase.findFirst({
        where: { parcelId: m.parcelId }
      });
      if (!existingCase) {
        const safeGatDash = String(m.gatNumber).replace(/[\/\\ ]/g, '-');
        const vType = incoming.flags?.isEncroached ? 'ENCROACHMENT' :
                      incoming.flags?.isTribal ? 'TRIBAL_LAND_VIOLATION' :
                      incoming.flags?.isShartbhang ? 'SHARTBHANG' : 'POKALIST_NONDI';
        await prisma.forwardEnforcementCase.create({
          data: {
            parcelId: m.parcelId,
            caseNumber: `${vType.slice(0, 3)}/${talukaPrefix}/${villageCode}/${safeGatDash}`,
            violationType: vType,
            status: 'FLAGGED_IN_AUDIT',
            encroachedAreaHa: incoming.totalAreaHa,
            occupantName: incoming.ownerName || 'नोंदविलेला खातेदार',
            prapatraCategory: 'प्रपत्र ५/९ तपासणी',
            investigatingOfficer: `तहसीलदार ${targetTaluka}`
          }
        });
        casesCreatedCount++;
      }
    }
  }

  // 4. Batch Insert NET_NEW parcels
  if (diffResult.netNewRows.length > 0) {
    const netNewParcelData = [];
    const forwardCaseList = [];
    const backwardHistoryList = [];

    // To prevent UPI collisions, determine max existing index for this village
    const existingCount = existingParcels.length;

    for (let i = 0; i < diffResult.netNewRows.length; i++) {
      const nr = diffResult.netNewRows[i];
      const p = parcels[nr.rowNumber - 1];
      if (!p) continue;

      const safeGat = String(p.gatNumber || (existingCount + i + 1)).replace(/[^0-9a-zA-Z]/g, '-').slice(0, 16);
      const safeHissa = String(p.hissaNumber || '00').replace(/[^0-9a-zA-Z]/g, '-').slice(0, 8);
      const upi = `MH-CHA-${talukaPrefix}-${villageCode}-${safeGat}-${safeHissa}-${Date.now().toString().slice(-4)}${i + 1}`.slice(0, 64);

      netNewParcelData.push({
        upi,
        district: 'Chandrapur',
        taluka: targetTaluka,
        revenueCircle: `मंडळ ${finalVillage.slice(0, 20)}`,
        villageCode,
        villageName: finalVillage,
        oldSurveyNo: p.oldSurveyNo || null,
        gatNumber: p.gatNumber,
        hissaNumber: p.hissaNumber || null,
        totalAreaHa: p.totalAreaHa,
        tenureClass: p.tenureClass,
        hasActiveDispute: Boolean(p.flags?.isShartbhang || p.flags?.isEncroached || p.flags?.isTribal || p.flags?.isPokalist),
        metadata: {
          ownerName: p.ownerName,
          otherRights: p.otherRights,
          agriAreaHa: p.agriAreaHa || p.totalAreaHa,
          naAreaSqM: p.naAreaSqM || 0,
          subTypeCategory: p.subTypeCategory || null,
          auditPoints: p.auditPoints || {},
          flags: p.flags
        }
      });
    }

    // Insert new parcels in chunks of 500
    const CHUNK_SIZE = 500;
    for (let c = 0; c < netNewParcelData.length; c += CHUNK_SIZE) {
      const chunk = netNewParcelData.slice(c, c + CHUNK_SIZE);
      await prisma.landParcel.createMany({
        data: chunk,
        skipDuplicates: true
      });
    }
    newParcelsCount = netNewParcelData.length;

    // Fetch newly created parcel IDs for relational seeding
    const newUpis = netNewParcelData.map(np => np.upi);
    const createdDbParcels = await prisma.landParcel.findMany({
      where: { upi: { in: newUpis } },
      select: { id: true, upi: true, gatNumber: true, totalAreaHa: true, villageCode: true }
    });
    const upiToNewParcel = new Map(createdDbParcels.map(p => [p.upi, p]));

    for (let i = 0; i < diffResult.netNewRows.length; i++) {
      const nr = diffResult.netNewRows[i];
      const p = parcels[nr.rowNumber - 1];
      const npData = netNewParcelData[i];
      if (!p || !npData) continue;

      const dbP = upiToNewParcel.get(npData.upi);
      if (!dbP) continue;

      const safeGatDash = String(dbP.gatNumber).replace(/[\/\\ ]/g, '-');

      if (p.flags?.isEncroached) {
        forwardCaseList.push({
          parcelId: dbP.id,
          caseNumber: `ENC/${talukaPrefix}/${dbP.villageCode}/${safeGatDash}`,
          violationType: 'ENCROACHMENT',
          status: 'FLAGGED_IN_AUDIT',
          encroachedAreaHa: dbP.totalAreaHa,
          occupantName: p.ownerName || 'नोंदविलेला अतिक्रमक',
          prapatraCategory: 'प्रपत्र ५ (अतिक्रमण)',
          investigatingOfficer: `तहसीलदार ${targetTaluka}`
        });
      } else if (p.flags?.isTribal && (p.flags?.isShartbhang || p.flags?.isIllegalDeletion)) {
        forwardCaseList.push({
          parcelId: dbP.id,
          caseNumber: `TRB/${talukaPrefix}/${dbP.villageCode}/${safeGatDash}`,
          violationType: 'TRIBAL_LAND_VIOLATION',
          status: 'NOTICE_ISSUED',
          encroachedAreaHa: dbP.totalAreaHa,
          occupantName: p.ownerName || 'आदिवासी जमीन हस्तांतरण',
          prapatraCategory: 'प्रपत्र ८ (आदिवासी जमीन)',
          investigatingOfficer: `उपविभागीय अधिकारी (SDO) ${targetTaluka}`
        });
      } else if (p.flags?.isShartbhang) {
        forwardCaseList.push({
          parcelId: dbP.id,
          caseNumber: `SHT/${talukaPrefix}/${dbP.villageCode}/${safeGatDash}`,
          violationType: 'SHARTBHANG',
          status: 'FLAGGED_IN_AUDIT',
          encroachedAreaHa: dbP.totalAreaHa,
          occupantName: p.ownerName || 'पट्टेदार / भोगवटदार',
          prapatraCategory: 'प्रपत्र ६/७ (शर्तभंग)',
          investigatingOfficer: `अप्पर तहसीलदार ${targetTaluka}`
        });
      } else if (p.flags?.isPokalist) {
        forwardCaseList.push({
          parcelId: dbP.id,
          caseNumber: `POK/${talukaPrefix}/${dbP.villageCode}/${safeGatDash}`,
          violationType: 'POKALIST_NONDI',
          status: 'FLAGGED_IN_AUDIT',
          encroachedAreaHa: dbP.totalAreaHa,
          occupantName: p.ownerName || 'पोकळीस्त खातेदार',
          prapatraCategory: 'प्रपत्र ९ (पोकळीस्त नोंदी)',
          investigatingOfficer: `मंडळ / नायब तहसीलदार`
        });
      }

      // Initial 1950 Provenance Milestone
      const bk = p.backward || {};
      const set1950 = bk.settlement1950 || {};
      const b1950Owner = set1950.owner || (p.flags?.isGovt ? 'शासकीय जमीन (Sarkar)' : (p.ownerName || 'मूळ खातेदार'));
      const b1950Tenure = mapTenureToEnum(set1950.tenure, p.flags?.isGovt ? 'SARKAR_SHASAN' : (p.tenureClass || 'BHOGVATDAR_CLASS_1'));
      const b1950No = set1950.no || dbP.gatNumber || '1';

      backwardHistoryList.push({
        parcelId: dbP.id,
        epochYear: 1950,
        recordDate: new Date('1950-06-15'),
        ferfarNumber: `F-1950-${String(b1950No).slice(0, 30)}`,
        ownerName: String(b1950Owner).slice(0, 240),
        khataNumber: `K-${String(b1950No).slice(0, 30)}`,
        areaHa: dbP.totalAreaHa,
        tenureClass: b1950Tenure,
        wasGovtLand: Boolean(p.flags?.isGovt || p.flags?.isIllegalDeletion || b1950Tenure === 'SARKAR_SHASAN'),
        mutationType: p.flags?.isGovt ? 'शासन जमा नोंद' : 'मूळ बंदोबस्त नोंद',
        remarks: 'स्वातंत्र्योत्तर बंदोबस्त अभिलेख नोंद (Baseline Record)'
      });
    }

    if (forwardCaseList.length > 0) {
      for (let c = 0; c < forwardCaseList.length; c += CHUNK_SIZE) {
        const chunk = forwardCaseList.slice(c, c + CHUNK_SIZE);
        const created = await prisma.forwardEnforcementCase.createMany({
          data: chunk,
          skipDuplicates: true
        });
        casesCreatedCount += created.count;
      }
    }

    if (backwardHistoryList.length > 0) {
      for (let c = 0; c < backwardHistoryList.length; c += CHUNK_SIZE) {
        const chunk = backwardHistoryList.slice(c, c + CHUNK_SIZE);
        const created = await prisma.backwardHistory.createMany({
          data: chunk,
          skipDuplicates: true
        });
        backwardCreatedCount += created.count;
      }
    }
  }

  // 5. Recalculate and Upsert village PrapatraRollup based on final unified DB state
  const totalParcelsInVillage = await prisma.landParcel.count({
    where: {
      taluka: { equals: targetTaluka, mode: 'insensitive' },
      villageName: { equals: finalVillage, mode: 'insensitive' }
    }
  });

  const govtParcelsCount = await prisma.landParcel.count({
    where: {
      taluka: { equals: targetTaluka, mode: 'insensitive' },
      villageName: { equals: finalVillage, mode: 'insensitive' },
      tenureClass: 'SARKAR_SHASAN'
    }
  });

  const shartbhangCount = await prisma.forwardEnforcementCase.count({
    where: {
      landParcel: {
        taluka: { equals: targetTaluka, mode: 'insensitive' },
        villageName: { equals: finalVillage, mode: 'insensitive' }
      },
      violationType: 'SHARTBHANG'
    }
  });

  const encroachedCount = await prisma.forwardEnforcementCase.count({
    where: {
      landParcel: {
        taluka: { equals: targetTaluka, mode: 'insensitive' },
        villageName: { equals: finalVillage, mode: 'insensitive' }
      },
      violationType: 'ENCROACHMENT'
    }
  });

  const rollupRecord = await prisma.prapatraRollup.upsert({
    where: {
      idx_prapatra_rollup_unique: {
        district: 'Chandrapur',
        taluka: targetTaluka,
        villageName: finalVillage
      }
    },
    create: {
      district: 'Chandrapur',
      taluka: targetTaluka,
      villageName: finalVillage,
      total712Count: Math.max(stats.total712 || 0, totalParcelsInVillage),
      inspected1950Count: stats.inspected1950 || totalParcelsInVillage,
      govtFound1950Count: stats.govt1950 || govtParcelsCount,
      illegalDeletionsCount: stats.illegalDel || 0,
      pokalistCount: stats.pokalist || 0,
      totalGovtLandCount: govtParcelsCount,
      govtShartbhangCount: shartbhangCount,
      govtEncroachedCount: encroachedCount,
      remarks: '१ ते ४५ मुद्देनिहाय सुरक्षित रिकन्सिलिएशन अपडेट'
    },
    update: {
      total712Count: Math.max(stats.total712 || 0, totalParcelsInVillage),
      inspected1950Count: stats.inspected1950 || totalParcelsInVillage,
      govtFound1950Count: stats.govt1950 || govtParcelsCount,
      illegalDeletionsCount: stats.illegalDel || 0,
      pokalistCount: stats.pokalist || 0,
      totalGovtLandCount: govtParcelsCount,
      govtShartbhangCount: shartbhangCount,
      govtEncroachedCount: encroachedCount,
      remarks: '१ ते ४५ मुद्देनिहाय सुरक्षित रिकन्सिलिएशन अपडेट'
    }
  });

  return {
    diffResult,
    executionSummary: {
      unchangedPreserved: diffResult.stats.unchangedCount,
      modifiedUpdated: updatedParcelsCount,
      netNewSeeded: newParcelsCount,
      omittedWarning: diffResult.stats.omittedCount,
      totalParcelsInDb: totalParcelsInVillage,
      casesCreated: casesCreatedCount,
      backwardCreated: backwardCreatedCount
    },
    rollup: rollupRecord
  };
};

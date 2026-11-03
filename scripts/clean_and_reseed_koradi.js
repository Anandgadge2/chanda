/**
 * Database Cleanup & Re-seeding / Reconciliation Script for Koradi Village
 * Chandrapur Land Governance & Revenue Portal
 * 
 * Objectives:
 * 1. Remove 5 stale ghost duplicate records in PostgreSQL (LandParcel table) with trailing dots (1/1., 1/2., 4/1., 4/2., 11/1.).
 * 2. Parse canonical spreadsheet data/all_talukas_raw/Korpana/32_करड.xlsx using fixed prapatraParserJs.
 * 3. Reconcile and update all 145 LandParcel records in Neon PostgreSQL:
 *    - Exactly 145 parcels (0 trailing dot records)
 *    - Column F -> tenureCategory ('भो.व-1', 'भो.व-2') & tenureClass (BHOGVATDAR_CLASS_1, BHOGVATDAR_CLASS_2, SARKAR_SHASAN)
 *    - Column G -> currentOwner / occupant names (NOT tenure codes)
 *    - Column H -> otherRights (NOT occupant names)
 *    - metadata.srNo -> 1..145 (Survey 1/1 at srNo 1, Survey 1/2 at srNo 2, Survey 100 at srNo 145)
 * 4. Update PrapatraRollup: total712Count = 145, inspected1950Count = 145.
 */

import path from 'path';
import prisma from '../backend/src/config/prisma.js';
import { parsePrapatraBuffer } from '../backend/src/parsers/prapatraParserJs.js';
import { normalizeGatKey } from '../backend/src/services/prapatraReconciliationService.js';

async function main() {
  console.log('================================================================');
  console.log(' Starting Database Cleanup & Re-seeding for Koradi Village');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // STEP 1: Identify and Clean Up 5 Stale Ghost Records with Trailing Dots
  // -------------------------------------------------------------
  const ghostGats = ['1/1.', '1/2.', '4/1.', '4/2.', '11/1.'];
  console.log(`Step 1: Searching for ghost duplicate records (${ghostGats.join(', ')})...`);

  const ghosts = await prisma.landParcel.findMany({
    where: {
      taluka: { equals: 'Korpana', mode: 'insensitive' },
      villageName: { contains: 'कोराडी' },
      OR: [
        { gatNumber: { in: ghostGats } },
        { gatNumber: { endsWith: '.' } }
      ]
    },
    select: { id: true, upi: true, gatNumber: true, totalAreaHa: true, createdAt: true }
  });

  console.log(`Found ${ghosts.length} ghost records to remove:`);
  for (const g of ghosts) {
    console.log(`  - ID: ${g.id} | Gat: ${g.gatNumber} | Area: ${g.totalAreaHa} | Created: ${g.createdAt.toISOString()}`);
  }

  if (ghosts.length > 0) {
    const ghostIds = ghosts.map(g => g.id);
    
    // Delete backward histories for ghosts if not already cascaded
    const delBk = await prisma.backwardHistory.deleteMany({
      where: { parcelId: { in: ghostIds } }
    });
    console.log(`  Deleted ${delBk.count} associated backward histories.`);

    // Delete forward enforcement cases for ghosts if any
    const delCases = await prisma.forwardEnforcementCase.deleteMany({
      where: { parcelId: { in: ghostIds } }
    });
    console.log(`  Deleted ${delCases.count} associated forward cases.`);

    // Delete the ghost LandParcel records
    const delParcels = await prisma.landParcel.deleteMany({
      where: { id: { in: ghostIds } }
    });
    console.log(`  Deleted ${delParcels.count} ghost LandParcel records.`);
  }

  // Verify remaining DB parcels count
  const postGhostCount = await prisma.landParcel.count({
    where: {
      taluka: { equals: 'Korpana', mode: 'insensitive' },
      villageName: { contains: 'कोराडी' }
    }
  });
  console.log(`\nRemaining LandParcel records for Koradi village: ${postGhostCount}`);

  // -------------------------------------------------------------
  // STEP 2: Parse Canonical Spreadsheet
  // -------------------------------------------------------------
  console.log('\nStep 2: Parsing canonical spreadsheet data/all_talukas_raw/Korpana/32_करड.xlsx...');
  const filePath = path.resolve('data/all_talukas_raw/Korpana/32_करड.xlsx');
  const parseResult = await parsePrapatraBuffer(filePath, 'Korpana', '32_करड.xlsx');

  const sheetParcels = parseResult.parcels;
  console.log(`  Parsed ${sheetParcels.length} parcels from spreadsheet.`);

  if (sheetParcels.length !== 145) {
    throw new Error(`Expected exactly 145 parcels in canonical spreadsheet, got ${sheetParcels.length}`);
  }

  // -------------------------------------------------------------
  // STEP 3: Reconcile and Update 145 Database Records
  // -------------------------------------------------------------
  console.log('\nStep 3: Matching and updating 145 LandParcel records in Neon PostgreSQL...');

  const dbParcels = await prisma.landParcel.findMany({
    where: {
      taluka: { equals: 'Korpana', mode: 'insensitive' },
      villageName: { contains: 'कोराडी' }
    },
    include: {
      backwardHistories: true
    }
  });

  const usedDbIds = new Set();
  const updatePromises = [];

  for (let idx = 0; idx < sheetParcels.length; idx++) {
    const sheetP = sheetParcels[idx];
    const targetSrNo = idx + 1; // 1..145
    const normGat = normalizeGatKey(sheetP.gatNumber);
    const sheetArea = Number(sheetP.totalAreaHa);
    const sheetOwnerSig = sheetP.ownerName.toLowerCase().replace(/[\s\.\,]/g, '').slice(0, 20);

    // Candidates in DB matching normalized Gat
    const candidates = dbParcels.filter(dbP => {
      if (usedDbIds.has(dbP.id)) return false;
      return normalizeGatKey(dbP.gatNumber) === normGat;
    });

    if (candidates.length === 0) {
      throw new Error(`No matching DB candidate found for sheet row ${targetSrNo} (Gat ${sheetP.gatNumber})`);
    }

    let matched = null;
    if (candidates.length === 1) {
      matched = candidates[0];
    } else {
      let bestScore = -1;
      for (const cand of candidates) {
        let score = 0;
        const candArea = Number(cand.totalAreaHa);
        if (Math.abs(candArea - sheetArea) < 0.001) {
          score += 10;
        }
        const oldRightsSig = String(cand.metadata?.otherRights || '').toLowerCase().replace(/[\s\.\,]/g, '');
        const oldOwnerSig = String(cand.metadata?.ownerName || '').toLowerCase().replace(/[\s\.\,]/g, '');
        if (sheetOwnerSig && (oldRightsSig.includes(sheetOwnerSig.slice(0, 10)) || oldOwnerSig.includes(sheetOwnerSig.slice(0, 10)))) {
          score += 20;
        }
        if (score > bestScore) {
          bestScore = score;
          matched = cand;
        }
      }
    }

    if (!matched) {
      throw new Error(`Failed to disambiguate candidates for sheet row ${targetSrNo} (Gat ${sheetP.gatNumber})`);
    }

    usedDbIds.add(matched.id);

    const hasDispute = Boolean(
      sheetP.flags?.isShartbhang ||
      sheetP.flags?.isEncroached ||
      sheetP.flags?.isTribal ||
      sheetP.flags?.isPokalist
    );

    // Clean normalized survey number without trailing period
    const cleanGatNumber = String(sheetP.gatNumber).replace(/\.+$/, '').trim();

    updatePromises.push((async () => {
      // 1. Update LandParcel
      await prisma.landParcel.update({
        where: { id: matched.id },
        data: {
          gatNumber: cleanGatNumber,
          totalAreaHa: sheetP.totalAreaHa,
          tenureClass: sheetP.tenureClass,
          hasActiveDispute: hasDispute,
          metadata: {
            srNo: targetSrNo,
            excelSrNo: targetSrNo,
            tenureCategory: sheetP.tenureCategory || (sheetP.tenureClass === 'BHOGVATDAR_CLASS_2' ? 'भो.व-2' : 'भो.व-1'),
            ownerName: sheetP.ownerName,
            otherRights: sheetP.otherRights,
            agriAreaHa: sheetP.agriAreaHa || sheetP.totalAreaHa,
            naAreaSqM: sheetP.naAreaSqM || 0,
            subTypeCategory: sheetP.subTypeCategory || null,
            auditPoints: sheetP.auditPoints || {},
            flags: sheetP.flags || {},
            lastReconciledAt: new Date().toISOString()
          }
        }
      });

      // 2. Fix backward histories tenureClass if corrupted (e.g. FOREST_JANGAL)
      if (matched.backwardHistories && matched.backwardHistories.length > 0) {
        for (const bk of matched.backwardHistories) {
          if (bk.tenureClass === 'FOREST_JANGAL' && sheetP.tenureClass !== 'FOREST_JANGAL') {
            await prisma.backwardHistory.update({
              where: { id: bk.id },
              data: {
                tenureClass: sheetP.tenureClass
              }
            });
          }
        }
      }
    })());
  }

  // Execute updates in batches of 25
  const BATCH_SIZE = 25;
  for (let b = 0; b < updatePromises.length; b += BATCH_SIZE) {
    const batch = updatePromises.slice(b, b + BATCH_SIZE);
    await Promise.all(batch.map(fn => fn));
    console.log(`  Updated ${Math.min(b + BATCH_SIZE, updatePromises.length)} / ${updatePromises.length} parcels...`);
  }

  console.log(`✓ All ${updatePromises.length} parcels successfully reconciled and updated.`);

  // -------------------------------------------------------------
  // STEP 4: Update PrapatraRollup for Koradi Village
  // -------------------------------------------------------------
  console.log('\nStep 4: Updating PrapatraRollup for Koradi village...');
  const rollup = await prisma.prapatraRollup.upsert({
    where: {
      idx_prapatra_rollup_unique: {
        district: 'Chandrapur',
        taluka: 'Korpana',
        villageName: 'कोराडी'
      }
    },
    create: {
      district: 'Chandrapur',
      taluka: 'Korpana',
      villageName: 'कोराडी',
      total712Count: 145,
      inspected1950Count: 145,
      govtFound1950Count: 1,
      illegalDeletionsCount: 0,
      pokalistCount: 0,
      totalGovtLandCount: 1,
      govtShartbhangCount: 0,
      govtEncroachedCount: 0,
      govtMojaniDoneCount: 1,
      remarks: '१ ते ४५ मुद्देनिहाय सुरक्षित रिकन्सिलिएशन अपडेट'
    },
    update: {
      total712Count: 145,
      inspected1950Count: 145,
      govtFound1950Count: 1,
      illegalDeletionsCount: 0,
      pokalistCount: 0,
      totalGovtLandCount: 1,
      govtShartbhangCount: 0,
      govtEncroachedCount: 0,
      govtMojaniDoneCount: 1,
      remarks: '१ ते ४५ मुद्देनिहाय सुरक्षित रिकन्सिलिएशन अपडेट'
    }
  });

  console.log(`✓ PrapatraRollup updated: total712Count=${rollup.total712Count}, inspected1950Count=${rollup.inspected1950Count}`);

  // -------------------------------------------------------------
  // STEP 5: Post-Reconciliation Verification
  // -------------------------------------------------------------
  console.log('\nStep 5: Running post-reconciliation verification...');

  const finalParcels = await prisma.landParcel.findMany({
    where: {
      taluka: { equals: 'Korpana', mode: 'insensitive' },
      villageName: { contains: 'कोराडी' }
    },
    orderBy: [{ gatNumber: 'asc' }]
  });

  console.log(`  1. Total LandParcel count: ${finalParcels.length} (Expected: 145)`);
  if (finalParcels.length !== 145) throw new Error(`Verification failed: DB parcel count is ${finalParcels.length}, expected 145`);

  const dottedFinal = finalParcels.filter(p => String(p.gatNumber).endsWith('.'));
  console.log(`  2. Trailing dot parcels count: ${dottedFinal.length} (Expected: 0)`);
  if (dottedFinal.length !== 0) throw new Error(`Verification failed: ${dottedFinal.length} dotted parcels remain`);

  const p1 = finalParcels.find(p => p.gatNumber === '1/1');
  console.log(`  3. Survey 1/1: srNo=${p1?.metadata?.srNo}, tenureClass=${p1?.tenureClass}, owner="${p1?.metadata?.ownerName.slice(0, 30)}...", rights="${p1?.metadata?.otherRights.slice(0, 30)}..."`);
  if (!p1 || p1.metadata?.srNo !== 1 || p1.tenureClass !== 'BHOGVATDAR_CLASS_2') {
    throw new Error('Verification failed for Survey 1/1');
  }

  const p2 = finalParcels.find(p => p.gatNumber === '1/2');
  console.log(`  4. Survey 1/2: srNo=${p2?.metadata?.srNo}, tenureClass=${p2?.tenureClass}, owner="${p2?.metadata?.ownerName.slice(0, 30)}..."`);
  if (!p2 || p2.metadata?.srNo !== 2 || p2.tenureClass !== 'BHOGVATDAR_CLASS_2') {
    throw new Error('Verification failed for Survey 1/2');
  }

  const p100 = finalParcels.find(p => p.gatNumber === '100');
  console.log(`  5. Survey 100: srNo=${p100?.metadata?.srNo}, tenureClass=${p100?.tenureClass}, owner="${p100?.metadata?.ownerName.slice(0, 30)}..."`);
  if (!p100 || p100.metadata?.srNo !== 145 || p100.tenureClass !== 'BHOGVATDAR_CLASS_2') {
    throw new Error('Verification failed for Survey 100');
  }

  const tenureDistribution = {};
  for (const p of finalParcels) {
    tenureDistribution[p.tenureClass] = (tenureDistribution[p.tenureClass] || 0) + 1;
  }
  console.log(`  6. Final tenureClass distribution in DB:`, tenureDistribution);
  if (tenureDistribution.BHOGVATDAR_CLASS_1 !== 64 || tenureDistribution.BHOGVATDAR_CLASS_2 !== 80 || tenureDistribution.SARKAR_SHASAN !== 1) {
    throw new Error(`Verification failed: tenure distribution does not match canonical (64 Class 1, 80 Class 2, 1 Sarkar)`);
  }

  console.log('\n================================================================');
  console.log(' DATABASE CLEANUP & RE-SEEDING COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

main()
  .catch((err) => {
    console.error('Execution failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

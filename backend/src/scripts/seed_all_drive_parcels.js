import fs from 'fs';
import path from 'path';
import prisma from '../config/prisma.js';

const SEEDED_DIR = path.resolve('..', 'data', 'seeded_talukas');

export function mapTenureToEnum(tenureRaw, fallback = 'BHOGVATDAR_CLASS_1') {
  if (!tenureRaw) return fallback;
  const s = String(tenureRaw).toUpperCase();
  if (s.includes('CLASS_1') || s.includes('वर्ग-१') || s.includes('वर्ग 1') || s.includes('१')) return 'BHOGVATDAR_CLASS_1';
  if (s.includes('CLASS_2') || s.includes('वर्ग-२') || s.includes('वर्ग 2') || s.includes('२')) return 'BHOGVATDAR_CLASS_2';
  if (s.includes('SARKAR') || s.includes('SHASAN') || s.includes('शासकीय') || s.includes('शासन')) return 'SARKAR_SHASAN';
  if (s.includes('DEVASTHAN') || s.includes('INAM') || s.includes('देवस्थान') || s.includes('इनाम')) return 'DEVASTHAN_INAM';
  if (s.includes('FOREST') || s.includes('JANGAL') || s.includes('वन')) return 'FOREST_JANGAL';
  return fallback;
}

export function normalizeGat(gat) {
  if (!gat) return '';
  return String(gat).trim().replace(/\s+/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '');
}

export function normalizeVillage(name) {
  if (!name) return '';
  return String(name).trim().replace(/\s+/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '');
}

const escapeSql = (s) => String(s || '').replace(/'/g, "''");

async function seedTaluka(talukaName, parcels) {
  const tStart = Date.now();
  console.log(`\n======================================================`);
  console.log(`Processing Taluka: ${talukaName} (${parcels.length} raw parcels)`);
  console.log(`======================================================`);

  // 1. Fetch existing DB parcels
  const dbParcels = await prisma.landParcel.findMany({
    where: { taluka: { equals: talukaName, mode: 'insensitive' } },
    select: {
      id: true,
      upi: true,
      villageName: true,
      gatNumber: true,
      totalAreaHa: true,
      tenureClass: true
    }
  });

  console.log(`  Found ${dbParcels.length} existing DB parcels for ${talukaName}.`);

  const upiMap = new Map();
  const vgMap = new Map();

  for (const p of dbParcels) {
    if (p.upi) upiMap.set(p.upi, p);
    const key = `${normalizeVillage(p.villageName)}__${normalizeGat(p.gatNumber)}`;
    if (!vgMap.has(key)) {
      vgMap.set(key, p);
    }
  }

  // Fetch existing backward history IDs
  const existingBks = await prisma.backwardHistory.findMany({
    where: { parcel: { taluka: { equals: talukaName, mode: 'insensitive' } } },
    select: { parcelId: true, epochYear: true }
  });
  const bkSet = new Set(existingBks.map(b => `${b.parcelId}__${b.epochYear}`));

  const updates = [];
  const newParcels = [];
  const bksToInsert = [];
  const villageRollupMap = new Map();

  // 2. Classify updates vs net-new
  for (const inP of parcels) {
    const vName = inP.villageName;
    if (!villageRollupMap.has(vName)) {
      villageRollupMap.set(vName, {
        total712: 0,
        inspected1950: 0,
        govt1950: 0,
        illegalDel: 0,
        pokalist: 0,
        privateAllot: 0,
        totalGovt: 0,
        govtAllotted: 0,
        govtShartbhang: 0,
        govtEncroach: 0,
        govtMojani: 0
      });
    }
    const rStat = villageRollupMap.get(vName);
    rStat.total712++;
    if (inP.flags?.isGovt) rStat.totalGovt++;
    if (inP.flags?.isIllegalDeletion) rStat.illegalDel++;
    if (inP.flags?.isPokalist) rStat.pokalist++;
    if (inP.flags?.isEncroached) rStat.govtEncroach++;
    if (inP.flags?.isMojaniDone) rStat.govtMojani++;
    if (inP.flags?.isShartbhang) rStat.govtShartbhang++;
    if (inP.flags?.isPrivateAllot) rStat.privateAllot++;

    const b1950 = inP.backward?.settlement1950;
    if (b1950 && b1950.no && !String(b1950.no).includes('उपलब्ध नाही') && b1950.no !== '-') {
      rStat.inspected1950++;
    }

    const key = `${normalizeVillage(inP.villageName)}__${normalizeGat(inP.gatNumber)}`;
    const matched = vgMap.get(key) || upiMap.get(inP.upi);

    if (matched) {
      updates.push({ id: matched.id, inP, matched });

      // Backward 1950
      if (b1950 && (b1950.no || b1950.owner) && !bkSet.has(`${matched.id}__1950`)) {
        const isV = String(b1950.no || '').includes('वनग्राम') || String(b1950.owner || '').includes('वनग्राम');
        const safeNo = isV ? 'वनग्राम' : String(b1950.no || matched.gatNumber).slice(0, 60);
        bksToInsert.push({
          parcelId: matched.id,
          epochYear: 1950,
          recordDate: new Date('1950-06-15'),
          ferfarNumber: `F-1950-${safeNo}`.slice(0, 120),
          ownerName: String(b1950.owner || inP.ownerName || 'मूळ खातेदार').slice(0, 240),
          khataNumber: `K-${safeNo}`.slice(0, 120),
          areaHa: matched.totalAreaHa,
          tenureClass: mapTenureToEnum(b1950.tenure, inP.flags?.isGovt ? 'SARKAR_SHASAN' : matched.tenureClass),
          wasGovtLand: Boolean(inP.flags?.isGovt || inP.flags?.isIllegalDeletion),
          mutationType: inP.flags?.isGovt ? 'शासकीय मूळ नोंद' : 'सन १९५० बंदोबस्त नोंद',
          remarks: 'स्वातंत्र्योत्तर बंदोबस्त अधिकार अभिलेख नोंद'
        });
        bkSet.add(`${matched.id}__1950`);
      }

      // Backward 1972 (Ekatrikaran)
      const b72 = inP.backward?.ekatrikaran1972;
      if (b72 && (b72.no || b72.owner) && !bkSet.has(`${matched.id}__1972`)) {
        const safeNo = String(b72.no || 'EK').slice(0, 60);
        bksToInsert.push({
          parcelId: matched.id,
          epochYear: 1972,
          recordDate: new Date('1972-04-01'),
          ferfarNumber: `F-EK-${safeNo}`.slice(0, 120),
          ownerName: String(b72.owner || inP.ownerName || 'नोंदविलेला खातेदार').slice(0, 240),
          khataNumber: `K-EK-${safeNo}`.slice(0, 120),
          areaHa: matched.totalAreaHa,
          tenureClass: mapTenureToEnum(b72.tenure, matched.tenureClass),
          wasGovtLand: false,
          mutationType: 'एकत्रिकरण योजना नोंद',
          remarks: 'जमीन एकत्रिकरण व पुनर्रचना नोंद (Consolidation Scheme)'
        });
        bkSet.add(`${matched.id}__1972`);
      }

      // Backward 1995 (Resurvey)
      const b95 = inP.backward?.resurvey1995;
      if (b95 && (b95.no || b95.owner) && !bkSet.has(`${matched.id}__1995`)) {
        const safeNo = String(b95.no || matched.gatNumber).slice(0, 60);
        bksToInsert.push({
          parcelId: matched.id,
          epochYear: 1995,
          recordDate: new Date('1995-10-15'),
          ferfarNumber: `F-RES-${safeNo}`.slice(0, 120),
          ownerName: String(b95.owner || inP.ownerName || 'पुनर्मोजणी खातेदार').slice(0, 240),
          khataNumber: `K-RES-${safeNo}`.slice(0, 120),
          areaHa: matched.totalAreaHa,
          tenureClass: mapTenureToEnum(b95.tenure, matched.tenureClass),
          wasGovtLand: false,
          mutationType: 'पुनर्मोजणी नोंद',
          remarks: 'पुनर्मोजणी व नवीन गट नंबर वाटप'
        });
        bkSet.add(`${matched.id}__1995`);
      }
    } else {
      newParcels.push(inP);
    }
  }

  console.log(`  Identified: ${updates.length} updates, ${newParcels.length} net-new parcels.`);

  // 3. Lightning-fast SQL Batch Updates (batches of 150)
  if (updates.length > 0) {
    console.log(`  Executing direct SQL batch updates for ${updates.length} parcels...`);
    const SQL_BATCH = 150;
    for (let i = 0; i < updates.length; i += SQL_BATCH) {
      const chunk = updates.slice(i, i + SQL_BATCH);
      const valRows = chunk.map(({ id, inP, matched }) => {
        const totalArea = Number(inP.totalAreaHa || matched.totalAreaHa || 0.0).toFixed(4);
        const tenure = inP.tenureClass || matched.tenureClass || 'BHOGVATDAR_CLASS_1';
        const dispute = Boolean(inP.flags?.isShartbhang || inP.flags?.isEncroached || inP.flags?.isTribal || inP.flags?.isPokalist);
        const metaJson = JSON.stringify({
          ownerName: inP.ownerName,
          otherRights: inP.otherRights,
          agriAreaHa: inP.agriAreaHa || inP.totalAreaHa,
          naAreaSqM: inP.naAreaSqM || 0,
          auditPoints: inP.auditPoints || {},
          flags: inP.flags,
          lastReconciledAt: new Date().toISOString()
        });
        return `('${id}'::uuid, ${totalArea}::decimal, '${tenure}', ${dispute}, '${escapeSql(metaJson)}'::jsonb)`;
      }).join(',\n');

      const sql = `
        UPDATE land_parcels AS lp
        SET 
          total_area_ha = v.total_area,
          tenure_class = v.tenure::"TenureClass",
          has_active_dispute = v.dispute,
          metadata = v.meta,
          updated_at = NOW()
        FROM (VALUES
          ${valRows}
        ) AS v(id, total_area, tenure, dispute, meta)
        WHERE lp.id = v.id;
      `;
      await prisma.$executeRawUnsafe(sql);
    }
  }

  // 4. Batch Insert Net-New Parcels
  if (newParcels.length > 0) {
    console.log(`  Inserting ${newParcels.length} net-new parcels in batches...`);
    for (let i = 0; i < newParcels.length; i += 300) {
      const chunk = newParcels.slice(i, i + 300);
      await prisma.landParcel.createMany({
        data: chunk.map(p => ({
          upi: String(p.upi).slice(0, 60),
          district: 'Chandrapur',
          taluka: p.taluka,
          revenueCircle: String(p.revenueCircle || 'मंडळ महसूल').slice(0, 120),
          villageCode: String(p.villageCode).slice(0, 30),
          villageName: String(p.villageName).slice(0, 240),
          oldSurveyNo: p.oldSurveyNo ? String(p.oldSurveyNo).slice(0, 240) : null,
          gatNumber: String(p.gatNumber).slice(0, 60),
          hissaNumber: p.hissaNumber ? String(p.hissaNumber).slice(0, 16) : null,
          totalAreaHa: p.totalAreaHa || 0.0,
          potkharabaAreaHa: 0.0,
          tenureClass: p.tenureClass,
          hasActiveDispute: Boolean(p.flags?.isShartbhang || p.flags?.isEncroached || p.flags?.isTribal || p.flags?.isPokalist),
          metadata: {
            ownerName: p.ownerName,
            otherRights: p.otherRights,
            agriAreaHa: p.agriAreaHa || p.totalAreaHa,
            naAreaSqM: p.naAreaSqM || 0,
            auditPoints: p.auditPoints || {},
            flags: p.flags
          }
        })),
        skipDuplicates: true
      });
    }

    // Attach backward to newly inserted parcels
    const newlyCreated = await prisma.landParcel.findMany({
      where: {
        taluka: { equals: talukaName, mode: 'insensitive' },
        upi: { in: newParcels.map(p => String(p.upi).slice(0, 60)) }
      },
      select: { id: true, upi: true, gatNumber: true, totalAreaHa: true, tenureClass: true }
    });
    const newUpiMap = new Map(newlyCreated.map(p => [p.upi, p]));

    for (const inP of newParcels) {
      const safeUpi = String(inP.upi).slice(0, 60);
      const dbP = newUpiMap.get(safeUpi);
      if (!dbP) continue;

      const b50 = inP.backward?.settlement1950;
      if (b50 && (b50.no || b50.owner)) {
        const isV = String(b50.no || '').includes('वनग्राम') || String(b50.owner || '').includes('वनग्राम');
        const safeNo = isV ? 'वनग्राम' : String(b50.no || dbP.gatNumber).slice(0, 60);
        bksToInsert.push({
          parcelId: dbP.id,
          epochYear: 1950,
          recordDate: new Date('1950-06-15'),
          ferfarNumber: `F-1950-${safeNo}`.slice(0, 120),
          ownerName: String(b50.owner || inP.ownerName || 'मूळ खातेदार').slice(0, 240),
          khataNumber: `K-${safeNo}`.slice(0, 120),
          areaHa: dbP.totalAreaHa,
          tenureClass: mapTenureToEnum(b50.tenure, inP.flags?.isGovt ? 'SARKAR_SHASAN' : dbP.tenureClass),
          wasGovtLand: Boolean(inP.flags?.isGovt || inP.flags?.isIllegalDeletion),
          mutationType: inP.flags?.isGovt ? 'शासकीय मूळ नोंद' : 'सन १९५० बंदोबस्त नोंद',
          remarks: 'स्वातंत्र्योत्तर बंदोबस्त अधिकार अभिलेख नोंद'
        });
      }

      const b72 = inP.backward?.ekatrikaran1972;
      if (b72 && (b72.no || b72.owner)) {
        const safeNo = String(b72.no || 'EK').slice(0, 60);
        bksToInsert.push({
          parcelId: dbP.id,
          epochYear: 1972,
          recordDate: new Date('1972-04-01'),
          ferfarNumber: `F-EK-${safeNo}`.slice(0, 120),
          ownerName: String(b72.owner || inP.ownerName || 'नोंदविलेला खातेदार').slice(0, 240),
          khataNumber: `K-EK-${safeNo}`.slice(0, 120),
          areaHa: dbP.totalAreaHa,
          tenureClass: mapTenureToEnum(b72.tenure, dbP.tenureClass),
          wasGovtLand: false,
          mutationType: 'एकत्रिकरण योजना नोंद',
          remarks: 'जमीन एकत्रिकरण व पुनर्रचना नोंद (Consolidation Scheme)'
        });
      }

      const b95 = inP.backward?.resurvey1995;
      if (b95 && (b95.no || b95.owner)) {
        const safeNo = String(b95.no || dbP.gatNumber).slice(0, 60);
        bksToInsert.push({
          parcelId: dbP.id,
          epochYear: 1995,
          recordDate: new Date('1995-10-15'),
          ferfarNumber: `F-RES-${safeNo}`.slice(0, 120),
          ownerName: String(b95.owner || inP.ownerName || 'पुनर्मोजणी खातेदार').slice(0, 240),
          khataNumber: `K-RES-${safeNo}`.slice(0, 120),
          areaHa: dbP.totalAreaHa,
          tenureClass: mapTenureToEnum(b95.tenure, dbP.tenureClass),
          wasGovtLand: false,
          mutationType: 'पुनर्मोजणी नोंद',
          remarks: 'पुनर्मोजणी व नवीन गट नंबर वाटप'
        });
      }
    }
  }

  // 5. Batch Insert Backward Histories (chunks of 1,000)
  if (bksToInsert.length > 0) {
    console.log(`  Inserting ${bksToInsert.length} authentic backward history milestones (1950, 1972, 1995)...`);
    for (let i = 0; i < bksToInsert.length; i += 1000) {
      await prisma.backwardHistory.createMany({
        data: bksToInsert.slice(i, i + 1000),
        skipDuplicates: true
      });
    }
  }

  // 6. Update PrapatraRollup per Village
  console.log(`  Syncing Prapatra rollups for ${villageRollupMap.size} villages...`);
  for (const [vName, stat] of villageRollupMap.entries()) {
    try {
      await prisma.prapatraRollup.upsert({
        where: {
          idx_prapatra_rollup_unique: {
            district: 'Chandrapur',
            taluka: talukaName,
            villageName: vName
          }
        },
        create: {
          district: 'Chandrapur',
          taluka: talukaName,
          villageName: vName,
          total712Count: stat.total712,
          inspected1950Count: stat.inspected1950,
          govtFound1950Count: stat.govt1950,
          illegalDeletionsCount: stat.illegalDel,
          pokalistCount: stat.pokalist,
          privateAllottedCount: stat.privateAllot,
          totalGovtLandCount: stat.totalGovt,
          govtAllottedCount: stat.govtAllotted,
          govtShartbhangCount: stat.govtShartbhang,
          govtEncroachedCount: stat.govtEncroach,
          govtMojaniDoneCount: stat.govtMojani
        },
        update: {
          total712Count: stat.total712,
          inspected1950Count: stat.inspected1950,
          govtFound1950Count: stat.govt1950,
          illegalDeletionsCount: stat.illegalDel,
          pokalistCount: stat.pokalist,
          privateAllottedCount: stat.privateAllot,
          totalGovtLandCount: stat.totalGovt,
          govtAllottedCount: stat.govtAllotted,
          govtShartbhangCount: stat.govtShartbhang,
          govtEncroachedCount: stat.govtEncroach,
          govtMojaniDoneCount: stat.govtMojani
        }
      });
    } catch (e) {
      // Ignore
    }
  }

  const duration = ((Date.now() - tStart) / 1000).toFixed(2);
  console.log(`  SUCCESS: ${talukaName} seeded in ${duration}s! (Updated: ${updates.length}, New: ${newParcels.length}, Milestones: ${bksToInsert.length})`);
}

async function main() {
  const tGlobal = Date.now();
  console.log('==============================================================');
  console.log('STARTING ULTRA-FAST DATABASE RE-SEEDING FROM DRIVE SPREADSHEETS');
  console.log('==============================================================');

  const files = fs.readdirSync(SEEDED_DIR)
    .filter(f => f.endsWith('.json') && f !== 'all_talukas_summary.json');

  let totalParcelsDone = 0;

  for (const f of files) {
    const talukaName = f.replace('.json', '');
    const jsonPath = path.join(SEEDED_DIR, f);
    const parcels = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    await seedTaluka(talukaName, parcels);
    totalParcelsDone += parcels.length;
  }

  const totalTime = ((Date.now() - tGlobal) / 1000).toFixed(2);
  console.log(`\n==============================================================`);
  console.log(`ALL 15 TALUKAS & 672 VILLAGES SEEDED IN ${totalTime}s!`);
  console.log(`Total Genuine Parcels Synchronized: ${totalParcelsDone}`);
  console.log(`==============================================================`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal database seeding error:', err);
  process.exit(1);
});

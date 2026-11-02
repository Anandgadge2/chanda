import prisma from '../config/prisma.js';
import { cleanVillageName } from '../utils/prapatraGenerator.js';

async function main() {
  console.log('=== FIXING DUPLICATES IN WARORA / अंतापूर रिठ ===\n');

  const village = 'अंतापूर रिठ';
  const parcels = await prisma.landParcel.findMany({
    where: {
      taluka: 'Warora',
      villageName: village
    },
    include: {
      backwardHistories: true,
      forwardCases: true,
      documents: true
    },
    orderBy: [{ gatNumber: 'asc' }, { createdAt: 'asc' }]
  });

  console.log(`Found ${parcels.length} total parcels in ${village}`);

  const byGat = new Map();
  for (const p of parcels) {
    const gat = String(p.gatNumber).trim();
    if (!byGat.has(gat)) byGat.set(gat, []);
    byGat.get(gat).push(p);
  }

  for (const [gat, list] of byGat.entries()) {
    console.log(`\nProcessing Gat Number ${gat}: ${list.length} copies found`);
    if (list.length <= 1) {
      console.log(`  Already unique, skipping.`);
      continue;
    }

    // Sort to find the best master record (most audit points, most backward histories)
    list.sort((a, b) => {
      const aPoints = Object.keys(a.metadata?.auditPoints || {}).length;
      const bPoints = Object.keys(b.metadata?.auditPoints || {}).length;
      if (bPoints !== aPoints) return bPoints - aPoints;
      return (b.backwardHistories?.length || 0) - (a.backwardHistories?.length || 0);
    });

    const master = list[0]; // Rich record (Oct 30)
    const duplicates = list.slice(1); // Sparse record (Oct 14)

    // Find if any duplicate had a cleaner canonical UPI (e.g. not having double 'WAR-WAR')
    let canonicalUpi = master.upi;
    for (const dup of duplicates) {
      if (dup.upi && !dup.upi.includes('-WAR-WAR-') && dup.upi.includes('-WAR-')) {
        canonicalUpi = dup.upi;
        break;
      }
    }

    console.log(`  Master Record to keep: ID ${master.id} (Audit points: ${Object.keys(master.metadata?.auditPoints || {}).length}, Backward: ${master.backwardHistories.length})`);
    console.log(`  Canonical UPI to assign: ${canonicalUpi}`);

    for (const dup of duplicates) {
      console.log(`  Removing duplicate placeholder ID ${dup.id} (UPI: ${dup.upi}, Created: ${dup.createdAt.toISOString()})`);
      // Delete child backward histories first if needed (Prisma cascade handles this, but let's be explicit)
      await prisma.backwardHistory.deleteMany({
        where: { parcelId: dup.id }
      });
      await prisma.landParcel.delete({
        where: { id: dup.id }
      });
    }

    // Update master with canonical UPI if changed
    if (master.upi !== canonicalUpi) {
      console.log(`  Updating master UPI from "${master.upi}" to "${canonicalUpi}"`);
      await prisma.landParcel.update({
        where: { id: master.id },
        data: { upi: canonicalUpi }
      });
    }
  }

  // Verify final count in अंतापूर रिठ
  const finalParcels = await prisma.landParcel.findMany({
    where: {
      taluka: 'Warora',
      villageName: village
    },
    select: {
      id: true,
      upi: true,
      gatNumber: true,
      totalAreaHa: true,
      tenureClass: true,
      metadata: true
    },
    orderBy: { gatNumber: 'asc' }
  });

  console.log(`\n=== VERIFICATION: ${village} now has ${finalParcels.length} parcels ===`);
  for (const p of finalParcels) {
    console.log(`  Gat ${p.gatNumber}: Area ${p.totalAreaHa} | Tenure: ${p.tenureClass} | Owner: ${p.metadata?.ownerName} | UPI: ${p.upi}`);
  }
}

main()
  .then(() => {
    console.log('\nAntapur Rith duplicates resolved successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error fixing Antapur Rith duplicates:', err);
    process.exit(1);
  });


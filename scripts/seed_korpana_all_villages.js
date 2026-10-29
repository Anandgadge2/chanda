import fs from 'fs';
import path from 'path';
import prisma from '../backend/src/config/prisma.js';
import { parsePrapatraBuffer } from '../backend/src/parsers/prapatraParserJs.js';
import { reconcileAndSeedVillage } from '../backend/src/services/prapatraReconciliationService.js';

async function main() {
  const master = JSON.parse(fs.readFileSync('d:\\chanda\\data\\all_talukas_master_filelist.json', 'utf8'));
  const korpanaMaster = master['कोरपना'] || [];
  const canonList = JSON.parse(fs.readFileSync('d:\\chanda\\data\\canonical_village_names.json', 'utf8'));
  
  // Map index -> canonical info
  const canonMap = new Map();
  for (const c of canonList) {
    if (c.taluka === 'Korpana' || c.talukaMr === 'कोरपना') {
      canonMap.set(c.index, c);
    }
  }

  const rawDir = 'd:\\chanda\\data\\all_talukas_raw\\Korpana';
  const rawFiles = fs.readdirSync(rawDir);

  console.log(`=== Starting idempotent seeding for all ${korpanaMaster.length} files in Korpana Google Drive ===`);
  
  const overallStats = {
    totalFiles: korpanaMaster.length,
    processedFiles: 0,
    successfulFiles: 0,
    failedFiles: 0,
    totalParcelsParsed: 0,
    unchangedPreserved: 0,
    modifiedUpdated: 0,
    netNewSeeded: 0,
    forwardCasesCreated: 0,
    backwardCreated: 0
  };

  const results = [];

  for (let idx = 1; idx <= korpanaMaster.length; idx++) {
    const item = korpanaMaster[idx - 1];
    const prefix = String(idx).padStart(2, '0');
    const matchedFile = rawFiles.find(f => f.startsWith(`${prefix}_`));

    if (!matchedFile) {
      console.warn(`[WARN] File with prefix ${prefix} not found in directory. Skipping.`);
      overallStats.failedFiles++;
      continue;
    }

    const filePath = path.join(rawDir, matchedFile);
    const canon = canonMap.get(idx) || {};
    const defaultVillageCode = canon.villageCode || `KOR-${String(idx).padStart(3, '0')}`;
    const cleanVillage = canon.cleanVillageName || item.title.replace(' Microsoft Excel', '').replace('.xlsx', '').trim();

    console.log(`\n[${idx}/${korpanaMaster.length}] Processing "${matchedFile}" -> Village: "${cleanVillage}" (Code: ${defaultVillageCode})...`);

    try {
      const parsed = await parsePrapatraBuffer(filePath, 'Korpana', matchedFile);
      const villageName = parsed.villageName && parsed.villageName !== 'गाव' ? parsed.villageName : cleanVillage;
      
      console.log(`   * Parsed ${parsed.parcels.length} parcels. Reconciling with database...`);
      
      const seedResult = await reconcileAndSeedVillage({
        parcels: parsed.parcels,
        stats: parsed.stats,
        targetTaluka: 'Korpana',
        finalVillage: villageName,
        villageCode: defaultVillageCode
      });

      const summary = seedResult.executionSummary;
      console.log(`   ✓ Done: ${summary.unchangedPreserved} unchanged preserved, ${summary.modifiedUpdated} modified, ${summary.netNewSeeded} new, ${summary.casesCreated} cases created, ${summary.backwardCreated} backward created.`);

      overallStats.processedFiles++;
      overallStats.successfulFiles++;
      overallStats.totalParcelsParsed += parsed.parcels.length;
      overallStats.unchangedPreserved += summary.unchangedPreserved;
      overallStats.modifiedUpdated += summary.modifiedUpdated;
      overallStats.netNewSeeded += summary.netNewSeeded;
      overallStats.forwardCasesCreated += summary.casesCreated;
      overallStats.backwardCreated += summary.backwardCreated;

      results.push({
        index: idx,
        filename: matchedFile,
        villageName,
        villageCode: defaultVillageCode,
        parcelsCount: parsed.parcels.length,
        unchanged: summary.unchangedPreserved,
        modified: summary.modifiedUpdated,
        netNew: summary.netNewSeeded,
        casesCreated: summary.casesCreated,
        status: 'SUCCESS'
      });
    } catch (err) {
      console.error(`   ✗ Error processing file ${matchedFile}:`, err.message);
      overallStats.processedFiles++;
      overallStats.failedFiles++;
      results.push({
        index: idx,
        filename: matchedFile,
        status: 'ERROR',
        error: err.message
      });
    }
  }

  console.log('\n======================================================');
  console.log('=== SEEDING COMPLETE FOR ALL KORPANA VILLAGES ===');
  console.log('======================================================');
  console.log(JSON.stringify(overallStats, null, 2));

  // Write detailed execution log to disk
  fs.writeFileSync('d:\\chanda\\data\\korpana_seed_execution_results.json', JSON.stringify({ overallStats, results }, null, 2), 'utf8');
  console.log('Detailed log written to d:\\chanda\\data\\korpana_seed_execution_results.json');
}

main().catch(console.error).finally(() => prisma.$disconnect());

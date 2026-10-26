import fs from 'fs';
import prisma from '../config/prisma.js';

async function main() {
  const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));
  let totalMasterFiles = 0;
  for (const k in master) totalMasterFiles += master[k].length;

  const rollups = await prisma.prapatraRollup.findMany({
    where: { villageName: { not: 'संपूर्ण तालुका (All Villages)' } }
  });

  const parcels = await prisma.landParcel.findMany({
    select: { taluka: true, villageName: true, totalAreaHa: true }
  });

  const parcelCountsByVillage = {};
  for (const p of parcels) {
    const key = p.taluka + '|||' + p.villageName;
    parcelCountsByVillage[key] = (parcelCountsByVillage[key] || 0) + 1;
  }

  const issues = [];
  const cleanVillages = [];

  function hasDevanagari(s) {
    return /[\u0900-\u097F]/.test(s);
  }

  function countDevanagariMarks(s) {
    const marks = s.match(/[\u0901-\u0903\u0904-\u0914\u093a-\u094f\u0951-\u0957\u0962-\u0963]/g);
    return marks ? marks.length : 0;
  }

  function countDevanagariLetters(s) {
    const letters = s.match(/[\u0915-\u0939]/g);
    return letters ? letters.length : 0;
  }

  // Taluka stats tracker
  const talukaStats = {};

  for (const r of rollups) {
    const key = r.taluka + '|||' + r.villageName;
    const vName = r.villageName;
    const pCount = parcelCountsByVillage[key] || 0;

    if (!talukaStats[r.taluka]) {
      talukaStats[r.taluka] = {
        total: 0,
        withParcels: 0,
        zeroParcels: 0,
        zero712: 0,
        corruptedName: 0,
        cleanProper: 0,
        samplesCorrupt: [],
        samplesClean: []
      };
    }
    const tStat = talukaStats[r.taluka];
    tStat.total++;

    const villageErrors = [];

    // 1. Literal question marks or replacement characters
    if (vName.includes('?') || vName.includes('\uFFFD')) {
      villageErrors.push('Contains question marks/encoding error');
    }

    // 2. Junk prefixes
    if (/^\s*(1\s*त[े]?\s*4[56]|45\s*म|तप[ा]?सण|सतबर|गवगन्न|मौज[ा]?[\s_\.-])/i.test(vName) || /1\s*त\s*45/i.test(vName)) {
      villageErrors.push('Contains unstripped checklist prefix (e.g. 1 ते 45)');
    }

    // 3. Stripped Devanagari marks (e.g. consonants only like 'पपरदड चक', 'कवडपठ', 'मदयबबत')
    if (hasDevanagari(vName)) {
      const letters = countDevanagariLetters(vName);
      const marks = countDevanagariMarks(vName);
      if (letters >= 5 && marks === 0) {
        villageErrors.push('Suspected stripped Devanagari matras (0 vowel marks)');
      }
    }

    // 4. Data errors: zero 7/12 count
    if (r.total712Count === 0) {
      villageErrors.push('Rollup total 7/12 count is 0');
      tStat.zero712++;
    }

    // 5. Data errors: zero parcels in landParcel table
    if (pCount === 0) {
      villageErrors.push('0 land parcels in parcel database');
      tStat.zeroParcels++;
    } else {
      tStat.withParcels++;
    }

    if (villageErrors.length > 0) {
      tStat.corruptedName += (villageErrors.some(e => e.includes('marks') || e.includes('prefix') || e.includes('encoding')) ? 1 : 0);
      if (tStat.samplesCorrupt.length < 3) {
        tStat.samplesCorrupt.push({ name: vName, errors: villageErrors, parcels: pCount, total712: r.total712Count });
      }
      issues.push({ taluka: r.taluka, name: vName, errors: villageErrors, parcels: pCount, total712: r.total712Count });
    } else {
      tStat.cleanProper++;
      if (tStat.samplesClean.length < 2) {
        tStat.samplesClean.push(vName);
      }
      cleanVillages.push({ taluka: r.taluka, name: vName, parcels: pCount, total712: r.total712Count });
    }
  }

  console.log('================================================================');
  console.log('              PORTAL VILLAGE DATA & AUDIT REPORT                 ');
  console.log('================================================================');
  console.log(`Master filelist total files in Drive/Source: ${totalMasterFiles}`);
  console.log(`Total non-summary village rollups in Portal: ${rollups.length}`);
  console.log(`Total land parcels in Portal: ${parcels.length}`);
  console.log(`Distinct villages with land parcels in DB: ${Object.keys(parcelCountsByVillage).length}`);
  console.log('----------------------------------------------------------------');
  console.log(`Villages completely CLEAN & PROPER (No name issues & Has parcels & Has 7/12): ${cleanVillages.length}`);
  console.log(`Villages with one or more issues/errors: ${issues.length}`);
  console.log('----------------------------------------------------------------');

  console.log('\n--- BREAKDOWN OF ISSUES ACROSS 664 VILLAGES ---');
  const countEncodingGlitch = issues.filter(i => i.errors.some(e => e.includes('encoding'))).length;
  const countJunkPrefix = issues.filter(i => i.errors.some(e => e.includes('prefix'))).length;
  const countStrippedMatras = issues.filter(i => i.errors.some(e => e.includes('stripped'))).length;
  const countZeroParcels = issues.filter(i => i.errors.some(e => e.includes('0 land parcels'))).length;
  const countZero712 = issues.filter(i => i.errors.some(e => e.includes('7/12 count is 0'))).length;

  console.log(`- Question marks or encoding glitches in name: ${countEncodingGlitch}`);
  console.log(`- Uncleaned prefixes in name (e.g., '1 ते 45', 'तपासणी'): ${countJunkPrefix}`);
  console.log(`- Stripped Devanagari vowel marks (mangled spelling): ${countStrippedMatras}`);
  console.log(`- Villages in Prapatra Rollup with 0 Land Parcels in DB: ${countZeroParcels}`);
  console.log(`- Villages in Prapatra Rollup with 0 Total 7/12 Count: ${countZero712}`);

  console.log('\n--- TALUKA-BY-TALUKA DETAILED STATUS ---');
  for (const [taluka, stat] of Object.entries(talukaStats).sort()) {
    console.log(`\nTaluka: ${taluka}`);
    console.log(`  Total villages: ${stat.total} | Clean & Proper: ${stat.cleanProper} | With Issues: ${stat.total - stat.cleanProper}`);
    console.log(`  With Parcels: ${stat.withParcels} | Zero Parcels: ${stat.zeroParcels} | Zero 7/12: ${stat.zero712}`);
    if (stat.samplesCorrupt.length) {
      console.log(`  Sample issues:`, JSON.stringify(stat.samplesCorrupt, null, 2));
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}).finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

const TALUKA_MAP = {
  'कोरपना': 'Korpana',
  'चंद्रपूर': 'Chandrapur',
  'चिमूर': 'Chimur',
  'जिवती': 'Jivati',
  'नागभीड': 'Nagbhid',
  'पोमभुर्णा': 'Pombhurna',
  'बल्लारपूर': 'Ballarpur',
  'ब्रम्हपुरी': 'Brahmapuri',
  'भद्रावती': 'Bhadravati',
  'मुल': 'Mul',
  'राजुरा': 'Rajura',
  'वरोरा': 'Warora',
  'सावली': 'Saoli',
  'सिंदेवाही': 'Sindewahi',
  'गोंडपिपरी': 'Gondpipri'
};

function cleanOriginalVillageName(title) {
  let t = title.replace(/\.xlsx.*$/i, '').replace(/Microsoft Excel.*$/i, '').trim();
  for (const prefix of [
    '45 मुद्द्याची माहिती', '1 ते 45 तपासणी  मुद्दे  मौजा', '1 ते 45 तपासणी मुददे',
    '1 ते 45 मुददे ची तपासणी -', '1 ते 45 मुद्दे', '1 to 45.', '1 to 46',
    '1 ते 46', '1  ते 46', '1 ते 54', '1 TO 45', '1 TO 46', '1ते45',
    'महसूल अधिकार अभिलेख (सातबारा) ची तपासणी', 'गावगन्ना'
  ]) {
    t = t.replace(prefix, '');
  }
  t = t.replace(/^\d+[\s_\.-]*/, '');
  t = t.replace(/[\s_\.-]*ok.*$/i, '');
  t = t.replace(/&amp;/g, '&');
  return t.trim();
}

function stripDevanagariMarks(s) {
  return s.replace(/[\u0901-\u0903\u093a-\u094f\u0951-\u0957\u0962-\u0963]/g, '')
          .replace(/[^\w\s\.\-\u0900-\u097F]/gi, '')
          .trim();
}

async function dryRunRestore() {
  const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));

  let totalRollupMatches = 0;
  let totalParcelMatches = 0;

  for (const [mrTaluka, enTaluka] of Object.entries(TALUKA_MAP)) {
    const items = master[mrTaluka] || [];
    if (!items.length) continue;

    // Build lookup map for this taluka: stripped -> original
    const lookup = new Map();
    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      if (!it.title) continue;
      const cleanOriginal = cleanOriginalVillageName(it.title);
      const stripped = stripDevanagariMarks(cleanOriginal);

      if (cleanOriginal && stripped) {
        lookup.set(stripped.toLowerCase(), cleanOriginal);
        // Also map stripped with single spaces
        lookup.set(stripped.toLowerCase().replace(/\s+/g, ' '), cleanOriginal);
        // If title had "01_...", also map index
        lookup.set(`idx_${idx + 1}`, cleanOriginal);
      }
    }

    const rollups = await prisma.prapatraRollup.findMany({
      where: { taluka: enTaluka }
    });

    let matchedInTaluka = 0;
    for (const r of rollups) {
      const currentName = r.villageName;
      if (!currentName || currentName === 'संपूर्ण तालुका (All Villages)') continue;

      const normCurrent = currentName.toLowerCase().replace(/\s+/g, ' ').trim();
      let restoredName = lookup.get(normCurrent);

      // If direct lookup didn't match, try stripping currentName marks too
      if (!restoredName) {
        const strippedCurrent = stripDevanagariMarks(currentName).toLowerCase().replace(/\s+/g, ' ').trim();
        restoredName = lookup.get(strippedCurrent);
      }

      if (restoredName && restoredName !== currentName) {
        matchedInTaluka++;
        totalRollupMatches++;
        if (enTaluka === 'Sindewahi' || matchedInTaluka <= 3) {
          console.log(`[${enTaluka}] Rollup: "${currentName}"  -->  "${restoredName}"`);
        }
      }
    }
  }

  console.log(`\nTotal Rollups matched for restoration: ${totalRollupMatches}`);
}

dryRunRestore().finally(() => prisma.$disconnect());

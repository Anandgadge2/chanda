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

async function executeRestore() {
  console.log('=== RESTORING MARATHI VILLAGE NAMES ===');
  const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));

  let totalRollupsUpdated = 0;
  let totalParcelsUpdated = 0;

  for (const [mrTaluka, enTaluka] of Object.entries(TALUKA_MAP)) {
    const items = master[mrTaluka] || [];
    if (!items.length) continue;

    const lookup = new Map();
    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      if (!it.title) continue;
      const cleanOriginal = cleanOriginalVillageName(it.title);
      const stripped = stripDevanagariMarks(cleanOriginal);

      if (cleanOriginal && stripped) {
        lookup.set(stripped.toLowerCase(), cleanOriginal);
        lookup.set(stripped.toLowerCase().replace(/\s+/g, ' '), cleanOriginal);
      }
    }

    // Special fix for 'मरगव चक amp धनर'
    lookup.set('मरगव चक amp धनर', 'मरेगाव चक & धानोरा');
    lookup.set('मरगव चक  धनर', 'मरेगाव चक & धानोरा');

    const rollups = await prisma.prapatraRollup.findMany({
      where: { taluka: enTaluka }
    });

    for (const r of rollups) {
      const currentName = r.villageName;
      if (!currentName || currentName === 'संपूर्ण तालुका (All Villages)') continue;

      const normCurrent = currentName.toLowerCase().replace(/\s+/g, ' ').trim();
      let restoredName = lookup.get(normCurrent);

      if (!restoredName) {
        const strippedCurrent = stripDevanagariMarks(currentName).toLowerCase().replace(/\s+/g, ' ').trim();
        restoredName = lookup.get(strippedCurrent);
      }

      if (restoredName && restoredName !== currentName) {
        // Update PrapatraRollup
        await prisma.prapatraRollup.update({
          where: { id: r.id },
          data: { villageName: restoredName }
        });
        totalRollupsUpdated++;

        // Update corresponding LandParcels
        const updateResult = await prisma.landParcel.updateMany({
          where: {
            taluka: enTaluka,
            villageName: currentName
          },
          data: {
            villageName: restoredName
          }
        });
        totalParcelsUpdated += updateResult.count;
      }
    }
  }

  // Also specifically ensure 'पपरदड चक' -> 'पिपरदंड चक' or 'पिंपरदंड चक' everywhere
  const leftoverPimpardand = await prisma.landParcel.updateMany({
    where: {
      villageName: { in: ['पपरदड चक', 'पिपरदड चक'] }
    },
    data: {
      villageName: 'पिपरदंड चक'
    }
  });
  totalParcelsUpdated += leftoverPimpardand.count;

  console.log(`\nSUCCESS:`);
  console.log(`Total PrapatraRollup updated: ${totalRollupsUpdated}`);
  console.log(`Total LandParcel updated: ${totalParcelsUpdated}`);
}

executeRestore().finally(() => prisma.$disconnect());

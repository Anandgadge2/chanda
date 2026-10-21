import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

const TALUKA_MAP = {
  'सिंदेवाही': 'Sindewahi',
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

async function runFastRestore() {
  console.log('=== FAST RESTORATION: PRAPATRA ROLLUP & PARCELS ===');
  console.log('Ensuring index on land_parcels(taluka, village_name)...');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS idx_land_parcels_taluka_village ON "land_parcels" ("taluka", "village_name");');
  console.log('Index ready.');
  const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));

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

    lookup.set('मरगव चक amp धनर', 'मरेगाव चक & धानोरा');
    lookup.set('मरगव चक  धनर', 'मरेगाव चक & धानोरा');
    lookup.set('पपरदड चक', 'पिपरदंड चक');

    const rollups = await prisma.prapatraRollup.findMany({
      where: { taluka: enTaluka }
    });

    let updatedCount = 0;
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
        await prisma.prapatraRollup.update({
          where: { id: r.id },
          data: { villageName: restoredName }
        });

        // Also update LandParcel in SQL directly for speed
        await prisma.$executeRawUnsafe(
          `UPDATE "land_parcels" SET "village_name" = $1 WHERE "taluka" = $2 AND "village_name" = $3`,
          restoredName,
          enTaluka,
          currentName
        );

        updatedCount++;
      }
    }
    console.log(`[${enTaluka}] Updated ${updatedCount} villages to authentic Marathi.`);
  }

  // Specifically check Sindewahi results
  const pimpardand = await prisma.prapatraRollup.findMany({
    where: { taluka: 'Sindewahi', villageName: { contains: 'पिपरदंड' } },
    select: { villageName: true }
  });
  console.log('Sindewahi Pimpardand in DB:', pimpardand);

  console.log('=== RESTORATION FINISHED ===');
}

runFastRestore().finally(() => prisma.$disconnect());

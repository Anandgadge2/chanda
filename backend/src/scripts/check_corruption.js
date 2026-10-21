import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));

  const talukaKeys = Object.keys(master);
  console.log('Talukas in master:', talukaKeys);

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

  // For each taluka, let's see how each original title in master maps to stripped title
  const stripMarks = (s) => {
    // mimics Python "".join(c for c in title if c.isalnum() or c in (' ', '-', '_', '.'))
    // in Python, isalnum() on Devanagari returns True only for Letters and Digits, False for marks (\u0901-\u0903, \u093e-\u094f, etc.)
    return s.replace(/[\u0901-\u0903\u093a-\u094f\u0951-\u0957\u0962-\u0963]/g, '')
            .replace(/[^\w\s\.\-\u0900-\u097F]/gi, '')
            .trim();
  };

  let totalMapped = 0;
  const mappings = []; // { taluka, stripped, original, cleanOriginal }

  function cleanOriginalTitle(title) {
    let t = title.replace(/\.xlsx.*$/i, '').replace(/Microsoft Excel.*$/i, '').trim();
    // remove prefixes
    for (const prefix of [
      '45 मुद्द्याची माहिती', '1 ते 45 तपासणी  मुद्दे  मौजा', '1 ते 45 तपासणी मुददे',
      '1 ते 45 मुददे ची तपासणी -', '1 ते 45 मुद्दे', '1 to 45.', '1 to 46',
      '1 ते 46', '1  ते 46', '1 ते 54', '1 TO 45', '1 TO 46', '1ते45'
    ]) {
      t = t.replace(prefix, '');
    }
    t = t.replace(/^\d+[\s_\.-]*/, '');
    t = t.replace(/[\s_\.-]*ok.*$/i, '');
    t = t.replace(/&amp;/g, '&');
    return t.trim();
  }

  for (const [mrTaluka, items] of Object.entries(master)) {
    const enTaluka = TALUKA_MAP[mrTaluka];
    if (!enTaluka) continue;

    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      if (!it.title) continue;
      const originalClean = cleanOriginalTitle(it.title);
      // Let's also see what the stripped version was
      // Notice the user had:
      // "पिपरदंड चक.xlsx Microsoft Excel" -> originalClean "पिपरदंड चक"
      // stripped was "पपरदड चक"
    }
  }

  // Let's inspect Sindewahi rollups
  const sindewahiRollups = await prisma.prapatraRollup.findMany({
    where: { taluka: { in: ['Sindewahi', 'सिंदेवाही'] } },
    select: { id: true, villageName: true }
  });

  console.log(`Sindewahi has ${sindewahiRollups.length} rollups. Examples:`);
  for (const r of sindewahiRollups.slice(0, 15)) {
    console.log(`  - "${r.villageName}"`);
  }

  // Check specifically for पपरदड चक
  const target = await prisma.prapatraRollup.findMany({
    where: { villageName: { contains: 'पपरदड' } }
  });
  console.log('Found rollups with पपरदड:', target);

  const targetParcels = await prisma.landParcel.count({
    where: { villageName: { contains: 'पपरदड' } }
  });
  console.log('Found parcels count with पपरदड:', targetParcels);
}

main().catch(console.error).finally(() => prisma.$disconnect());

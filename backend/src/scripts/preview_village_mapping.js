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
  t = t.trim();
  return t;
}

function simulatePythonIsalnum(s) {
  // Replicates Python "".join(c for c in title if c.isalnum() or c in (' ', '-', '_', '.'))
  // Strips Devanagari marks (vowels signs U+093E-U+094F, anusvara/visarga U+0901-U+0903, etc.)
  return s.replace(/[\u0901-\u0903\u093a-\u094f\u0951-\u0957\u0962-\u0963]/g, '')
          .replace(/[^\w\s\.\-\u0900-\u097F]/gi, '')
          .trim();
}

async function previewMapping() {
  const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));

  const swItems = master['सिंदेवाही'] || [];
  console.log(`Checking Sindewahi (${swItems.length} items):`);

  for (let idx = 0; idx < swItems.length; idx++) {
    const item = swItems[idx];
    const originalClean = cleanOriginalVillageName(item.title);
    const stripped = simulatePythonIsalnum(originalClean);
    console.log(`${idx + 1}. Original: "${originalClean}"  ==>  Stripped (corrupted): "${stripped}"`);
  }
}

previewMapping().finally(() => prisma.$disconnect());

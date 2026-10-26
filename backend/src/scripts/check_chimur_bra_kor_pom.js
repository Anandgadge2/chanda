import prisma from '../config/prisma.js';
import fs from 'fs';

async function main() {
  const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));

  // Chimur
  console.log('=== CHIMUR MASTER FILES ===');
  master['चिमूर'].forEach((f, i) => console.log(`[${i+1}] CHIM-${i+1}: ${f.title.substring(0, 35)}`));

  // Brahmapuri
  console.log('\n=== BRAHMAPURI MASTER FILES ===');
  master['ब्रम्हपुरी'].forEach((f, i) => console.log(`[${i+1}] BRA-${i+1}: ${f.title.substring(0, 35)}`));

  // Korpana
  console.log('\n=== KORPANA MASTER FILES ===');
  master['कोरपना'].forEach((f, i) => console.log(`[${i+1}] KOR-${i+1}: ${f.title.substring(0, 35)}`));
}

main().finally(() => prisma.$disconnect());

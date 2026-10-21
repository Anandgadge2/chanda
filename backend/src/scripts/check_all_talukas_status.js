import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));

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

  for (const [mrTaluka, enTaluka] of Object.entries(TALUKA_MAP)) {
    const rollups = await prisma.prapatraRollup.findMany({
      where: { taluka: enTaluka },
      select: { villageName: true }
    });
    // Check if any rollups in this taluka look corrupted (e.g. have no matras or match specific patterns)
    console.log(`Taluka: ${enTaluka} (${mrTaluka}) - Total rollups: ${rollups.length}`);
    const sample = rollups.slice(0, 5).map(r => r.villageName);
    console.log(`  Sample:`, sample);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

import fs from 'fs';

const rollups = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_rollups.json', 'utf8'));
const parcels = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_parcels.json', 'utf8'));

// 1. Ballarpur
console.log('=== BALLARPUR ===');
const balRollups = rollups.filter(r => r.taluka === 'Ballarpur');
balRollups.forEach((r, i) => console.log(`R[${i}] ${r.villageName} (${r.total712Count})`));

// 2. Brahmapuri
console.log('\n=== BRAHMAPURI ===');
const braRollups = rollups.filter(r => r.taluka === 'Brahmapuri');
braRollups.forEach((r, i) => console.log(`R[${i}] ${r.villageName} (${r.total712Count})`));

// 3. Chimur
console.log('\n=== CHIMUR ===');
const chimRollups = rollups.filter(r => r.taluka === 'Chimur');
chimRollups.forEach((r, i) => console.log(`R[${i}] ${r.villageName} (${r.total712Count})`));

// 4. Korpana
console.log('\n=== KORPANA ===');
const korRollups = rollups.filter(r => r.taluka === 'Korpana');
korRollups.forEach((r, i) => console.log(`R[${i}] ${r.villageName} (${r.total712Count})`));

// 5. Pombhurna
console.log('\n=== POMBHURNA ===');
const pomRollups = rollups.filter(r => r.taluka === 'Pombhurna');
pomRollups.forEach((r, i) => console.log(`R[${i}] ${r.villageName} (${r.total712Count})`));

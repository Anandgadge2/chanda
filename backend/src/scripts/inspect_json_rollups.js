import fs from 'fs';

const rollups = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_rollups.json', 'utf8'));

const rajRollups = rollups.filter(r => r.taluka === 'Rajura');
console.log('Rajura rollups in JSON:', rajRollups.length);
console.log(rajRollups.map(r => ({ name: r.villageName, total: r.total712Count })));

const bhaRollups = rollups.filter(r => r.taluka === 'Bhadravati');
console.log('\nBhadravati rollups in JSON:', bhaRollups.length);
console.log(bhaRollups.map(r => ({ name: r.villageName, total: r.total712Count })));

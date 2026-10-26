import fs from 'fs';

const parcels = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_parcels.json', 'utf8'))
  .filter(p => p.taluka === 'Brahmapuri');

const codes = new Set(parcels.map(p => p.villageCode));
console.log('Brahmapuri unique villageCodes in parcels JSON:', Array.from(codes).sort());

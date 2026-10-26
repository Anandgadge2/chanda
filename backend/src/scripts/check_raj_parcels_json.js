import fs from 'fs';

const parcels = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_parcels.json', 'utf8'));

const codes = ['RAJ-008', 'RAJ-011', 'RAJ-031', 'RAJ-040'];
for (const c of codes) {
  const p = parcels.find(x => x.villageCode === c);
  console.log(c, p?.villageName, p?.taluka);
}

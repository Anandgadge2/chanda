import fs from 'fs';

const canon = JSON.parse(fs.readFileSync('d:/chanda/data/canonical_village_names.json', 'utf8'));
const seen = new Map();
const duplicates = [];

for (const c of canon) {
  const key = `${c.taluka}___${c.cleanVillageName}`;
  if (seen.has(key)) {
    duplicates.push({
      first: seen.get(key),
      second: c
    });
  } else {
    seen.set(key, c);
  }
}

console.log('Duplicates in canonical_village_names:', duplicates.length);
for (const d of duplicates) {
  console.log(`[${d.first.taluka}] "${d.first.cleanVillageName}":`);
  console.log(`   1: ${d.first.villageCode} - "${d.first.rawTitle}"`);
  console.log(`   2: ${d.second.villageCode} - "${d.second.rawTitle}"`);
}

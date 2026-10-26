import fs from 'fs';

const canonical = Object.values(JSON.parse(fs.readFileSync('d:/chanda/data/canonical_village_names.json', 'utf8')));

console.log('=== BHADRAVATI CANONICAL ENTRIES ===');
canonical.filter(c => c.taluka === 'Bhadravati').forEach(c => {
  console.log(`${c.villageCode} | clean: "${c.cleanVillageName}" | raw: "${c.rawTitle}"`);
});

console.log('\n=== RAJURA CANONICAL ENTRIES ===');
canonical.filter(c => c.taluka === 'Rajura').forEach(c => {
  console.log(`${c.villageCode} | clean: "${c.cleanVillageName}" | raw: "${c.rawTitle}"`);
});

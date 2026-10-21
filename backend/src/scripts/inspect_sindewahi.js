import fs from 'fs';

const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));
const sw = master['सिंदेवाही'] || [];
console.log('Sindewahi entries count:', sw.length);
sw.forEach((item, i) => {
  console.log(`${i + 1}: ${item.title}`);
});

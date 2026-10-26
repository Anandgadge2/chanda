import fs from 'fs';

const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'))['चंद्रपूर'];
master.forEach((f, i) => {
  const code = `CHA-${String(i+1).padStart(3, '0')}`;
  console.log(`[${i+1}] ${code} -> ${f.title}`);
});

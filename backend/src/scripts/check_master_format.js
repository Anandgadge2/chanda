import fs from 'fs';

const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));
console.log('Sample key: राजुरा');
console.log('Type of element 0:', typeof master['राजुरा'][0]);
console.log('Value of element 0:', master['राजुरा'][0]);

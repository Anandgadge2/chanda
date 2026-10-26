import fs from 'fs';

export function extractCleanVillageName(rawTitle) {
  let t = rawTitle || '';
  t = t.replace(/\.xlsx.*$/i, '').replace(/Microsoft Excel.*$/i, '').trim();

  // Strip common audit prefixes
  const prefixes = [
    /^\s*1\s*[-तेtoTOत ]+\s*4[56]\s*[\.\-–—:]*\s*(?:मुद्द्यांची\s*माहिती|मुद्द्याबाबत|मुद्याबाबत|तपासणी\s*मुद्दे|तपासणी\s*मुददे|मुद्दे\s*माहिती|मुद्दे\s*ची\s*तपासणी|मुददे\s*ची\s*तपासणी|मुद्दे|मुददे|तपासणी|ची\s*तपासणी)?\s*[\.\-–—:]*\s*(?:मौजा|मौज|मौ)?\s*/i,
    /^\s*4[56]\s*मुद्द्यांची\s*माहिती\s*/i,
    /^\s*4[56]\s*मुद्द्याची\s*माहिती\s*/i,
    /^\s*4[56]\s*मुद्याची\s*माहिती\s*/i,
    /^\s*4[56]\s*मुद्दे\s*/i,
    /^\s*1\s*ते\s*54\s*/i,
    /^\s*महसूल\s*अधिकार\s*अभिलेख\s*\(सातबारा\)\s*ची\s*तपासणी\s*/i,
    /^\s*सातबारा\s*ची\s*तपासणी\s*[\-–—:]*\s*/i,
    /^\s*सातबारा\s*ची\s*[\-–—:]*\s*/i,
    /^\s*तपासणी\s*मुद्दे\s*(?:मौजा)?\s*/i,
    /^\s*गावगन्ना\s*/i,
    /^\s*मौजा\s+/i
  ];

  for (const p of prefixes) {
    t = t.replace(p, '');
  }

  // Strip trailing suffixes like '१ ते ४५', '1 ते 45', '1 to 45', 'ok', '(1)', etc.
  t = t.replace(/[\s_\.-]*[1१]\s*[-तेtoTOत]\s*4[56].*$/i, '');
  t = t.replace(/[\s_\.-]*7\.?12\s*ची\s*तपासणी.*$/i, '');
  t = t.replace(/[\s_\.-]*ok.*$/i, '');
  t = t.replace(/[\s_\.-]*final.*$/i, '');
  t = t.replace(/[\s_\.-]*सुधारीत.*$/i, '');
  t = t.replace(/[\s_\.-]*Recovered.*$/i, '');
  t = t.replace(/\(\d+\)$/i, '');
  t = t.replace(/&amp;/g, '&');
  t = t.replace(/^[0-9\.\-\_\s]+/, ''); // leading numbers like '01 - '
  t = t.trim();

  // If there is still a trailing 'गावगन्ना' or 'रीठ'
  t = t.replace(/[\s_-]+$/, '');
  return t;
}

const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));
const samples = [];
for (const [taluka, items] of Object.entries(master)) {
  for (const it of items) {
    if (!it.title || it.title === 'gondpipri_local') continue;
    const clean = extractCleanVillageName(it.title);
    samples.push({ taluka, original: it.title, clean });
  }
}

console.log('Processed', samples.length, 'master titles.');
console.log('Sample extractions:');
for (let i = 0; i < samples.length; i += 20) {
  console.log(`[${samples[i].taluka}] "${samples[i].original}"  ==>  "${samples[i].clean}"`);
}

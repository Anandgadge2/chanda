/**
 * Village Name Cleaning, Formatting, and Transliteration Utilities
 * Ensures single-language display (pure Marathi when Marathi is selected, pure English when English is selected).
 */

const DEVA_DICT = {
  'बु.': 'Bk.',
  'बु': 'Bk.',
  'बुद्रुक': 'Budruk',
  'खु.': 'Kh.',
  'खु': 'Kh.',
  'खुर्द': 'Khurd',
  'रिठ': 'Rith',
  'रीठ': 'Rith',
  'चक': 'Chak',
  'माल': 'Mal',
  'तुकूम': 'Tukum',
  'तुकुम': 'Tukum',
  'रैयतवारी': 'Raiyatwari',
  'मक्ता': 'Makta',
  'मोकासा': 'Mokasa',
  'टोला': 'Tola',
  'पेठ': 'Peth',
  'वाडा': 'Wada',
  'नगर': 'Nagar',
  'अंतापूर': 'Antapur',
  'आगडी': 'Agadi',
  'करंजी': 'Karanji',
  'कवडशी': 'Kavadashi',
  'केकापूर': 'Kekapur',
  'केम': 'Kem',
  'कोसरसार': 'Kosarsar',
  'गुंजाळा': 'Gunjala',
  'चंद्रपूर': 'Chandrapur',
  'वरोरा': 'Warora',
  'भद्रावती': 'Bhadravati',
  'बल्लारपूर': 'Ballarpur',
  'बल्लारपुर': 'Ballarpur',
  'राजुरा': 'Rajura',
  'मूल': 'Mul',
  'चिमूर': 'Chimur',
  'सिंदेवाही': 'Sindewahi',
  'ब्रह्मपुरी': 'Brahmapuri',
  'नागभीड': 'Nagbhid',
  'गोंडपिपरी': 'Gondpipri',
  'कोरपना': 'Korpana',
  'पोंभुर्णा': 'Pombhurna',
  'सावली': 'Saoli',
  'जिवती': 'Jivati',
  'देऊलवार': 'Deulwar',
  'मस्के': 'Maske',
  'अडेगांव': 'Adegaon',
  'अडेगाव': 'Adegaon',
  'कवडजई': 'Kavadjai',
  'काटवली': 'Katavali',
  'झाडबोरी': 'Zadbori',
  'झरी': 'Zari',
  'केळझर': 'Kelzar',
  'शेम्बळ': 'Shembal',
  'विसापुर': 'Visapur',
  'विसापूर': 'Visapur',
  'भगवानपुर': 'Bhagwanpur',
  'भगवानपूर': 'Bhagwanpur',
  'बामनी': 'Bamani',
  'पाथरी': 'Pathari',
  'इटोली': 'Itoli',
  'चिवंढा': 'Chivandha',
  'कळमना': 'Kalmana',
  'चांदली': 'Chandli',
  'नगराळा': 'Nagrala',
  'गोलाभूज': 'Golabhuj',
  'तेलीमेंढा': 'Telimendha',
  'मिंडाळा': 'Mindala',
  'नंदगुर': 'Nandgur',
  'पेंढरी': 'Pendhari',
  'जाठेपार': 'Jathepar',
  'दानोदा': 'Danoda',
  'तेलवासा': 'Telwasa',
  'सांडाळा': 'Sandala',
  'बिबी': 'Bibi',
  'अड्याळ': 'Adyal',
  'बोरीनवेगाव': 'Bori Navegaon',
  'कटली': 'Katali',
  'गायडोंगरी': 'Gaidongri',
  'आमडी': 'Aamdi',
  'चिरुड': 'Chirud',
  'निमगाव': 'Nimgaon',
  'गोठणगाव': 'Gothangaon',
  'कारगटा': 'Kargata',
  'खातेरा': 'Khatera',
  'पळसगाव': 'Palasgaon',
  'कुकुड': 'Kukud',
  'चिमडा': 'Chimda',
  'अंतरगाव': 'Antargaon',
  'पेटगाव': 'Petgaon',
  'नवेगाव': 'Navegaon',
  'जुगनाला': 'Jugnala',
  'डोंगरगाव': 'Dongargaon',
  'दाबगाव': 'Dabgaon',
  'चिखली': 'Chikhali',
  'जनकापूर': 'Janakapur',
  'पाटण': 'Patan',
  'गोविंदपूर': 'Govindpur',
};

export const TALUKA_MR_TO_EN = {
  'वरोरा': 'Warora',
  'राजुरा': 'Rajura',
  'चंद्रपूर': 'Chandrapur',
  'मूल': 'Mul',
  'चिमूर': 'Chimur',
  'बल्लारपूर': 'Ballarpur',
  'बल्लारपुर': 'Ballarpur',
  'भद्रावती': 'Bhadravati',
  'सिंदेवाही': 'Sindewahi',
  'ब्रह्मपुरी': 'Brahmapuri',
  'नागभीड': 'Nagbhid',
  'गोंडपिपरी': 'Gondpipri',
  'कोरपना': 'Korpana',
  'पोंभुर्णा': 'Pombhurna',
  'पोंभूर्णा': 'Pombhurna',
  'सावली': 'Saoli',
  'साओली': 'Saoli',
  'जिवती': 'Jivati',
};

export const TALUKA_EN_TO_MR = {
  'Warora': 'वरोरा',
  'Rajura': 'राजुरा',
  'Chandrapur': 'चंद्रपूर',
  'Mul': 'मूल',
  'Chimur': 'चिमूर',
  'Ballarpur': 'बल्लारपूर',
  'Ballarshah': 'बल्लारपूर',
  'Balharshah': 'बल्लारपूर',
  'Bhadravati': 'भद्रावती',
  'Bhadrawati': 'भद्रावती',
  'Sindewahi': 'सिंदेवाही',
  'Sindhewahi': 'सिंदेवाही',
  'Brahmapuri': 'ब्रह्मपुरी',
  'Nagbhid': 'नागभीड',
  'Gondpipri': 'गोंडपिपरी',
  'Gondpipari': 'गोंडपिपरी',
  'Korpana': 'कोरपना',
  'Pombhurna': 'पोंभुर्णा',
  'Saoli': 'सावली',
  'Sawali': 'सावली',
  'Jivati': 'जिवती',
};

/**
 * Format Taluka Name to Marathi or English
 */
export function formatTalukaName(name, isMarathi = true) {
  if (!name) return '';
  const clean = String(name).trim();
  if (isMarathi) {
    if (TALUKA_MR_TO_EN[clean]) return clean;
    const found = TALUKA_EN_TO_MR[clean] ||
      Object.entries(TALUKA_EN_TO_MR).find(([en]) => en.toLowerCase() === clean.toLowerCase())?.[1];
    return found || clean;
  }
  if (TALUKA_EN_TO_MR[clean]) return clean;
  return TALUKA_MR_TO_EN[clean] || clean;
}

/**
 * Format and transliterate/translate remark strings for Goshwara and Checklist tables
 */
export function formatRemarks(remark, isMarathi = true) {
  if (!remark || remark === '-') return '-';
  let str = String(remark).trim();
  if (isMarathi) {
    for (const [en, mr] of Object.entries(TALUKA_EN_TO_MR)) {
      str = str.replace(new RegExp(`\\b${en}\\b`, 'gi'), mr);
    }
    str = str.replace(/Taluka Total/gi, 'तालुका एकत्रित');
    str = str.replace(/Taluka Consolidated/gi, 'तालुका एकत्रित');
    str = str.replace(/District Consolidated Rollup/gi, 'जिल्हास्तरीय एकत्रित गोषवारा');
    str = str.replace(/Whole Taluka/gi, 'संपूर्ण तालुका');
    str = str.replace(/All Villages/gi, 'सर्व गावे');
  } else {
    for (const [mr, en] of Object.entries(TALUKA_MR_TO_EN)) {
      str = str.replace(new RegExp(mr, 'g'), en);
    }
    str = str.replace(/तालुका एकत्रित/gi, 'Taluka Total');
    str = str.replace(/जिल्हास्तरीय एकत्रित गोषवारा/gi, 'District Consolidated Rollup');
    str = str.replace(/संपूर्ण तालुका/gi, 'Whole Taluka');
    str = str.replace(/सर्व गावे/gi, 'All Villages');
  }
  return str;
}

const VOWELS = {
  'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u',
  'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'अं': 'an', 'अः': 'ah', 'ऑ': 'o', 'ॲ': 'a'
};

const MATRAS = {
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u',
  'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
  'ॉ': 'o', 'ॅ': 'a', 'ॊ': 'o', 'ॆ': 'e'
};

const CONSONANTS = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'z', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
  'ष': 'sh', 'स': 's', 'ह': 'h', 'ळ': 'l',
  'क्ष': 'ksh', 'ज्ञ': 'dny', 'श्र': 'shr',
  'ऱ': 'r', 'ड़': 'd', 'ढ़': 'dh', 'फ़': 'f', 'ज़': 'z'
};

/**
 * Clean OCR/Scrape artifacts from village name strings
 */
export function cleanVillageName(name) {
  if (!name) return '';
  if (
    name === 'संपूर्ण तालुका (All Villages)' ||
    name === 'संपूर्ण तालुका' ||
    name === 'Whole Taluka' ||
    name === 'all' ||
    name === 'सर्व गावे' ||
    name === 'All Villages'
  ) {
    return name;
  }

  let raw = String(name);
  raw = raw.replace(/[1१]\s*[-तते]\s*[4४][56५६]/gi, '');
  raw = raw.replace(/[4४][56५६]\s*[-तते]\s*[1१]/gi, '');
  raw = raw.replace(/[1१]\s*[-तते]\s*[1-9१-९]+/gi, '');
  raw = raw.replace(/[1-9१-९]+\s*[-तते]\s*[1-9१-९]+/gi, '');
  raw = raw.replace(/1-46|१-४६|1-45|१-४५/gi, '');
  raw = raw.replace(/१ त ४५|१ ते ४६|1 to 46|1 to 45/gi, '');
  raw = raw.replace(/[4४][56५६]\s*मद[दत]?/gi, '');
  raw = raw.replace(/मद[दत]?\s+/gi, '');
  raw = raw.replace(/मदयच/gi, '');
  raw = raw.replace(/महसल\s*अधकर\s*अभलख/gi, '');
  raw = raw.replace(/महिती|महत/gi, '');
  raw = raw.replace(/तपसण[ी]?\s*सतर/gi, '');
  raw = raw.replace(/तपसण[ी]?/gi, '');
  raw = raw.replace(/Worksheet\s*\d*/gi, '');
  raw = raw.replace(/सधरत/gi, '');
  raw = raw.replace(/2026/g, '');
  raw = raw.replace(/^मंडळ\s*/i, '');
  raw = raw.trim().replace(/\s+/g, ' ');
  return raw || name;
}

/**
 * Transliterates a single Devanagari word into English with Marathi phonetic rules
 */
function transliterateWord(word) {
  if (!word) return '';
  if (DEVA_DICT[word]) return DEVA_DICT[word];
  
  const clean = word.replace(/^[,\.\(\)]+|[,\.\(\)]+$/g, '');
  if (DEVA_DICT[clean]) return DEVA_DICT[clean];

  // Common Marathi administrative and revenue village suffixes
  let suffixMatch = '';
  let root = word;
  
  const suffixes = [
    { mar: /(?:गाव|गांव|गावं)$/, eng: 'gaon' },
    { mar: /(?:पूर|पुर)$/, eng: 'pur' },
    { mar: /(?:वाडी|वाड़ी)$/, eng: 'wadi' },
    { mar: /(?:खेड|खेडे)$/, eng: 'khed' },
    { mar: /(?:बोरी)$/, eng: 'bori' },
    { mar: /(?:डोंगरी)$/, eng: 'dongri' },
    { mar: /(?:मेंढा)$/, eng: 'mendha' },
    { mar: /(?:टोला)$/, eng: 'tola' },
    { mar: /(?:पेठ)$/, eng: 'peth' },
    { mar: /(?:नगर)$/, eng: 'nagar' },
  ];

  for (const s of suffixes) {
    if (s.mar.test(root)) {
      suffixMatch = s.eng;
      root = root.replace(s.mar, '');
      break;
    }
  }

  let result = '';
  const len = root.length;
  
  for (let i = 0; i < len; i++) {
    const ch = root[i];
    const nextCh = i + 1 < len ? root[i + 1] : null;

    if (ch === '्') {
      continue;
    }

    if (VOWELS[ch]) {
      result += VOWELS[ch];
      continue;
    }

    if (CONSONANTS[ch]) {
      const cEng = CONSONANTS[ch];
      result += cEng;

      if (nextCh === '्') {
        continue;
      } else if (MATRAS[nextCh]) {
        continue;
      } else if (nextCh === 'ं' || nextCh === 'ँ') {
        result += 'a';
        continue;
      } else if (i === len - 1 && !suffixMatch) {
        // Marathi schwa deletion: drop final unvoweled inherent 'a'
        continue;
      } else {
        result += 'a';
      }
      continue;
    }

    if (MATRAS[ch]) {
      result += MATRAS[ch];
      continue;
    }

    if (ch === 'ं' || ch === 'ँ') {
      if (nextCh && ['प', 'फ', 'ब', 'भ', 'म'].includes(nextCh)) {
        result += 'm';
      } else {
        result += 'n';
      }
      continue;
    }

    if (ch === 'ः') {
      result += 'h';
      continue;
    }

    result += ch;
  }

  // Combine root and recognized suffix
  if (suffixMatch) {
    if (result.endsWith('a') && result.length > 2) {
      result = result.slice(0, -1);
    }
    result += suffixMatch;
  }

  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  return result;
}

/**
 * Transliterates a Devanagari string to English
 */
const translitCache = new Map();

export function transliterateDevanagariToEnglish(text) {
  if (!text) return '';
  if (translitCache.has(text)) return translitCache.get(text);

  // If text already has only ASCII/English characters, return formatted
  if (/^[A-Za-z0-9\s\.\,\-\/\(\)]+$/.test(text)) {
    const res = text
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    translitCache.set(text, res);
    return res;
  }

  // If comma separated list (e.g. "चिखली बु, जनकापूर, डोंगरगाव")
  if (text.includes(',')) {
    const parts = text.split(',').map(p => transliterateDevanagariToEnglish(p.trim()));
    const res = parts.join(', ');
    translitCache.set(text, res);
    return res;
  }

  const res = text.split(/\s+/).map(transliterateWord).join(' ');
  translitCache.set(text, res);
  return res;
}

/**
 * Single-Language Village Formatter
 * When isMarathi is true -> Clean Marathi
 * When isMarathi is false -> English (Transliterated from Devanagari or cleaned English)
 */
export function formatVillageName(name, isMarathi = true) {
  if (!name) return isMarathi ? 'अज्ञात गाव' : 'Unknown Village';

  if (name === 'all' || name === 'सर्व गावे' || name === 'All Villages') {
    return isMarathi ? 'सर्व गावे' : 'All Villages';
  }

  if (
    name === 'संपूर्ण तालुका (All Villages)' ||
    name === 'संपूर्ण तालुका' ||
    name === 'Whole Taluka' ||
    name === 'Whole Taluka Rollup'
  ) {
    return isMarathi ? 'संपूर्ण तालुका' : 'Whole Taluka';
  }

  if (
    name === 'संपूर्ण जिल्हा (सर्व १५ तालुके)' ||
    name === 'Whole District Rollup'
  ) {
    return isMarathi ? 'संपूर्ण जिल्हा' : 'Whole District';
  }

  const cleaned = cleanVillageName(name);

  if (isMarathi) {
    // If it was stored in English, see if we have a Marathi mapping or return cleaned
    if (/^[A-Za-z0-9\s\.\,\-]+$/.test(cleaned)) {
      const match = TALUKA_EN_TO_MR[cleaned];
      if (match) return match;
    }
    return cleaned;
  }

  // English requested
  return transliterateDevanagariToEnglish(cleaned);
}

/**
 * Format scope description text (e.g. "तालुका: Warora (सर्व गावे)") into single-language
 */
export function formatScopeText(scopeText, isMarathi = true) {
  if (!scopeText) return '';
  let str = String(scopeText).trim();

  if (isMarathi) {
    // Convert any English taluka name inside to Marathi
    for (const [en, mr] of Object.entries(TALUKA_EN_TO_MR)) {
      str = str.replace(new RegExp(`\\b${en}\\b`, 'g'), mr);
    }
    str = str.replace(/All Villages/g, 'सर्व गावे');
    str = str.replace(/Taluka:/gi, 'तालुका:');
    str = str.replace(/Village:/gi, 'गाव:');
    str = str.replace(/District:/gi, 'जिल्हा:');
    str = str.replace(/\(All 15 Talukas\)/gi, '(सर्व १५ तालुके)');
    return str;
  }

  // English requested
  for (const [mr, en] of Object.entries(TALUKA_MR_TO_EN)) {
    str = str.replace(new RegExp(mr, 'g'), en);
  }
  str = str.replace(/सर्व गावे/g, 'All Villages');
  str = str.replace(/तालुका:/g, 'Taluka:');
  str = str.replace(/गाव:/g, 'Village:');
  str = str.replace(/जिल्हा:/g, 'District:');
  str = str.replace(/\(सर्व १५ तालुके\)/g, '(All 15 Talukas)');
  str = str.replace(/चंद्रपूर जिल्हा कार्यक्षेत्र/g, 'Chandrapur District Jurisdiction');

  // If there is any Marathi village name in the scope like "गाव: अंतापूर रिठ"
  const villageMatch = str.match(/(?:Village|गाव):\s*([^\(]+)/);
  if (villageMatch && villageMatch[1]) {
    const rawV = villageMatch[1].trim();
    const transV = transliterateDevanagariToEnglish(cleanVillageName(rawV));
    str = str.replace(rawV, transV);
  }

  return str;
}

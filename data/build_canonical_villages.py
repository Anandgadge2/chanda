import json
import os
import re
import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')

MASTER_PATH = r"d:\chanda\data\all_talukas_master_filelist.json"
GP_MANIFEST_PATH = r"d:\chanda\data\gondpipri_real_data\manifest.json"

master = json.load(open(MASTER_PATH, "r", encoding="utf-8"))
gp_manifest = json.load(open(GP_MANIFEST_PATH, "r", encoding="utf-8"))

TALUKA_MAP = {
    "कोरपना": "Korpana",
    "चंद्रपूर": "Chandrapur",
    "चिमूर": "Chimur",
    "जिवती": "Jivati",
    "नागभीड": "Nagbhid",
    "पोमभुर्णा": "Pombhurna",
    "बल्लारपूर": "Ballarpur",
    "ब्रम्हपुरी": "Brahmapuri",
    "भद्रावती": "Bhadravati",
    "मुल": "Mul",
    "राजुरा": "Rajura",
    "वरोरा": "Warora",
    "सावली": "Saoli",
    "सिंदेवाही": "Sindewahi",
    "गोंडपिपरी": "Gondpipri"
}

def clean_title_to_village_name(title, taluka_en):
    t = str(title or '').strip()
    t = re.sub(r'\.xlsx.*$', '', t, flags=re.I)
    t = re.sub(r'Microsoft Excel.*$', '', t, flags=re.I)
    t = t.replace('&amp;', '&').strip()

    # Special case mappings
    if '1 TO 45 TOK' in title or '1 TO 45  TOK' in title:
        return 'टोक'

    # Normalize underscores to spaces for compound titles
    if '_' in t and ('मुद्दे' in t or 'मुददे' in t or 'तपासणी' in t):
        t = t.replace('_', ' ')

    # Gondpipri saza stripping
    if taluka_en == 'Gondpipri':
        t = re.sub(r'[\s_\.-]*साजा\s*[-–—:]*\s*.*$', '', t)
        t = re.sub(r'[\s_\.-]*सज\s*[-–—:]*\s*.*$', '', t)

    # Common prefixes to remove (iteratively)
    prefixes = [
        r'^\s*1\s*[-–—तेtoTOत ]+\s*(?:4[56]|४[५६])\s*[\.\-–—:]*\s*(?:मुद्द्यांची\s*माहिती|मुद्द्याची\s*माहिती|मुद्याची\s*माहिती|मुद्द्याबाबत|मुद्याबाबत|तपासणी\s*मुद्दे|तपासणी\s*मुददे|मुद्दे\s*माहिती|मुद्दे\s*ची\s*तपासणी|मुददे\s*ची\s*तपासणी|मुद्दे|मुददे|तपासणी|ची\s*तपासणी)?\s*[\.\-–—:]*\s*(?:मौजा|मौज|मौ)?\s*',
        r'^\s*(?:4[56]|४[५६])\s*(?:मुद्द्यांची|मुद्द्याची|मुद्याची|मुद्याबाबत|मुद्द्याबाबत|मुद्दे|मुददे)\s*(?:माहिती)?\s*[\.\-–—:]*\s*',
        r'^\s*1\s*[-–—तेtoTOत ]+\s*(?:54|५४)\s*[\.\-–—:]*\s*',
        r'^\s*महसूल\s*अधिकार\s*अभिलेख\s*\(?सातबारा\)?\s*(?:[1१]\s*[-–—तेtoTOत ]+\s*(?:4[56]|४[५६]))?\s*(?:ची)?\s*(?:तपासणी)?\s*(?:मौजा|मौज|मौ)?\s*[\.\-–—:]*\s*',
        r'^\s*सातबारा\s*ची\s*तपासणी\s*[\.\-–—:]*\s*',
        r'^\s*सातबारा\s*ची\s*[\.\-–—:]*\s*',
        r'^\s*सातबारा\s*तपासणी\s*[\.\-–—:]*\s*',
        r'^\s*तपासणी\s*मुद्दे\s*(?:मौजा|मौज|मौ)?\s*',
        r'^\s*तपासणी\s*मुददे\s*(?:मौजा|मौज|मौ)?\s*',
        r'^\s*(?:मुद्दे|मुददे|मुदे)\s*तपासणी\s*(?:मौजा|मौज|मौ)?\s*',
        r'^\s*मुद्द्याबाबत\s*(?:मौजा|मौज|मौ)?\s*',
        r'^\s*मुद्याबाबत\s*(?:मौजा|मौज|मौ)?\s*',
        r'^\s*गावगन्ना\s*',
        r'^\s*मौजा\s+',
        r'^\s*मौज\s+',
        r'^\s*तपासणी\s+'
    ]

    changed = True
    while changed:
        before = t
        for p in prefixes:
            t = re.sub(p, '', t, flags=re.I).strip()
        changed = (t != before)

    # Suffixes to remove
    suffixes = [
        r'[\s_\.-]*\(?सातबारा\s*\)?\s*ची\s*तपासणी.*$',
        r'[\s_\.-]*7\.?12\s*ची\s*तपासणी.*$',
        r'[\s_\.-]*[1१]\s*[-–—तेtoTOत ]+\s*(?:4[56]|४[५६])\s*(?:मुद्दे|मुददे|माहिती)?.*$',
        r'[\s_\.-]*(?:4[56]|४[५६])\s*(?:मुद्दे|मुददे|माहिती)?\s*final.*$',
        r'[\s_\.-]*(?:4[56]|४[५६])\s*(?:मुद्दे|मुददे|माहिती)\s*$',
        r'[\s_\.-]*(?:54|५४)\s*final.*$',
        r'[\s_\.-]*final.*$',
        r'[\s_\.-]*ok.*$',
        r'[\s_\.-]*सुधारीत.*$',
        r'[\s_\.-]*Recovered.*$',
        r'[\s_\.-]*\(\d+\)$',
        r'[\s_\.-]*_\d+_\d+$'
    ]

    changed = True
    while changed:
        before = t
        for s in suffixes:
            t = re.sub(s, '', t, flags=re.I).strip()
        changed = (t != before)

    # Strip leading index numbers (e.g., '01 - ', '01_')
    t = re.sub(r'^[0-9]+[\s_\.\-–—:]+', '', t).strip()
    t = re.sub(r'[\s_\.\-–—:]+$', '', t).strip()
    return t

canonical_records = []

for mr_taluka, en_taluka in TALUKA_MAP.items():
    if en_taluka == "Gondpipri":
        items = gp_manifest
        for idx, it in enumerate(items, 1):
            raw_title = it.get('title', '')
            clean_v = clean_title_to_village_name(raw_title, en_taluka)
            code = f"GON-{idx:03d}"
            canonical_records.append({
                "taluka": en_taluka,
                "talukaMr": mr_taluka,
                "index": idx,
                "villageCode": code,
                "rawTitle": raw_title,
                "cleanVillageName": clean_v
            })
    else:
        items = master.get(mr_taluka, [])
        for idx, it in enumerate(items, 1):
            raw_title = it.get('title', '')
            if not raw_title:
                continue
            clean_v = clean_title_to_village_name(raw_title, en_taluka)
            code = f"{en_taluka[:3].upper()}-{idx:03d}"
            canonical_records.append({
                "taluka": en_taluka,
                "talukaMr": mr_taluka,
                "index": idx,
                "villageCode": code,
                "rawTitle": raw_title,
                "cleanVillageName": clean_v,
                "circle": it.get('circle')
            })

print(f"Total canonical records generated: {len(canonical_records)}")

# Group by taluka and show samples
by_t = {}
for r in canonical_records:
    by_t.setdefault(r['taluka'], []).append(r)

for t, recs in sorted(by_t.items()):
    print(f"\nTaluka: {t} ({len(recs)} villages)")
    for r in recs[:3]:
        print(f"  {r['villageCode']}: '{r['rawTitle']}' -> '{r['cleanVillageName']}'")

# Save canonical mapping
with open(r"d:\chanda\data\canonical_village_names.json", "w", encoding="utf-8") as f:
    json.dump(canonical_records, f, ensure_ascii=False, indent=2)

print("\nSaved canonical village names to d:\\chanda\\data\\canonical_village_names.json")

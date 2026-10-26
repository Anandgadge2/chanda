import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

records = json.load(open(r"d:\chanda\data\canonical_village_names.json", encoding="utf-8"))

suspicious = []
for r in records:
    v = r['cleanVillageName']
    t = r['taluka']
    c = r['villageCode']
    raw = r['rawTitle']
    
    # Check for leftover junk
    if re.search(r'[1१]\s*[-–—तेtoTOत ]+\s*(?:4[56]|४[५६])', v):
        suspicious.append((c, t, v, raw, 'Contains 1-45'))
    elif re.search(r'तपासणी|मुद्दे|मुददे|माहिती|सातबारा', v):
        suspicious.append((c, t, v, raw, 'Contains checklist words'))
    elif re.search(r'^\s*मौजा\s+', v):
        suspicious.append((c, t, v, raw, 'Contains leading मौजा'))
    elif len(v) < 2:
        suspicious.append((c, t, v, raw, 'Too short'))

print(f"Total canonical records: {len(records)}")
print(f"Total suspicious records: {len(suspicious)}")
for s in suspicious:
    print(f'  [{s[0]}] {s[1]}: "{s[2]}" (Reason: {s[4]}) | Raw: "{s[3]}"')

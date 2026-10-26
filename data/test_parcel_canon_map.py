import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

canon = json.load(open(r"d:\chanda\data\canonical_village_names.json", encoding="utf-8"))
canon_map = {f"{r['taluka']}___{r['villageCode']}": r['cleanVillageName'] for r in canon}

parcels = json.load(open(r"d:\chanda\data\all_talukas_parcels.json", encoding="utf-8"))
missing = set()
for p in parcels:
    key = f"{p['taluka']}___{p['villageCode']}"
    if key not in canon_map:
        missing.add(key)

print(f"Total parcels: {len(parcels)}")
print(f"Missing keys: {len(missing)}")
if missing:
    print("Samples:", list(missing)[:5])
else:
    print("ALL 100% of parcels match canonical villageCode!")

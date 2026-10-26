import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

rollups = json.load(open(r"d:\chanda\data\all_talukas_rollups.json", encoding="utf-8"))
canon = json.load(open(r"d:\chanda\data\canonical_village_names.json", encoding="utf-8"))

r_by_t = {}
for r in rollups:
    if r['villageName'] == 'संपूर्ण तालुका (All Villages)':
        continue
    r_by_t.setdefault(r['taluka'], []).append(r)

c_by_t = {}
for c in canon:
    c_by_t.setdefault(c['taluka'], []).append(c)

print("TALUKA-WISE INDEX ALIGNMENT:")
for t in sorted(r_by_t.keys()):
    r_list = r_by_t[t]
    c_list = c_by_t.get(t, [])
    print(f"\n{t:12} | Rollups: {len(r_list):2} | Canon: {len(c_list):2}")
    for i in range(min(4, len(r_list), len(c_list))):
        print(f'   [{i+1}] Rollup: "{r_list[i]["villageName"]}" <--> Canon: "{c_list[i]["cleanVillageName"]}" (Code: {c_list[i]["villageCode"]})')

import json
import urllib.request
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
headers = {'User-Agent': 'Mozilla/5.0'}

with open(r'd:\chanda\data\all_talukas_inspection.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

subfolder_results = {}
for taluka in ['नागभीड', 'भद्रावती', 'वरोरा', 'सिंदेवाही', 'पोमभुर्णा']:
    items = data[taluka].get('items', [])
    folders = [it for it in items if 'Shared folder' in it.get('title', '')]
    print(f"\n=== {taluka} has {len(folders)} subfolders ===")
    subfolder_results[taluka] = {}
    for fld in folders:
        fld_id = fld['id']
        fld_title = fld['title'].replace(' Shared folder', '')
        url = f"https://drive.google.com/drive/folders/{fld_id}"
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                html = resp.read().decode('utf-8', errors='ignore')
            f_items = re.findall(r'data-id="([a-zA-Z0-9_\-]+)"[^>]*data-tooltip="([^"]+)"', html)
            seen = set()
            files = []
            for fid, title in f_items:
                if fid not in seen:
                    seen.add(fid)
                    files.append({'id': fid, 'title': title})
            print(f"  - Subfolder [{fld_title}]: {len(files)} items")
            subfolder_results[taluka][fld_title] = {'id': fld_id, 'files': files}
        except Exception as e:
            print(f"  - Error {fld_title}: {e}")

with open(r'd:\chanda\data\subfolders_inspection.json', 'w', encoding='utf-8') as f:
    json.dump(subfolder_results, f, ensure_ascii=False, indent=2)

print("\nSubfolders inspection saved successfully.")

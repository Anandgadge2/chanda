import urllib.request
import re
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

talukas_folders = [
    ("कोरपना", "1xwSqrUv9vmd5Jj4VFwzpoXbf35QkaC-Y"),
    ("चंद्रपूर", "1DjkNh4vgCTIfSdbeO9hDpdcRfqncXFmV"),
    ("चिमूर", "1xvX4gDJ4YlC1eN20PUNleOSbGKzIBI_i"),
    ("जिवती", "1-TpV087VkvQMEWwsNNZhNk8nYCRr8WH9"),
    ("नागभीड", "1cc68jWHUT6Zi9FoiOFgUCVO9rY-Yg20U"),
    ("पोमभुर्णा", "1tkUGszn3Y_oI5Ukpl5ttlIiQnmoygUoX"),
    ("बल्लारपूर", "15-tlRHZRC7Ha_uXD6E0qP3MiLrucfskt"),
    ("ब्रम्हपुरी", "1ZfXxCGRRBq3HYZvzSoWjugPFM-VDz-7p"),
    ("भद्रावती", "1YS2kTROVSzi0FheGfjc1isDpCCXcLAiA"),
    ("मुल", "1H0o-VjsNesRBWiKVVxyVlWLgWpeH98s5"),
    ("राजुरा", "1ue4Dg51n7O46daDgF1QcPBLqrg0zm1BS"),
    ("वरोरा", "1DS1HGb7fpH9izp9g-v3zjaQBpGkBIcP4"),
    ("सावली", "1cTKgLsQs1kAQ-YLKho17tVpDQph6Ktsx"),
    ("सिंदेवाही", "1Cz1jHP7LdkJ9UCdKeO1y41RLSKwCkrJD")
]

headers = {'User-Agent': 'Mozilla/5.0'}

results = {}

for name, folder_id in talukas_folders:
    url = f"https://drive.google.com/drive/folders/{folder_id}"
    print(f"\n--- Checking Taluka: {name} ({folder_id}) ---")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            
        items = re.findall(r'data-id="([a-zA-Z0-9_\-]+)"[^>]*data-tooltip="([^"]+)"', html)
        unique_items = []
        seen = set()
        for fid, title in items:
            if fid not in seen:
                seen.add(fid)
                unique_items.append({"id": fid, "title": title})
                
        print(f"Found {len(unique_items)} items in {name}:")
        for it in unique_items[:5]:
            print(f"  - {it['title']} ({it['id']})")
        if len(unique_items) > 5:
            print(f"  ... and {len(unique_items) - 5} more")
            
        results[name] = {"folderId": folder_id, "count": len(unique_items), "items": unique_items}
    except Exception as e:
        print(f"Error checking {name}: {e}")
        results[name] = {"folderId": folder_id, "error": str(e)}

with open(r"d:\chanda\data\all_talukas_inspection.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\nSummary saved to d:\chanda\data\all_talukas_inspection.json")

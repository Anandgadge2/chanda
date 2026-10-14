import os
import json
import urllib.request
import time
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')

MASTER_LIST = r"d:\chanda\data\all_talukas_master_filelist.json"
OUTPUT_DIR = r"d:\chanda\data\all_talukas_raw"
os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(MASTER_LIST, "r", encoding="utf-8") as f:
    master = json.load(f)

# Map Marathi taluka names to canonical folder names
TALUKA_NAME_MAP = {
    "कोरपना": "Korpana",
    "चंद्रपूर": "Chandrapur",
    "चिमूर": "Chimur",
    "जिवती": "Jivati",
    "नागभीड": "Nagbhid",
    "पोमभुर्णा": "Pombhurna",
    "बल्लारपूर": "Ballarpur",
    "ब्रम्हपुरी": "Bramhapuri",
    "भद्रावती": "Bhadravati",
    "मुल": "Mul",
    "राजुरा": "Rajura",
    "वरोरा": "Warora",
    "सावली": "Saoli",
    "सिंदेवाही": "Sindewahi"
}

tasks = []
for mr_name, en_name in TALUKA_NAME_MAP.items():
    items = master.get(mr_name, [])
    t_dir = os.path.join(OUTPUT_DIR, en_name)
    os.makedirs(t_dir, exist_ok=True)
    
    for idx, it in enumerate(items, 1):
        if 'id' not in it:
            continue
        sheet_id = it['id']
        title = it['title'].replace(" Microsoft Excel", "").replace(".xlsx", "").strip()
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_', '.')).rstrip()
        filename = f"{idx:02d}_{safe_title}.xlsx"
        filepath = os.path.join(t_dir, filename)
        tasks.append({
            "talukaMr": mr_name,
            "talukaEn": en_name,
            "index": idx,
            "id": sheet_id,
            "title": title,
            "circle": it.get('circle'),
            "filepath": filepath,
            "filename": filename
        })

print(f"Total tasks prepared: {len(tasks)} files across {len(TALUKA_NAME_MAP)} talukas.")

def download_file(task):
    filepath = task["filepath"]
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        return {"status": "skipped", "task": task, "size": os.path.getsize(filepath)}
    
    url = f"https://docs.google.com/spreadsheets/d/{task['id']}/export?format=xlsx"
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    for attempt in range(1, 4):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = resp.read()
            if len(data) > 500:
                with open(filepath, "wb") as f:
                    f.write(data)
                return {"status": "success", "task": task, "size": len(data)}
            else:
                time.sleep(1)
        except Exception as e:
            if attempt == 3:
                return {"status": "error", "task": task, "error": str(e)}
            time.sleep(attempt * 1.5)
    return {"status": "failed", "task": task}

results = []
success_count = 0
error_count = 0
skipped_count = 0

start_time = time.time()
print("Starting concurrent downloads with 8 workers...")

with ThreadPoolExecutor(max_workers=8) as executor:
    futures = {executor.submit(download_file, t): t for t in tasks}
    completed = 0
    for future in as_completed(futures):
        completed += 1
        res = future.result()
        results.append(res)
        if res["status"] == "success":
            success_count += 1
        elif res["status"] == "skipped":
            skipped_count += 1
        else:
            error_count += 1
            
        if completed % 25 == 0 or completed == len(tasks):
            elapsed = time.time() - start_time
            print(f"[{completed}/{len(tasks)}] Finished: {success_count} downloaded, {skipped_count} skipped, {error_count} errors ({elapsed:.1f}s)")

with open(r"d:\chanda\data\download_manifest.json", "w", encoding="utf-8") as f:
    json.dump({
        "total": len(tasks),
        "success": success_count,
        "skipped": skipped_count,
        "error": error_count,
        "timeSeconds": time.time() - start_time
    }, f, ensure_ascii=False, indent=2)

print("\nDownload process completed!")
print(f"Summary: {success_count} downloaded, {skipped_count} skipped, {error_count} errors in {time.time() - start_time:.1f}s")

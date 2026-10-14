import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

sample_file = r"d:\chanda\data\all_talukas_raw\Warora\01_कसरसर १ त ४५.xlsx"
boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"

with open(sample_file, "rb") as f:
    file_bytes = f.read()

part1 = (
    f"--{boundary}\r\n"
    f"Content-Disposition: form-data; name=\"taluka\"\r\n\r\n"
    f"Warora\r\n"
    f"--{boundary}\r\n"
    f"Content-Disposition: form-data; name=\"villageName\"\r\n\r\n"
    f"कोसरसार\r\n"
    f"--{boundary}\r\n"
    f"Content-Disposition: form-data; name=\"file\"; filename=\"kosarsar.xlsx\"\r\n"
    f"Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n"
).encode("utf-8")

part2 = f"\r\n--{boundary}--\r\n".encode("utf-8")
body = part1 + file_bytes + part2

req = urllib.request.Request(
    "http://127.0.0.1:5000/api/prapatra/upload",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    method="POST"
)

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        res = json.load(resp)
        print("Upload Result:")
        print("  - Success:", res.get("success"))
        print("  - Message:", res.get("message"))
        print("  - Village:", res.get("village"))
        print("  - Taluka:", res.get("taluka"))
        print("  - Stats:", res.get("stats"))
except Exception as e:
    print("Upload Error:", e)

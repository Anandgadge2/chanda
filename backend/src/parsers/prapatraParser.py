import openpyxl
import os
import sys
import json
import re

# Ensure standard output uses UTF-8 encoding for Devanagari Unicode
sys.stdout.reconfigure(encoding='utf-8')

if len(sys.argv) < 2:
    print(json.dumps({"success": False, "error": "No file path provided"}))
    sys.exit(1)

fpath = sys.argv[1]
taluka_override = sys.argv[2] if len(sys.argv) > 2 else ""
original_fname = sys.argv[3] if len(sys.argv) > 3 else os.path.basename(fpath)

if not os.path.exists(fpath):
    print(json.dumps({"success": False, "error": f"File not found: {fpath}"}))
    sys.exit(1)

def clean_area(val):
    if val is None:
        return 0.0
    s = str(val).strip()
    if not s or s in ['-', '_', 'निरंक', 'None']:
        return 0.0
    s_clean = re.sub(r'\s+', '', s)
    s_clean = re.sub(r'\.{2,}', '.', s_clean)
    match = re.search(r'(\d+(?:\.\d+)?)', s_clean)
    if match:
        try:
            return round(float(match.group(1)), 4)
        except Exception:
            return 0.0
    return 0.0

def clean_survey_no(val):
    if val is None:
        return None
    s = str(val).strip()
    if not s or s in ['-', '_', 'निरंक', 'None']:
        return None
    if s.endswith('.0'):
        s = s[:-2]
    if len(s) > 30 or any(w in s for w in ['सक्षम', 'बंदी', 'आदिवासी', 'हस्तांतरण', 'परवानगी', 'जमीन', 'नियम']):
        return None
    return s[:30]

def normalize_tenure(val, other_rights, bandobast_tenure, owner):
    s = str(val or "").strip()
    owner_str = str(owner or "").strip()
    rights_str = str(other_rights or "").strip()
    b_tenure = str(bandobast_tenure or "").strip()

    if any(k in owner_str for k in ['महाराष्ट्र शासन', 'सरकार', 'शासन', 'कालवा', 'तलाव', 'गायरान', 'सार्वजनिक', 'राखीव']):
        return "SARKAR_SHASAN"
    if 'वन' in s or 'वन' in owner_str:
        return "FOREST_JANGAL"
    if 'देवस्थान' in s or 'इनाम' in s:
        return "DEVASTHAN_INAM"
    if '2' in s or '२' in s:
        return "BHOGVATDAR_CLASS_2"
    if any(k in rights_str for k in ['आदिवासी', 'आदीवासी', '36', '३६', 'शर्तभंग', 'सक्षम प्राधिकारी']):
        return "BHOGVATDAR_CLASS_2"
    if '1' in s or '१' in s or 'भूमिधारी' in b_tenure:
        return "BHOGVATDAR_CLASS_1"
    return "BHOGVATDAR_CLASS_1"

def clean_village_name(fname, first_v_cell):
    if first_v_cell and len(str(first_v_cell).strip()) > 2 and str(first_v_cell).strip() not in ['-', '_', 'None', 'गावाचे नाव']:
        clean_v = str(first_v_cell).strip()
        clean_v = re.sub(r'^[0-9\.\-\_\s]+', '', clean_v)
        if len(clean_v) > 2:
            return clean_v[:80]
    v = fname
    for prefix in [
        '45 मुद्द्याची माहिती', '1 ते 45 तपासणी  मुद्दे  मौजा', '1 ते 45 तपासणी मुददे',
        '1 ते 45 मुददे ची तपासणी -', '1 ते 45 मुद्दे', '1 to 45.', '1 to 46',
        '1 ते 46', '1  ते 46', '1 ते 54', '1 TO 45', '1 TO 46', '1ते45'
    ]:
        v = v.replace(prefix, '')
    v = re.sub(r'^\d+[\s_\.-]*', '', v)
    v = re.sub(r'[\s_\.-]*ok.*$', '', v, flags=re.I)
    v = re.sub(r'\.xlsx$', '', v, flags=re.I)
    v = re.sub(r'Microsoft Excel.*$', '', v, flags=re.I)
    v = v.strip()
    return v if len(v) > 1 else fname.replace('.xlsx', '')[:40]

try:
    wb = openpyxl.load_workbook(fpath, data_only=True, read_only=True)
    ws = wb.worksheets[0]
    
    header_row = 3
    sample_village = None
    rows_data = []

    for r_idx, r in enumerate(ws.iter_rows(values_only=True), 1):
        if r_idx <= 6:
            vals_str = [str(x or '') for x in r[:10]]
            if any('गाव' in v for v in vals_str) or any('सर्व्हे' in v for v in vals_str):
                header_row = r_idx
            if len(r) > 1 and r[1] and str(r[1]).strip() not in ['-', '_', 'None', 'गावाचे नाव', '1', '2']:
                if not sample_village and len(str(r[1]).strip()) > 2:
                    sample_village = str(r[1]).strip()
        else:
            if any(r[:6]):
                rows_data.append(r)

    # Prefer original_fname over temp upload path
    fname = original_fname or os.path.basename(fpath)
    v_name = clean_village_name(fname, sample_village)
    # Double safeguard: if v_name is still a hex hash or empty, fallback
    if not v_name or re.match(r'^[0-9a-f]{16,}$', v_name, re.I):
        fallback = os.path.splitext(original_fname)[0] if original_fname else 'गाव'
        v_name = clean_village_name(fallback, None)
    
    v_stats = {
        "total712": 0,
        "inspected1950": 0,
        "govt1950": 0,
        "illegalDel": 0,
        "pokalist": 0,
        "corpAllot": 0,
        "corpShartbhang": 0,
        "privateAllot": 0,
        "privateShartbhang": 0,
        "totalGovt": 0,
        "govtAllotted": 0,
        "govtShartbhang": 0,
        "govtEncroach": 0,
        "govtMojani": 0
    }

    parcels = []

    for r_idx, r in enumerate(rows_data, 1):
        survey_raw = r[2] if len(r) > 2 else None
        area_raw = r[3] if len(r) > 3 else None
        tenure_raw = r[4] if len(r) > 4 else None
        owner_raw = r[5] if len(r) > 5 else None
        rights_raw = r[6] if len(r) > 6 else None

        if not any([survey_raw, area_raw, owner_raw]):
            continue

        survey_clean = clean_survey_no(survey_raw) or f"S-{r_idx}"
        area_clean = clean_area(area_raw)
        owner_clean = str(owner_raw or "अज्ञात खातेदार").strip()[:240]
        rights_clean = str(rights_raw or "नाही").strip()

        b_no = clean_survey_no(r[7]) if len(r) > 7 else None
        b_owner = str(r[8] or "").strip()[:240] if len(r) > 8 else ""
        b_tenure = str(r[9] or "").strip()[:60] if len(r) > 9 else ""

        col17_sarkar = str(r[16] or "").strip() if len(r) > 16 else ""
        col18_illegal_del = str(r[24] or "").strip() if len(r) > 24 else ""
        col19_pokalist = str(r[25] or "").strip() if len(r) > 25 else ""
        col21_private_allot = str(r[20] or "").strip() if len(r) > 20 else ""
        col22_encroach = str(r[21] or "").strip() if len(r) > 21 else ""
        col23_mojani = str(r[22] or "").strip() if len(r) > 22 else ""
        col24_corp = str(r[30] or "").strip() if len(r) > 30 else ""
        col26_tribal = str(r[32] or "").strip() if len(r) > 32 else ""
        col35_shartbhang = str(r[41] or "").strip() if len(r) > 41 else ""
        col36_shartbhang_use = str(r[42] or "").strip() if len(r) > 42 else ""

        tenure_final = normalize_tenure(tenure_raw, rights_clean, b_tenure, owner_clean)
        is_govt = (tenure_final == "SARKAR_SHASAN") or ('सरकार' in col17_sarkar or 'शासन' in col17_sarkar)
        is_illegal_del = col18_illegal_del in ['होय', '1', '1.0'] or ('अवैध' in col18_illegal_del)
        is_pokalist = col19_pokalist in ['होय', '1', '1.0'] or any(k in col19_pokalist for k in ['बु.ग.दे', 'ता.ग.दे', 'सं.कु'])
        is_encroach = col22_encroach in ['होय', '1', '1.0']
        is_mojani = col23_mojani in ['होय', '1', '1.0'] or ('आहे' in col23_mojani)
        is_shartbhang = (col35_shartbhang in ['होय', '1', '1.0']) or (col36_shartbhang_use and col36_shartbhang_use not in ['नाही', '-', '0', '0.0', 'निरंक', '_', 'नोंद नाही'])
        is_tribal = (col26_tribal in ['होय', '1', '1.0']) or ('आदिवासी' in rights_clean)
        is_corp_allot = (col24_corp and col24_corp not in ['नाही', '-', '0', '0.0', 'निरंक', '_', 'नोंद नाही'])
        is_private_allot = (col21_private_allot in ['होय', '1', '1.0']) or (col21_private_allot and col21_private_allot not in ['नाही', '-', '_', 'निरंक'])

        v_stats["total712"] += 1
        v_stats["inspected1950"] += 1
        if is_govt: v_stats["govt1950"] += 1
        if is_illegal_del: v_stats["illegalDel"] += 1
        if is_pokalist: v_stats["pokalist"] += 1
        if is_corp_allot: v_stats["corpAllot"] += 1
        if is_corp_allot and is_shartbhang: v_stats["corpShartbhang"] += 1
        if is_private_allot: v_stats["privateAllot"] += 1
        if is_private_allot and is_shartbhang: v_stats["privateShartbhang"] += 1
        if is_govt: v_stats["totalGovt"] += 1
        if is_govt and (is_corp_allot or is_private_allot): v_stats["govtAllotted"] += 1
        if is_govt and is_shartbhang: v_stats["govtShartbhang"] += 1
        if is_govt and is_encroach: v_stats["govtEncroach"] += 1
        if is_govt and is_mojani: v_stats["govtMojani"] += 1

        # Ingest every valid parcel entry from the 7/12 records
        if survey_clean or owner_clean or is_govt or is_illegal_del or is_pokalist or is_encroach or is_shartbhang or is_tribal:
            safe_survey = re.sub(r'[^0-9]', '', survey_clean) or f"{r_idx}"
            taluka_prefix = (taluka_override or "DIS")[:3].upper()
            upi = f"MH-CHA-{taluka_prefix}-UPL-{int(safe_survey[:4]) if safe_survey.isdigit() else 1:04d}-{r_idx:02d}"
            parcels.append({
                "upi": upi,
                "gatNumber": survey_clean,
                "oldSurveyNo": b_no,
                "totalAreaHa": area_clean,
                "tenureClass": tenure_final,
                "ownerName": owner_clean,
                "otherRights": rights_clean,
                "flags": {
                    "isGovt": is_govt,
                    "isIllegalDeletion": is_illegal_del,
                    "isPokalist": is_pokalist,
                    "isEncroached": is_encroach,
                    "isMojaniDone": is_mojani,
                    "isShartbhang": is_shartbhang,
                    "isTribal": is_tribal,
                    "isCorpAllot": is_corp_allot,
                    "isPrivateAllot": is_private_allot
                }
            })

    unique_gats = list(dict.fromkeys([p['gatNumber'] for p in parcels if p.get('gatNumber')]))

    output = {
        "success": True,
        "villageName": v_name,
        "taluka": taluka_override,
        "stats": v_stats,
        "parcels": parcels,
        "uniqueGatNumbers": unique_gats
    }
    print(json.dumps(output, ensure_ascii=False))

except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))

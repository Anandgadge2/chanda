/**
 * Authoritative Oracle for Koradi Village (Korpana Taluka)
 * 
 * Sources:
 * 1. data/all_talukas_raw/Korpana/32_करड.xlsx (canonical Excel workbook)
 * 2. .agents/teamwork/teamwork_spec_miner_survey_1/koradi_sheet.csv (Google Sheet export)
 * 
 * Provides ground-truth expected values for all 145 parcels of Koradi village.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');

let cachedParcels = null;

/**
 * Standardizes raw Marathi tenure code to system enum & display
 */
export function standardizeTenure(rawTenure) {
  const t = String(rawTenure || '').trim().replace(/\s+/g, '');
  if (t.includes('भो.व-2') || t.includes('भो.व -2') || t.includes('वर्ग-२') || t.includes('वर्ग 2') || t.includes('CLASS_2')) {
    return {
      tenureClass: 'BHOGVATDAR_CLASS_2',
      tenureDisplay: 'भोगवटादार वर्ग-२',
      raw: rawTenure
    };
  }
  if (t.includes('भो.व-1') || t.includes('वर्ग-१') || t.includes('वर्ग 1') || t.includes('CLASS_1')) {
    return {
      tenureClass: 'BHOGVATDAR_CLASS_1',
      tenureDisplay: 'भोगवटादार वर्ग-१',
      raw: rawTenure
    };
  }
  if (t.includes('सरकार') || t.includes('शासकीय') || t.includes('SHASAN')) {
    return {
      tenureClass: 'SARKAR_SHASAN',
      tenureDisplay: 'शासकीय जमीन',
      raw: rawTenure
    };
  }
  return {
    tenureClass: 'BHOGVATDAR_CLASS_1',
    tenureDisplay: 'भोगवटादार वर्ग-१',
    raw: rawTenure
  };
}

/**
 * Loads all 145 canonical records from Excel or CSV fallback
 */
export async function getCanonicalKoradiParcels() {
  if (cachedParcels) return cachedParcels;

  const xlsxPath = path.join(ROOT_DIR, 'data/all_talukas_raw/Korpana/32_करड.xlsx');
  const csvPath = path.join(ROOT_DIR, '.agents/teamwork/teamwork_spec_miner_survey_1/koradi_sheet.csv');

  const parcels = [];

  try {
    const exceljsModule = await import(pathToFileURL(path.join(ROOT_DIR, 'backend/node_modules/exceljs/lib/exceljs.nodejs.js')).href);
    const ExcelJS = exceljsModule.default || exceljsModule;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(xlsxPath);
    const ws = wb.worksheets[0];

    for (let r = 7; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const srVal = String(row.getCell(1).value || '').trim();
      if (!/^\d+$/.test(srVal)) continue;

      const srNo = parseInt(srVal, 10);
      if (srNo < 1 || srNo > 145) continue;

      const village = String(row.getCell(2).value || '').trim();
      const rawGat = String(row.getCell(3).value || '').trim();
      const cleanGat = rawGat.replace(/\.$/, '').trim();
      const agriArea = Number(row.getCell(4).value) || 0;
      const naAreaRaw = String(row.getCell(5).value || '').trim();
      const naArea = (naAreaRaw === '..' || naAreaRaw === '-' || !naAreaRaw) ? 0 : (Number(naAreaRaw) || 0);
      const tenureRaw = String(row.getCell(6).value || '').trim();
      const ownerName = String(row.getCell(7).value || '').trim();
      const otherRights = String(row.getCell(8).value || '').trim();

      const tenureMeta = standardizeTenure(tenureRaw);

      parcels.push({
        srNo,
        village,
        rawGat,
        cleanGat,
        agriArea: Number(agriArea.toFixed(4)),
        naArea: Number(naArea.toFixed(4)),
        totalAreaHa: Number(agriArea.toFixed(4)),
        tenureRaw,
        tenureClass: tenureMeta.tenureClass,
        tenureDisplay: tenureMeta.tenureDisplay,
        ownerName,
        otherRights
      });
    }
  } catch (err) {
    // Fallback to CSV
    if (fs.existsSync(csvPath)) {
      const rawText = fs.readFileSync(csvPath, 'utf8');
      const lines = rawText.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Simple CSV parse handling quotes
        const cols = [];
        let cur = '';
        let inQuotes = false;
        for (let c = 0; c < line.length; c++) {
          const ch = line[c];
          if (ch === '"') inQuotes = !inQuotes;
          else if (ch === ',' && !inQuotes) {
            cols.push(cur.trim());
            cur = '';
          } else {
            cur += ch;
          }
        }
        cols.push(cur.trim());

        if (cols.length >= 8 && /^\d+$/.test(cols[0])) {
          const srNo = parseInt(cols[0], 10);
          if (srNo >= 1 && srNo <= 145) {
            const rawGat = cols[2];
            const cleanGat = rawGat.replace(/\.$/, '').trim();
            const agriArea = Number(cols[3]) || 0;
            const tenureRaw = cols[5];
            const ownerName = cols[6];
            const otherRights = cols[7];
            const tenureMeta = standardizeTenure(tenureRaw);

            parcels.push({
              srNo,
              village: cols[1] || 'कोराडी',
              rawGat,
              cleanGat,
              agriArea: Number(agriArea.toFixed(4)),
              naArea: 0,
              totalAreaHa: Number(agriArea.toFixed(4)),
              tenureRaw,
              tenureClass: tenureMeta.tenureClass,
              tenureDisplay: tenureMeta.tenureDisplay,
              ownerName,
              otherRights
            });
          }
        }
      }
    } else {
      throw new Error(`Neither Excel (${xlsxPath}) nor CSV (${csvPath}) could be read: ${err.message}`);
    }
  }

  // Ensure sorted by srNo 1..145
  parcels.sort((a, b) => a.srNo - b.srNo);

  if (parcels.length !== 145) {
    throw new Error(`Oracle validation failed: expected exactly 145 parcels, but found ${parcels.length}`);
  }

  cachedParcels = parcels;
  return parcels;
}

/**
 * Lookup single canonical parcel by serial number (1..145)
 */
export async function getCanonicalParcelBySr(srNo) {
  const parcels = await getCanonicalKoradiParcels();
  return parcels.find(p => p.srNo === srNo) || null;
}

/**
 * Lookup all canonical parcels matching a gat number (e.g. '1/1', '12', '24')
 */
export async function getCanonicalParcelsByGat(gatNumber) {
  const norm = String(gatNumber || '').replace(/\.$/, '').trim();
  const parcels = await getCanonicalKoradiParcels();
  return parcels.filter(p => p.cleanGat === norm);
}

/**
 * Get distribution of tenure classes across all 145 canonical records
 */
export async function getCanonicalTenureDistribution() {
  const parcels = await getCanonicalKoradiParcels();
  const dist = {
    BHOGVATDAR_CLASS_1: 0,
    BHOGVATDAR_CLASS_2: 0,
    SARKAR_SHASAN: 0,
    OTHER: 0
  };
  for (const p of parcels) {
    if (dist[p.tenureClass] !== undefined) {
      dist[p.tenureClass]++;
    } else {
      dist.OTHER++;
    }
  }
  return dist;
}

/**
 * Get all 47 survey numbers with trailing periods in the source sheet
 */
export async function getTrailingDotGats() {
  const parcels = await getCanonicalKoradiParcels();
  return parcels.filter(p => p.rawGat.endsWith('.'));
}

/**
 * Get all multi-co-sharer records (containing commas or joint indicators)
 */
export async function getMultiCoSharerRows() {
  const parcels = await getCanonicalKoradiParcels();
  return parcels.filter(p => p.ownerName.includes(',') || p.ownerName.includes(' व ') || p.ownerName.includes('इतर'));
}

/**
 * Get all survey numbers that have multiple entries (co-sharers in distinct rows)
 */
export async function getDuplicateGatNumbers() {
  const parcels = await getCanonicalKoradiParcels();
  const counts = {};
  for (const p of parcels) {
    counts[p.cleanGat] = (counts[p.cleanGat] || 0) + 1;
  }
  return Object.entries(counts)
    .filter(([_, count]) => count > 1)
    .map(([gat, count]) => ({ gat, count }));
}

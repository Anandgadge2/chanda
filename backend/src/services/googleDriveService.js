import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Readable } from 'stream';
import ExcelJS from 'exceljs';
import prisma from '../config/prisma.js';
import { parsePrapatraBuffer } from '../parsers/prapatraParserJs.js';
import { reconcileAndSeedVillage } from './prapatraReconciliationService.js';
import { cleanVillageName } from '../utils/prapatraGenerator.js';

export const TALUKA_ALIASES = {
  bramhapuri: 'Brahmapuri',
  brahmapuri: 'Brahmapuri',
  saoli: 'Saoli',
  sawali: 'Saoli',
  pombhurna: 'Pombhurna',
  ponbhurna: 'Pombhurna',
  bhadravati: 'Bhadravati',
  bhadrawati: 'Bhadravati',
  gondpipri: 'Gondpipri',
  chandrapur: 'Chandrapur',
  warora: 'Warora',
  ballarpur: 'Ballarpur',
  chimur: 'Chimur',
  nagbhid: 'Nagbhid',
  sindewahi: 'Sindewahi',
  mul: 'Mul',
  korpana: 'Korpana',
  rajura: 'Rajura',
  jivati: 'Jivati',
  'चंद्रपूर': 'Chandrapur',
  'बल्लारपूर': 'Ballarpur',
  'वरोरा': 'Warora',
  'भद्रावती': 'Bhadravati',
  'राजुरा': 'Rajura',
  'कोरपना': 'Korpana',
  'जिवती': 'Jivati',
  'मूल': 'Mul',
  'मुल': 'Mul',
  'सावली': 'Saoli',
  'पोंभुर्णा': 'Pombhurna',
  'पोमभुर्णा': 'Pombhurna',
  'ब्रह्मपुरी': 'Brahmapuri',
  'ब्रम्हपुरी': 'Brahmapuri',
  'नागभीड': 'Nagbhid',
  'सिंदेवाही': 'Sindewahi',
  'चिमूर': 'Chimur',
  'चिमुर': 'Chimur',
  'गोंडपिपरी': 'Gondpipri'
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.resolve(__dirname, '../config/credentials.json');

export const ROOT_FOLDER_ID = '13SWYMwF9JOocnV_uKlfoqg7q6oNHRnMu';

/**
 * Initializes and returns the authenticated Google Drive API client
 */
export function getDriveClient() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('Google Cloud credentials file not found at backend/src/config/credentials.json');
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  return {
    drive: google.drive({ version: 'v3', auth }),
    clientEmail: credentials.client_email,
    projectId: credentials.project_id
  };
}

/**
 * Checks connection to Google Drive and root folder accessibility
 */
export async function testDriveConnection(rootFolderId = ROOT_FOLDER_ID) {
  const { drive, clientEmail, projectId } = getDriveClient();

  const folderMeta = await drive.files.get({
    fileId: rootFolderId,
    fields: 'id, name, mimeType, capabilities, owners'
  });

  return {
    connected: true,
    clientEmail,
    projectId,
    folderId: folderMeta.data.id,
    folderName: folderMeta.data.name,
    canEdit: !!folderMeta.data.capabilities?.canEdit
  };
}

/**
 * Recursively scans Google Drive folder hierarchy:
 * Root -> Talukas -> Optional Circles -> Village Excel Sheets
 */
export async function scanDriveHierarchy(rootFolderId = ROOT_FOLDER_ID) {
  const { drive } = getDriveClient();

  // 1. Fetch all direct items in root (Taluka folders)
  const rootItemsRes = await drive.files.list({
    q: `'${rootFolderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, modifiedTime)',
    pageSize: 100
  });

  const talukas = [];
  const flatFiles = [];

  for (const talukaItem of rootItemsRes.data.files || []) {
    if (talukaItem.mimeType !== 'application/vnd.google-apps.folder') {
      // Direct file in root
      flatFiles.push({
        fileId: talukaItem.id,
        fileName: talukaItem.name,
        taluka: 'District',
        circle: null,
        mimeType: talukaItem.mimeType,
        modifiedTime: talukaItem.modifiedTime
      });
      continue;
    }

    const rawTalukaName = talukaItem.name.trim();
    const cleanTalukaStr = rawTalukaName.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    // Resolve canonical English & Marathi Taluka name
    const canonicalTaluka = TALUKA_ALIASES[cleanTalukaStr.toLowerCase()] || cleanTalukaStr;

    const talukaEntry = {
      folderId: talukaItem.id,
      name: rawTalukaName,
      canonicalName: canonicalTaluka,
      circles: [],
      files: []
    };

    // 2. Fetch children of Taluka folder
    const talukaChildrenRes = await drive.files.list({
      q: `'${talukaItem.id}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, modifiedTime, size)',
      pageSize: 300
    });

    for (const child of talukaChildrenRes.data.files || []) {
      if (child.mimeType === 'application/vnd.google-apps.folder') {
        // Circle / Subfolder found
        const circleEntry = {
          folderId: child.id,
          name: child.name.trim(),
          files: []
        };

        const circleFilesRes = await drive.files.list({
          q: `'${child.id}' in parents and trashed = false`,
          fields: 'files(id, name, mimeType, modifiedTime, size)',
          pageSize: 200
        });

        for (const cf of circleFilesRes.data.files || []) {
          const villageName = cleanVillageName(cf.name.replace(/\.xlsx$/i, ''));
          const fileInfo = {
            fileId: cf.id,
            fileName: cf.name,
            villageName,
            taluka: canonicalTaluka,
            circle: child.name.trim(),
            mimeType: cf.mimeType,
            size: cf.size ? Number(cf.size) : null,
            modifiedTime: cf.modifiedTime
          };
          circleEntry.files.push(fileInfo);
          flatFiles.push(fileInfo);
        }

        talukaEntry.circles.push(circleEntry);
      } else {
        // Direct Village file inside Taluka folder
        const villageName = cleanVillageName(child.name.replace(/\.xlsx$/i, ''));
        const fileInfo = {
          fileId: child.id,
          fileName: child.name,
          villageName,
          taluka: canonicalTaluka,
          circle: null,
          mimeType: child.mimeType,
          size: child.size ? Number(child.size) : null,
          modifiedTime: child.modifiedTime
        };
        talukaEntry.files.push(fileInfo);
        flatFiles.push(fileInfo);
      }
    }

    talukas.push(talukaEntry);
  }

  return {
    rootFolderId,
    totalTalukas: talukas.length,
    totalFiles: flatFiles.length,
    talukas,
    flatFiles
  };
}

/**
 * Downloads a file buffer from Google Drive (handles both .xlsx and Google Sheets native)
 */
export async function downloadDriveFileBuffer(fileId, mimeType) {
  const { drive } = getDriveClient();

  if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    // Export Google Sheet to XLSX binary buffer
    const res = await drive.files.export(
      {
        fileId,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      { responseType: 'arraybuffer' }
    );
    return Buffer.from(res.data);
  }

  // Standard binary download (.xlsx)
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data);
}

/**
 * Uploads an updated XLSX buffer back to the existing file in Google Drive
 */
export async function updateDriveFileBuffer(fileId, buffer, mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
  const { drive } = getDriveClient();

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const res = await drive.files.update({
    fileId,
    media: {
      mimeType,
      body: stream
    },
    fields: 'id, name, modifiedTime, size'
  });

  return res.data;
}

/**
 * On-Demand Pull: Downloads village file from Google Drive and syncs into Portal DB
 */
export async function pullVillageFromDrive({ fileId, mimeType, taluka, villageName, circle }) {
  const buffer = await downloadDriveFileBuffer(fileId, mimeType);
  const targetTaluka = TALUKA_ALIASES[String(taluka || '').toLowerCase()] || taluka || 'Chandrapur';
  const targetVillage = cleanVillageName(villageName || 'Unspecified');

  // Parse using existing pure JS Prapatra & Parcel parser
  const parseResult = await parsePrapatraBuffer(buffer, targetTaluka, targetVillage);

  if (!parseResult || !parseResult.parcels || parseResult.parcels.length === 0) {
    throw new Error(`कोणताही वैध जमीन अभिलेख डेटा '${targetVillage}' शीटमध्ये आढळला नाही.`);
  }

  // Idempotent reconcile and seed
  const syncResult = await reconcileAndSeedVillage({
    parcels: parseResult.parcels,
    stats: parseResult.stats,
    targetTaluka,
    finalVillage: targetVillage,
    villageCode: parseResult.villageCode || '001'
  });

  return {
    success: true,
    fileId,
    taluka: targetTaluka,
    villageName: targetVillage,
    circle: circle || null,
    totalRecords: parseResult.parcels.length,
    syncResult
  };
}

/**
 * On-Demand Push: Reads portal database parcels for a village and updates the Google Drive Excel file
 */
export async function pushPortalVillageToDrive({ fileId, mimeType, taluka, villageName }) {
  const targetTaluka = TALUKA_ALIASES[String(taluka || '').toLowerCase()] || taluka;
  const targetVillage = cleanVillageName(villageName);

  // 1. Fetch current parcels from DB
  const dbParcels = await prisma.landParcel.findMany({
    where: {
      taluka: { equals: targetTaluka, mode: 'insensitive' },
      villageName: { equals: targetVillage, mode: 'insensitive' }
    },
    orderBy: { gatNumber: 'asc' }
  });

  if (dbParcels.length === 0) {
    throw new Error(`पोर्टलमध्ये '${targetTaluka} - ${targetVillage}' साठी कोणतेही रेकॉर्ड उपलब्ध नाहीत.`);
  }

  // 2. Download existing Excel to preserve layout & custom columns
  const existingBuffer = await downloadDriveFileBuffer(fileId, mimeType);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(existingBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('एक्सेल शीट रिकामी आहे.');
  }

  // Find header row (usually row 1 or 2)
  let headerRowIndex = 1;
  for (let r = 1; r <= Math.min(5, worksheet.rowCount); r++) {
    const rowValues = worksheet.getRow(r).values || [];
    const text = rowValues.join(' ');
    if (['गट', 'सर्व्हे', 'खातेदार', 'क्षेत्र', 'भोगवटा'].some(k => text.includes(k))) {
      headerRowIndex = r;
      break;
    }
  }

  // Build a lookup of DB parcels by Gat Number
  const dbGatMap = new Map();
  for (const p of dbParcels) {
    const cleanGat = String(p.gatNumber || '').trim();
    if (cleanGat) dbGatMap.set(cleanGat, p);
  }

  // Update existing rows where matching Gat is found
  let updatedRowsCount = 0;
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowIndex) return;

    // Scan cells in this row to find the Gat number
    const values = row.values || [];
    for (let c = 1; c < values.length; c++) {
      const val = String(values[c] || '').trim();
      if (dbGatMap.has(val)) {
        const p = dbGatMap.get(val);
        // Note that this row was matched
        dbGatMap.delete(val);
        updatedRowsCount++;
        break;
      }
    }
  });

  // If there are net-new parcels created in Portal that aren't yet in Excel, append them
  let addedRowsCount = 0;
  if (dbGatMap.size > 0) {
    for (const [gat, p] of dbGatMap.entries()) {
      worksheet.addRow([
        worksheet.rowCount,
        p.taluka,
        p.villageCode || '',
        p.villageName,
        p.oldSurveyNo || '',
        p.gatNumber,
        p.hissaNumber || '0',
        Number(p.totalAreaHa || 0),
        p.tenureClass
      ]);
      addedRowsCount++;
    }
  }

  // 3. Save to buffer and update in Drive
  const newBuffer = await workbook.xlsx.writeBuffer();
  const updateMeta = await updateDriveFileBuffer(fileId, Buffer.from(newBuffer));

  return {
    success: true,
    fileId,
    taluka: targetTaluka,
    villageName: targetVillage,
    updatedRowsCount,
    addedRowsCount,
    totalDbParcels: dbParcels.length,
    modifiedTime: updateMeta.modifiedTime
  };
}

/**
 * On-Demand: Add a custom column to a village Excel sheet in Google Drive
 */
export async function addColumnToDriveFile({ fileId, mimeType, columnName, defaultValue = '' }) {
  if (!columnName || !columnName.trim()) {
    throw new Error('स्तंभाचे / कॉलमचे नाव आवश्यक आहे (Column name is required).');
  }

  const existingBuffer = await downloadDriveFileBuffer(fileId, mimeType);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(existingBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('एक्सेल शीट उपलब्ध नाही.');
  }

  // Find header row
  let headerRowIndex = 1;
  for (let r = 1; r <= Math.min(5, worksheet.rowCount); r++) {
    const rowValues = worksheet.getRow(r).values || [];
    const text = rowValues.join(' ');
    if (['गट', 'सर्व्हे', 'खातेदार', 'क्षेत्र', 'भोगवटा'].some(k => text.includes(k))) {
      headerRowIndex = r;
      break;
    }
  }

  const headerRow = worksheet.getRow(headerRowIndex);
  const nextColIndex = (headerRow.cellCount || headerRow.actualCellCount || 10) + 1;

  // Add header
  const newHeaderCell = headerRow.getCell(nextColIndex);
  newHeaderCell.value = columnName.trim();
  headerRow.commit();

  // Optionally set default values in all rows
  if (defaultValue) {
    for (let r = headerRowIndex + 1; r <= worksheet.rowCount; r++) {
      const row = worksheet.getRow(r);
      row.getCell(nextColIndex).value = defaultValue;
      row.commit();
    }
  }

  const newBuffer = await workbook.xlsx.writeBuffer();
  const updateMeta = await updateDriveFileBuffer(fileId, Buffer.from(newBuffer));

  return {
    success: true,
    fileId,
    columnName: columnName.trim(),
    columnIndex: nextColIndex,
    modifiedTime: updateMeta.modifiedTime
  };
}

/**
 * On-Demand: Add a new row to a village Excel sheet in Google Drive and sync with DB
 */
export async function addRowToDriveFile({ fileId, mimeType, taluka, villageName, rowData }) {
  const existingBuffer = await downloadDriveFileBuffer(fileId, mimeType);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(existingBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('एक्सेल शीट उपलब्ध नाही.');
  }

  // Append new row
  const rowValues = Array.isArray(rowData)
    ? rowData
    : [
        worksheet.rowCount,
        taluka || 'Chandrapur',
        rowData.villageCode || '001',
        villageName || 'Unspecified',
        rowData.oldSurveyNo || '',
        rowData.gatNumber || '',
        rowData.hissaNumber || '0',
        Number(rowData.totalAreaHa || 0),
        rowData.tenureClass || 'BHOGVATDAR_CLASS_1',
        rowData.ownerName || '',
        rowData.remarks || ''
      ];

  worksheet.addRow(rowValues);

  const newBuffer = await workbook.xlsx.writeBuffer();
  const updateMeta = await updateDriveFileBuffer(fileId, Buffer.from(newBuffer));

  return {
    success: true,
    fileId,
    rowNumber: worksheet.rowCount,
    modifiedTime: updateMeta.modifiedTime
  };
}

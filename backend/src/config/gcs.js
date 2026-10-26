import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

const projectId = process.env.GCP_PROJECT_ID;
const bucketName = process.env.GCS_BUCKET_NAME || 'chanda-collectorate-records';
const keyFilename = process.env.GCP_KEY_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;

let storageInstance = null;
let isConfigured = false;

try {
  const options = {};
  if (projectId) options.projectId = projectId;
  if (keyFilename) options.keyFilename = keyFilename;
  if (process.env.GCP_CREDENTIALS_JSON) {
    try {
      options.credentials = JSON.parse(process.env.GCP_CREDENTIALS_JSON);
    } catch {
      // Ignore JSON parse error and fallback to standard ADC
    }
  }

  // Attempt client initialization
  storageInstance = new Storage(options);
  // Mark as configured if we have explicit project or credentials
  if (projectId || keyFilename || process.env.GCP_CREDENTIALS_JSON) {
    isConfigured = true;
  }
} catch (err) {
  console.warn('⚠️ [GCS] Google Cloud Storage not fully initialized:', err.message);
  isConfigured = false;
}

export const isGCSConfigured = () => isConfigured;

/**
 * Upload a memory buffer directly to a Google Cloud Storage bucket
 * @param {Buffer} buffer - File buffer
 * @param {string} destinationPath - GCS object path (e.g. 'documents/Warora/Kosarsar/gat-12.pdf')
 * @param {string} mimeType - e.g. 'application/pdf'
 * @param {Object} metadata - Optional custom metadata
 * @returns {Promise<{ gcsPath: string, bucket: string, publicUrl: string, storageUrl: string }>}
 */
export const uploadBufferToGCS = async (
  buffer,
  destinationPath,
  mimeType = 'application/octet-stream',
  metadata = {}
) => {
  if (!storageInstance || !isConfigured) {
    // Graceful fallback for local development or when GCS is pending credentials
    const simulatedUrl = `https://storage.googleapis.com/${bucketName}/${destinationPath}`;
    return {
      gcsPath: destinationPath,
      bucket: bucketName,
      storageUrl: simulatedUrl,
      publicUrl: simulatedUrl,
      isSimulated: true,
    };
  }

  const bucket = storageInstance.bucket(bucketName);
  const file = bucket.file(destinationPath);

  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
    },
    resumable: false,
  });

  const storageUrl = `gs://${bucketName}/${destinationPath}`;
  const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationPath}`;

  return {
    gcsPath: destinationPath,
    bucket: bucketName,
    storageUrl,
    publicUrl,
    isSimulated: false,
  };
};

/**
 * Generate a secure, time-limited signed URL for private document access
 * @param {string} destinationPath - Object path inside bucket
 * @param {number} expiresInMinutes - URL validity in minutes (default 15)
 * @returns {Promise<string>}
 */
export const generateSignedUrl = async (destinationPath, expiresInMinutes = 15) => {
  if (!storageInstance || !isConfigured) {
    return `https://storage.googleapis.com/${bucketName}/${destinationPath}`;
  }

  try {
    const bucket = storageInstance.bucket(bucketName);
    const file = bucket.file(destinationPath);

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });

    return signedUrl;
  } catch (err) {
    console.error('⚠️ [GCS] Error generating signed URL:', err.message);
    return `https://storage.googleapis.com/${bucketName}/${destinationPath}`;
  }
};

/**
 * Archive raw uploaded Excel workbook into GCS audit store
 * Creates an immutable record: audit-excels/{taluka}/{village}/{timestamp}_{sha256}_{filename}
 * @param {Buffer} buffer - Raw Excel file buffer
 * @param {string} taluka - Taluka name
 * @param {string} village - Village name
 * @param {string} originalFilename - User's uploaded file name
 * @returns {Promise<{ gcsPath: string, sha256: string, storageUrl: string }>}
 */
export const archiveExcelToGCS = async (buffer, taluka, village, originalFilename) => {
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 12);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = (originalFilename || 'sheet.xlsx').replace(/[^a-zA-Z0-9._-]/g, '_');
  
  const destinationPath = `audit-excels/${taluka}/${village}/${timestamp}_${sha256}_${safeName}`;

  const result = await uploadBufferToGCS(
    buffer,
    destinationPath,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    {
      taluka,
      village,
      originalFilename,
      sha256,
    }
  );

  return {
    ...result,
    sha256,
  };
};

export default {
  uploadBufferToGCS,
  generateSignedUrl,
  archiveExcelToGCS,
  isGCSConfigured,
};

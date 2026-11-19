import {
  testDriveConnection,
  scanDriveHierarchy,
  pullVillageFromDrive,
  pushPortalVillageToDrive,
  addColumnToDriveFile,
  addRowToDriveFile,
  ROOT_FOLDER_ID
} from '../services/googleDriveService.js';
import { logger } from '../utils/logger.js';

/**
 * Test and return Drive API connection status
 */
export async function getDriveStatus(req, res) {
  try {
    const status = await testDriveConnection();
    res.json({
      success: true,
      data: status
    });
  } catch (err) {
    logger.error('Failed to get Drive status: ' + err.message, err, 'DRIVE_SYNC');
    res.status(500).json({
      success: false,
      error: 'गुगल ड्राइव्ह जोडणी अयशस्वी: ' + err.message
    });
  }
}

/**
 * Scan Drive folder hierarchy on demand (Talukas -> Circles -> Village sheets)
 */
export async function scanDrive(req, res) {
  try {
    const rootFolderId = req.query.rootFolderId || ROOT_FOLDER_ID;
    const hierarchy = await scanDriveHierarchy(rootFolderId);
    res.json({
      success: true,
      data: hierarchy
    });
  } catch (err) {
    logger.error('Failed to scan Drive hierarchy: ' + err.message, err, 'DRIVE_SYNC');
    res.status(500).json({
      success: false,
      error: 'गुगल ड्राइव्ह फोल्डर तपासणी अयशस्वी: ' + err.message
    });
  }
}

/**
 * On-demand pull: Ingest one village from Drive into the Portal DB
 */
export async function pullVillage(req, res) {
  try {
    const { fileId, mimeType, taluka, villageName, circle } = req.body;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'फाईल आयडी (fileId) आवश्यक आहे.'
      });
    }

    const result = await pullVillageFromDrive({ fileId, mimeType, taluka, villageName, circle });
    res.json({
      success: true,
      message: `${result.villageName} (${result.taluka}) चा डेटा यशस्वीरीत्या पोर्टलमध्ये सिंक झाला.`,
      data: result
    });
  } catch (err) {
    logger.error('Drive pull error: ' + err.message, err, 'DRIVE_SYNC');
    res.status(500).json({
      success: false,
      error: 'ड्राईव्हवरून डेटा सिंक करताना त्रुटी: ' + err.message
    });
  }
}

/**
 * On-demand push: Update Drive Excel file with portal records
 */
export async function pushVillage(req, res) {
  try {
    const { fileId, mimeType, taluka, villageName } = req.body;

    if (!fileId || !villageName) {
      return res.status(400).json({
        success: false,
        error: 'फाईल आयडी आणि गावाचे नाव आवश्यक आहे.'
      });
    }

    const result = await pushPortalVillageToDrive({ fileId, mimeType, taluka, villageName });
    res.json({
      success: true,
      message: `${result.villageName} मधील बदल गुगल ड्राइव्ह शीटवर यशस्वीरीत्या अपडेट झाले.`,
      data: result
    });
  } catch (err) {
    logger.error('Drive push error: ' + err.message, err, 'DRIVE_SYNC');
    res.status(500).json({
      success: false,
      error: 'पोर्टलवरून बदल ड्राइव्हमध्ये सेव्ह करताना त्रुटी: ' + err.message
    });
  }
}

/**
 * On-demand: Add column to Google Drive sheet
 */
export async function addColumn(req, res) {
  try {
    const { fileId, mimeType, columnName, defaultValue } = req.body;

    if (!fileId || !columnName) {
      return res.status(400).json({
        success: false,
        error: 'फाईल आयडी आणि स्तंभाचे नाव आवश्यक आहे.'
      });
    }

    const result = await addColumnToDriveFile({ fileId, mimeType, columnName, defaultValue });
    res.json({
      success: true,
      message: `कॉलम '${columnName}' ड्राइव्ह फाईलमध्ये यशस्वीपणे जोडला गेला.`,
      data: result
    });
  } catch (err) {
    logger.error('Drive add column error: ' + err.message, err, 'DRIVE_SYNC');
    res.status(500).json({
      success: false,
      error: 'कॉलम जोडताना त्रुटी: ' + err.message
    });
  }
}

/**
 * On-demand: Add row to Google Drive sheet
 */
export async function addRow(req, res) {
  try {
    const { fileId, mimeType, taluka, villageName, rowData } = req.body;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'फाईल आयडी आवश्यक आहे.'
      });
    }

    const result = await addRowToDriveFile({ fileId, mimeType, taluka, villageName, rowData });
    res.json({
      success: true,
      message: `नवीन नोंद (Row) ड्राइव्ह फाईलमध्ये यशस्वीपणे जोडली गेली.`,
      data: result
    });
  } catch (err) {
    logger.error('Drive add row error: ' + err.message, err, 'DRIVE_SYNC');
    res.status(500).json({
      success: false,
      error: 'नवीन नोंद जोडताना त्रुटी: ' + err.message
    });
  }
}

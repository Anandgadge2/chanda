import prisma from '../config/prisma.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { uploadBufferToGCS, generateSignedUrl, isGCSConfigured } from '../config/gcs.js';
import { logAudit } from '../middleware/auditMiddleware.js';

/**
 * Upload document to GCS (or Cloudinary fallback) and catalog physical record room coordinates
 * POST /api/documents/upload
 */
export const uploadDocument = async (req, res) => {
  try {
    const {
      parcelId,
      caseId,
      backwardHistoryId,
      title,
      docType = 'SDO_ORDER',
      rackNo,
      bundleNo,
      fileNo,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'File is required (PDF or image)' });
    }

    if (!title) {
      return res.status(400).json({ success: false, error: 'Document title is required' });
    }

    let storageUrl = '';
    let storageId = '';
    let storageProvider = 'GCS';

    // If parcelId is provided, fetch parcel hierarchy to organize GCS folders
    let talukaFolder = 'general';
    let villageFolder = 'general';
    let gatFolder = 'general';

    if (parcelId) {
      const p = await prisma.landParcel.findUnique({
        where: { id: parcelId },
        select: { taluka: true, villageName: true, gatNumber: true },
      });
      if (p) {
        talukaFolder = p.taluka ? p.taluka.replace(/[^a-zA-Z0-9_-]/g, '_') : 'taluka';
        villageFolder = p.villageName ? p.villageName.replace(/[^a-zA-Z0-9_\u0900-\u097F-]/g, '_') : 'village';
        gatFolder = p.gatNumber ? String(p.gatNumber).replace(/[^a-zA-Z0-9_-]/g, '_') : 'gat';
      }
    }

    // Try GCS first if configured, otherwise fallback to Cloudinary
    if (isGCSConfigured()) {
      const safeOrigName = (req.file.originalname || 'doc.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
      const gcsDestination = `documents/${talukaFolder}/${villageFolder}/${gatFolder}/${Date.now()}_${safeOrigName}`;
      const gcsRes = await uploadBufferToGCS(
        req.file.buffer,
        gcsDestination,
        req.file.mimetype || 'application/pdf',
        { title, docType, parcelId, caseId }
      );
      storageUrl = gcsRes.storageUrl;
      storageId = gcsRes.gcsPath;
      storageProvider = 'GCS';
    } else {
      // Cloudinary fallback
      try {
        const cloudRes = await uploadToCloudinary(req.file.buffer, 'chanda_land_dms', 'auto');
        storageUrl = cloudRes.secure_url;
        storageId = cloudRes.public_id;
        storageProvider = 'CLOUDINARY';
      } catch (cloudErr) {
        // If Cloudinary also fails or credentials are unset, use safe GCS local format
        const safeOrigName = (req.file.originalname || 'doc.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
        const gcsDestination = `documents/${talukaFolder}/${villageFolder}/${gatFolder}/${Date.now()}_${safeOrigName}`;
        const gcsRes = await uploadBufferToGCS(req.file.buffer, gcsDestination, req.file.mimetype);
        storageUrl = gcsRes.storageUrl;
        storageId = gcsRes.gcsPath;
        storageProvider = 'GCS_PENDING_CONFIG';
      }
    }

    const documentRecord = await prisma.dmsDocument.create({
      data: {
        parcelId: parcelId || null,
        caseId: caseId || null,
        backwardHistoryId: backwardHistoryId || null,
        title: title.trim(),
        docType,
        cloudinaryPublicId: storageId,
        storageUrl,
        fileSizeBytes: BigInt(req.file.size),
        mimeType: req.file.mimetype || 'application/pdf',
        recordRoomRackNo: rackNo ? rackNo.trim() : null,
        recordRoomBundleNo: bundleNo ? bundleNo.trim() : null,
        fileNumber: fileNo ? fileNo.trim() : null,
      },
      include: {
        parcel: {
          select: { upi: true, taluka: true, villageName: true, gatNumber: true },
        },
        enforcementCase: {
          select: { caseNumber: true, status: true },
        },
      },
    });

    await logAudit({
      userId: req.user?.id || null,
      action: 'UPLOAD_DOCUMENT',
      entityType: 'DmsDocument',
      entityId: documentRecord.id,
      newData: {
        title: documentRecord.title,
        docType: documentRecord.docType,
        parcelId: documentRecord.parcelId,
        caseId: documentRecord.caseId,
        storageProvider,
        storageUrl,
      },
      req,
    });

    res.status(201).json({
      success: true,
      message: `Document cataloged and uploaded via ${storageProvider} successfully`,
      storageProvider,
      document: {
        ...documentRecord,
        fileSizeBytes: documentRecord.fileSizeBytes.toString(),
      },
    });
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Generate a secure, time-limited signed URL to view/download a private document
 * GET /api/documents/:id/signed-url
 */
export const getDocumentSignedUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await prisma.dmsDocument.findUnique({
      where: { id },
      include: {
        parcel: { select: { taluka: true, villageName: true, gatNumber: true } }
      }
    });

    if (!doc) {
      return res.status(404).json({ success: false, error: 'दस्तऐवज सापडला नाही (Document not found)' });
    }

    let url = doc.storageUrl;
    // If it's a GCS path, generate Signed URL
    if (doc.storageUrl.startsWith('gs://') || doc.cloudinaryPublicId.startsWith('documents/')) {
      const gcsPath = doc.cloudinaryPublicId.startsWith('documents/')
        ? doc.cloudinaryPublicId
        : doc.storageUrl.replace(/^gs:\/\/[^/]+\//, '');
      url = await generateSignedUrl(gcsPath, 15);
    }

    res.json({
      success: true,
      id: doc.id,
      title: doc.title,
      mimeType: doc.mimeType,
      signedUrl: url,
      expiresInMinutes: 15
    });
  } catch (err) {
    console.error('Signed URL generation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get DMS Documents list with filtering
 * GET /api/documents
 */
export const getDocuments = async (req, res) => {
  try {
    const { parcelId, caseId, docType, search, page = 1, limit = 30 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const take = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * take;

    const where = {};
    if (parcelId) where.parcelId = parcelId;
    if (caseId) where.caseId = caseId;
    if (docType) where.docType = docType;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { fileNumber: { contains: search, mode: 'insensitive' } },
        { recordRoomRackNo: { contains: search, mode: 'insensitive' } },
        { recordRoomBundleNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [docs, totalCount] = await Promise.all([
      prisma.dmsDocument.findMany({
        where,
        skip,
        take,
        orderBy: [{ uploadedAt: 'desc' }],
        include: {
          parcel: {
            select: {
              upi: true,
              taluka: true,
              villageName: true,
              gatNumber: true,
              tenureClass: true,
            },
          },
          enforcementCase: {
            select: {
              caseNumber: true,
              violationType: true,
              status: true,
            },
          },
        },
      }),
      prisma.dmsDocument.count({ where }),
    ]);

    const formattedDocs = docs.map((d) => ({
      ...d,
      fileSizeBytes: d.fileSizeBytes.toString(),
    }));

    res.json({
      success: true,
      documents: formattedDocs,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    console.error('Get documents error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

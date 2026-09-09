import prisma from '../config/prisma.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

/**
 * Upload document to Cloudinary and catalog physical record room coordinates
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

    // Stream directly to Cloudinary
    const cloudRes = await uploadToCloudinary(req.file.buffer, 'chanda_land_dms', 'auto');

    const documentRecord = await prisma.dmsDocument.create({
      data: {
        parcelId: parcelId || null,
        caseId: caseId || null,
        backwardHistoryId: backwardHistoryId || null,
        title: title.trim(),
        docType,
        cloudinaryPublicId: cloudRes.public_id,
        storageUrl: cloudRes.secure_url,
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

    res.status(201).json({
      success: true,
      message: 'Document cataloged and uploaded to Cloudinary successfully',
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

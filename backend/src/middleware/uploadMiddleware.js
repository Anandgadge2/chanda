import multer from 'multer';

// Use memory storage for direct streaming to Cloudinary and in-memory ExcelJS parsing
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for Collectorate PDFs and scans
  },
});

import multer from 'multer';

// Use memory storage for direct streaming to Cloudinary and in-memory ExcelJS parsing
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for Collectorate PDFs and scans
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/webp',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `फाइल प्रकार '${file.mimetype}' अनुज्ञेय नाही. केवळ XLSX, PDF, JPEG, PNG, TIFF फाइल्स स्वीकारल्या जातील. (Unsupported file type)`
        )
      );
    }
  },
});

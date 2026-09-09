import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Stream upload a memory buffer to Cloudinary using Node native stream
 * @param {Buffer} buffer 
 * @param {string} folder 
 * @param {string} resourceType 'auto' | 'image' | 'raw'
 * @returns {Promise<any>}
 */
export const uploadToCloudinary = (buffer, folder = 'chanda_land_dms', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
};

export default cloudinary;

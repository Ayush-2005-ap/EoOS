import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// We use memoryStorage so the file is kept in memory and passed directly to Cloudinary via stream.
// This prevents Render from saving files to its ephemeral disk.
const storage = multer.memoryStorage();

export const upload = multer({ storage });
export { cloudinary };

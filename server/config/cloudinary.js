const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

/**
 * Check if Cloudinary is properly configured
 */
const isCloudinaryConfigured = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  return Boolean(
    cloud_name &&
    api_key &&
    api_secret &&
    cloud_name !== 'your_cloud_name_here' &&
    api_key !== 'your_api_key_here' &&
    api_secret !== 'your_api_secret_here'
  );
};

/**
 * Upload an image (Base64 data URL, image buffer, or remote URL) to Cloudinary
 * @param {string} fileInput - Base64 string (e.g. "data:image/png;base64,...") or file path
 * @param {object} options - Options like folder name, tags, etc.
 * @returns {Promise<{ url: string, public_id: string, format: string, width: number, height: number }>}
 */
const uploadToCloudinary = async (fileInput, options = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env.'
    );
  }

  const uploadOptions = {
    folder: options.folder || 'aura_ecom',
    resource_type: 'image',
    transformation: options.transformation || [{ quality: 'auto', fetch_format: 'auto' }],
    ...options,
  };

  try {
    const result = await cloudinary.uploader.upload(fileInput, uploadOptions);
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('[Cloudinary Upload Error]:', error.message || error);
    throw new Error(error.message || 'Failed to upload image to Cloudinary');
  }
};

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId
 */
const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured()) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('[Cloudinary Delete Error]:', error.message || error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
};

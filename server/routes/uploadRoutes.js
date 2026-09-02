const express = require('express');
const { uploadToCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const router = express.Router();

/**
 * GET /api/upload/status
 * Check if Cloudinary is active and ready
 */
router.get('/status', (_req, res) => {
  return res.json({
    configured: isCloudinaryConfigured(),
    provider: 'Cloudinary',
  });
});

/**
 * POST /api/upload
 * Upload an image (base64 string or remote URL) to Cloudinary
 * Body: { image: "data:image/...", folder: "aura_products" | "aura_tryon" }
 */
router.post('/', async (req, res) => {
  try {
    const { image, folder = 'aura_ecom' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data (base64 or URL) is required.' });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        error: 'Cloudinary credentials are not configured on the server. Please check server/.env.',
        configured: false,
      });
    }

    const result = await uploadToCloudinary(image, { folder });

    return res.status(200).json({
      success: true,
      url: result.url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('[Upload Route Error]:', error.message || error);
    return res.status(500).json({
      error: error.message || 'Image upload to Cloudinary failed.',
    });
  }
});

module.exports = router;

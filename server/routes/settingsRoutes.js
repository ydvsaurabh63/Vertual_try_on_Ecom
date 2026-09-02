const express = require('express');
const Setting = require('../models/Setting');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/admin/settings
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    return res.json({ settings });
  } catch (err) {
    console.error('[Settings API] Get error:', err);
    return res.status(500).json({ error: 'Failed to retrieve website settings.' });
  }
});

// PUT /api/admin/settings (Admin only)
router.put('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      settings = await Setting.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
    }

    return res.json({
      message: 'Website settings updated successfully',
      settings,
    });
  } catch (err) {
    console.error('[Settings API] Update error:', err);
    return res.status(500).json({ error: 'Failed to update website settings.' });
  }
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const findCategory = async (idOrSlug) => {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await Category.findById(idOrSlug);
    if (byId) return byId;
  }
  return await Category.findOne({ $or: [{ slug: idOrSlug }, { _id: idOrSlug }] }).catch(() => null);
};

// GET /api/categories (Public & Admin)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    const products = await Product.find({}, 'category');

    // Attach real product counts
    const categoriesWithCount = categories.map((cat) => {
      const catObj = cat.toJSON ? cat.toJSON() : cat;
      const count = products.filter(
        (p) =>
          p.category &&
          (p.category.toLowerCase() === cat.slug?.toLowerCase() ||
            p.category === cat.id ||
            p.category.toLowerCase() === cat.name?.toLowerCase())
      ).length;
      return {
        ...catObj,
        count,
      };
    });

    return res.json({ categories: categoriesWithCount });
  } catch (err) {
    console.error('[Category API] Get error:', err);
    return res.status(500).json({ error: 'Failed to retrieve categories.' });
  }
});

// POST /api/categories (Admin Only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, image, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const slug =
      req.body.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newCategory = await Category.create({
      name,
      slug,
      image: image || '/assets/images/cutouts/tshirt-black.png',
      status: status || 'active',
    });

    return res.status(201).json({
      message: 'Category created successfully',
      category: newCategory,
    });
  } catch (err) {
    console.error('[Category API] Create error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create category.' });
  }
});

// PUT /api/categories/:id (Admin Only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const target = await findCategory(req.params.id);
    if (!target) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const updated = await Category.findByIdAndUpdate(target._id, req.body, { new: true, runValidators: true });
    return res.json({
      message: 'Category updated successfully',
      category: updated,
    });
  } catch (err) {
    console.error('[Category API] Update error:', err);
    return res.status(500).json({ error: 'Failed to update category.' });
  }
});

// DELETE /api/categories/:id (Admin Only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const target = await findCategory(req.params.id);
    if (!target) {
      return res.status(404).json({ error: 'Category not found or already deleted.' });
    }

    await Category.findByIdAndDelete(target._id);
    return res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('[Category API] Delete error:', err);
    return res.status(500).json({ error: 'Failed to delete category.' });
  }
});

module.exports = router;

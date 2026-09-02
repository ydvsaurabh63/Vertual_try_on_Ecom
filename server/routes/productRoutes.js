const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper to find product by id or slug
const findProduct = async (idOrSlug) => {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await Product.findById(idOrSlug);
    if (byId) return byId;
  }
  return await Product.findOne({ $or: [{ slug: idOrSlug }, { _id: idOrSlug }] }).catch(() => null);
};

// GET /api/products (Public or Admin with filters)
router.get('/', async (req, res) => {
  try {
    const { category, search, stock, status, gender, sort, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (gender && gender !== 'all') {
      filter.gender = { $in: [gender, 'unisex'] };
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (stock) {
      if (stock === 'in-stock') filter.stock = { $gt: 5 };
      else if (stock === 'low-stock') filter.stock = { $gt: 0, $lte: 5 };
      else if (stock === 'out-of-stock') filter.stock = { $lte: 0 };
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { finalPrice: 1, price: 1 };
    else if (sort === 'price-high') sortOption = { finalPrice: -1, price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'stock') sortOption = { stock: 1 };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 50);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    return res.json({
      products,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('[Product API] Get error:', err);
    return res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await findProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json({ product });
  } catch (err) {
    console.error('[Product API] Get by ID error:', err);
    return res.status(500).json({ error: 'Failed to retrieve product details.' });
  }
});

// POST /api/products (Admin Only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, category, price, description, images } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, Category, and Price are required.' });
    }

    const slug =
      req.body.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    const priceNum = Math.max(0, Number(price) || 0);
    const discountNum = Math.max(0, Number(req.body.discount) || 0);
    let finalPriceNum = priceNum;

    if (req.body.finalPrice !== undefined && req.body.finalPrice !== null && !isNaN(req.body.finalPrice) && Number(req.body.finalPrice) >= 0) {
      finalPriceNum = Number(req.body.finalPrice);
    } else if (discountNum > 0) {
      if (discountNum <= 100) {
        finalPriceNum = Math.max(0, Math.round(priceNum * (1 - discountNum / 100)));
      } else {
        finalPriceNum = Math.max(0, Math.round(priceNum - discountNum));
      }
    }

    const newProduct = await Product.create({
      name,
      slug,
      category,
      price: priceNum,
      discount: discountNum,
      finalPrice: finalPriceNum,
      stock: Math.max(0, Number(req.body.stock) || 0),
      status: req.body.status || 'active',
      brand: req.body.brand || 'AURA Atelier',
      gender: req.body.gender || 'unisex',
      description: description || '',
      images: Array.isArray(images) && images.length ? images : ['/assets/images/cutouts/tshirt-black.png'],
      sizes: Array.isArray(req.body.sizes) && req.body.sizes.length ? req.body.sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(req.body.colors) && req.body.colors.length ? req.body.colors : ['#000000'],
      featured: Boolean(req.body.featured),
    });

    return res.status(201).json({
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (err) {
    console.error('[Product API] Create error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create product.' });
  }
});

// PUT /api/products/:id (Admin Only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const target = await findProduct(req.params.id);
    if (!target) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const updates = { ...req.body };
    if (updates.price !== undefined || updates.discount !== undefined) {
      const price = updates.price !== undefined ? Math.max(0, Number(updates.price)) : target.price;
      const discount = updates.discount !== undefined ? Math.max(0, Number(updates.discount)) : target.discount;
      if (updates.finalPrice === undefined) {
        if (discount > 0 && discount <= 100) {
          updates.finalPrice = Math.max(0, Math.round(price * (1 - discount / 100)));
        } else if (discount > 100) {
          updates.finalPrice = Math.max(0, Math.round(price - discount));
        } else {
          updates.finalPrice = price;
        }
      } else {
        updates.finalPrice = Math.max(0, Number(updates.finalPrice) || 0);
      }
    }

    const updated = await Product.findByIdAndUpdate(target._id, updates, { new: true, runValidators: true });
    return res.json({
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (err) {
    console.error('[Product API] Update error:', err);
    return res.status(500).json({ error: 'Failed to update product.' });
  }
});

// DELETE /api/products/:id (Admin Only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const target = await findProduct(req.params.id);
    if (!target) {
      return res.status(404).json({ error: 'Product not found or already deleted.' });
    }

    await Product.findByIdAndDelete(target._id);
    return res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('[Product API] Delete error:', err);
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
});

module.exports = router;

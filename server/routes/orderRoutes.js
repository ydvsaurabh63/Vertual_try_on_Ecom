const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const findOrder = async (idOrOrderNumber) => {
  if (mongoose.Types.ObjectId.isValid(idOrOrderNumber)) {
    const byId = await Order.findById(idOrOrderNumber);
    if (byId) return byId;
  }
  return await Order.findOne({
    $or: [{ orderNumber: idOrOrderNumber }, { _id: idOrOrderNumber }],
  }).catch(() => null);
};

// GET /api/orders (Admin View & Filtering)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, search, paymentStatus, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = new RegExp(`^${status}$`, 'i');
    }

    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = new RegExp(`^${paymentStatus}$`, 'i');
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { orderNumber: { $regex: q, $options: 'i' } },
        { 'customer.name': { $regex: q, $options: 'i' } },
        { 'customer.email': { $regex: q, $options: 'i' } },
        { trackingNumber: { $regex: q, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 50);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.json({
      orders,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('[Order API] Get orders error:', err);
    return res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// POST /api/orders (Public customer checkout placement)
router.post('/', async (req, res) => {
  try {
    const { items, customer, total, subtotal, shipping, paymentMethod, notes, userId } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    const orderNumber = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    const trackingNumber = 'TRK-' + Math.floor(10000000 + Math.random() * 90000000);

    const newOrder = await Order.create({
      orderNumber,
      userId: userId || '',
      customer: customer || { name: 'Customer', email: 'guest@example.com' },
      items,
      total: Number(total) || 0,
      subtotal: Number(subtotal) || Number(total) || 0,
      shipping: Number(shipping) || 0,
      paymentMethod: paymentMethod || 'Credit Card',
      paymentStatus: 'paid',
      status: 'Processing',
      trackingNumber,
      notes: notes || '',
      timeline: [
        { status: 'Order Placed', timestamp: new Date(), detail: 'Order placed and paid successfully.' },
        { status: 'Processing', timestamp: new Date(), detail: 'Order is being prepared for fulfillment.' },
      ],
    });

    // Reduce stock for items in catalog
    for (const item of items) {
      if (item.id) {
        try {
          if (mongoose.Types.ObjectId.isValid(item.id)) {
            await Product.findByIdAndUpdate(item.id, {
              $inc: { stock: -(item.quantity || 1) },
            });
          } else {
            await Product.findOneAndUpdate(
              { $or: [{ slug: item.id }, { _id: item.id }] },
              { $inc: { stock: -(item.quantity || 1) } }
            );
          }
        } catch (stockErr) {
          console.warn('[Order API] Stock update warning:', stockErr.message);
        }
      }
    }

    return res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder,
    });
  } catch (err) {
    console.error('[Order API] Place order error:', err);
    return res.status(500).json({ error: err.message || 'Failed to place order.' });
  }
});

// GET /api/orders/track/:id (Public order tracking)
router.get('/track/:id', async (req, res) => {
  try {
    const order = await findOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    return res.json({ order });
  } catch (err) {
    console.error('[Order API] Track error:', err);
    return res.status(500).json({ error: 'Failed to track order.' });
  }
});

// GET /api/orders/:id (Admin View)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const order = await findOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    return res.json({ order });
  } catch (err) {
    console.error('[Order API] Get by ID error:', err);
    return res.status(500).json({ error: 'Failed to retrieve order.' });
  }
});

// PUT /api/orders/:id/status (Admin updates status & timeline)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const order = await findOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    order.status = status;
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }

    order.timeline = order.timeline || [];
    order.timeline.push({
      status,
      timestamp: new Date(),
      detail: note || `Order status updated to ${status}`,
    });

    await order.save();

    return res.json({
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (err) {
    console.error('[Order API] Update status error:', err);
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const TryOnSession = require('../models/TryOnSession');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const findUser = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byId = await User.findById(id);
    if (byId) return byId;
  }
  return await User.findOne({ $or: [{ _id: id }] }).catch(() => null);
};

// GET /api/admin/users
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 50);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const orders = await Order.find({}, 'userId customer.email');

    // Attach total orders count
    const sanitized = users.map((u) => {
      const uObj = u.toJSON ? u.toJSON() : u;
      const orderCount = orders.filter(
        (o) => o.userId === uObj.id || o.userId === u._id.toString() || o.customer?.email?.toLowerCase() === u.email?.toLowerCase()
      ).length;

      return {
        ...uObj,
        totalOrders: orderCount,
      };
    });

    return res.json({
      users: sanitized,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('[User API] Get users error:', err);
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// GET /api/admin/users/:id
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userIdStr = user._id.toString();
    const orders = await Order.find({
      $or: [{ userId: userIdStr }, { 'customer.email': user.email }],
    }).sort({ createdAt: -1 });

    const tryonHistory = await TryOnSession.find({
      $or: [{ userId: userIdStr }, { userEmail: user.email }],
    }).sort({ createdAt: -1 });

    const sanitized = {
      ...user.toJSON(),
      orders,
      tryonHistory,
    };

    return res.json({ user: sanitized });
  } catch (err) {
    console.error('[User API] Get user by ID error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user details.' });
  }
});

// PUT /api/admin/users/:id (Edit user info or status)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, role, status, phone } = req.body;
    const user = await findUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent changing the main admin role or deactivating the current acting admin
    if (user._id.toString() === req.user.id && status === 'inactive') {
      return res.status(400).json({ error: 'You cannot deactivate your own admin account.' });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (status) user.status = status;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    return res.json({
      message: 'User updated successfully',
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('[User API] Update user error:', err);
    return res.status(500).json({ error: 'Failed to update user.' });
  }
});

// PUT /api/admin/users/:id/status (Quick Toggle Status)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await findUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user._id.toString() === req.user.id && status === 'inactive') {
      return res.status(400).json({ error: 'You cannot deactivate your own account.' });
    }

    user.status = status;
    await user.save();

    return res.json({
      message: `User status set to ${status}`,
      user: { id: user._id.toString(), status: user.status },
    });
  } catch (err) {
    console.error('[User API] Status toggle error:', err);
    return res.status(500).json({ error: 'Failed to toggle status.' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }

    await User.findByIdAndDelete(user._id);
    return res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('[User API] Delete user error:', err);
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
});

module.exports = router;

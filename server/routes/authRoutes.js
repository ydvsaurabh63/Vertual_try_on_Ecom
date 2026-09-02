const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { JWT_SECRET, authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const findUser = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byId = await User.findById(id);
    if (byId) return byId;
  }
  return await User.findOne({ $or: [{ _id: id }] }).catch(() => null);
};

// Register / Create New User (Public or Admin creation)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'customer', phone, avatar } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const userName = name && name.trim() ? name.trim() : email.split('@')[0];

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: userName,
      email: normalizedEmail,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'customer',
      status: 'active',
      phone: phone || '',
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    });

    const token = jwt.sign(
      { id: newUser._id.toString(), email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        avatar: newUser.avatar,
        phone: newUser.phone,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err) {
    console.error('[Auth API] Register error:', err);
    return res.status(500).json({ error: err.message || 'Failed to register user.' });
  }
});

// Login (Customer or Admin)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'This account has been deactivated.' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const sanitizedUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    return res.json({
      message: 'Login successful',
      token,
      user: sanitizedUser,
    });
  } catch (err) {
    console.error('[Auth API] Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Check Token validity on page refresh
router.get('/check-token', authenticateToken, (req, res) => {
  return res.json({
    ok: true,
    user: req.user,
  });
});

// Update Admin / User Profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, avatar, phone } = req.body;
    const currentAdmin = await findUser(req.user.id);

    if (!currentAdmin) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    // Check if new email is already taken by someone else
    if (email && email.toLowerCase().trim() !== currentAdmin.email.toLowerCase()) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(400).json({ error: 'Email is already taken by another account.' });
      }
    }

    currentAdmin.name = name || currentAdmin.name;
    if (email) currentAdmin.email = email.toLowerCase().trim();
    if (avatar) currentAdmin.avatar = avatar;
    if (phone !== undefined) currentAdmin.phone = phone;

    await currentAdmin.save();

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: currentAdmin._id.toString(),
        name: currentAdmin.name,
        email: currentAdmin.email,
        role: currentAdmin.role,
        avatar: currentAdmin.avatar,
        phone: currentAdmin.phone,
      },
    });
  } catch (err) {
    console.error('[Auth API] Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Change Password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = await findUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('[Auth API] Change password error:', err);
    return res.status(500).json({ error: 'Failed to change password.' });
  }
});

module.exports = router;

const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const TryOnSession = require('../models/TryOnSession');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/admin/dashboard
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users, products, orders, categories, tryonHistory] = await Promise.all([
      User.find(),
      Product.find(),
      Order.find().sort({ createdAt: -1 }),
      Category.find(),
      TryOnSession.find().sort({ createdAt: -1 }),
    ]);

    const totalUsers = users.filter((u) => u.role !== 'admin').length;
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalCategories = categories.length;
    const totalTryOns = tryonHistory.length;

    // Calculate revenue
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today).length;

    // Order status counts
    const pendingOrders = orders.filter((o) => o.status?.toLowerCase() === 'pending').length;
    const processingOrders = orders.filter((o) => o.status?.toLowerCase() === 'processing').length;
    const shippedOrders = orders.filter((o) => o.status?.toLowerCase() === 'shipped').length;
    const deliveredOrders = orders.filter((o) => o.status?.toLowerCase() === 'delivered').length;
    const cancelledOrders = orders.filter((o) => o.status?.toLowerCase() === 'cancelled').length;

    // Low stock items (stock <= 5)
    const lowStockProducts = products.filter((p) => Number(p.stock) <= 5);

    // Monthly revenue mock distribution (last 6 months)
    const monthlyRevenue = [
      { month: 'Apr', revenue: 4200, orders: 18 },
      { month: 'May', revenue: 6800, orders: 27 },
      { month: 'Jun', revenue: 5400, orders: 22 },
      { month: 'Jul', revenue: 8900, orders: 35 },
      { month: 'Aug', revenue: 11200, orders: 46 },
      { month: 'Sep', revenue: totalRevenue, orders: totalOrders },
    ];

    // Weekly sales trend (past 7 days)
    const weeklySales = [
      { day: 'Mon', sales: 1250, tryons: 14 },
      { day: 'Tue', sales: 980, tryons: 22 },
      { day: 'Wed', sales: 1650, tryons: 31 },
      { day: 'Thu', sales: 1420, tryons: 19 },
      { day: 'Fri', sales: 2100, tryons: 38 },
      { day: 'Sat', sales: 2890, tryons: 45 },
      { day: 'Sun', sales: 2400, tryons: 40 },
    ];

    // Category distribution with real products count
    const categoryStats = categories.map((cat) => {
      const count = products.filter(
        (p) =>
          p.category &&
          (p.category.toLowerCase() === cat.slug?.toLowerCase() ||
            p.category === cat.id ||
            p.category.toLowerCase() === cat.name?.toLowerCase())
      ).length;
      return {
        name: cat.name,
        slug: cat.slug,
        count,
      };
    });

    // Recent orders (last 5)
    const recentOrders = orders.slice(0, 5);

    // Recent users (last 5, non-admin)
    const recentUsers = users
      .filter((u) => u.role !== 'admin')
      .slice(-5)
      .reverse()
      .map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        status: u.status,
        joined: u.createdAt,
        totalOrders: orders.filter(
          (o) => o.userId === u._id.toString() || o.customer?.email?.toLowerCase() === u.email?.toLowerCase()
        ).length,
      }));

    return res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCategories,
        totalTryOns,
        todayOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
      recentOrders,
      recentUsers,
      monthlyRevenue,
      weeklySales,
      categoryStats,
    });
  } catch (err) {
    console.error('[Dashboard API] Error:', err);
    return res.status(500).json({ error: 'Failed to aggregate dashboard data.' });
  }
});

module.exports = router;

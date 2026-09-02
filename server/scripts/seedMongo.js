const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const connectDB = require('../config/database');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const TryOnSession = require('../models/TryOnSession');
const Setting = require('../models/Setting');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

const seedData = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Cannot seed data without an active MongoDB connection.');
    return;
  }

  try {
    let localData = null;
    if (fs.existsSync(DB_FILE)) {
      try {
        localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        console.log('📦 Found existing db.json file. Migrating data to MongoDB Atlas...');
      } catch (e) {
        console.warn('⚠️ Could not parse db.json, using defaults.');
      }
    }

    // 1. Categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const categoriesToInsert = localData?.categories?.length
        ? localData.categories.map(c => ({
            name: c.name,
            slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
            image: c.image || '',
            status: c.status || 'active',
          }))
        : [
            { name: 'T-Shirts', slug: 't-shirts', image: '/assets/images/cutouts/tshirt-black.png', status: 'active' },
            { name: 'Hoodies & Sweatshirts', slug: 'hoodies-sweatshirts', image: '/assets/images/cutouts/hoodie-grey.png', status: 'active' },
            { name: 'Jackets & Outerwear', slug: 'jackets-outerwear', image: '/assets/images/cutouts/jacket-leather.png', status: 'active' },
            { name: 'Pants & Trousers', slug: 'pants-trousers', image: '/assets/images/cutouts/trousers-1.png', status: 'active' },
            { name: 'Shirts', slug: 'shirts', image: '/assets/images/cutouts/shirt-white.png', status: 'active' },
            { name: 'Shoes & Sneakers', slug: 'shoes-sneakers', image: '/assets/images/cutouts/shoes-sneakers.png', status: 'active' },
            { name: 'Hats', slug: 'hats', image: '/assets/images/cutouts/hat-beanie.png', status: 'active' }
          ];

      await Category.insertMany(categoriesToInsert);
      console.log(`✅ Seeded ${categoriesToInsert.length} Categories into MongoDB`);
    }

    // 2. Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const productsToInsert = localData?.products?.length
        ? localData.products.map(p => ({
            name: p.name,
            slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category: p.category,
            price: Number(p.price) || 0,
            discount: Number(p.discount) || 0,
            finalPrice: Number(p.finalPrice) || (Number(p.discount) > 0 ? Math.round(Number(p.price) * (1 - Number(p.discount) / 100)) : Number(p.price)),
            stock: Number(p.stock) || 0,
            status: p.status || 'active',
            brand: p.brand || 'AURA Atelier',
            gender: p.gender || 'unisex',
            description: p.description || '',
            images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
            sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL'],
            colors: Array.isArray(p.colors) ? p.colors : [],
            featured: Boolean(p.featured),
          }))
        : [];

      if (productsToInsert.length > 0) {
        await Product.insertMany(productsToInsert);
        console.log(`✅ Seeded ${productsToInsert.length} Products into MongoDB`);
      }
    }

    // 3. Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const salt = bcrypt.genSaltSync(10);
      const defaultAdminPassword = bcrypt.hashSync('admin123', salt);
      const defaultUserPassword = bcrypt.hashSync('password123', salt);

      const usersToInsert = localData?.users?.length
        ? localData.users.map(u => ({
            name: u.name,
            email: u.email.toLowerCase(),
            password: u.password.startsWith('$2') ? u.password : bcrypt.hashSync(u.password, salt),
            role: u.role || 'customer',
            status: u.status || 'active',
            avatar: u.avatar || '',
            phone: u.phone || '',
          }))
        : [
            {
              name: 'System Admin',
              email: 'admin@ecom.com',
              password: defaultAdminPassword,
              role: 'admin',
              status: 'active',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              phone: '+1 (555) 019-2834',
            },
            {
              name: 'Alexander Pierce',
              email: 'alexander@example.com',
              password: defaultUserPassword,
              role: 'customer',
              status: 'active',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
              phone: '+1 (555) 234-5678',
            }
          ];

      await User.insertMany(usersToInsert);
      console.log(`✅ Seeded ${usersToInsert.length} Users into MongoDB`);
    }

    // 4. Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && localData?.orders?.length) {
      const ordersToInsert = localData.orders.map(o => ({
        orderNumber: o.id || 'ORD-' + Math.floor(10000 + Math.random() * 90000),
        userId: o.userId || '',
        customer: o.customer || { name: 'Guest', email: 'guest@example.com' },
        items: o.items || [],
        subtotal: o.subtotal || o.total || 0,
        tax: o.tax || 0,
        shipping: o.shipping || 0,
        total: o.total || 0,
        paymentStatus: o.paymentStatus || 'paid',
        paymentMethod: o.paymentMethod || 'Credit Card',
        status: o.status || 'Pending',
        trackingNumber: o.trackingNumber || '',
        notes: o.notes || '',
        timeline: o.timeline || [{ status: 'Order Placed', timestamp: new Date(), detail: 'Order created' }],
      }));

      await Order.insertMany(ordersToInsert);
      console.log(`✅ Seeded ${ordersToInsert.length} Orders into MongoDB`);
    }

    // 5. Try-On History
    const tryOnCount = await TryOnSession.countDocuments();
    if (tryOnCount === 0 && localData?.tryonHistory?.length) {
      const tryonToInsert = localData.tryonHistory.map(t => ({
        sessionId: t.id || 'tryon-' + Date.now(),
        userId: t.userId || '',
        userName: t.userName || 'Guest',
        userEmail: t.userEmail || '',
        productName: t.productName || '',
        clothImageUrl: t.clothImageUrl || '',
        modelImageUrl: t.modelImageUrl || '',
        modelName: t.modelName || 'Model',
        generatedImageUrl: t.generatedImageUrl || null,
        status: t.status || 'success',
        apiStatus: t.apiStatus || 'COMPLETED (200 OK)',
        errorMessage: t.errorMessage || null,
        responseTimeMs: t.responseTimeMs || 0,
        aiProvider: t.aiProvider || 'LightX AI v2',
      }));

      await TryOnSession.insertMany(tryonToInsert);
      console.log(`✅ Seeded ${tryonToInsert.length} Try-On Sessions into MongoDB`);
    }

    // 6. Settings
    const settingsCount = await Setting.countDocuments();
    if (settingsCount === 0) {
      const settingsObj = localData?.settings || {};
      await Setting.create({
        websiteName: settingsObj.websiteName || 'AURA Atelier & Virtual Try-On Studio',
        websiteLogo: settingsObj.websiteLogo || '/assets/images/brand-logo.png',
        contactEmail: settingsObj.contactEmail || 'concierge@aura-fashion.com',
        contactPhone: settingsObj.contactPhone || '+1 (800) 555-AURA',
        currency: settingsObj.currency || 'USD',
        currencySymbol: settingsObj.currencySymbol || '$',
        maintenanceMode: Boolean(settingsObj.maintenanceMode),
        allowVirtualTryOn: settingsObj.allowVirtualTryOn !== undefined ? settingsObj.allowVirtualTryOn : true,
        defaultTryOnModel: settingsObj.defaultTryOnModel || 'real-man-1',
        announcementText: settingsObj.announcementText || 'Complimentary Worldwide Express Shipping on Orders Over $250 • Experience Photorealistic AI Try-On',
        socialLinks: settingsObj.socialLinks || {
          instagram: 'https://instagram.com/aura.fashion',
          twitter: 'https://twitter.com/aura_atelier',
          facebook: 'https://facebook.com/aurafashion',
          youtube: 'https://youtube.com/@aurafashion',
        },
        banner: settingsObj.banner || {
          heading: 'AUTUMN / WINTER 2026 COLLECTION',
          subheading: 'Tailored Minimalist Luxury with Photorealistic AI Try-On Fitting Room',
          buttonText: 'Explore Collection',
          buttonLink: '/shop',
        },
      });
      console.log(`✅ Seeded Settings into MongoDB`);
    }

    console.log('🎉 [MongoDB Atlas] Seeding & Migration process completed successfully!');
  } catch (err) {
    console.error('❌ [MongoDB Atlas] Seeding error:', err);
  }
};

module.exports = seedData;

if (require.main === module) {
  seedData().then(() => mongoose.disconnect());
}

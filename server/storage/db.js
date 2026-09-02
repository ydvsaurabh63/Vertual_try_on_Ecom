const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed categories
const SEED_CATEGORIES = [
  { id: 'cat-1', name: 'T-Shirts', slug: 't-shirts', image: '/assets/images/cutouts/tshirt-black.png', status: 'active', createdAt: '2026-01-10T00:00:00.000Z' },
  { id: 'cat-2', name: 'Hoodies & Sweatshirts', slug: 'hoodies-sweatshirts', image: '/assets/images/cutouts/hoodie-grey.png', status: 'active', createdAt: '2026-01-10T00:00:00.000Z' },
  { id: 'cat-3', name: 'Jackets & Outerwear', slug: 'jackets-outerwear', image: '/assets/images/cutouts/jacket-leather.png', status: 'active', createdAt: '2026-01-10T00:00:00.000Z' },
  { id: 'cat-4', name: 'Pants & Trousers', slug: 'pants-trousers', image: '/assets/images/cutouts/trousers-1.png', status: 'active', createdAt: '2026-01-10T00:00:00.000Z' },
  { id: 'cat-5', name: 'Shirts', slug: 'shirts', image: '/assets/images/cutouts/shirt-white.png', status: 'active', createdAt: '2026-01-10T00:00:00.000Z' },
  { id: 'cat-6', name: 'Shoes & Sneakers', slug: 'shoes-sneakers', image: '/assets/images/cutouts/shoes-sneakers.png', status: 'active', createdAt: '2026-01-10T00:00:00.000Z' },
  { id: 'cat-7', name: 'Hats', slug: 'hats', image: '/assets/images/cutouts/hat-beanie.png', status: 'active', createdAt: '2026-01-10T00:00:00.000Z' }
];

// Initial seed products
const SEED_PRODUCTS = [
  {
    id: 'p1',
    name: 'Charcoal Wool Dress Trousers',
    slug: 'charcoal-wool-dress-trousers',
    category: 'pants-trousers',
    price: 189,
    discount: 15,
    finalPrice: 160,
    stock: 24,
    status: 'active',
    brand: 'AURA Atelier',
    gender: 'men',
    description: 'Precision tailored modern silhouette crafted from 100% fine Italian merino wool with subtle stretch.',
    images: ['/assets/images/cutouts/trousers-1.png', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80'],
    sizes: ['30', '32', '34', '36'],
    colors: ['#2B2B2B', '#1E1E24'],
    featured: true,
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'p2',
    name: 'Relaxed Minimalist Pleated Chino',
    slug: 'relaxed-minimalist-pleated-chino',
    category: 'pants-trousers',
    price: 145,
    discount: 0,
    finalPrice: 145,
    stock: 18,
    status: 'active',
    brand: 'AURA Atelier',
    gender: 'men',
    description: 'High-density organic cotton twill featuring double front pleats and relaxed tapered leg.',
    images: ['/assets/images/cutouts/trousers-2.png'],
    sizes: ['28', '30', '32', '34'],
    colors: ['#D2B48C', '#3E3D39'],
    featured: false,
    createdAt: '2026-01-16T11:30:00.000Z'
  },
  {
    id: 'p3',
    name: 'Heavyweight Heavy Cotton Boxy Tee',
    slug: 'heavyweight-heavy-cotton-boxy-tee',
    category: 't-shirts',
    price: 65,
    discount: 10,
    finalPrice: 58,
    stock: 50,
    status: 'active',
    brand: 'AURA Street',
    gender: 'unisex',
    description: '300 GSM custom-knit combed cotton tee with reinforced ribbed collar and dropped shoulders.',
    images: ['/assets/images/cutouts/tshirt-black.png'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#FFFFFF', '#4A4A4A'],
    featured: true,
    createdAt: '2026-01-18T09:15:00.000Z'
  },
  {
    id: 'p4',
    name: 'Oversized French Terry Hoodie',
    slug: 'oversized-french-terry-hoodie',
    category: 'hoodies-sweatshirts',
    price: 130,
    discount: 20,
    finalPrice: 104,
    stock: 12,
    status: 'active',
    brand: 'AURA Street',
    gender: 'unisex',
    description: '500 GSM loopback French terry hoodie with seamless kangaroo pocket and double-layered hood.',
    images: ['/assets/images/cutouts/hoodie-grey.png'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#808080', '#1A1A1A'],
    featured: true,
    createdAt: '2026-01-20T14:20:00.000Z'
  },
  {
    id: 'p5',
    name: 'Italian Lambskin Biker Jacket',
    slug: 'italian-lambskin-biker-jacket',
    category: 'jackets-outerwear',
    price: 495,
    discount: 0,
    finalPrice: 495,
    stock: 6,
    status: 'active',
    brand: 'AURA Luxe',
    gender: 'men',
    description: 'Handcrafted buttery soft full-grain Italian lambskin leather with silver hardware accents.',
    images: ['/assets/images/cutouts/jacket-leather.png'],
    sizes: ['M', 'L', 'XL'],
    colors: ['#0A0A0A'],
    featured: true,
    createdAt: '2026-01-22T16:00:00.000Z'
  },
  {
    id: 'p6',
    name: 'Poplin Tailored Clean Button Shirt',
    slug: 'poplin-tailored-clean-button-shirt',
    category: 'shirts',
    price: 115,
    discount: 15,
    finalPrice: 97,
    stock: 22,
    status: 'active',
    brand: 'AURA Atelier',
    gender: 'men',
    description: 'Crisp 120s two-ply Egyptian cotton poplin with concealed placket and structured collar.',
    images: ['/assets/images/cutouts/shirt-white.png'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#FFFFFF', '#B0C4DE'],
    featured: false,
    createdAt: '2026-01-25T13:40:00.000Z'
  },
  {
    id: 'p7',
    name: 'Minimalist Platform Court Sneakers',
    slug: 'minimalist-platform-court-sneakers',
    category: 'shoes-sneakers',
    price: 210,
    discount: 10,
    finalPrice: 189,
    stock: 4, // low stock test
    status: 'active',
    brand: 'AURA Footwear',
    gender: 'unisex',
    description: 'Ultra-clean court silhouette with Margom rubber cupsole and premium nappa leather upper.',
    images: ['/assets/images/cutouts/shoes-sneakers.png'],
    sizes: ['40', '41', '42', '43', '44'],
    colors: ['#FAFAFA', '#1C1C1C'],
    featured: true,
    createdAt: '2026-01-28T10:10:00.000Z'
  },
  {
    id: 'p8',
    name: 'Cashmere Ribbed Beanie Hat',
    slug: 'cashmere-ribbed-beanie-hat',
    category: 'hats',
    price: 60,
    discount: 0,
    finalPrice: 60,
    stock: 35,
    status: 'active',
    brand: 'AURA Luxe',
    gender: 'unisex',
    description: '100% grade-A Mongolian cashmere with ribbed knit construction and fold-over cuff.',
    images: ['/assets/images/cutouts/hat-beanie.png'],
    sizes: ['One Size'],
    colors: ['#333333', '#C0C0C0', '#D2B48C'],
    featured: false,
    createdAt: '2026-02-01T12:00:00.000Z'
  }
];

// Initial seed admin user and customers
const getSeedUsers = () => {
  const salt = bcrypt.genSaltSync(10);
  return [
    {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@ecom.com',
      password: bcrypt.hashSync('admin123', salt),
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      phone: '+1 (555) 019-2834',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'u101',
      name: 'Alexander Pierce',
      email: 'alexander@example.com',
      password: bcrypt.hashSync('password123', salt),
      role: 'customer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      phone: '+1 (555) 234-5678',
      createdAt: '2026-01-12T08:30:00.000Z'
    },
    {
      id: 'u102',
      name: 'Sophia Laurent',
      email: 'sophia@example.com',
      password: bcrypt.hashSync('password123', salt),
      role: 'customer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      phone: '+1 (555) 456-7890',
      createdAt: '2026-01-15T14:10:00.000Z'
    },
    {
      id: 'u103',
      name: 'Marcus Sterling',
      email: 'marcus@example.com',
      password: bcrypt.hashSync('password123', salt),
      role: 'customer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      phone: '+1 (555) 789-0123',
      createdAt: '2026-02-02T11:45:00.000Z'
    }
  ];
};

// Initial seed orders
const SEED_ORDERS = [
  {
    id: 'ORD-98421',
    userId: 'u101',
    customer: {
      name: 'Alexander Pierce',
      email: 'alexander@example.com',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Apt 4B, New York, NY 10001'
    },
    items: [
      { id: 'p5', name: 'Italian Lambskin Biker Jacket', quantity: 1, price: 495, image: '/assets/images/cutouts/jacket-leather.png' },
      { name: 'Monochrome Oversized Silk Shirt', quantity: 1, price: 240, image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=400&q=80' }
    ],
    subtotal: 735,
    tax: 0,
    shipping: 0,
    total: 735,
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card (Stripe)',
    status: 'Shipped',
    trackingNumber: 'TRK-882910492',
    notes: 'Leave package with building concierge if not home.',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-08-24T10:14:00.000Z', detail: 'Order successfully created and paid.' },
      { status: 'Processing', timestamp: '2026-08-24T14:30:00.000Z', detail: 'Items verified and prepared for fulfillment.' },
      { status: 'Shipped', timestamp: '2026-08-25T09:00:00.000Z', detail: 'Dispatched via Express Courier.' }
    ],
    createdAt: '2026-08-24T10:14:00.000Z'
  },
  {
    id: 'ORD-87102',
    userId: 'u101',
    customer: {
      name: 'Alexander Pierce',
      email: 'alexander@example.com',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Apt 4B, New York, NY 10001'
    },
    items: [
      { id: 'p7', name: 'Minimalist Platform Court Sneakers', quantity: 2, price: 180, image: '/assets/images/cutouts/shoes-sneakers.png' }
    ],
    subtotal: 360,
    tax: 0,
    shipping: 0,
    total: 360,
    paymentStatus: 'paid',
    paymentMethod: 'Apple Pay',
    status: 'Delivered',
    trackingNumber: 'TRK-55102914',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-07-15T08:00:00.000Z', detail: 'Order placed' },
      { status: 'Processing', timestamp: '2026-07-15T11:20:00.000Z', detail: 'Packed' },
      { status: 'Shipped', timestamp: '2026-07-16T10:00:00.000Z', detail: 'In transit' },
      { status: 'Delivered', timestamp: '2026-07-18T15:45:00.000Z', detail: 'Delivered to front door' }
    ],
    createdAt: '2026-07-15T08:00:00.000Z'
  },
  {
    id: 'ORD-76291',
    userId: 'u102',
    customer: {
      name: 'Sophia Laurent',
      email: 'sophia@example.com',
      phone: '+1 (555) 456-7890',
      address: '1200 Avenue of the Americas, Suite 1400, New York, NY 10036'
    },
    items: [
      { id: 'p1', name: 'Charcoal Wool Dress Trousers', quantity: 1, price: 160, image: '/assets/images/cutouts/trousers-1.png' },
      { id: 'p4', name: 'Oversized French Terry Hoodie', quantity: 1, price: 104, image: '/assets/images/cutouts/hoodie-grey.png' }
    ],
    subtotal: 264,
    tax: 0,
    shipping: 0,
    total: 264,
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    status: 'Processing',
    trackingNumber: 'TRK-99021844',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-09-01T09:30:00.000Z', detail: 'Order confirmed' },
      { status: 'Processing', timestamp: '2026-09-01T11:00:00.000Z', detail: 'Packaging items' }
    ],
    createdAt: '2026-09-01T09:30:00.000Z'
  },
  {
    id: 'ORD-75109',
    userId: 'u103',
    customer: {
      name: 'Marcus Sterling',
      email: 'marcus@example.com',
      phone: '+1 (555) 789-0123',
      address: '450 Sutter St, San Francisco, CA 94108'
    },
    items: [
      { id: 'p3', name: 'Heavyweight Heavy Cotton Boxy Tee', quantity: 2, price: 58, image: '/assets/images/cutouts/tshirt-black.png' }
    ],
    subtotal: 116,
    tax: 0,
    shipping: 0,
    total: 116,
    paymentStatus: 'paid',
    paymentMethod: 'PayPal',
    status: 'Pending',
    trackingNumber: '',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-09-01T14:10:00.000Z', detail: 'Awaiting fulfillment confirmation' }
    ],
    createdAt: '2026-09-01T14:10:00.000Z'
  }
];

// Initial Try-On History
const SEED_TRYON_HISTORY = [
  {
    id: 'tryon-101',
    userId: 'u101',
    userName: 'Alexander Pierce',
    userEmail: 'alexander@example.com',
    productName: 'Charcoal Wool Dress Trousers',
    clothImageUrl: '/assets/images/cutouts/trousers-1.png',
    modelImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    modelName: 'Real Male Model',
    generatedImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    status: 'success',
    apiStatus: 'COMPLETED (200 OK)',
    responseTimeMs: 3420,
    aiProvider: 'LightX AI v2',
    timestamp: '2026-08-30T16:20:10.000Z'
  },
  {
    id: 'tryon-102',
    userId: 'u102',
    userName: 'Sophia Laurent',
    userEmail: 'sophia@example.com',
    productName: 'Oversized French Terry Hoodie',
    clothImageUrl: '/assets/images/cutouts/hoodie-grey.png',
    modelImageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    modelName: 'Real Female Model',
    generatedImageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    status: 'success',
    apiStatus: 'COMPLETED (200 OK)',
    responseTimeMs: 4180,
    aiProvider: 'LightX AI v2',
    timestamp: '2026-08-31T11:45:00.000Z'
  },
  {
    id: 'tryon-103',
    userId: 'u103',
    userName: 'Marcus Sterling',
    userEmail: 'marcus@example.com',
    productName: 'Italian Lambskin Biker Jacket',
    clothImageUrl: '/assets/images/cutouts/jacket-leather.png',
    modelImageUrl: '/assets/images/tryon/model-man.jpg',
    modelName: '3D Mannequin',
    generatedImageUrl: null,
    status: 'failed',
    apiStatus: 'ERROR: Image resolution insufficient',
    errorMessage: 'Local asset URL was unreachable before public tunnel fully initialized.',
    responseTimeMs: 1200,
    aiProvider: 'LightX AI v2',
    timestamp: '2026-09-01T08:12:00.000Z'
  }
];

// Initial Site Settings
const SEED_SETTINGS = {
  websiteName: 'AURA Atelier & Virtual Try-On Studio',
  websiteLogo: '/assets/images/brand-logo.png',
  contactEmail: 'concierge@aura-fashion.com',
  contactPhone: '+1 (800) 555-AURA',
  currency: 'USD',
  currencySymbol: '$',
  maintenanceMode: false,
  allowVirtualTryOn: true,
  defaultTryOnModel: 'real-man-1',
  announcementText: 'Complimentary Worldwide Express Shipping on Orders Over $250 • Experience Photorealistic AI Try-On',
  socialLinks: {
    instagram: 'https://instagram.com/aura.fashion',
    twitter: 'https://twitter.com/aura_atelier',
    facebook: 'https://facebook.com/aurafashion',
    youtube: 'https://youtube.com/@aurafashion'
  },
  banner: {
    heading: 'AUTUMN / WINTER 2026 COLLECTION',
    subheading: 'Tailored Minimalist Luxury with Photorealistic AI Try-On Fitting Room',
    buttonText: 'Explore Collection',
    buttonLink: '/shop'
  }
};

class DBManager {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[DB] Error loading db.json, reinitializing seeds:', err.message);
    }

    const initial = {
      categories: SEED_CATEGORIES,
      products: SEED_PRODUCTS,
      users: getSeedUsers(),
      orders: SEED_ORDERS,
      tryonHistory: SEED_TRYON_HISTORY,
      settings: SEED_SETTINGS
    };

    this.saveData(initial);
    return initial;
  }

  saveData(data = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('[DB] Error saving to db.json:', err.message);
    }
  }

  // Categories
  getCategories() {
    return this.data.categories || [];
  }

  getCategoryById(id) {
    return this.getCategories().find(c => c.id === id || c.slug === id);
  }

  addCategory(category) {
    const newCat = {
      id: 'cat-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'active',
      ...category
    };
    this.data.categories.push(newCat);
    this.saveData();
    return newCat;
  }

  updateCategory(id, updates) {
    const idx = this.data.categories.findIndex(c => c.id === id || c.slug === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveData();
    return this.data.categories[idx];
  }

  deleteCategory(id) {
    const idx = this.data.categories.findIndex(c => c.id === id || c.slug === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.saveData();
    return true;
  }

  // Products
  getProducts() {
    return this.data.products || [];
  }

  getProductById(id) {
    return this.getProducts().find(p => p.id === id || p.slug === id);
  }

  addProduct(product) {
    const price = Number(product.price) || 0;
    const discount = Number(product.discount) || 0;
    const finalPrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : price;

    const newProd = {
      id: 'p-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'active',
      ...product,
      price,
      discount,
      finalPrice: Number(product.finalPrice) || finalPrice,
      stock: Number(product.stock) || 0
    };
    this.data.products.unshift(newProd);
    this.saveData();
    return newProd;
  }

  updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id || p.slug === id);
    if (idx === -1) return null;

    const current = this.data.products[idx];
    const price = updates.price !== undefined ? Number(updates.price) : current.price;
    const discount = updates.discount !== undefined ? Number(updates.discount) : current.discount;
    const calculatedFinalPrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : price;

    this.data.products[idx] = {
      ...current,
      ...updates,
      price,
      discount,
      finalPrice: updates.finalPrice !== undefined ? Number(updates.finalPrice) : calculatedFinalPrice,
      stock: updates.stock !== undefined ? Number(updates.stock) : current.stock,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.products[idx];
  }

  deleteProduct(id) {
    const idx = this.data.products.findIndex(p => p.id === id || p.slug === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.saveData();
    return true;
  }

  // Users
  getUsers() {
    return this.data.users || [];
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email) {
    if (!email) return null;
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user) {
    const newUser = {
      id: 'u-' + Date.now(),
      role: 'customer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date().toISOString(),
      ...user
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveData();
    return this.data.users[idx];
  }

  deleteUser(id) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.saveData();
    return true;
  }

  // Orders
  getOrders() {
    return this.data.orders || [];
  }

  getOrderById(id) {
    return this.getOrders().find(o => o.id === id);
  }

  addOrder(order) {
    const newOrder = {
      id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
      createdAt: new Date().toISOString(),
      status: 'Pending',
      paymentStatus: 'paid',
      timeline: [
        { status: 'Order Placed', timestamp: new Date().toISOString(), detail: 'Order created successfully.' }
      ],
      ...order
    };
    this.data.orders.unshift(newOrder);
    this.saveData();
    return newOrder;
  }

  updateOrderStatus(id, status, note = '') {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    const order = this.data.orders[idx];
    order.status = status;
    order.timeline = order.timeline || [];
    order.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      detail: note || `Order marked as ${status}`
    });
    order.updatedAt = new Date().toISOString();
    this.saveData();
    return order;
  }

  // Try-On History
  getTryOnHistory() {
    return this.data.tryonHistory || [];
  }

  getTryOnById(id) {
    return this.getTryOnHistory().find(t => t.id === id);
  }

  addTryOnLog(log) {
    const newLog = {
      id: 'tryon-' + Date.now(),
      timestamp: new Date().toISOString(),
      status: 'success',
      ...log
    };
    this.data.tryonHistory = this.data.tryonHistory || [];
    this.data.tryonHistory.unshift(newLog);
    this.saveData();
    return newLog;
  }

  deleteTryOnLog(id) {
    const idx = (this.data.tryonHistory || []).findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.data.tryonHistory.splice(idx, 1);
    this.saveData();
    return true;
  }

  // Settings
  getSettings() {
    return this.data.settings || SEED_SETTINGS;
  }

  updateSettings(updates) {
    this.data.settings = { ...this.getSettings(), ...updates, updatedAt: new Date().toISOString() };
    this.saveData();
    return this.data.settings;
  }
}

const db = new DBManager();
module.exports = db;

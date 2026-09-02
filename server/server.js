/**
 * Secure Express Backend — LightX AI Virtual Try-On & E-commerce Management API
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const localtunnel = require('localtunnel');
const connectDB = require('./config/database');
const seedData = require('./scripts/seedMongo');
const TryOnSession = require('./models/TryOnSession');

// Helper to log try-on sessions to MongoDB
const logTryOn = async (logData) => {
  try {
    await TryOnSession.create(logData);
  } catch (err) {
    console.warn('[TryOn Logger] Warning: Could not save try-on log to MongoDB:', err.message);
  }
};

// Route Imports
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const tryonAdminRoutes = require('./routes/tryonAdminRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { isCloudinaryConfigured, uploadToCloudinary } = require('./config/cloudinary');

const app = express();
const PORT = process.env.PORT || 4000;
const LIGHTX_API_KEY = process.env.LIGHTX_API_KEY || process.env.VITE_LIGHTX_API_KEY;

// The public tunnel URL — set once the tunnel is established
let publicBaseUrl = null;

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve the Vite public/assets folder so images have HTTP URLs
app.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));

// ─── Mount Modular Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/admin', tryonAdminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// ─── Browser Root Output ───────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Backend Status</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0d0e12;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .card {
          background: #181920;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          max-width: 520px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e;
        }
        h1 {
          font-size: 22px;
          margin: 0 0 12px;
          color: #ffffff;
        }
        p {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          margin: 0 0 24px;
        }
        .btn {
          display: inline-block;
          background: #c87d4a;
          color: #ffffff;
          padding: 12px 28px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
        }
        .btn:hover {
          background: #db8a52;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">
          <span class="dot"></span>
          Live & Online
        </div>
        <h1>Backend successfully running on port 4000</h1>
        <p>AURA Atelier E-commerce & Virtual Try-On API Server is active and operational.</p>
        <a href="http://localhost:5173/admin" class="btn">Open Admin Panel →</a>
      </div>
    </body>
    </html>
  `);
});

// ─── Health Check ────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    keyConfigured: Boolean(LIGHTX_API_KEY) && LIGHTX_API_KEY !== 'your_lightx_api_key_here',
    publicBaseUrl,
    timestamp: new Date().toISOString(),
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function resolvePublicUrl(imageUrl, isGarment = false) {
  if (!imageUrl) return null;

  // 1. If already Cloudinary URL
  if (imageUrl.startsWith('https://res.cloudinary.com/')) {
    if (isGarment && (imageUrl.endsWith('.png') || !imageUrl.includes('b_white'))) {
      const parts = imageUrl.split('/upload/');
      if (parts.length === 2 && !parts[1].startsWith('b_white')) {
        return `${parts[0]}/upload/b_white,f_jpg/${parts[1]}`.replace(/\.png$/, '.jpg');
      }
    }
    return imageUrl;
  }

  // 2. Generic HTTP/HTTPS URL (e.g. Unsplash)
  if (imageUrl.startsWith('https://') || imageUrl.startsWith('http://')) {
    return imageUrl;
  }

  // 3. Base64 Upload
  if (imageUrl.startsWith('data:image/')) {
    if (isCloudinaryConfigured()) {
      try {
        console.log('[Upload Handler] Uploading base64 image to Cloudinary...');
        const options = {
          folder: 'aura_tryon',
          ...(isGarment ? { format: 'jpg', background: 'white', transformation: [{ background: 'white', flatten: true }] } : {})
        };
        const uploaded = await uploadToCloudinary(imageUrl, options);
        console.log('[Upload Handler] ✅ Uploaded to Cloudinary:', uploaded.url);
        return uploaded.url;
      } catch (cloudErr) {
        console.warn('[Upload Handler] Cloudinary upload failed, falling back to local:', cloudErr.message);
      }
    }

    try {
      const uploadsDir = path.join(__dirname, '..', 'public', 'assets', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const matches = imageUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const rawExt = matches[1].toLowerCase();
        const ext = rawExt.includes('png') ? 'png' : 'jpg';
        const filename = `user-upload-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, Buffer.from(matches[2], 'base64'));
        console.log(`[Upload Handler] Saved custom user photo to ${filename}`);
        const cleanPath = `/assets/uploads/${filename}`;
        const base = publicBaseUrl || `http://localhost:${PORT}`;
        return `${base}${cleanPath}`;
      }
    } catch (err) {
      console.error('[Upload Handler] Error saving uploaded image locally:', err);
    }
  }

  // 4. Local relative file path (convert to studio white JPG on Cloudinary if garment)
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  const localDiskPath = path.join(__dirname, '..', 'public', cleanPath);

  if (isCloudinaryConfigured() && fs.existsSync(localDiskPath)) {
    try {
      const options = {
        folder: isGarment ? 'aura_garments_solid' : 'aura_tryon_assets',
        ...(isGarment ? { format: 'jpg', background: 'white', transformation: [{ background: 'white', flatten: true, quality: 'auto' }] } : {})
      };
      const uploaded = await uploadToCloudinary(localDiskPath, options);
      return uploaded.url;
    } catch (err) {
      console.warn('[Upload Handler] Cloudinary local asset upload fallback:', err.message);
    }
  }

  const base = publicBaseUrl || `http://localhost:${PORT}`;
  return `${base}${cleanPath}`;
}

// ─── LightX Order Status Poller ──────────────────────────────────────────────

async function pollOrderStatus(orderId, maxAttempts = 30, intervalMs = 3000) {
  const statusUrl = 'https://api.lightxeditor.com/external/api/v2/order-status';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    const res = await fetch(statusUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LIGHTX_API_KEY,
      },
      body: JSON.stringify({ orderId }),
    });

    if (!res.ok) {
      if (res.status === 402) {
        throw new Error('LightX API credits are currently exhausted. Please recharge API credits.');
      }
      console.warn(`[LightX] Status poll HTTP ${res.status} on attempt ${attempt}`);
      continue;
    }

    const data = await res.json();
    const body = data?.body || data;
    const status = (body?.status || '').toLowerCase();
    const statusCode = body?.statusCode || data?.statusCode;

    console.log(`[LightX] Poll ${attempt}/${maxAttempts} — status: "${status}" code: ${statusCode || '-'}`);

    if (
      (status === 'active' || status === 'success' || status === 'completed') &&
      (body?.output || body?.outputUrl || body?.imageUrl)
    ) {
      return body.output || body.outputUrl || body.imageUrl;
    }

    if (status === 'failed' || status === 'fail' || status === 'error') {
      if (statusCode === 5040 || (body?.message && body.message.toUpperCase().includes('CREDIT'))) {
        throw new Error('LightX API credits are currently exhausted. Please recharge API credits.');
      }
      const errMsg = body?.message || body?.error || statusCode
        ? `LightX AI processing failed (code ${statusCode || 'unknown'}). ` +
          'This usually means the input images are not suitable for Virtual Try-On.'
        : 'LightX AI job failed during processing.';
      throw new Error(errMsg);
    }
  }

  throw new Error('LightX AI generation timed out. The job may still be processing — please try again in a moment.');
}

// ─── Virtual Try-On Execution Endpoint (with Admin Logging) ──────────────────

app.post('/api/tryon', async (req, res) => {
  const startTime = Date.now();
  const { modelImageUrl, clothImageUrl, productName, modelName, userId, userName, userEmail } = req.body;

  if (!modelImageUrl || !clothImageUrl) {
    return res.status(400).json({
      error: 'Both modelImageUrl and clothImageUrl are required.',
    });
  }

  // Guard: API key
  if (!LIGHTX_API_KEY || LIGHTX_API_KEY === 'your_lightx_api_key_here') {
    const errorMsg = 'Server misconfiguration: LIGHTX_API_KEY is not set in server/.env.';
    db.addTryOnLog({
      userId: userId || 'anonymous',
      userName: userName || 'Guest Shopper',
      userEmail: userEmail || 'guest@example.com',
      productName: productName || 'Selected Garment',
      clothImageUrl,
      modelImageUrl,
      modelName: modelName || 'Standard Mannequin',
      status: 'failed',
      apiStatus: 'MISSING_API_KEY',
      errorMessage: errorMsg,
      responseTimeMs: Date.now() - startTime,
      aiProvider: 'LightX AI v2'
    });
    return res.status(500).json({ error: errorMsg });
  }

  // Wait up to 5s if tunnel is still booting for local assets
  const isLocal = (url) => url && !url.startsWith('http');
  if ((isLocal(modelImageUrl) || isLocal(clothImageUrl)) && !publicBaseUrl) {
    console.log('[LightX] Waiting for public tunnel to be ready...');
    let waited = 0;
    while (!publicBaseUrl && waited < 5000) {
      await new Promise((r) => setTimeout(r, 500));
      waited += 500;
    }
  }

  const resolvedModelUrl = await resolvePublicUrl(modelImageUrl, false);
  const resolvedClothUrl = await resolvePublicUrl(clothImageUrl, true);

  console.log('\n[LightX] ── New Try-On Request ──────────────────────────');
  console.log('  Model  :', resolvedModelUrl);
  console.log('  Cloth  :', resolvedClothUrl);

  try {
    const tryOnApiUrl = 'https://api.lightxeditor.com/external/api/v2/aivirtualtryon';

    const jobRes = await fetch(tryOnApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LIGHTX_API_KEY,
      },
      body: JSON.stringify({
        imageUrl: resolvedModelUrl,
        styleImageUrl: resolvedClothUrl,
      }),
    });

    const jobData = await jobRes.json().catch(() => ({}));

    if (!jobRes.ok) {
      const errMsg = jobData?.message || jobData?.description || `LightX API HTTP ${jobRes.status}`;
      await logTryOn({
        userId: userId || 'anonymous',
        userName: userName || 'Guest Shopper',
        userEmail: userEmail || 'guest@example.com',
        productName: productName || 'Selected Garment',
        clothImageUrl,
        modelImageUrl,
        modelName: modelName || 'Standard Mannequin',
        status: 'failed',
        apiStatus: `HTTP ${jobRes.status}`,
        errorMessage: errMsg,
        responseTimeMs: Date.now() - startTime,
        aiProvider: 'LightX AI v2'
      });
      return res.status(jobRes.status).json({ error: errMsg });
    }

    if (
      jobData?.statusCode === 5040 ||
      jobData?.status === 'FAIL' ||
      (jobData?.message && jobData.message.includes('CREDITS'))
    ) {
      const errMsg = jobData?.message || 'LightX API credits exhausted. Please recharge at app.lightxeditor.com.';
      await logTryOn({
        userId: userId || 'anonymous',
        userName: userName || 'Guest Shopper',
        userEmail: userEmail || 'guest@example.com',
        productName: productName || 'Selected Garment',
        clothImageUrl,
        modelImageUrl,
        modelName: modelName || 'Standard Mannequin',
        status: 'failed',
        apiStatus: 'CREDITS_EXHAUSTED (402)',
        errorMessage: errMsg,
        responseTimeMs: Date.now() - startTime,
        aiProvider: 'LightX AI v2'
      });
      return res.status(402).json({ error: errMsg });
    }

    const orderId = jobData?.body?.orderId || jobData?.orderId;
    if (!orderId) {
      const errMsg = jobData?.message || jobData?.body?.message || 'LightX did not return an order ID.';
      await logTryOn({
        userId: userId || 'anonymous',
        userName: userName || 'Guest Shopper',
        userEmail: userEmail || 'guest@example.com',
        productName: productName || 'Selected Garment',
        clothImageUrl,
        modelImageUrl,
        modelName: modelName || 'Standard Mannequin',
        status: 'failed',
        apiStatus: 'NO_ORDER_ID',
        errorMessage: errMsg,
        responseTimeMs: Date.now() - startTime,
        aiProvider: 'LightX AI v2'
      });
      return res.status(500).json({ error: errMsg });
    }

    // Poll until ready
    const outputUrl = await pollOrderStatus(orderId);

    const elapsed = Date.now() - startTime;
    await logTryOn({
      userId: userId || 'anonymous',
      userName: userName || 'Guest Shopper',
      userEmail: userEmail || 'guest@example.com',
      productName: productName || 'Selected Garment',
      clothImageUrl,
      modelImageUrl,
      modelName: modelName || 'Standard Mannequin',
      generatedImageUrl: outputUrl,
      status: 'success',
      apiStatus: 'COMPLETED (200 OK)',
      responseTimeMs: elapsed,
      aiProvider: 'LightX AI v2'
    });

    console.log('[LightX] ✅ Try-On complete:', outputUrl);
    return res.json({ outputUrl });

  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.error('[LightX] ✗ Virtual Try-On Error:', err.message);
    await logTryOn({
      userId: userId || 'anonymous',
      userName: userName || 'Guest Shopper',
      userEmail: userEmail || 'guest@example.com',
      productName: productName || 'Selected Garment',
      clothImageUrl,
      modelImageUrl,
      modelName: modelName || 'Standard Mannequin',
      status: 'failed',
      apiStatus: 'EXCEPTION',
      errorMessage: err.message,
      responseTimeMs: elapsed,
      aiProvider: 'LightX AI v2'
    });
    return res.status(500).json({ error: err.message || 'Virtual Try-On processing failed.' });
  }
});

// ─── Start Server + Establish Public Tunnel ──────────────────────────────────

app.listen(PORT, async () => {
  // Connect to MongoDB Atlas & seed initial data
  console.log('\n🔄 Connecting to MongoDB Atlas...');
  const isDbConnected = await connectDB();
  if (isDbConnected) {
    await seedData();
  }

  const keyOk = LIGHTX_API_KEY && LIGHTX_API_KEY !== 'your_lightx_api_key_here';
  const keyStatus = !LIGHTX_API_KEY
    ? '❌ MISSING'
    : !keyOk
    ? '⚠️  PLACEHOLDER — replace in server/.env'
    : '✅ Configured';

  const cloudinaryStatus = isCloudinaryConfigured()
    ? '✅ Configured (Active)'
    : '⚠️  NOT CONFIGURED — set credentials in server/.env';

  console.log(`\n🚀 Backend successfully running on port ${PORT}`);
  console.log(`   Server URL   : http://localhost:${PORT}`);
  console.log(`   Database     : ${isDbConnected ? 'MongoDB Atlas (Connected)' : 'Local Fallback'}`);
  console.log(`   Frontend URL : http://localhost:5173`);
  console.log(`   Admin Panel  : http://localhost:5173/admin`);
  console.log(`   LightX API   : ${keyStatus}`);
  console.log(`   Cloudinary   : ${cloudinaryStatus}`);
  console.log(`   Upload API   : http://localhost:${PORT}/api/upload`);
  console.log(`   Admin APIs   : http://localhost:${PORT}/api/admin/...`);
  console.log(`   Product APIs : http://localhost:${PORT}/api/products`);

  // Create tunnel
  try {
    const tunnel = await localtunnel({ port: PORT });
    publicBaseUrl = tunnel.url;
    console.log(`   ✅ Tunnel active: ${publicBaseUrl}`);

    tunnel.on('close', () => {
      console.warn('[Tunnel] Tunnel closed — local images may no longer be reachable by LightX.');
      publicBaseUrl = null;
    });

    tunnel.on('error', (err) => {
      console.warn('[Tunnel] Tunnel error:', err.message);
    });

  } catch (err) {
    console.warn(`\n⚠️  Could not establish public tunnel: ${err.message}`);
  }
});

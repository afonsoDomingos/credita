require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// ── Startup diagnostics ──────────────────────────────────────────
console.log('[STARTUP] Node version:', process.version);
console.log('[STARTUP] MONGO_URI set:', !!process.env.MONGO_URI);
console.log('[STARTUP] JWT_SECRET set:', !!process.env.JWT_SECRET);
if (!process.env.MONGO_URI) {
  console.error('[STARTUP] ❌ FATAL: MONGO_URI is not set! Add it to environment variables.');
}
if (!process.env.JWT_SECRET) {
  console.warn('[STARTUP] ⚠️ WARNING: JWT_SECRET is not set. Using fallback for development. Set JWT_SECRET in production!');
}
// ─────────────────────────────────────────────────────────────────

// Temporarily disabled cloudinary to debug 500 error
// const { upload } = require('./config/cloudinary');
// const Client = require('./models/Client'); // Not used in index.js

const app = express();

// CORS - Allow all origins for now (configure properly in production)
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Temporarily disabled static file serving (uploads folder may not exist on Vercel)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Custom Request Logger for Production Debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      family: 4,
      serverSelectionTimeoutMS: 5000
    }).then(mongoose => mongoose);
  }
  cached.conn = await cached.promise;
  console.log('✅ MongoDB Connected (Serverless)');
  return cached.conn;
}

// Middleware to ensure DB connection on every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    res.status(503).json({ 
      error: 'Falha na ligação à Base de Dados', 
      details: error.message,
      hint: 'Verifique se o cluster no MongoDB Atlas está ativo/unpaused ou se as credenciais estão corretas.'
    });
  }
});

// Routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const clientRoutes = require('./routes/clientRoutes');
const loanRoutes = require('./routes/loanRoutes');
// Temporarily disabled company routes that use cloudinary upload
// const companyRoutes = require('./routes/companyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const systemRoutes = require('./routes/systemRoutes');
const supportRoutes = require('./routes/supportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditRoutes = require('./routes/auditRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
// app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Etako API is running!' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;

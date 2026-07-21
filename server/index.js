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
  console.error('[STARTUP] ❌ FATAL: MONGO_URI is not set! Add it to Vercel environment variables.');
}
// ─────────────────────────────────────────────────────────────────

const { upload } = require('./config/cloudinary');
const Client = require('./models/Client');

const app = express();

app.use(cors());
app.use(express.json());

// Servir ficheiros carregados localmente de forma estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
const companyRoutes = require('./routes/companyRoutes');
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
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Etako API is running!' });
});

// Create client with image upload
app.post('/api/clients', upload.single('profileImage'), async (req, res) => {
  try {
    const { name, phone, idCard, address } = req.body;
    
    let profileImageUrl = '';
    if (req.file) {
      profileImageUrl = req.file.path; // URL do Cloudinary
    }

    const newClient = new Client({
      name,
      phone,
      idCard,
      address,
      profileImageUrl
    });

    const savedClient = await newClient.save();
    res.status(201).json(savedClient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { upload } = require('./config/cloudinary');
const Client = require('./models/Client');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

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
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

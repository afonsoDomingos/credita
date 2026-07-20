const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

const generateToken = (id) => {
  // Num cenário real usar um JWT_SECRET forte no .env
  return jwt.sign({ id }, process.env.JWT_SECRET || 'etako_super_secret', {
    expiresIn: '30d',
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Tentativa de login recebida para: ${email}`);

  try {
    const user = await User.findOne({ email }).populate('company');
    
    if (!user) {
      console.log(`[AUTH] Falha: Utilizador ${email} não encontrado na BD.`);
      return res.status(401).json({ message: 'Email ou password incorretos' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`[AUTH] Falha: Password incorreta para ${email}.`);
      return res.status(401).json({ message: 'Email ou password incorretos' });
    }

    // Check if it's a company and if the company is suspended
    if (user.role === 'empresa' && user.company && !user.company.isActive) {
      console.log(`[AUTH] Falha: Empresa suspensa (${email}).`);
      return res.status(403).json({ message: 'A sua conta encontra-se suspensa. Contacte o administrador.' });
    }

    console.log(`[AUTH] Sucesso: Login aprovado para ${email} (Role: ${user.role})`);
    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      company: user.company,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('[AUTH] Erro interno durante o login:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Registar Utilizador
const registerUser = async (req, res) => {
  const { companyName, nif, phone, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Este email já está registado.' });
    }

    // Criar a Empresa primeiro
    const company = new Company({
      name: companyName,
      nif: nif || '',
      phone: phone || '',
      subscriptionPlan: 'trial',
      isActive: true
    });
    const savedCompany = await company.save();

    const user = new User({
      email,
      password,
      role: 'empresa',
      company: savedCompany._id
    });
    const savedUser = await user.save();

    res.status(201).json({
      _id: savedUser._id,
      email: savedUser.email,
      role: savedUser.role,
      company: savedCompany,
      token: generateToken(savedUser._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar conta', details: error.message });
  }
};

module.exports = { loginUser, registerUser };

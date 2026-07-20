const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  // Num cenário real usar um JWT_SECRET forte no .env
  return jwt.sign({ id }, process.env.JWT_SECRET || 'etako_super_secret', {
    expiresIn: '30d',
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('company');

    if (user && (await user.matchPassword(password))) {
      // Check if it's a company and if the company is suspended
      if (user.role === 'empresa' && user.company && !user.company.isActive) {
        return res.status(403).json({ message: 'A sua conta encontra-se suspensa. Contacte o administrador.' });
      }

      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        company: user.company,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email ou password incorretos' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

module.exports = { loginUser };

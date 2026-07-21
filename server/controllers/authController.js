const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Company = require('../models/Company');

const generateToken = (id) => {
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
    res.status(500).json({ message: 'Erro no servidor', error: error.message, stack: error.stack });
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

// Esqueceu a Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Por segurança, não dizemos que o email não existe
      return res.json({ message: 'Se este email existir no sistema, receberá instruções de recuperação.' });
    }

    // Gerar token de 6 dígitos (código simples para o utilizador)
    const resetCode = crypto.randomInt(100000, 999999).toString();
    
    user.resetPasswordToken = crypto.createHash('sha256').update(resetCode).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutos
    await user.save({ validateBeforeSave: false });

    // Enviar email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'credita.mz.app@gmail.com',
        pass: process.env.EMAIL_PASS || 'your_app_password'
      }
    });

    const mailOptions = {
      from: '"Credita" <credita.mz.app@gmail.com>',
      to: email,
      subject: 'Credita - Recuperação de Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563EB;">Credita - Recuperação de Password</h2>
          <p>Recebemos um pedido para recuperar a sua password. Use o código abaixo para definir uma nova password:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1F2937;">${resetCode}</span>
          </div>
          <p style="color: #6B7280; font-size: 14px;">Este código expira em <strong>15 minutos</strong>.</p>
          <p style="color: #6B7280; font-size: 14px;">Se não solicitou esta recuperação, ignore este email.</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
          <p style="color: #9CA3AF; font-size: 12px;">© ${new Date().getFullYear()} Credita - Plataforma de Microcrédito</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[AUTH] Código de recuperação enviado para ${email}`);

    res.json({ message: 'Se este email existir no sistema, receberá instruções de recuperação.' });
  } catch (error) {
    console.error('[AUTH] Erro no forgot password:', error);
    // Limpar tokens em caso de erro no envio
    const user = await User.findOne({ email });
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.status(500).json({ message: 'Erro ao processar pedido. Tente novamente.' });
  }
};

// Resetar Password com código
const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedCode,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Código inválido ou expirado. Peça um novo código.' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log(`[AUTH] Password redefinida com sucesso para ${email}`);
    res.json({ message: 'Password redefinida com sucesso! Pode fazer login.' });
  } catch (error) {
    console.error('[AUTH] Erro no reset password:', error);
    res.status(500).json({ message: 'Erro ao redefinir password.' });
  }
};

module.exports = { loginUser, registerUser, forgotPassword, resetPassword };

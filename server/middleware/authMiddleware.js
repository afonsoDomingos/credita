const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!process.env.JWT_SECRET) {
    console.error('[SECURITY] ❌ FATAL: JWT_SECRET não está definido nas variáveis de ambiente!');
    return res.status(500).json({ 
      message: 'Erro de configuração do servidor',
      code: 'SERVER_CONFIG_ERROR'
    });
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log(`[AUTH-MIDDLEWARE] [${new Date().toISOString()}] IP: ${clientIp} | Token recebido, verificando...`);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`[AUTH-MIDDLEWARE] Token válido para user ID: ${decoded.id}`);
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.warn(`[AUTH-MIDDLEWARE] ❌ Utilizador não encontrado para ID: ${decoded.id}`);
        return res.status(401).json({ 
          message: 'Não autorizado, utilizador não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }
      
      console.log(`[AUTH-MIDDLEWARE] ✅ Autenticação bem-sucedida para: ${req.user.email} (Role: ${req.user.role})`);
      next();
    } catch (error) {
      console.error(`[AUTH-MIDDLEWARE-ERROR] [${new Date().toISOString()}] IP: ${clientIp} | Falha na verificação do token:`, {
        error: error.message,
        name: error.name
      });
      res.status(401).json({ 
        message: 'Não autorizado, token falhou',
        code: 'TOKEN_INVALID',
        details: error.message
      });
    }
  } else {
    console.warn(`[AUTH-MIDDLEWARE] [${new Date().toISOString()}] IP: ${clientIp} | Requisição sem token Bearer`);
  }

  if (!token) {
    res.status(401).json({ 
      message: 'Não autorizado, sem token',
      code: 'NO_TOKEN'
    });
  }
};

const superadmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado: Apenas Superadmin' });
  }
};

module.exports = { protect, superadmin };

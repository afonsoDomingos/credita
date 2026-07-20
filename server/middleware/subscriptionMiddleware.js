const Company = require('../models/Company');

const checkSubscription = async (req, res, next) => {
  try {
    if (!req.user || req.user.role === 'superadmin') {
      return next();
    }

    const company = await Company.findById(req.user.company);
    
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    // Se estiver expirado ou inativo
    if (!company.isActive || company.subscriptionStatus === 'expired') {
      return res.status(403).json({ 
        message: 'A sua assinatura expirou. Por favor, regularize o pagamento.',
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar assinatura' });
  }
};

module.exports = { checkSubscription };

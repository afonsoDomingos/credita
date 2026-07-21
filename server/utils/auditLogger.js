const AuditLog = require('../models/AuditLog');

const logActivity = async (req, action, description) => {
  try {
    if (!req.user || !req.user.company) return;

    await AuditLog.create({
      company: req.user.company,
      user: req.user._id,
      userEmail: req.user.email || 'Utilizador',
      action,
      description,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
    });
  } catch (error) {
    console.error('Erro ao registar log de auditoria:', error);
  }
};

module.exports = { logActivity };

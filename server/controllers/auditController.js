const AuditLog = require('../models/AuditLog');

// Listar histórico de auditoria da empresa
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ company: req.user.company })
      .populate('user', 'email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Erro ao carregar registos de auditoria' });
  }
};

module.exports = { getAuditLogs };

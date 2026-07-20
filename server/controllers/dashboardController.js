const Client = require('../models/Client');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Company = require('../models/Company');

// Para o Dashboard da Empresa (Inquilino)
const getEmpresaStats = async (req, res) => {
  try {
    const companyId = req.user.company;

    // Contagens reais da BD apenas para ESTA empresa
    const totalClientes = await Client.countDocuments({ company: companyId });
    const totalEmprestimosAtivos = await Loan.countDocuments({ company: companyId, status: 'active' });
    
    // Podemos somar o valor emprestado com agregação, mas para já simplificamos para 0 se não houver
    const emprestimos = await Loan.find({ company: companyId });
    const valorEmprestado = emprestimos.reduce((acc, loan) => acc + loan.amount, 0);

    const pagamentos = await Payment.find({ company: companyId });
    const valorRecebido = pagamentos.reduce((acc, pay) => acc + pay.amountPaid, 0);

    const ultimosClientes = await Client.find({ company: companyId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Também enviamos a própria info da empresa para o plano
    const empresa = await Company.findById(companyId);

    res.json({
      totalClientes,
      totalEmprestimosAtivos,
      valorEmprestado,
      valorRecebido,
      ultimosClientes,
      plano: empresa ? empresa.subscriptionPlan : 'N/A'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas da empresa' });
  }
};

// Para o Dashboard do Superadmin
const getSuperadminStats = async (req, res) => {
  try {
    const empresas = await Company.find().sort({ createdAt: -1 });
    const totalCompanies = empresas.length;
    const activeCompanies = empresas.filter(emp => emp.isActive).length;
    const totalClients = await Client.countDocuments(); // Soma de todos os clientes no sistema

    res.json({
      empresas,
      stats: {
        totalCompanies,
        activeCompanies,
        totalClients
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas do admin' });
  }
};

module.exports = { getEmpresaStats, getSuperadminStats };

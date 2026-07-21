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
    
    const emprestimos = await Loan.find({ company: companyId });
    const valorEmprestado = emprestimos.reduce((acc, loan) => acc + loan.amount, 0);

    const pagamentos = await Payment.find({ company: companyId });
    const valorRecebido = pagamentos.reduce((acc, pay) => acc + pay.amountPaid, 0);

    const ultimosClientes = await Client.find({ company: companyId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Também enviamos a própria info da empresa para o plano
    const empresa = await Company.findById(companyId);

    // --- DADOS PARA GRÁFICOS ---

    // 1. Receitas por Mês (últimos 6 meses)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const receitasMensais = [];
    const labelsMeses = [];
    const mesesPT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    for (let i = 5; i >= 0; i--) {
      const mesInicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mesFim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const somaMes = pagamentos
        .filter(p => {
          const d = new Date(p.paymentDate);
          return d >= mesInicio && d <= mesFim;
        })
        .reduce((acc, p) => acc + p.amountPaid, 0);
      
      receitasMensais.push(somaMes);
      labelsMeses.push(mesesPT[mesInicio.getMonth()]);
    }

    // 2. Estado da Carteira (Doughnut)
    const empAtivos = emprestimos.filter(e => e.status === 'active').length;
    const empPagos = emprestimos.filter(e => e.status === 'paid').length;
    const empDivida = emprestimos.filter(e => e.status !== 'active' && e.status !== 'paid').length;

    res.json({
      totalClientes,
      totalEmprestimosAtivos,
      valorEmprestado,
      valorRecebido,
      ultimosClientes,
      plano: empresa ? empresa.subscriptionPlan : 'N/A',
      chartData: {
        receitasMensais,
        labelsMeses,
        carteira: {
          ativos: empAtivos,
          pagos: empPagos,
          divida: empDivida
        }
      }
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

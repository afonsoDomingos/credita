const Company = require('../models/Company');
const User = require('../models/User');
const Client = require('../models/Client');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');

// ... (existing createCompany and toggleCompanyStatus will be preserved using StartLine=4)

// Criar nova empresa e utilizador dono (SaaS Onboarding)
const createCompany = async (req, res) => {
  const { name, nif, phone, plan, email, password } = req.body;

  try {
    // 1. Check if email is already taken
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este email já está a ser utilizado por outro utilizador' });
    }

    // 2. Create the Company
    const company = new Company({
      name,
      nif,
      phone: phone || '',
      subscriptionPlan: plan,
      isActive: true
    });
    const savedCompany = await company.save();

    // 3. Create the User (Empresa role) linked to this company
    const user = new User({
      email,
      password,
      role: 'empresa',
      company: savedCompany._id
    });
    await user.save();

    res.status(201).json({
      message: 'Empresa criada com sucesso',
      company: savedCompany
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Erro ao criar empresa. Verifique os dados fornecidos.' });
  }
};

// Alternar estado da empresa (Suspender / Ativar)
const toggleCompanyStatus = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    // Invert the status
    company.isActive = !company.isActive;
    await company.save();

    res.json({
      message: `Empresa ${company.isActive ? 'ativada' : 'suspensa'} com sucesso`,
      company
    });
  } catch (error) {
    console.error('Error toggling company status:', error);
    res.status(500).json({ message: 'Erro ao alterar estado da empresa' });
  }
};

// Atualizar Plano da Empresa
const updateCompanyPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const company = await Company.findByIdAndUpdate(req.params.id, { subscriptionPlan: plan }, { new: true });
    
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }
    res.json({ message: 'Plano atualizado com sucesso', company });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ message: 'Erro ao atualizar plano' });
  }
};

const jwt = require('jsonwebtoken');

// Apagar Empresa (Hard Delete Cascata)
const deleteCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    // Apagar tudo relacionado à empresa em cascata
    await Payment.deleteMany({ company: companyId });
    await Loan.deleteMany({ company: companyId });
    await Client.deleteMany({ company: companyId });
    await User.deleteMany({ company: companyId });
    await Company.findByIdAndDelete(companyId);

    res.json({ message: 'Empresa e todos os seus dados eliminados permanentemente' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Erro crítico ao apagar empresa' });
  }
};

// Impersonate (Ver Detalhes da Empresa como Gestor)
const impersonateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    
    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }
    
    // Find the main user/owner of this company
    const companyUser = await User.findOne({ company: companyId, role: 'empresa' });
    if (!companyUser) {
      return res.status(404).json({ message: 'Nenhum utilizador encontrado para esta empresa' });
    }
    
    // Generate JWT for this user
    const token = jwt.sign({ id: companyUser._id }, process.env.JWT_SECRET || 'etako_super_secret', {
      expiresIn: '2h', // Short lived token for security during impersonation
    });
    
    res.json({
      _id: companyUser._id,
      email: companyUser.email,
      role: companyUser.role,
      company: companyUser.company,
      token
    });
  } catch (error) {
    console.error('Error in impersonate:', error);
    res.status(500).json({ message: 'Erro ao tentar aceder à empresa' });
  }
};

const Receipt = require('../models/Receipt');

// Obter estatísticas financeiras do Superadmin
const getFinancialStats = async (req, res) => {
  try {
    // Apenas comprovativos aprovados contam como receita
    const approvedReceipts = await Receipt.find({ status: 'approved' })
      .populate('company', 'name subscriptionPlan')
      .sort({ createdAt: -1 });

    let totalRevenue = 0;
    let thisMonthRevenue = 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    approvedReceipts.forEach(receipt => {
      const amount = receipt.amount || 0;
      totalRevenue += amount;

      const receiptDate = new Date(receipt.createdAt);
      if (receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear) {
        thisMonthRevenue += amount;
      }
    });

    res.json({
      totalRevenue,
      thisMonthRevenue,
      history: approvedReceipts
    });
  } catch (error) {
    console.error('Error getting financial stats:', error);
    res.status(500).json({ message: 'Erro ao obter finanças' });
  }
};

// Dados para gráficos do Superadmin
const getAdminCharts = async (req, res) => {
  try {
    const Receipt = require('../models/Receipt');
    const Company = require('../models/Company');

    const now = new Date();

    // --- 1. Receita Mensal (últimos 6 meses) ---
    const monthlyRevenue = [];
    const monthLabels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const receipts = await Receipt.find({
        status: 'approved',
        createdAt: { $gte: d, $lt: nextD }
      });
      const total = receipts.reduce((acc, r) => acc + (r.amount || 0), 0);
      monthlyRevenue.push(total);
      monthLabels.push(d.toLocaleString('pt-PT', { month: 'short' }));
    }

    // --- 2. Distribuição de Planos ---
    const plans = await Company.aggregate([
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }
    ]);
    const planLabels = plans.map(p => p._id ? (p._id.charAt(0).toUpperCase() + p._id.slice(1)) : 'N/A');
    const planCounts = plans.map(p => p.count);

    // --- 3. Novas Empresas por Mês (últimos 6 meses) ---
    const newCompanies = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await Company.countDocuments({ createdAt: { $gte: d, $lt: nextD } });
      newCompanies.push(count);
    }

    // --- 4. Status das Empresas ---
    const activeCount = await Company.countDocuments({ isActive: true });
    const inactiveCount = await Company.countDocuments({ isActive: false });

    res.json({
      monthLabels,
      monthlyRevenue,
      planLabels,
      planCounts,
      newCompanies,
      statusCounts: [activeCount, inactiveCount]
    });
  } catch (error) {
    console.error('Error in getAdminCharts:', error);
    res.status(500).json({ message: 'Erro ao gerar dados dos gráficos' });
  }
};

module.exports = { createCompany, toggleCompanyStatus, updateCompanyPlan, deleteCompany, impersonateCompany, getFinancialStats, getAdminCharts };

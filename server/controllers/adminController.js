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

module.exports = { createCompany, toggleCompanyStatus, updateCompanyPlan, deleteCompany, impersonateCompany, getFinancialStats };

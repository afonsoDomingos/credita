const Company = require('../models/Company');
const User = require('../models/User');
const Client = require('../models/Client');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');

// ... (existing createCompany and toggleCompanyStatus will be preserved using StartLine=4)

// Criar nova empresa e utilizador dono (SaaS Onboarding)
const createCompany = async (req, res) => {
  const { name, nif, plan, email, password } = req.body;

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

module.exports = { createCompany, toggleCompanyStatus, updateCompanyPlan, deleteCompany };

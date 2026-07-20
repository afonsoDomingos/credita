const Company = require('../models/Company');
const User = require('../models/User');

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

module.exports = { createCompany, toggleCompanyStatus };

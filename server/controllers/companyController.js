const Company = require('../models/Company');

// Obter dados da própria empresa
const getSettings = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados da empresa' });
  }
};

// Atualizar dados da empresa
const updateSettings = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);
    
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    company.name = req.body.name || company.name;
    company.nif = req.body.nif || company.nif;

    const updatedCompany = await company.save();
    res.json(updatedCompany);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar dados da empresa' });
  }
};

module.exports = { getSettings, updateSettings };

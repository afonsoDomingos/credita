const Company = require('../models/Company');

// Obter dados da própria empresa
const getSettings = async (req, res) => {
  try {
    if (!req.user.company) {
      return res.status(400).json({ message: 'Utilizador sem empresa associada' });
    }
    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }
    res.json(company);
  } catch (error) {
    console.error('Error in getSettings:', error);
    res.status(500).json({ message: 'Erro ao buscar dados da empresa' });
  }
};

// Atualizar dados da empresa
const updateSettings = async (req, res) => {
  try {
    console.log('[COMPANY-UPDATE] Starting update for company:', req.user?.company);
    console.log('[COMPANY-UPDATE] Request body keys:', Object.keys(req.body || {}));
    console.log('[COMPANY-UPDATE] Request file:', req.file ? 'File present' : 'No file');
    
    if (!req.user || !req.user.company) {
      console.error('[COMPANY-UPDATE] No user or company in request');
      return res.status(400).json({ message: 'Acesso negado: sem empresa associada.' });
    }
    const company = await Company.findById(req.user.company);
    
    if (!company) {
      console.error('[COMPANY-UPDATE] Company not found:', req.user.company);
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    // Handle form data or JSON body
    if (req.body.name) company.name = req.body.name;
    if (req.body.nif) company.nif = req.body.nif;
    if (req.body.phone !== undefined) company.phone = req.body.phone;

    if (req.file) {
      company.logoUrl = req.file.path;
      console.log('[COMPANY-UPDATE] Logo URL updated:', req.file.path);
    } else {
      console.log('[COMPANY-UPDATE] No file uploaded, keeping existing logo');
    }

    const updatedCompany = await company.save();
    console.log('[COMPANY-UPDATE] Company updated successfully');
    res.json(updatedCompany);
  } catch (error) {
    console.error('[COMPANY-UPDATE-ERROR] Error in updateSettings:', error);
    console.error('[COMPANY-UPDATE-ERROR] Error stack:', error.stack);
    res.status(500).json({ message: 'Erro ao atualizar dados da empresa', error: error.message });
  }
};

module.exports = { getSettings, updateSettings };

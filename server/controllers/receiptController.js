const Receipt = require('../models/Receipt');
const Company = require('../models/Company');

const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum comprovativo enviado.' });
    }

    const newReceipt = new Receipt({
      company: req.user.company,
      receiptUrl: req.file.path,
      amount: req.body.amount || 150,
      notes: req.body.notes || ''
    });

    const savedReceipt = await newReceipt.save();
    
    // Opcional: Marcar a empresa como pending_verification
    const company = await Company.findById(req.user.company);
    if (company) {
      company.subscriptionStatus = 'pending_verification';
      await company.save();
    }

    res.status(201).json(savedReceipt);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao enviar comprovativo.' });
  }
};

const getPendingReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ status: 'pending' }).populate('company', 'name nif subscriptionPlan');
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar comprovativos.' });
  }
};

const reviewReceipt = async (req, res) => {
  const { status } = req.body; // 'approved' ou 'rejected'
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Comprovativo não encontrado.' });
    }

    receipt.status = status;
    await receipt.save();

    if (status === 'approved') {
      const company = await Company.findById(receipt.company);
      if (company) {
        company.subscriptionStatus = 'active';
        company.subscriptionPlan = 'mensal';
        
        // Adiciona 30 dias à data atual (ou à data de expiração, se for no futuro)
        const now = new Date();
        const currentNextBilling = company.nextBillingDate ? new Date(company.nextBillingDate) : now;
        
        const baseDate = currentNextBilling > now ? currentNextBilling : now;
        baseDate.setDate(baseDate.getDate() + 30);
        
        company.nextBillingDate = baseDate;
        await company.save();
      }
    } else if (status === 'rejected') {
      const company = await Company.findById(receipt.company);
      if (company && company.subscriptionStatus === 'pending_verification') {
        company.subscriptionStatus = 'expired';
        await company.save();
      }
    }

    res.json({ message: `Comprovativo ${status === 'approved' ? 'aprovado' : 'rejeitado'}.` });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar comprovativo.' });
  }
};

module.exports = { uploadReceipt, getPendingReceipts, reviewReceipt };

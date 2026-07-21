const Receipt = require('../models/Receipt');
const Company = require('../models/Company');
const SystemSetting = require('../models/SystemSetting');

const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum comprovativo enviado.' });
    }

    // Determinar o montante: usa o enviado ou busca no sistema
    let amount = parseFloat(req.body.amount);
    if (!amount || isNaN(amount)) {
      const setting = await SystemSetting.findOne({ key: 'monthly_plan_price' });
      amount = setting ? parseFloat(setting.value) : 95;
    }

    // Mês de faturação: formato 'YYYY-MM', ex: '2026-07'
    // Se não for enviado, usa o mês atual
    const billingMonth = req.body.billingMonth || 
      new Date().toISOString().slice(0, 7);

    const newReceipt = new Receipt({
      company: req.user.company,
      receiptUrl: req.file.path,
      amount,
      billingMonth,
      notes: req.body.notes || ''
    });

    const savedReceipt = await newReceipt.save();
    
    // Marcar a empresa como pending_verification
    const company = await Company.findById(req.user.company);
    if (company) {
      company.subscriptionStatus = 'pending_verification';
      await company.save();
    }

    res.status(201).json(savedReceipt);
  } catch (error) {
    console.error('Erro uploadReceipt:', error);
    res.status(500).json({ message: 'Erro ao enviar comprovativo.' });
  }
};

const getPendingReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ status: 'pending' })
      .populate('company', 'name nif subscriptionPlan')
      .sort({ createdAt: -1 });
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
        
        // --- Calcular nextBillingDate com base no billingMonth ---
        let nextBillingDate;

        if (receipt.billingMonth) {
          // Extrair ano e mês do pagamento (ex: '2026-07' → Julho 2026)
          const [year, month] = receipt.billingMonth.split('-').map(Number);
          // nextBillingDate = último dia do MÊS SEGUINTE ao mês pago
          // Exemplo: paga Julho → acesso válido até 31 de Agosto
          const endOfNextMonth = new Date(year, month, 0); // último dia do mês 'month' (que é o seguinte ao pago)
          // Ajustar para o último dia do mês após o mês pago
          nextBillingDate = new Date(year, month, 0); // último dia do mês seguinte ao billingMonth

          // Se a data calculada já passou, avançar 1 mês extra
          const now = new Date();
          if (nextBillingDate < now) {
            nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          }
        } else {
          // Fallback: sem billingMonth → adiciona 30 dias da data atual
          const now = new Date();
          const currentNextBilling = company.nextBillingDate ? new Date(company.nextBillingDate) : now;
          const baseDate = currentNextBilling > now ? currentNextBilling : now;
          baseDate.setDate(baseDate.getDate() + 30);
          nextBillingDate = baseDate;
        }

        company.nextBillingDate = nextBillingDate;
        await company.save();
      }
    } else if (status === 'rejected') {
      const company = await Company.findById(receipt.company);
      if (company && company.subscriptionStatus === 'pending_verification') {
        company.subscriptionStatus = 'expired';
        await company.save();
      }
    }

    res.json({ 
      message: `Comprovativo ${status === 'approved' ? 'aprovado' : 'rejeitado'}.`,
      billingMonth: receipt.billingMonth 
    });
  } catch (error) {
    console.error('Erro reviewReceipt:', error);
    res.status(500).json({ message: 'Erro ao processar comprovativo.' });
  }
};

const getMyReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ company: req.user.company }).sort({ createdAt: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar comprovativos.' });
  }
};

module.exports = { uploadReceipt, getPendingReceipts, reviewReceipt, getMyReceipts };

const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const { logActivity } = require('../utils/auditLogger');

// Listar todos os pagamentos da empresa
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ company: req.user.company })
      .populate({
        path: 'loan',
        select: 'amount',
        populate: {
          path: 'client',
          select: 'name idCard profileImageUrl'
        }
      })
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar pagamentos' });
  }
};

// Registar um novo pagamento
const createPayment = async (req, res) => {
  const { loanId, amountPaid, paymentMethod } = req.body;

  try {
    // Validate loan belongs to company
    const loan = await Loan.findOne({ _id: loanId, company: req.user.company }).populate('client', 'name');
    if (!loan) {
      return res.status(404).json({ message: 'Empréstimo não encontrado' });
    }

    const payment = new Payment({
      company: req.user.company,
      loan: loanId,
      amountPaid,
      paymentMethod
    });

    const savedPayment = await payment.save();
    
    await logActivity(req, 'REGISTAR_PAGAMENTO', `Registou pagamento de MT ${amountPaid.toLocaleString()} do cliente ${loan.client?.name || 'Cliente'} (${paymentMethod})`);

    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registar pagamento' });
  }
};

// Obter pagamento por ID (para recibo)
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, company: req.user.company })
      .populate({
        path: 'loan',
        select: 'amount',
        populate: {
          path: 'client',
          select: 'name idCard address phone profileImageUrl'
        }
      });
      
    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pagamento' });
  }
};

// Apagar / Anular um pagamento
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, company: req.user.company }).populate({
      path: 'loan',
      populate: { path: 'client', select: 'name' }
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
    
    const amount = payment.amountPaid;
    const clientName = payment.loan?.client?.name || 'Cliente';

    await payment.deleteOne();
    
    await logActivity(req, 'ANULAR_PAGAMENTO', `Anulou o pagamento de MT ${amount.toLocaleString()} do cliente ${clientName}`);

    res.json({ message: 'Pagamento anulado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao anular pagamento' });
  }
};

module.exports = { getPayments, createPayment, getPaymentById, deletePayment };

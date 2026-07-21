const Payment = require('../models/Payment');
const Loan = require('../models/Loan');

// Listar todos os pagamentos da empresa
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ company: req.user.company })
      .populate({
        path: 'loan',
        select: 'amount',
        populate: {
          path: 'client',
          select: 'name idCard'
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
    const loan = await Loan.findOne({ _id: loanId, company: req.user.company });
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
    
    // Future: logic to check if loan is fully paid and update status
    // For now we just record the payment

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
          select: 'name idCard address phone'
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
    const payment = await Payment.findOne({ _id: req.params.id, company: req.user.company });
    
    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
    
    // Future logic: IF we updated the loan status to 'paid' when this payment was made, 
    // we should probably revert it to 'active'. For MVP, just delete the payment.
    await payment.deleteOne();
    
    res.json({ message: 'Pagamento anulado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao anular pagamento' });
  }
};

module.exports = { getPayments, createPayment, getPaymentById, deletePayment };

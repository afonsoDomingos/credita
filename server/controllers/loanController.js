const Loan = require('../models/Loan');

const Payment = require('../models/Payment');

// Listar empréstimos
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ company: req.user.company })
      .populate('client', 'name idCard phone')
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar empréstimos' });
  }
};

// Obter detalhe de um empréstimo específico (incluindo pagamentos)
const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, company: req.user.company })
      .populate('client');
      
    if (!loan) {
      return res.status(404).json({ message: 'Empréstimo não encontrado' });
    }
    
    // Obter todos os pagamentos deste empréstimo
    const payments = await Payment.find({ loan: loan._id }).sort({ paymentDate: -1 });
    
    // Return loan document combined with payments
    res.json({
      ...loan._doc,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar detalhes do empréstimo' });
  }
};

// Criar empréstimo
const createLoan = async (req, res) => {
  const { client, amount, interestRate, dueDate } = req.body;

  try {
    const loan = new Loan({
      company: req.user.company,
      client,
      amount,
      interestRate,
      dueDate,
      status: 'active'
    });

    const savedLoan = await loan.save();
    const populatedLoan = await savedLoan.populate('client', 'name');
    res.status(201).json(populatedLoan);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar empréstimo' });
  }
};

// Editar empréstimo
const updateLoan = async (req, res) => {
  const { amount, interestRate, dueDate, status } = req.body;
  
  try {
    const loan = await Loan.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      { amount, interestRate, dueDate, status },
      { new: true }
    ).populate('client', 'name');
    
    if (!loan) {
      return res.status(404).json({ message: 'Empréstimo não encontrado' });
    }
    
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar empréstimo' });
  }
};

// Apagar empréstimo
const deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, company: req.user.company });
    
    if (!loan) {
      return res.status(404).json({ message: 'Empréstimo não encontrado' });
    }
    
    // Apagar também os pagamentos associados
    await Payment.deleteMany({ loan: loan._id });
    await loan.deleteOne();
    
    res.json({ message: 'Empréstimo removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover empréstimo' });
  }
};

module.exports = { getLoans, getLoanById, createLoan, updateLoan, deleteLoan };

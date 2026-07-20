const Loan = require('../models/Loan');

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

module.exports = { getLoans, createLoan };

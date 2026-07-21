const Client = require('../models/Client');
const { logActivity } = require('../utils/auditLogger');

// Listar clientes
const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ company: req.user.company }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar clientes' });
  }
};

// Criar cliente
const createClient = async (req, res) => {
  const { name, phone, idCard, address } = req.body;

  try {
    const clientExists = await Client.findOne({ idCard, company: req.user.company });
    if (clientExists) {
      return res.status(400).json({ message: 'Um cliente com este NIF/BI já existe' });
    }

    const client = new Client({
      company: req.user.company,
      name,
      phone,
      idCard,
      address,
    });

    const savedClient = await client.save();
    
    await logActivity(req, 'CRIAR_CLIENTE', `Cadastrou novo cliente: ${name} (${idCard || 'Sem BI'})`);

    res.status(201).json(savedClient);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar cliente' });
  }
};

// Atualizar cliente
const updateClient = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, company: req.user.company });

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    client.name = req.body.name || client.name;
    client.phone = req.body.phone || client.phone;
    client.idCard = req.body.idCard || client.idCard;
    client.address = req.body.address || client.address;

    const updatedClient = await client.save();
    
    await logActivity(req, 'EDITAR_CLIENTE', `Atualizou dados do cliente: ${updatedClient.name}`);

    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar cliente' });
  }
};

// Apagar cliente
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, company: req.user.company });

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    await logActivity(req, 'APAGAR_CLIENTE', `Apagou o cliente: ${client.name}`);

    res.json({ message: 'Cliente apagado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar cliente' });
  }
};
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');

// Obter perfil completo de um cliente (com histórico financeiro)
const getClientProfile = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, company: req.user.company });
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Todos os empréstimos deste cliente
    const loans = await Loan.find({ client: client._id, company: req.user.company }).sort({ createdAt: -1 });

    // Todos os pagamentos associados aos empréstimos deste cliente
    const loanIds = loans.map(l => l._id);
    const payments = await Payment.find({ loan: { $in: loanIds }, company: req.user.company }).sort({ paymentDate: -1 });

    // Cálculos financeiros
    const totalEmprestado = loans.reduce((acc, l) => acc + l.amount, 0);
    const totalEsperado = loans.reduce((acc, l) => acc + l.amount + (l.amount * (l.interestRate / 100)), 0);
    const totalPago = payments.reduce((acc, p) => acc + p.amountPaid, 0);
    const totalEmDivida = Math.max(totalEsperado - totalPago, 0);

    const emprestimosPagos = loans.filter(l => l.status === 'paid').length;
    const emprestimosAtivos = loans.filter(l => l.status === 'active').length;
    const emprestimosAtraso = loans.filter(l => {
      if (l.status === 'paid') return false;
      return new Date(l.dueDate) < new Date();
    }).length;

    // Score de Confiança (0-100)
    let score = 50; // Base
    if (loans.length > 0) {
      // +30 se pagou mais de 80% do esperado
      if (totalEsperado > 0 && (totalPago / totalEsperado) >= 0.8) score += 30;
      else if (totalEsperado > 0 && (totalPago / totalEsperado) >= 0.5) score += 15;
      // +20 se não tem atrasos
      if (emprestimosAtraso === 0) score += 20;
      else score -= emprestimosAtraso * 10;
      // -10 se nunca pagou nada
      if (totalPago === 0 && totalEsperado > 0) score -= 20;
    }
    score = Math.max(0, Math.min(100, score));

    res.json({
      client,
      stats: {
        totalEmprestimos: loans.length,
        emprestimosAtivos,
        emprestimosPagos,
        emprestimosAtraso,
        totalEmprestado,
        totalEsperado,
        totalPago,
        totalEmDivida,
        score
      },
      loans: loans.map(l => ({
        ...l._doc,
        totalComJuros: l.amount + (l.amount * (l.interestRate / 100))
      })),
      payments
    });
  } catch (error) {
    console.error('Error getting client profile:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil do cliente' });
  }
};

module.exports = { getClients, createClient, updateClient, deleteClient, getClientProfile };

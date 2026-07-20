const Client = require('../models/Client');

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

    res.json({ message: 'Cliente apagado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar cliente' });
  }
};

module.exports = { getClients, createClient, updateClient, deleteClient };

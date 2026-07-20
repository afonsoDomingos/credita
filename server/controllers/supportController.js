const Message = require('../models/Message');

// Company fetching their own messages
const getCompanyMessages = async (req, res) => {
  try {
    const messages = await Message.find({ company: req.user.company }).sort({ createdAt: 1 });
    
    // Mark superadmin messages as read
    await Message.updateMany(
      { company: req.user.company, sender: 'superadmin', read: false },
      { $set: { read: true } }
    );
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao carregar mensagens' });
  }
};

// Company sending a message
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const newMessage = new Message({
      company: req.user.company,
      sender: 'company',
      content
    });
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao enviar mensagem' });
  }
};

// Superadmin getting all companies with unread count
const getAdminInbox = async (req, res) => {
  try {
    // Group by company to get last message and unread count
    const inbox = await Message.aggregate([
      {
        $group: {
          _id: '$company',
          lastMessageDate: { $max: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$sender', 'company'] }, { $eq: ['$read', false] }] }, 1, 0]
            }
          }
        }
      },
      { $sort: { lastMessageDate: -1 } },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'companyInfo'
        }
      },
      { $unwind: '$companyInfo' }
    ]);
    res.json(inbox);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao carregar inbox' });
  }
};

// Superadmin getting messages for a specific company
const getAdminMessagesForCompany = async (req, res) => {
  try {
    const messages = await Message.find({ company: req.params.companyId }).sort({ createdAt: 1 });
    
    // Mark company messages as read
    await Message.updateMany(
      { company: req.params.companyId, sender: 'company', read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao carregar mensagens da empresa' });
  }
};

// Superadmin replying to a company
const adminReplyMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const newMessage = new Message({
      company: req.params.companyId,
      sender: 'superadmin',
      content
    });
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao enviar resposta' });
  }
};

module.exports = {
  getCompanyMessages,
  sendMessage,
  getAdminInbox,
  getAdminMessagesForCompany,
  adminReplyMessage
};

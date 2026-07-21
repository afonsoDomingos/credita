const Notification = require('../models/Notification');

// Obter notificações do utilizador logado
const getNotifications = async (req, res) => {
  try {
    const { role, company } = req.user;
    let query = {};

    if (role === 'superadmin') {
      query = { $or: [{ role: 'superadmin' }, { role: 'all' }] };
    } else {
      query = {
        $or: [
          { company: company },
          { role: 'all' }
        ]
      };
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Erro ao buscar notificações' });
  }
};

// Marcar uma notificação como lida
const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar notificação' });
  }
};

// Marcar todas como lidas
const markAllAsRead = async (req, res) => {
  try {
    const { role, company } = req.user;
    let query = {};

    if (role === 'superadmin') {
      query = { $or: [{ role: 'superadmin' }, { role: 'all' }], isRead: false };
    } else {
      query = {
        $or: [
          { company: company },
          { role: 'all' }
        ],
        isRead: false
      };
    }

    await Notification.updateMany(query, { isRead: true });
    res.json({ message: 'Todas as notificações foram marcadas como lidas.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar notificações' });
  }
};

// (Internal Use) Create notification helper
const createNotification = async (data) => {
  try {
    const newNotif = new Notification(data);
    await newNotif.save();
    return newNotif;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
};

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company', // Pode ser nulo se for para todos ou superadmin
  },
  role: {
    type: String, // 'empresa', 'superadmin', 'all'
    default: 'empresa'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['system', 'billing', 'alert', 'info', 'success'],
    default: 'info'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);

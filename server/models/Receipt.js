const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  receiptUrl: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 95
  },
  billingMonth: {
    type: String, // Formato: 'YYYY-MM' ex: '2026-07'
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Receipt', ReceiptSchema);

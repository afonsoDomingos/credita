const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  nif: {
    type: String
  },
  phone: {
    type: String
  },
  logoUrl: {
    type: String,
    default: ''
  },
  subscriptionPlan: {
    type: String,
    enum: ['trial', 'pro', 'premium'],
    default: 'trial'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Company', CompanySchema);

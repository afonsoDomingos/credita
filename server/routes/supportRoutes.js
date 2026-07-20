const express = require('express');
const router = express.Router();
const { 
  getCompanyMessages, 
  sendMessage, 
  getAdminInbox, 
  getAdminMessagesForCompany, 
  adminReplyMessage 
} = require('../controllers/supportController');
const { protect, superadmin } = require('../middleware/authMiddleware');

// Tenant routes
router.route('/company')
  .get(protect, getCompanyMessages)
  .post(protect, sendMessage);

// Admin routes
router.route('/admin/inbox')
  .get(protect, superadmin, getAdminInbox);

router.route('/admin/company/:companyId')
  .get(protect, superadmin, getAdminMessagesForCompany)
  .post(protect, superadmin, adminReplyMessage);

module.exports = router;

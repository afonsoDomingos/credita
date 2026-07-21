const express = require('express');
const router = express.Router();
const { createCompany, toggleCompanyStatus, updateCompanyPlan, deleteCompany, impersonateCompany, getFinancialStats, getAdminCharts } = require('../controllers/adminController');
const { updateSetting } = require('../controllers/systemController');
const { getPendingReceipts, reviewReceipt } = require('../controllers/receiptController');
const { protect, superadmin } = require('../middleware/authMiddleware');

router.route('/finance')
  .get(protect, superadmin, getFinancialStats);

router.route('/charts')
  .get(protect, superadmin, getAdminCharts);

router.route('/companies')
  .post(protect, superadmin, createCompany);

router.route('/companies/:id/toggle-status')
  .put(protect, superadmin, toggleCompanyStatus);

router.route('/companies/:id/plan')
  .put(protect, superadmin, updateCompanyPlan);

router.route('/companies/:id')
  .delete(protect, superadmin, deleteCompany);

router.route('/companies/:id/impersonate')
  .get(protect, superadmin, impersonateCompany);

router.route('/system/settings')
  .put(protect, superadmin, updateSetting);

router.route('/receipts/pending')
  .get(protect, superadmin, getPendingReceipts);

router.route('/receipts/:id/review')
  .put(protect, superadmin, reviewReceipt);

module.exports = router;

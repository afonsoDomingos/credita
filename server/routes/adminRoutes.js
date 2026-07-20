const express = require('express');
const router = express.Router();
const { createCompany, toggleCompanyStatus, updateCompanyPlan, deleteCompany } = require('../controllers/adminController');
const { protect, superadmin } = require('../middleware/authMiddleware');

router.route('/companies')
  .post(protect, superadmin, createCompany);

router.route('/companies/:id/toggle-status')
  .put(protect, superadmin, toggleCompanyStatus);

router.route('/companies/:id/plan')
  .put(protect, superadmin, updateCompanyPlan);

router.route('/companies/:id')
  .delete(protect, superadmin, deleteCompany);

module.exports = router;

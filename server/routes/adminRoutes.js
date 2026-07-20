const express = require('express');
const router = express.Router();
const { createCompany, toggleCompanyStatus } = require('../controllers/adminController');
const { protect, superadmin } = require('../middleware/authMiddleware');

router.route('/companies')
  .post(protect, superadmin, createCompany);

router.route('/companies/:id/toggle-status')
  .put(protect, superadmin, toggleCompanyStatus);

module.exports = router;

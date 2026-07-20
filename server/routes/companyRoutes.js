const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

router.route('/settings')
  .get(protect, getSettings)
  .put(protect, updateSettings);

module.exports = router;

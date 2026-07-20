const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/settings')
  .get(protect, getSettings)
  .put(protect, upload.single('logo'), updateSettings);

module.exports = router;

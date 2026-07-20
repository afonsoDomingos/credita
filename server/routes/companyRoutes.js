const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/companyController');
const { uploadReceipt } = require('../controllers/receiptController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/settings')
  .get(protect, getSettings)
  .put(protect, upload.single('logo'), updateSettings);

router.route('/receipts')
  .post(protect, upload.single('receipt'), uploadReceipt);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/companyController');
const { getMyReceipts } = require('../controllers/receiptController');
const { protect } = require('../middleware/authMiddleware');
// Temporarily disabled cloudinary upload
// const { upload } = require('../config/cloudinary');

router.route('/settings')
  .get(protect, getSettings)
  .put(protect, updateSettings); // Removed upload.single('logo')

// Temporarily disabled receipt upload routes
// router.route('/receipts')
//   .get(protect, getMyReceipts)
//   .post(protect, upload.single('receipt'), uploadReceipt);

// Keep GET route for receipts without upload
router.get('/receipts', protect, getMyReceipts);

module.exports = router;

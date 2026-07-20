const express = require('express');
const router = express.Router();
const { getPayments, createPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

router.route('/')
  .get(protect, checkSubscription, getPayments)
  .post(protect, checkSubscription, createPayment);

module.exports = router;

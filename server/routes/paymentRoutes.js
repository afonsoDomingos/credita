const express = require('express');
const router = express.Router();
const { getPayments, createPayment, getPaymentById, deletePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

router.route('/')
  .get(protect, checkSubscription, getPayments)
  .post(protect, checkSubscription, createPayment);

router.route('/:id')
  .get(protect, checkSubscription, getPaymentById)
  .delete(protect, checkSubscription, deletePayment);

module.exports = router;

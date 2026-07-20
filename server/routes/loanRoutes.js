const express = require('express');
const router = express.Router();
const { getLoans, createLoan, updateLoanStatus } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

router.route('/')
  .get(protect, checkSubscription, getLoans)
  .post(protect, checkSubscription, createLoan);

module.exports = router;

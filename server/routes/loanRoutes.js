const express = require('express');
const router = express.Router();
const { getLoans, getLoanById, createLoan, updateLoan, deleteLoan } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

router.route('/')
  .get(protect, checkSubscription, getLoans)
  .post(protect, checkSubscription, createLoan);

router.route('/:id')
  .get(protect, checkSubscription, getLoanById)
  .put(protect, checkSubscription, updateLoan)
  .delete(protect, checkSubscription, deleteLoan);

module.exports = router;

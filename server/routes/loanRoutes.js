const express = require('express');
const router = express.Router();
const { getLoans, createLoan } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getLoans)
  .post(protect, createLoan);

module.exports = router;

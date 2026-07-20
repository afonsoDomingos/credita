const express = require('express');
const router = express.Router();
const { getSettings } = require('../controllers/systemController');
const { protect } = require('../middleware/authMiddleware');

router.route('/settings')
  .get(protect, getSettings);

module.exports = router;

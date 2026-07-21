const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAuditLogs);

module.exports = router;

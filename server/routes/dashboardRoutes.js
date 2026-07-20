const express = require('express');
const router = express.Router();
const { getEmpresaStats, getSuperadminStats } = require('../controllers/dashboardController');
const { protect, superadmin } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

router.get('/empresa', protect, checkSubscription, getEmpresaStats);
router.get('/superadmin', protect, superadmin, getSuperadminStats);

module.exports = router;

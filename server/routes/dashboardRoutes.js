const express = require('express');
const router = express.Router();
const { getEmpresaStats, getSuperadminStats } = require('../controllers/dashboardController');
const { protect, superadmin } = require('../middleware/authMiddleware');

router.get('/empresa', protect, getEmpresaStats);
router.get('/superadmin', protect, superadmin, getSuperadminStats);

module.exports = router;

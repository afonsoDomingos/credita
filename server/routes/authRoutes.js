const express = require('express');
const router = express.Router();
const { loginUser, registerUser, seedSuperadmin } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/seed-superadmin', seedSuperadmin);

module.exports = router;

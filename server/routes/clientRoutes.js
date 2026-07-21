const express = require('express');
const router = express.Router();
const { getClients, createClient, updateClient, deleteClient, getClientProfile } = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

router.route('/')
  .get(protect, checkSubscription, getClients)
  .post(protect, checkSubscription, createClient);

router.route('/:id/profile')
  .get(protect, checkSubscription, getClientProfile);

router.route('/:id')
  .put(protect, checkSubscription, updateClient)
  .delete(protect, checkSubscription, deleteClient);

module.exports = router;

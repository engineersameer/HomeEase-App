const express = require('express');
const router = express.Router();
const { getCustomerDashboard, getCustomerProfile, updateCustomerProfile } = require('../controllers/customerController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, getCustomerDashboard);
router.get('/profile', auth, getCustomerProfile);
router.put('/profile', auth, updateCustomerProfile);

module.exports = router;

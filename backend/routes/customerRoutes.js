const express = require('express');
const router = express.Router();
const { getCustomerDashboard } = require('../controllers/customerController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, getCustomerDashboard);

module.exports = router;

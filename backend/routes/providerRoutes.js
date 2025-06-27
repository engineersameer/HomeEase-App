const express = require('express');
const router = express.Router();
const { getProviderDashboard } = require('../controllers/providerController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, getProviderDashboard);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getProviderDashboard, getAvailableServices } = require('../controllers/providerController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, getProviderDashboard);
router.get('/services', getAvailableServices);

module.exports = router;

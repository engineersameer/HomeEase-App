const express = require('express');
const router = express.Router();
const termsController = require('../controllers/termsController');
const auth = require('../middleware/auth');

// Admin routes (require admin authentication)
router.get('/admin/all', auth, termsController.getAllTerms);
router.get('/admin/user-type/:userType', auth, termsController.getTermsByUserType);
router.get('/admin/:id', auth, termsController.getTermsById);
router.post('/admin', auth, termsController.createTerms);
router.put('/admin/:id', auth, termsController.updateTerms);
router.delete('/admin/:id', auth, termsController.deleteTerms);

// Customer/Provider routes (view only)
router.get('/active', auth, termsController.getActiveTerms);

module.exports = router; 
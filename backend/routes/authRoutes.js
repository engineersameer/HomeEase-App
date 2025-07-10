const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  getProfile, 
  updateProfile,
  customerSignup,
  customerSignin,
  providerSignup,
  providerSignin,
  adminSignin,
  verifyAdminToken
} = require('../controllers/authController');
const auth = require('../middleware/auth');

// Generic routes (for backward compatibility)
router.post('/signup', signup);
router.post('/login', login);

// Customer routes
router.post('/customer/signup', customerSignup);
router.post('/customer/signin', customerSignin);

// Provider routes
router.post('/provider/signup', providerSignup);
router.post('/provider/signin', providerSignin);

// Admin routes
router.post('/admin/signin', adminSignin);
router.get('/admin/verify', auth, verifyAdminToken);

// Protected routes (require authentication)
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;

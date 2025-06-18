const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);

module.exports = router; 
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatbotController = require('../controllers/chatbotController');

// Test endpoint without auth
router.get('/test', (req, res) => {
  console.log('Chatbot test endpoint hit!');
  res.json({ success: true, message: 'Chatbot route working!' });
});

// Free AI API test endpoint without auth
router.get('/test-ai', chatbotController.testAI);

router.use(auth);

router.post('/chat', chatbotController.chat);

module.exports = router;

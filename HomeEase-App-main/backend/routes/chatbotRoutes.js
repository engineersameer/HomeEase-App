const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatbotController = require('../controllers/chatbotController');
const multer = require('multer');

// In-memory uploads for chatbot images (no need to persist)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
});

// Test endpoint without auth
router.get('/test', (req, res) => {
  console.log('Chatbot test endpoint hit!');
  res.json({ success: true, message: 'Chatbot route working!' });
});

// Free AI API test endpoint without auth
router.get('/test-ai', chatbotController.testAI);
router.post('/chat-local', chatbotController.chat);
router.post('/analyze-image-local', upload.single('image'), chatbotController.analyzeImage);

router.use(auth);

router.post('/chat', chatbotController.chat);

// (Optional) Authenticated variant if needed later
// router.post('/analyze-image', upload.single('image'), chatbotController.analyzeImage);

module.exports = router;

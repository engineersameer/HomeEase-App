const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// CORS configuration for web browser
app.use(cors({
  origin: ['http://localhost:8081', 'http://127.0.0.1:8081', 'http://192.168.100.5:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
  
});

app.get('/chat-ui', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat-ui.html'));
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));
app.use('/api/provider', require('./routes/providerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/terms', require('./routes/termsRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at: http://192.168.100.5:${PORT}`);
  console.log(`Health check available at: http://192.168.100.5:${PORT}/health`);
});

// Test script to verify chatbot responses
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

const testQuestions = [
  'What payment methods do you accept?',
  'How do I book a service?',
  'Can I cancel my booking?',
  'Do you accept cash payment?',
  'What is HomeEase?',
  'App is not working properly',
  'How to update my profile?',
  'I need AC repair service',
  'Need a plumber urgently',
  'What are the rates for electrical work?'
];

async function testChatbot() {
  console.log('🧪 Testing Chatbot Responses...\n');
  
  for (const question of testQuestions) {
    try {
      console.log(`❓ Question: "${question}"`);
      
      const response = await axios.post(`${API_BASE}/api/chatbot/chat`, {
        message: question
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // Mock token for testing
        }
      });
      
      if (response.data.success) {
        console.log(`✅ Response: ${response.data.reply.substring(0, 100)}...`);
        console.log(`📊 Sources: ${JSON.stringify(response.data.sources)}`);
      } else {
        console.log(`❌ Error: ${response.data.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
    
    console.log('─'.repeat(80));
  }
}

// Run the test
testChatbot().catch(console.error);
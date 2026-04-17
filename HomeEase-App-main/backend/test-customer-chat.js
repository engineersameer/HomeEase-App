const fetch = require('node-fetch');

// Replace these with real values from your database
const TOKEN = 'PASTE_CUSTOMER_JWT_TOKEN_HERE';
const PROVIDER_ID = 'PASTE_PROVIDER_OBJECT_ID_HERE';
const SERVICE_ID = 'PASTE_SERVICE_OBJECT_ID_HERE';

async function testFindOrCreateChat() {
  const response = await fetch('http://localhost:5000/api/customer/chats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ providerId: PROVIDER_ID, serviceId: SERVICE_ID })
  });
  const data = await response.json().catch(() => ({}));
  console.log('Status:', response.status);
  console.log('Response:', data);
}

testFindOrCreateChat().catch(err => {
  console.error('Error:', err);
}); 
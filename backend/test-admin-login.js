const fetch = require('node-fetch');

async function testAdminLogin() {
  const response = await fetch('http://localhost:5000/api/auth/admin/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@homeease.com',
      password: 'admin123',
    }),
  });

  const data = await response.json().catch(() => ({}));
  console.log('Status:', response.status);
  console.log('Response:', data);
}

testAdminLogin().catch(err => {
  console.error('Error:', err);
}); 
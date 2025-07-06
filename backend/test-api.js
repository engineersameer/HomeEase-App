const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const API_URL = 'http://192.168.100.5:5000/api/auth/profile';

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');

    // Test 1: Customer Signup
    console.log('1. Testing Customer Signup...');
    const customerSignup = await axios.post(`${API_BASE}/auth/signup`, {
      name: 'Test Customer',
      email: 'customer@test.com',
      password: '123456',
      role: 'customer',
      address: '123 Test Street',
      phone: '03001234567',
      city: 'Karachi'
    });
    console.log('✅ Customer signup successful:', customerSignup.data.message);

    // Test 2: Provider Signup
    console.log('\n2. Testing Provider Signup...');
    const providerSignup = await axios.post(`${API_BASE}/auth/signup`, {
      name: 'Test Provider',
      email: 'provider@test.com',
      password: '123456',
      role: 'provider',
      profession: 'Electrician',
      experience: 5,
      pricing: 1000,
      city: 'Lahore',
      availability: '9am to 6pm, Mon-Sat',
      bio: 'Experienced electrician with 5 years of experience'
    });
    console.log('✅ Provider signup successful:', providerSignup.data.message);

    // Test 3: Customer Login
    console.log('\n3. Testing Customer Login...');
    const customerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'customer@test.com',
      password: '123456'
    });
    console.log('✅ Customer login successful:', customerLogin.data.message);
    const customerToken = customerLogin.data.token;

    // Test 4: Provider Login
    console.log('\n4. Testing Provider Login...');
    const providerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'provider@test.com',
      password: '123456'
    });
    console.log('✅ Provider login successful:', providerLogin.data.message);
    const providerToken = providerLogin.data.token;

    // Test 5: Get Customer Profile
    console.log('\n5. Testing Get Customer Profile...');
    const customerProfile = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Customer profile retrieved:', customerProfile.data.name);

    // Test 6: Get Provider Profile
    console.log('\n6. Testing Get Provider Profile...');
    const providerProfile = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${providerToken}` }
    });
    console.log('✅ Provider profile retrieved:', providerProfile.data.name);

    console.log('\n🎉 All API tests passed successfully!');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testAPI(); 
const axios =     // Test search users
    const searchResponse = await axios.get('http://localhost:3000/api/messages/search?q=an', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });e('axios');

async function testMessaging() {
  try {
    // Login first
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'minh.le@company.com',
      password: '123456'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    
    // Test search users
    const searchResponse = await axios.get('http://localhost:3000/api/messages/search?query=an', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Search users successful');
    console.log('👥 Found users:', searchResponse.data.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMessaging();

const fetch = require('node-fetch');

async function testSalesAPI() {
  try {
    console.log('Testing sales API...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc1NDQxODUwMSwiZXhwIjoxNzU0NTA0OTAxfQ.VO1evElMrF7dnbMoWepEE2aZ9Vutd6TpJZm4Yk-pIfI';
    
    const response = await fetch('http://localhost:5000/api/sales', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Sales data:', data);
    } else {
      const error = await response.text();
      console.log('Error response:', error);
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testSalesAPI(); 
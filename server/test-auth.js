const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Get the test user
    const user = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['test@example.com']
    );

    if (user.rows.length === 0) {
      console.log('Test user not found!');
      return;
    }

    console.log('Test user found:', user.rows[0]);

    // Create a test token
    const token = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Test token created:', token.substring(0, 50) + '...');
    console.log('Use this token in your browser console:');
    console.log('localStorage.setItem("token", "' + token + '");');
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing auth:', error);
    process.exit(1);
  }
}

testAuth(); 
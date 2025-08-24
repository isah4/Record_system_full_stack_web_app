const db = require('./config/database');

async function testConnection() {
  try {
    console.log('🔌 Testing Neon PostgreSQL connection...');
    console.log('📋 Environment:', process.env.NODE_ENV || 'development');
    
    // Test basic connection
    const result = await db.testConnection();
    
    if (result) {
      console.log('✅ Connection test successful!');
      
      // Test a simple query
      console.log('🔍 Testing simple query...');
      const queryResult = await db.query('SELECT NOW() as current_time, version() as pg_version');
      console.log('✅ Query test successful!');
      console.log('⏰ Current time:', queryResult.rows[0].current_time);
      console.log('🐘 PostgreSQL version:', queryResult.rows[0].pg_version.substring(0, 50) + '...');
      
      console.log('\n🎉 All tests passed! Your Neon PostgreSQL connection is working correctly.');
      console.log('💡 You can now run: npm run init-db');
    } else {
      console.log('❌ Connection test failed after all retries');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔍 Error details:', error);
    
    if (error.code === 'ECONNRESET') {
      console.log('\n💡 Common solutions for ECONNRESET:');
      console.log('   1. Check if your Neon database is active');
      console.log('   2. Verify your DATABASE_URL is correct');
      console.log('   3. Ensure your IP is allowed in Neon dashboard');
      console.log('   4. Check if Neon service is experiencing issues');
    }
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  try {
    await db.pool.end();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
  process.exit(0);
});

testConnection();

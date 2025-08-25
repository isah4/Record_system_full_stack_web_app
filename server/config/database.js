const { Pool } = require('pg');
const env = require('./env');

// Debug: print the DATABASE_URL and its type (mask password)
if (env.DATABASE_URL) {
  const url = env.DATABASE_URL.replace(/(postgres:\/\/[^:]+:)[^@]+(@)/, '$1*****$2');

} else {
  console.log('❌ DATABASE_URL is not set');
}

// Parse connection string to extract components
const parseConnectionString = (url) => {
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: urlObj.port || 5432,
      database: urlObj.pathname.slice(1),
      user: urlObj.username,
      password: urlObj.password,
      ssl: {
        rejectUnauthorized: false,
        sslmode: 'require'
      }
    };
  } catch (error) {
    console.error('❌ Error parsing DATABASE_URL:', error.message);
    return null;
  }
};

// Create the connection pool with Neon-specific optimizations
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  },
  // Neon-specific connection settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
});

// Test the database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  // Don't exit process in production, just log the error
  if (env.NODE_ENV === 'development') {
    process.exit(-1);
  }
});

// Query wrapper function with better error handling
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Test connection function with retry logic
const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log(`✅ Database connection test successful (attempt ${i + 1})`);
      client.release();
      return true;
    } catch (error) {
      console.error(`❌ Database connection test failed (attempt ${i + 1}):`, error.message);
      if (i === retries - 1) {
        return false;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
};

// Export database functions
module.exports = {
  query,
  pool,
  testConnection
};

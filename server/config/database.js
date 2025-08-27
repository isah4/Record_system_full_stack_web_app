const { Pool } = require('pg');
const env = require('./env');

// Debug: print the DATABASE_URL and its type (mask password)
if (env.DATABASE_URL) {
  const url = env.DATABASE_URL.replace(/(postgres:\/\/[^:]+:)[^@]+(@)/, '$1*****$2');
  // console.log(`DB URL: ${url}`);
} else {
  console.log('❌ DATABASE_URL is not set');
}

// Helper: decide SSL based on URL/host
function getSslOption(databaseUrl) {
  try {
    const u = new URL(databaseUrl);
    const host = (u.hostname || '').toLowerCase();
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    const isNeon = host.includes('neon.tech');

    // Allow override via env PGSSLMODE
    const pgSslMode = (process.env.PGSSLMODE || '').toLowerCase();
    if (pgSslMode === 'disable' || pgSslMode === 'allow' || isLocal) {
      return false; // disable SSL for local or explicit disable
    }

    if (pgSslMode === 'require' || isNeon) {
      return { rejectUnauthorized: false }; // enable SSL in relaxed mode for Neon/remote
    }

    // Default: no SSL for unknown/local-like hosts
    return false;
  } catch (e) {
    // If parsing fails, be conservative and disable SSL for local dev
    return false;
  }
}

// Create the connection pool with conditional SSL
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: getSslOption(env.DATABASE_URL),
  // Connection settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  maxUses: 7500,
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

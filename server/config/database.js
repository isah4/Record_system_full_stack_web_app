const { Pool } = require('pg');
require('dotenv').config();

// Debug: print the DATABASE_URL and its type (mask password)
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL.replace(/(postgres:\/\/[^:]+:)[^@]+(@)/, '$1*****$2');
  console.log('DATABASE_URL:', url, '| type:', typeof process.env.DATABASE_URL);
} else {
  console.log('DATABASE_URL is not set');
}

// Create the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Query wrapper function
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Test connection function
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection test successful');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

// Export database functions
module.exports = {
  query,
  pool,
  testConnection
};

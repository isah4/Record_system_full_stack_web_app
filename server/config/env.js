// Environment configuration for the server
require('dotenv').config();

const env = {
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET,
  
  // Server Configuration
  PORT: parseInt(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV,
  
  // CORS Configuration
  CLIENT_URL: process.env.CLIENT_URL,
  
  // Environment flags
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Database connection validation
  validateDatabaseUrl() {
    if (!this.DATABASE_URL) {
      throw new Error('DATABASE_URL is required');
    }
    
    // Check if it's a Neon URL (contains neon.tech)
    if (this.DATABASE_URL.includes('neon.tech')) {
      console.log('🌐 Detected Neon PostgreSQL database');
      
      // Ensure SSL mode is set for Neon
      if (!this.DATABASE_URL.includes('sslmode=require')) {
        console.warn('⚠️  Warning: Neon PostgreSQL requires SSL. Consider adding ?sslmode=require to your DATABASE_URL');
      }
    }
  },
  
  // Validation
  validate() {
    const required = ['DATABASE_URL', 'JWT_SECRET', 'PORT', 'NODE_ENV', 'CLIENT_URL'];
    const missing = required.filter(key => !this[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // Validate database URL specifically
    this.validateDatabaseUrl();
    
    // Validate PORT is a valid number
    if (isNaN(this.PORT) || this.PORT < 1 || this.PORT > 65535) {
      throw new Error('PORT must be a valid number between 1 and 65535');
    }
  }
};

// Always validate environment on load
env.validate();

module.exports = env;

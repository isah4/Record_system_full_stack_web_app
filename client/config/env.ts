// Environment configuration for the client
export const env = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000',
  
  // Client Configuration
  CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Type-safe environment access
export type Env = typeof env;

// Validation function
export function validateEnv() {
  // Only validate required vars in production
  if (process.env.NODE_ENV === 'production') {
    const required = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_BASE_URL', 'NEXT_PUBLIC_CLIENT_URL'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn(`Missing environment variables in production: ${missing.join(', ')}`);
      console.warn('Using fallback values. Please configure these in Vercel dashboard.');
    }
  }
  
  // Validate URLs are valid (only if they exist)
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      new URL(process.env.NEXT_PUBLIC_API_URL);
    }
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      new URL(process.env.NEXT_PUBLIC_BASE_URL);
    }
    if (process.env.NEXT_PUBLIC_CLIENT_URL) {
      new URL(process.env.NEXT_PUBLIC_CLIENT_URL);
    }
  } catch (error) {
    console.warn('Invalid URL format in environment variables:', error);
  }
}

// Validate environment on load
if (typeof window === 'undefined') {
  // Only validate on server side
  validateEnv();
}

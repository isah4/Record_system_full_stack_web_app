// Environment configuration for the client
export const env = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  
  // Client Configuration
  CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV,
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Type-safe environment access
export type Env = typeof env;

// Validation function
export function validateEnv() {
  const required = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_BASE_URL', 'NEXT_PUBLIC_CLIENT_URL', 'NODE_ENV'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate URLs are valid
  try {
    new URL(process.env.NEXT_PUBLIC_API_URL!);
    new URL(process.env.NEXT_PUBLIC_BASE_URL!);
    new URL(process.env.NEXT_PUBLIC_CLIENT_URL!);
  } catch (error) {
    throw new Error('Invalid URL format in environment variables');
  }
}

// Validate environment on load
if (typeof window === 'undefined') {
  // Only validate on server side
  validateEnv();
}

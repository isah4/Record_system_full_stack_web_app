import axios from 'axios';

// Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

// Log configuration on load
console.log('🔧 API Configuration Loaded:');
console.log('📍 API_BASE_URL:', API_BASE_URL);
console.log('🌐 CLIENT_URL:', CLIENT_URL);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);

// Validate environment variables
if (!API_BASE_URL) {
  console.error('❌ NEXT_PUBLIC_API_URL is not defined!');
  console.error('🔧 Please check your environment variables');
}

if (!CLIENT_URL) {
  console.error('❌ NEXT_PUBLIC_CLIENT_URL is not defined!');
  console.error('🔧 Please check your environment variables');
}

// Create axios instance with logging
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    const timestamp = new Date().toISOString();
    console.log(`\n📤 [${timestamp}] API Request:`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
    });
    
    // Log environment info
    console.log('🌍 Environment Check:', {
      API_BASE_URL,
      CLIENT_URL,
      NODE_ENV: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === 'production',
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString();
    console.log(`\n📥 [${timestamp}] API Response:`, {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    const timestamp = new Date().toISOString();
    console.error(`\n❌ [${timestamp}] API Error:`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : 'N/A',
      responseData: error.response?.data,
      requestData: error.config?.data,
    });
    
    // Log environment variables in error
    console.error('🔧 Environment Variables in Error:', {
      API_BASE_URL,
      CLIENT_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
    
    return Promise.reject(error);
  }
);

export { api };

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// API Configuration
export const API_CONFIG = {
  // Base URL from environment variables
  BASE_URL: API_BASE_URL,
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      ME: '/api/auth/me'
    },
    SALES: {
      LIST: '/api/sales',
      CREATE: '/api/sales',
      GET: (id: number) => `/api/sales/${id}`,
      UPDATE_PAYMENT: (id: number) => `/api/sales/${id}/payment`
    },
    ITEMS: {
      LIST: '/api/items',
      CREATE: '/api/items',
      UPDATE: (id: number) => `/api/items/${id}`,
      DELETE: (id: number) => `/api/items/${id}`,
      LOW_STOCK: '/api/items/low-stock'
    },
    ANALYTICS: {
      DASHBOARD: '/api/analytics/dashboard'
    },
    EXPENSES: {
      LIST: '/api/expenses',
      CREATE: '/api/expenses',
      GET: (id: number) => `/api/expenses/${id}`,
      UPDATE: (id: number) => `/api/expenses/${id}`,
      DELETE: (id: number) => `/api/expenses/${id}`
    }
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
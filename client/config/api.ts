import axios from 'axios';

// Environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and automatic /api prefix
api.interceptors.request.use(
  (config) => {
    // Automatically add /api prefix if not present
    if (config.url && !config.url.startsWith('/api')) {
      config.url = `/api${config.url}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ [API Error]:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL ? `${error.config?.baseURL}${error.config?.url}` : 'N/A',
      responseData: error.response?.data,
      requestData: error.config?.data,
    });
    
    return Promise.reject(error);
  }
);

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
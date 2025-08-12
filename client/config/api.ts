import axios from 'axios';

// Create axios instance with default config
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Standard error handling without port fallback
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log network errors for debugging
    if (error.message.includes('Network Error')) {
      console.error('Network Error: Unable to connect to the server. Please ensure the server is running on port 5000.');
    }
    
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Configuration
export const API_CONFIG = {
  // Development server URL
  BASE_URL: 'http://localhost:5000',
  
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
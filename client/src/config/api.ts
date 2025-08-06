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
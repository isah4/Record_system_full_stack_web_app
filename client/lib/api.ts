import { API_CONFIG, getApiUrl, getAuthHeaders } from '../config/api';

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = getApiUrl(endpoint);
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log(`Sending request to: ${url}`, { method: options.method || 'GET' });
    
    try {
      const response = await fetch(url, config);
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.error(`Request failed with status ${response.status}:`, data);
        throw new Error(data.error || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }

  async authenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await getAuthHeaders();
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('Making login request to:', API_CONFIG.ENDPOINTS.AUTH.LOGIN);
    try {
      const response = await this.request<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      console.log('Login request successful');
      return response;
    } catch (error) {
      console.error('Login request failed:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.authenticatedRequest<{ user: User }>(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/api/health');
  }
}

export const apiService = new ApiService();
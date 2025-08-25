import axios from 'axios';
import { api } from '@/config/api';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from './auth-context';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    
    // Remove trailing /api if present
    if (this.baseURL.endsWith('/api')) {
      this.baseURL = this.baseURL.slice(0, -4);
    }
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getAuthHeaders() {
    if (this.token) {
      return {
        Authorization: `Bearer ${this.token}`,
      };
    }
    return {};
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Set token in service for future requests
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Set token in service for future requests
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async getCurrentUser(): Promise<{ user: User }> {
    try {
      const response = await this.authenticatedRequest<{ user: User }>('/auth/me');
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  async authenticatedRequest<T>(endpoint: string, options: any = {}): Promise<T> {
    // Remove /api prefix if present since the main API config will add it automatically
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
    const url = `${this.baseURL}/api${cleanEndpoint}`;
    
    const config = {
      method: options.method || 'GET',
      data: options.data,
      params: options.params,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await api.request({
        url: cleanEndpoint,
        ...config,
      });
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async publicRequest<T>(endpoint: string, options: any = {}): Promise<T> {
    // Remove /api prefix if present since the main API config will add it automatically
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
    const url = `${this.baseURL}/api${cleanEndpoint}`;
    
    try {
      const response = await api.request({
        url: cleanEndpoint,
        ...options,
      });
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export const apiService = new ApiService();
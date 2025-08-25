import axios from 'axios';
import { api } from '@/config/api';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from './auth-context';

// Log API service initialization
console.log('🔧 API Service Initialized');
console.log('📍 Base API URL:', process.env.NEXT_PUBLIC_API_URL);

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    console.log('🚀 ApiService created with baseURL:', this.baseURL);
    
    // Validate baseURL
    if (!this.baseURL) {
      console.error('❌ NEXT_PUBLIC_API_URL is not defined in API Service!');
    }
  }

  setToken(token: string) {
    this.token = token;
    console.log('🔑 Token set in API Service');
  }

  clearToken() {
    this.token = null;
    console.log('🔑 Token cleared from API Service');
  }

  private getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log('🔐 Adding Authorization header to request');
    } else {
      console.log('⚠️ No token available for request');
    }

    return headers;
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('🔐 Attempting login with:', credentials.email);
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('✅ Login successful');
      
      // Set token in service for future requests
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    console.log('📝 Attempting registration with:', userData.email);
    try {
      const response = await api.post('/auth/register', userData);
      console.log('✅ Registration successful');
      
      // Set token in service for future requests
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<{ user: User }> {
    console.log('👤 Getting current user');
    try {
      const response = await this.authenticatedRequest<{ user: User }>('/auth/me');
      console.log('✅ Current user retrieved');
      return response;
    } catch (error: any) {
      console.error('❌ Failed to get current user:', error);
      throw error;
    }
  }

  async authenticatedRequest<T>(endpoint: string, options: any = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    console.log(`\n🔐 [${new Date().toISOString()}] Authenticated Request:`, {
      method: options.method || 'GET',
      endpoint,
      fullURL: url,
      hasToken: !!this.token,
      headers: config.headers,
      data: options.data,
    });

    try {
      const response = await api.request({
        url: endpoint,
        ...config,
      });

      console.log(`✅ [${new Date().toISOString()}] Request successful:`, {
        status: response.status,
        data: response.data,
      });

      return response.data;
    } catch (error: any) {
      console.error(`❌ [${new Date().toISOString()}] Authenticated request failed:`, {
        endpoint,
        fullURL: url,
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
      });

      // Log environment variables in error
      console.error('🔧 Environment Check in Error:', {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NODE_ENV: process.env.NODE_ENV,
        baseURL: this.baseURL,
      });

      throw error;
    }
  }

  async publicRequest<T>(endpoint: string, options: any = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`\n🌐 [${new Date().toISOString()}] Public Request:`, {
      method: options.method || 'GET',
      endpoint,
      fullURL: url,
      headers: options.headers,
      data: options.data,
    });

    try {
      const response = await api.request({
        url: endpoint,
        ...options,
      });

      console.log(`✅ [${new Date().toISOString()}] Public request successful:`, {
        status: response.status,
        data: response.data,
      });

      return response.data;
    } catch (error: any) {
      console.error(`❌ [${new Date().toISOString()}] Public request failed:`, {
        endpoint,
        fullURL: url,
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
      });

      // Log environment variables in error
      console.error('🔧 Environment Check in Error:', {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NODE_ENV: process.env.NODE_ENV,
        baseURL: this.baseURL,
      });

      throw error;
    }
  }
}

export const apiService = new ApiService();
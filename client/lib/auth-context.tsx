"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define interfaces locally to avoid circular imports
interface User {
  id: number;
  email: string;
  created_at: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Import apiService dynamically to avoid circular imports
          const { apiService } = await import('./api');
          const { user } = await apiService.getCurrentUser();
          setUser(user);
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Failed to get current user:', error);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Attempting login with:', { email });
      
      // Import apiService dynamically to avoid circular imports
      const { apiService } = await import('./api');
      const response = await apiService.login({ email, password });
      
      console.log('Login response received:', { success: !!response.token });
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Import apiService dynamically to avoid circular imports
      const { apiService } = await import('./api');
      const response = await apiService.register({ email, password });
      
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    // Redirect to auth page after logout
    window.location.href = '/auth';
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export types for use in other files
export type { User, LoginRequest, RegisterRequest, AuthResponse };
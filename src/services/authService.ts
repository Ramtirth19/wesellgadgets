import api from '../config/api';
import { User } from '../store';

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token: string;
  };
  user?: User;
  token?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.auth.login(email, password);
      
      // Handle different response formats
      const token = response.data?.token || response.token;
      const user = response.data?.user || response.user;
      
      if (token) {
        localStorage.setItem('auth-token', token);
      }
      
      return {
        success: true,
        data: { user, token }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.auth.register(name, email, password);
      
      const token = response.data?.token || response.token;
      const user = response.data?.user || response.user;
      
      if (token) {
        localStorage.setItem('auth-token', token);
      }
      
      return {
        success: true,
        data: { user, token }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  },

  async getCurrentUser(): Promise<{ success: boolean; data?: { user: User } }> {
    try {
      const response = await api.auth.getMe();
      return {
        success: true,
        data: { user: response.data?.user || response.user || response }
      };
    } catch (error) {
      localStorage.removeItem('auth-token');
      return { success: false };
    }
  },

  async logout(): Promise<void> {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth-token');
    }
  },

  getToken(): string | null {
    return localStorage.getItem('auth-token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export default authService;
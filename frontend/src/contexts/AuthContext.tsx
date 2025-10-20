import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { signalRService } from '../services/signalr.ts';

interface User {
  id: string;
  userName: string;
  email: string;
  isEmailConfirmed: boolean;
  role?: string; // "Buyer", "Seller", or "Admin"
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (userData: { userName: string; email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app start
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const userData = await api.getCurrentUser(token);
          setUser(userData);
          
          // Initialize SignalR connection with token
          await signalRService.start(token);
        } catch (error) {
          console.error('Failed to get user data:', error);
          // Token might be expired, clear it
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.login(credentials);
      
      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        
        // Start SignalR connection
        await signalRService.start(response.token);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { userName: string; email: string; password: string }): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.register(userData);
      
      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        
        // Start SignalR connection
        await signalRService.start(response.token);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await api.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clean up regardless of API call success
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      
      // Stop SignalR connection
      await signalRService.stop();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'Admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
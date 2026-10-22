import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dastaan_auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('dastaan_auth_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.auth.me();
      const userData = res?.data || res?.user;
      if (res?.success && userData) {
        setUser(userData);
      } else {
        localStorage.removeItem('dastaan_auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('dastaan_auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.auth.login(credentials);
    if (!res || res.success === false) {
      throw new Error(res?.error || res?.message || 'Invalid email or password.');
    }

    const payload = res.data || res;
    const newToken = payload?.token;
    const newUser = payload?.user;

    if (!newToken || !newUser) {
      throw new Error(res?.error || 'Authentication token or user profile missing in response.');
    }

    localStorage.setItem('dastaan_auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (data: { email: string; password: string; name: string; phone?: string }) => {
    const res = await api.auth.register(data);
    if (!res || res.success === false) {
      throw new Error(res?.error || res?.message || 'Registration failed. Please check your information.');
    }

    const payload = res.data || res;
    const newToken = payload?.token;
    const newUser = payload?.user;

    if (!newToken || !newUser) {
      throw new Error(res?.error || 'Registration response was invalid.');
    }

    localStorage.setItem('dastaan_auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('dastaan_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

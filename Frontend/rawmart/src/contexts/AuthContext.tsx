import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginData, RegisterData, ApiError } from '@/types';
import { api } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  error: ApiError | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch {
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (data: LoginData) => {
    setError(null);
    try {
      const response = await api.login(data);
      setUser(response.user);
    } catch (err) {
      setError(err as ApiError);
      throw err;
    }
  };

  const register = async (data: RegisterData) => {
    setError(null);
    try {
      const response = await api.register(data);
      setUser(response.user);
    } catch (err) {
      setError(err as ApiError);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Still clear local state even if API call fails
    }
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

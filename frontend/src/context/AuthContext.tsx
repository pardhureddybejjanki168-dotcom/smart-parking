import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi } from '../api/client';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { fullName: string; email: string; phone: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('parking_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('parking_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      const userData = (res as any)?.data || res;
      if (userData && userData.id) {
        setUser(userData);
        localStorage.setItem('parking_user', JSON.stringify(userData));
      }
    } catch {
      // If /me fails, clear token if 401
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('parking_token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const res = await authApi.me();
          const userData = (res as any)?.data || res;
          if (userData && userData.id) {
            setUser(userData);
            localStorage.setItem('parking_user', JSON.stringify(userData));
          }
        } catch (err) {
          console.error('Failed to restore auth session:', err);
          localStorage.removeItem('parking_token');
          localStorage.removeItem('parking_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const payload = (response as any)?.data || response;
      const receivedToken = payload.token;
      const receivedUser = payload.user;

      if (!receivedToken || !receivedUser) {
        throw new Error(payload.message || 'Login failed - invalid credentials response');
      }

      localStorage.setItem('parking_token', receivedToken);
      localStorage.setItem('parking_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      toast.success(`Welcome back, ${receivedUser.fullName}!`);
      return receivedUser;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { fullName: string; email: string; phone: string; password: string }): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      const payload = (response as any)?.data || response;
      const receivedToken = payload.token;
      const receivedUser = payload.user;

      if (receivedToken && receivedUser) {
        localStorage.setItem('parking_token', receivedToken);
        localStorage.setItem('parking_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
        toast.success('Registration successful!');
        return receivedUser;
      } else {
        toast.success('Account created! Please sign in.');
        return payload.user || payload;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('parking_token');
      localStorage.removeItem('parking_user');
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('parking_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
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

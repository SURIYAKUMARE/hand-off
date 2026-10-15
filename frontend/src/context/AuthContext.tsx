import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../api/client';
import { UserRole } from '@helpdesk360/shared';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refetchUser = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; user: AuthUser }>('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const login = async (email: string, password: string, rememberMe = false): Promise<AuthUser> => {
    const res = await api.post<{ success: boolean; user: AuthUser }>('/auth/login', {
      email,
      password,
      rememberMe,
    });
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Continue client cleanup even if network fails
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

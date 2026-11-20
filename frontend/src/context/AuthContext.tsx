import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../api/client';
import { UserRole } from '@helpdesk360/shared';
import { useQueryClient } from '@tanstack/react-query';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: string;
  employeeId?: string | null;
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
  technicianProfile?: {
    specialization: string;
    status: string;
    skills: string | null;
  } | null;
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
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refetchUser = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get<{ success: boolean; user: AuthUser; token?: string }>('/auth/me', { signal, cache: 'no-store' });
      if (!signal?.aborted && res?.success && res.user) {
        setUser(res.user);
        if (res.token) {
          try {
            localStorage.setItem('helpdesk360_token', res.token);
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      if (!signal?.aborted && err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        try {
          localStorage.removeItem('helpdesk360_token');
        } catch {
          // ignore
        }
        setUser(null);
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = new AbortController();
    void refetchUser(request.signal);
    return () => request.abort();
  }, [refetchUser]);

  const login = async (email: string, password: string, rememberMe = false): Promise<AuthUser> => {
    const res = await api.post<{ success: boolean; user: AuthUser; token?: string }>('/auth/login', {
      email,
      password,
      rememberMe,
    });
    if (!res?.success || !res.user) {
      throw new ApiError('The sign-in service returned an invalid response.', 502);
    }
    if (res.token) {
      try {
        localStorage.setItem('helpdesk360_token', res.token);
      } catch {
        // ignore
      }
    }
    queryClient.clear();
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      if (!(err instanceof ApiError) || (err.status !== 401 && err.status !== 403)) throw err;
    } finally {
      try {
        localStorage.removeItem('helpdesk360_token');
      } catch {
        // ignore
      }
      queryClient.clear();
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

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthToken, setAuthToken } from '../lib/api';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isLoginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  hasRole: () => false,
  hasPermission: () => false,
  hasAnyPermission: () => false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const refreshUser = useCallback(async () => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      return null;
    }
    try {
      const data = await api.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.warn('User refresh failed:', err.message);
    }
    return null;
  }, []);

  // Check existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);
      try {
        const data = await api.getMe();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setAuthToken(null);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        setAuthToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const router = useRouter();

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data.success && data.token) {
      try {
        localStorage.setItem('chanda_sidebar_collapsed', 'true');
      } catch {}
      setToken(data.token);
      setUser(data.user);
      setIsLoginModalOpen(false);
    }
    return data;
  };

  const logout = useCallback(() => {
    // 1. Immediately reset client state and token for zero-delay UI update
    setToken(null);
    setUser(null);
    setAuthToken(null);

    // 2. Notify backend in background without awaiting or blocking UI
    api.logout().catch(() => {});

    // 3. Instant client-side redirect to home
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      router.push('/');
    }
  }, [router]);

  const hasRole = useCallback(
    (...roles) => {
      if (!user) return false;
      if (roles.length === 0) return true;
      if (user.isWildcard) return true;
      const lower = roles.map((r) => String(r).toLowerCase());
      return (
        roles.includes(user.role) ||
        (user.roleSlug && lower.includes(String(user.roleSlug).toLowerCase()))
      );
    },
    [user]
  );

  const hasPermission = useCallback(
    (permKey) => {
      if (!user) return false;
      if (user.isWildcard) return true;
      return Array.isArray(user.permissions) && user.permissions.includes(permKey);
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (...permKeys) => {
      if (!user) return false;
      if (user.isWildcard) return true;
      if (permKeys.length === 0) return true;
      return permKeys.some((k) => Array.isArray(user.permissions) && user.permissions.includes(k));
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        login,
        logout,
        refreshUser,
        hasRole,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

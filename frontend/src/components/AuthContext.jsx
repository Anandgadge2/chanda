'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  hasRole: () => false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

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

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      setIsLoginModalOpen(false);
    }
    return data;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setToken(null);
      setUser(null);
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
  };

  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    if (roles.length === 0) return true;
    return roles.includes(user.role);
  };

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
        hasRole,
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

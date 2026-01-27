import React, { createContext, useContext, useState, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const verifyToken = async (token) => {
    try {
      const { data } = await WWClient.functions.invoke('verifyToken', { token });
      return data.user;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const userData = await verifyToken(token);
        if (userData) {
          setUser(userData);
        } else {
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await WWClient.functions.invoke('login', { email, password });
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password, full_name, role) => {
    const { data } = await WWClient.functions.invoke('register', { email, password, full_name, role });
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = createPageUrl('Login');
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
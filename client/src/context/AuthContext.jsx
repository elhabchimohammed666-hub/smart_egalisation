import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mo9ata3a_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('mo9ata3a_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('mo9ata3a_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('[AuthContext] Session verification failed:', error.message);
          setUser(null);
          localStorage.removeItem('mo9ata3a_token');
          localStorage.removeItem('mo9ata3a_user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('mo9ata3a_token', res.data.token);
      localStorage.setItem('mo9ata3a_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res.data;
  };

  const registerCitizen = async (formData) => {
    // Multipart form data for CIN images
    const res = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (res.data?.token) {
      localStorage.setItem('mo9ata3a_token', res.data.token);
      localStorage.setItem('mo9ata3a_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('mo9ata3a_token');
    localStorage.removeItem('mo9ata3a_user');
    setUser(null);
  };

  const isCitizen = user?.role === 'citizen';
  const isManager = user?.role === 'manager';
  const isAdmin = user?.role === 'admin';
  const isStaff = isManager || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        registerCitizen,
        logout,
        isAuthenticated: !!user,
        isCitizen,
        isManager,
        isAdmin,
        isStaff
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

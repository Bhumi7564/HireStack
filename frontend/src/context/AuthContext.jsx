import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hirestack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hirestack_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('hirestack_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error('Session expired or invalid', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const data = res.data.data;
      setToken(data.accessToken);
      setUser(data);
      localStorage.setItem('hirestack_token', data.accessToken);
      localStorage.setItem('hirestack_user', JSON.stringify(data));
      return data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const data = res.data.data;
      setToken(data.accessToken);
      setUser(data);
      localStorage.setItem('hirestack_token', data.accessToken);
      localStorage.setItem('hirestack_user', JSON.stringify(data));
      return data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const googleLogin = async (idToken) => {
    const res = await api.post('/auth/google', { idToken });
    if (res.data.success) {
      const data = res.data.data;
      setToken(data.accessToken);
      setUser(data);
      localStorage.setItem('hirestack_token', data.accessToken);
      localStorage.setItem('hirestack_user', JSON.stringify(data));
      return data;
    }
    throw new Error(res.data.message || 'Google sign-in failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hirestack_token');
    localStorage.removeItem('hirestack_user');
  };

  const isAdmin = user?.role === 'ROLE_HR_ADMIN' || user?.role === 'HR_ADMIN';
  const isRecruiter = user?.role === 'ROLE_RECRUITER' || user?.role === 'RECRUITER';
  const isInterviewer = user?.role === 'ROLE_INTERVIEWER' || user?.role === 'INTERVIEWER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isAdmin,
        isRecruiter,
        isInterviewer,
        login,
        register,
        googleLogin,
        logout,
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


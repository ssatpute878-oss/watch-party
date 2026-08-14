import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('watchparty_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('watchparty_token') || null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('watchparty_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Session expired or invalid token:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('watchparty_token', res.data.token);
        localStorage.setItem('watchparty_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const res = await API.post('/auth/register', { name, email, password, confirmPassword });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('watchparty_token', res.data.token);
        localStorage.setItem('watchparty_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('watchparty_token');
    localStorage.removeItem('watchparty_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout
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

export default AuthContext;

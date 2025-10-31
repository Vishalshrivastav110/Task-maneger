import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      console.log('Initial token check:', token);
      
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await fetchUser();
      } else {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const fetchUser = async () => {
    try {
      console.log('Fetching user profile...');
      const res = await axios.get(`${API_BASE_URL}/auth/profile`);
      console.log('User profile fetched:', res.data);
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Login attempt for:', email);
      
      // Remove any existing token for fresh login
      delete axios.defaults.headers.common['Authorization'];
      
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      
      console.log('Login response:', res.data);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        console.log('Token saved and header set');
        
        // Set user data immediately
        const userData = {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email
        };
        setUser(userData);
        console.log('User state set:', userData);
        
        return res.data;
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Register attempt for:', email);
      
      // Remove any existing token for fresh registration
      delete axios.defaults.headers.common['Authorization'];
      
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
      });
      
      console.log('Register response:', res.data);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        console.log('Token saved and header set after register');
        
        // Set user data immediately
        const userData = {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email
        };
        setUser(userData);
        console.log('User state set after register:', userData);
        
        return res.data;
      }
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
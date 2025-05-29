import React, { createContext, useState, useEffect, useContext } from 'react';
import { login, register } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setCurrentUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    setError('');
    try {
      const response = await login({ email, password });
      localStorage.setItem('token', response.data.access_token);
      
      // For now, we'll store a simple user object
      const user = { email, id: 'user-id' }; // Ideally, get the user ID from the token or response
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
      return false;
    }
  };

  const registerUser = async (username, email, password) => {
    setError('');
    try {
      await register({ username, email, password });
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login: loginUser,
    register: registerUser,
    logout,
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
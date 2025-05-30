import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

// Habits API calls
export const getHabits = () => api.get('/habits');
export const createHabit = (habitData) => api.post('/habits', habitData);
export const updateHabit = (habitId, habitData) => api.put(`/habits/${habitId}`, habitData);
export const completeHabit = (habitId) => api.post(`/habits/${habitId}/complete`);

export default api;
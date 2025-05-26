import axios from 'axios';

const API_URL = 'http://13.51.150.158:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    console.log('Making request:', {
      method: config.method,
      url: config.url,
      data: config.data
    });
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Health check function
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data.status === 'ok';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

export const register = async (userData) => {
  try {
    console.log('Making registration request to:', `${API_URL}/auth/register`);
    const response = await api.post('/auth/register', userData);
    console.log('Registration response:', response.data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    throw error.response?.data || { message: 'Failed to get user data' };
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated
}; 
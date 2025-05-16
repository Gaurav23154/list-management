import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'; // Adjust if your backend runs elsewhere

const authService = {
  // Admin Login
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        // You might want to set axios default headers here if you plan to make authenticated requests frequently
        // axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      // Handle or throw error to be caught by the calling component
      console.error('Login service error:', error.response?.data || error.message);
      throw error.response?.data || new Error('Login failed');
    }
  },

  // Admin Logout
  logout: () => {
    localStorage.removeItem('adminToken');
    // Remove axios default header if it was set
    // delete axios.defaults.headers.common['Authorization'];
    // Potentially notify other parts of the app or redirect
  },

  // Get current admin (if needed, e.g., to verify token or get admin details)
  getCurrentAdmin: async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return null;
    }
    try {
      const response = await axios.get(`${API_URL}/auth`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get current admin error:', error.response?.data || error.message);
      // Token might be invalid or expired, so clear it
      localStorage.removeItem('adminToken');
      return null;
    }
  },

  // Check if admin is currently authenticated (basic check)
  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  }

  // Admin Registration (if you want to expose it via UI, otherwise can be a one-time script or seeded)
  /* 
  register: async (adminData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, adminData);
      // Handle successful registration (e.g., auto-login or message)
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration service error:', error.response?.data || error.message);
      throw error.response?.data || new Error('Registration failed');
    }
  }
  */
};

export default authService; 
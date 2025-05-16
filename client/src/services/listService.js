import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Function to get the auth token from localStorage (can be shared or duplicated from agentService)
const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

// Create an axios instance for authenticated requests (can be shared or duplicated)
const axiosAuth = axios.create();

axiosAuth.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // For file uploads, we need to set the Content-Type to multipart/form-data
    // This will be handled when creating FormData object for the request
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const listService = {
  // Upload CSV file and distribute lists
  uploadList: async (formData) => {
    try {
      // The backend expects 'listFile' as the field name for the file
      const response = await axiosAuth.post(`${API_URL}/lists/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload list service error:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to upload and process list');
    }
  },

  // Get all distributed lists (useful for displaying them later)
  getAllDistributedLists: async () => {
    try {
      const response = await axiosAuth.get(`${API_URL}/lists`);
      return response.data;
    } catch (error) {
      console.error('Get all distributed lists service error:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch distributed lists');
    }
  },

  // Get lists for a specific agent (useful for displaying them later)
  getListsByAgent: async (agentId) => {
    try {
      const response = await axiosAuth.get(`${API_URL}/lists/agent/${agentId}`);
      return response.data;
    } catch (error) {
      console.error(`Get lists for agent ${agentId} service error:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch lists for the agent');
    }
  }
};

export default listService; 
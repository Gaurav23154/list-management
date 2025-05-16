import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Function to get the auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

// Create an axios instance for authenticated requests
const axiosAuth = axios.create();

axiosAuth.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const agentService = {
  // Create a new agent
  createAgent: async (agentData) => {
    try {
      const response = await axiosAuth.post(`${API_URL}/agents`, agentData);
      return response.data;
    } catch (error) {
      console.error('Create agent service error:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to create agent');
    }
  },

  // Get all agents
  getAllAgents: async () => {
    try {
      const response = await axiosAuth.get(`${API_URL}/agents`);
      return response.data;
    } catch (error) {
      console.error('Get all agents service error:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch agents');
    }
  },

  // Get a single agent by ID (optional, if needed for an edit page later)
  getAgentById: async (agentId) => {
    try {
      const response = await axiosAuth.get(`${API_URL}/agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error(`Get agent by ID (${agentId}) service error:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch agent details');
    }
  },

  // Update an agent (optional, if needed for an edit page later)
  updateAgent: async (agentId, agentData) => {
    try {
      const response = await axiosAuth.put(`${API_URL}/agents/${agentId}`, agentData);
      return response.data;
    } catch (error) {
      console.error(`Update agent (${agentId}) service error:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update agent');
    }
  },

  // Delete an agent (optional, if needed)
  deleteAgent: async (agentId) => {
    try {
      const response = await axiosAuth.delete(`${API_URL}/agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error(`Delete agent (${agentId}) service error:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to delete agent');
    }
  }
};

export default agentService; 
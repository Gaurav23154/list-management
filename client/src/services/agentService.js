import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all agents
const getAgents = async () => {
  try {
    const response = await api.get('/agents');
    console.log('Get agents response:', response.data);
    // Return the data array from the response
    return response.data.data || [];
  } catch (error) {
    console.error('Get agents error:', error);
    throw error.response?.data || { message: 'Failed to fetch agents' };
  }
};

// Get agent by ID
const getAgentById = async (id) => {
  try {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch agent' };
  }
};

// Create a new agent
const createAgent = async (agentData) => {
  try {
    console.log('Sending agent data to server:', agentData);
    const response = await api.post('/agents', agentData);
    console.log('Server response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create agent');
    }
    
    return response.data;
  } catch (error) {
    console.error('Create agent error:', error);
    throw error.response?.data || { message: error.message || 'Failed to create agent' };
  }
};

// Update an existing agent
const updateAgent = async (id, agentData) => {
  try {
    const response = await api.put(`/agents/${id}`, agentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update agent' };
  }
};

// Delete an agent
const deleteAgent = async (id) => {
  try {
    const response = await api.delete(`/agents/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete agent' };
  }
};

// Export all functions
export {
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent
}; 
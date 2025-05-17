import React, { useState, useEffect } from 'react';
import { getAgents, createAgent, updateAgent, deleteAgent } from '../services/agentService';
import './Agents.css';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await getAgents();
      console.log('Fetched agents:', data);
      setAgents(data);
      setError(null);
    } catch (err) {
      console.error('Fetch agents error:', err);
      setError('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Please fill in all required fields');
        return;
      }

      // Log the data being sent
      console.log('Submitting agent data:', formData);

      if (editingId) {
        const response = await updateAgent(editingId, formData);
        console.log('Update response:', response);
      } else {
        const response = await createAgent(formData);
        console.log('Create response:', response);
      }
      
      // Refresh the agents list
      await fetchAgents();
      // Reset the form
      resetForm();
    } catch (err) {
      console.error('Agent save error:', err);
      setError(
        err.message || 
        err.response?.data?.message || 
        'Failed to save agent. Please try again.'
      );
    }
  };

  const handleEdit = (agent) => {
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone
    });
    setEditingId(agent._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await deleteAgent(id);
        // Refresh the agents list after deletion
        await fetchAgents();
      } catch (err) {
        console.error('Delete agent error:', err);
        setError('Failed to delete agent');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: ''
    });
    setEditingId(null);
  };

  if (loading) {
    return <div className="agents-loading">Loading agents...</div>;
  }

  return (
    <div className="agents-container">
      <h1>Manage Agents</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="agent-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            {editingId ? 'Update Agent' : 'Add Agent'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="cancel-button">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="agents-list">
        <h2>Agents List ({agents.length})</h2>
        {agents.length > 0 ? (
          <div className="agents-grid">
            {agents.map(agent => (
              <div key={agent._id} className="agent-card">
                <div className="agent-info">
                  <h3>{agent.name}</h3>
                  <p>{agent.email}</p>
                  <p>{agent.phone}</p>
                </div>
                <div className="agent-actions">
                  <button
                    onClick={() => handleEdit(agent)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(agent._id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No agents found</p>
        )}
      </div>
    </div>
  );
};

export default Agents; 
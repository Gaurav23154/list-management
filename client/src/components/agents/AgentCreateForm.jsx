import React, { useState } from 'react';
import agentService from '../../services/agentService';
import './AgentForms.css'; // Shared CSS for agent forms

const AgentCreateForm = ({ onAgentCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name || !email || !mobileNumber || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const newAgentData = { name, email, mobileNumber, password };
      const createdAgent = await agentService.createAgent(newAgentData);
      setSuccessMessage(`Agent "${createdAgent.name}" created successfully!`);
      // Clear form
      setName('');
      setEmail('');
      setMobileNumber('');
      setPassword('');
      setConfirmPassword('');
      if (onAgentCreated) {
        onAgentCreated(createdAgent); // Callback to update parent component (e.g., refresh agent list)
      }
    } catch (err) {
      const errorMessage = err.msg || err.message || 'Failed to create agent.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-form-card">
      <h3>Create New Agent</h3>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        
        <div className="form-group">
          <label htmlFor="agentName">Name:</label>
          <input 
            type="text" 
            id="agentName"
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="agentEmail">Email:</label>
          <input 
            type="email" 
            id="agentEmail"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="agentMobile">Mobile Number (with country code):</label>
          <input 
            type="text" // Consider type="tel" for better semantics
            id="agentMobile"
            value={mobileNumber} 
            onChange={(e) => setMobileNumber(e.target.value)} 
            required 
            disabled={loading}
            placeholder="+1234567890"
          />
        </div>

        <div className="form-group">
          <label htmlFor="agentPassword">Password:</label>
          <input 
            type="password" 
            id="agentPassword"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            minLength="6"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="agentConfirmPassword">Confirm Password:</label>
          <input 
            type="password" 
            id="agentConfirmPassword"
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            minLength="6"
            disabled={loading}
          />
        </div>

        <button type="submit" className="agent-form-button" disabled={loading}>
          {loading ? 'Creating Agent...' : 'Create Agent'}
        </button>
      </form>
    </div>
  );
};

export default AgentCreateForm; 
import React, { useState, useEffect } from 'react';
import agentService from '../../services/agentService';
import './AgentList.css'; // We'll create this CSS file next

const AgentList = ({ refreshTrigger, onAgentError }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await agentService.getAllAgents();
        setAgents(data || []); // Ensure data is an array
      } catch (err) {
        const errorMessage = err.msg || err.message || 'Failed to fetch agents.';
        setError(errorMessage);
        if(onAgentError) onAgentError(errorMessage); // Notify parent of error
        setAgents([]); // Clear agents on error
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [refreshTrigger, onAgentError]); // Re-fetch when refreshTrigger changes

  if (loading) {
    return <p>Loading agents...</p>;
  }

  if (error) {
    return <p className="error-message" style={{textAlign: 'center'}}>{error}</p>;
  }

  if (agents.length === 0) {
    return <p>No agents found. Create one to get started!</p>;
  }

  return (
    <div className="agent-list-container">
      <h3>Current Agents</h3>
      {agents.length > 0 && (
        <ul className="agent-list">
          {agents.map((agent) => (
            <li key={agent._id} className="agent-list-item">
              <div className="agent-info">
                <strong>{agent.name}</strong> ({agent.email})
              </div>
              <div className="agent-contact">{agent.mobileNumber}</div>
              {/* Add Edit/Delete buttons here if needed later */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AgentList; 
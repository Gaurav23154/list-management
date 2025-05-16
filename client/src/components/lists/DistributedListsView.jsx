import React, { useState, useEffect } from 'react';
import listService from '../../services/listService';
import './DistributedListsView.css'; // We'll create this CSS file

const DistributedListsView = ({ refreshTrigger, onDisplayError }) => {
  const [distributedLists, setDistributedLists] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(''); // Error will be handled by parent via onDisplayError

  useEffect(() => {
    const fetchLists = async () => {
      setLoading(true);
      if(onDisplayError) onDisplayError(''); // Clear previous error on new fetch
      try {
        const data = await listService.getAllDistributedLists();
        // The data is an array of lists, each list has an agent and tasks.
        // We can group them by agent for display if needed, or display as is if each list object is per agent per upload.
        // For now, assuming the backend returns lists already somewhat structured or we display them sequentially.
        // If multiple uploads assign tasks to the same agent, they'll appear as separate list entries for that agent.
        setDistributedLists(data || []);
      } catch (err) {
        const errorMessage = err.msg || err.message || 'Failed to fetch distributed lists.';
        if(onDisplayError) onDisplayError(errorMessage);
        setDistributedLists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, [refreshTrigger, onDisplayError]); // Re-fetch when refreshTrigger changes

  if (loading) {
    return <p>Loading distributed lists...</p>;
  }

  // Error display is now handled by the parent DashboardPage
  // if (error) {
  //   return <p className="error-message">{error}</p>;
  // }

  if (distributedLists.length === 0 && !loading) { // Ensure not to show if still loading initially
    return <p>No lists have been distributed yet. Upload a CSV to see tasks here.</p>;
  }

  // Group tasks by agent for a more organized view
  const listsByAgent = distributedLists.reduce((acc, list) => {
    const agentId = list.agent?._id || 'unknown-agent'; // Handle cases where agent might be null or missing _id
    const agentName = list.agent?.name || 'Unknown Agent';
    const agentEmail = list.agent?.email || 'N/A';

    if (!acc[agentId]) {
      acc[agentId] = {
        agentName,
        agentEmail,
        tasks: [],
        files: new Set() // To track unique file names per agent
      };
    }
    list.tasks.forEach(task => acc[agentId].tasks.push({ ...task, originalFile: list.originalFileName }));
    acc[agentId].files.add(list.originalFileName);
    return acc;
  }, {});

  return (
    <div className="distributed-lists-container">
      {Object.entries(listsByAgent).map(([agentId, agentData]) => (
        <div key={agentId} className="agent-tasks-card">
          <h4>Tasks for: {agentData.agentName} ({agentData.agentEmail})</h4>
          <p className="file-origin-info">Original File(s): {Array.from(agentData.files).join(', ')}</p>
          {agentData.tasks.length > 0 ? (
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Phone</th>
                  <th>Notes</th>
                  {/* <th>Original File</th> */}
                </tr>
              </thead>
              <tbody>
                {agentData.tasks.map((task, index) => (
                  <tr key={`${agentId}-task-${index}`}> {/* Ensure unique key for tasks within an agent */}
                    <td>{task.firstName}</td>
                    <td>{task.phone}</td>
                    <td>{task.notes || '-'}</td>
                    {/* <td>{task.originalFile}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No tasks assigned to this agent from the current lists.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default DistributedListsView; 
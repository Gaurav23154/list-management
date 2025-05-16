import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Import useAuth
import AgentCreateForm from '../components/agents/AgentCreateForm';
import AgentList from '../components/agents/AgentList';
import ListUploadForm from '../components/lists/ListUploadForm'; // Import ListUploadForm
import DistributedListsView from '../components/lists/DistributedListsView'; // Import DistributedListsView
import './DashboardPage.css'; // Create this for dashboard specific styles if needed

const DashboardPage = () => {
  const { adminUser, logout } = useAuth(); // Get adminUser and logout from context
  
  // State for Agent Management
  const [refreshAgentListTrigger, setRefreshAgentListTrigger] = useState(0);
  const [agentSectionError, setAgentSectionError] = useState('');

  // State for List Upload & Display
  const [listUploadMessage, setListUploadMessage] = useState('');
  const [listUploadError, setListUploadError] = useState('');
  const [refreshListsViewTrigger, setRefreshListsViewTrigger] = useState(0);
  const [distributedListError, setDistributedListError] = useState('');

  const handleLogout = () => {
    logout(); // Use logout from context
  };

  // Agent Management Callbacks
  const handleAgentCreated = () => {
    setRefreshAgentListTrigger(prev => prev + 1); // Trigger a refresh
    setAgentSectionError(''); // Clear previous errors on new creation
  };
  
  const handleAgentListError = (errorMessage) => {
    setAgentSectionError(errorMessage);
  };

  // List Upload Callbacks
  const handleListUploadSuccess = (response) => {
    setListUploadMessage(response.msg || 'List uploaded successfully!');
    setListUploadError(''); // Clear upload error on success
    setDistributedListError(''); // Clear list view error as we are about to refresh
    setRefreshListsViewTrigger(prev => prev + 1); // Trigger refresh of distributed lists
  };
  const handleListUploadError = (errorMessage) => {
    setListUploadError(errorMessage);
    setListUploadMessage('');
  };

  // Distributed List View Callback
  const handleDistributedListError = (errorMessage) => {
    setDistributedListError(errorMessage);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        {adminUser && <p>Welcome, {adminUser.email || 'Admin'}!</p>}
        {!adminUser && <p>Loading user data or not logged in...</p>}
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="dashboard-section agent-management-section">
        <h3>Agent Management</h3>
        {agentSectionError && <p className="error-message">{agentSectionError}</p>}
        <AgentCreateForm onAgentCreated={handleAgentCreated} />
        <AgentList 
            refreshTrigger={refreshAgentListTrigger} 
            onAgentError={handleAgentListError} 
        />
      </div>

      <div className="dashboard-section list-upload-section">
        <h3>Upload CSV List</h3>
        {listUploadError && <p className="error-message">{listUploadError}</p>}
        {listUploadMessage && <p className="success-message">{listUploadMessage}</p>}
        <ListUploadForm 
          onUploadSuccess={handleListUploadSuccess} 
          onUploadError={handleListUploadError} 
        />
      </div>

      <div className="dashboard-section distributed-lists-section">
        <h3>Distributed Lists</h3>
        {distributedListError && <p className="error-message">{distributedListError}</p>}
        <DistributedListsView 
            refreshTrigger={refreshListsViewTrigger} 
            onDisplayError={handleDistributedListError} // Prop to catch errors from the view component
        />
      </div>

    </div>
  );
};

export default DashboardPage; 
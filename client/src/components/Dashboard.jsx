import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';
import AIInsights from './AIInsights';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalAgents: 0,
    contactsByStatus: {},
    recentUploads: [],
    insights: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please log in to view dashboard');
        }

        const response = await axios.get('http://localhost:5001/api/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setStats(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.username}!</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Contacts</h3>
          <p className="stat-value">{stats.totalContacts}</p>
        </div>
        <div className="stat-card">
          <h3>Active Agents</h3>
          <p className="stat-value">{stats.totalAgents}</p>
        </div>
      </div>

      <AIInsights />

      {stats.insights.length > 0 && (
        <div className="insights-section">
          <h2>Insights</h2>
          <div className="insights-grid">
            {stats.insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <h3>{insight.title}</h3>
                <p>{insight.description}</p>
                <span className="insight-date">
                  {new Date(insight.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {stats.recentUploads.length > 0 ? (
          <div className="activity-list">
            {stats.recentUploads.map((day, index) => (
              <div key={index} className="activity-item">
                <span className="date">{day.date}</span>
                <span className="count">{day.count} contacts added</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent activity</p>
        )}
      </div>

      {Object.keys(stats.contactsByStatus).length > 0 && (
        <div className="status-section">
          <h2>Contact Status</h2>
          <div className="status-grid">
            {Object.entries(stats.contactsByStatus).map(([status, count]) => (
              <div key={status} className="status-card">
                <h3>{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
                <p className="status-value">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 
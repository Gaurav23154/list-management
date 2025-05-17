import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AIInsights.css';

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view insights');
          setLoading(false);
          navigate('/login');
          return;
        }

        console.log('Fetching insights...');
        const response = await axios.get('/api/ai/insights', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Response received:', response.data);

        if (!response.data) {
          throw new Error('No data received from server');
        }

        if (!response.data.success) {
          throw new Error(response.data.message || 'Server returned unsuccessful response');
        }

        if (!Array.isArray(response.data.data)) {
          console.error('Invalid data format:', response.data);
          throw new Error('Invalid data format received from server');
        }

        setInsights(response.data.data);
      } catch (err) {
        console.error('Error fetching insights:', err);
        if (err.response) {
          console.error('Error response:', err.response.data);
          if (err.response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            setError('Session expired. Please log in again.');
          } else {
            setError(err.response.data.message || 'Error fetching insights');
          }
        } else if (err.request) {
          console.error('No response received:', err.request);
          setError('No response from server. Please check your connection.');
        } else {
          setError(err.message || 'Error fetching insights');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [navigate]);

  if (loading) {
    return <div className="insights-loading">Loading insights...</div>;
  }

  if (error) {
    return (
      <div className="insights-error">
        <h3>Error Loading Insights</h3>
        <p>{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="insights-empty">
        <h3>No Insights Available</h3>
        <p>Start adding contacts to see AI-powered insights about your data.</p>
      </div>
    );
  }

  return (
    <div className="ai-insights">
      <h2>AI-Powered Insights</h2>
      <div className="insights-grid">
        {insights.map((insight, index) => (
          <div key={index} className={`insight-card ${insight.type || 'default'}`}>
            <h3>{insight.title || 'Untitled Insight'}</h3>
            <p>{insight.description || 'No description available'}</p>
            {insight.action && (
              <a href={insight.action.url} className="insight-action">
                {insight.action.text}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsights; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AIContactAnalysis.css';

const AIContactAnalysis = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view insights');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5001/api/contacts/ai-insights', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setInsights(response.data.data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching insights');
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return <div className="loading">Analyzing contacts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="ai-analysis">
      <h2>AI-Powered Contact Insights</h2>
      <div className="insights-grid">
        {insights.map((insight, index) => (
          <div key={index} className="insight-card">
            <div className="insight-icon">
              {insight.type === 'pattern' && '📊'}
              {insight.type === 'recommendation' && '💡'}
              {insight.type === 'trend' && '📈'}
            </div>
            <div className="insight-content">
              <h3>{insight.title}</h3>
              <p>{insight.description}</p>
              {insight.action && (
                <button className="action-button" onClick={() => window.location.href = insight.action.url}>
                  {insight.action.text}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIContactAnalysis; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import authService from '../services/authService'; // No longer needed directly
import { useAuth } from '../context/AuthContext.jsx'; // Import useAuth
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loadingAuth } = useAuth(); // Get login from context

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  // Redirect if already authenticated
  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loadingAuth, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      await login({ email, password }); // Use login from context
      // Navigation is handled by AuthContext or the effect above after state update
      // navigate(from, { replace: true }); // This can also be here if preferred
    } catch (err) {
      const errorMessage = err.msg || err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login page error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // If still checking auth or already authenticated, don't show login form yet
  if (loadingAuth) {
    return <div>Loading...</div>; // Or a spinner
  }
  // If authenticated (and useEffect hasn't redirected yet, which it should have), don't render form
  // This check is mostly a safeguard, useEffect should handle redirection.
  if (isAuthenticated) {
      return null; 
  }

  return (
    <div className="login-page-container">
      <div className="login-form-card">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input 
              type="email" 
              id="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button" disabled={loading || loadingAuth}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 
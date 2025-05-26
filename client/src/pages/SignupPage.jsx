import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { register } from '../services/authService';
import './LoginPage.css'; // We can reuse the same styles

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loadingAuth } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  // Redirect if already authenticated
  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loadingAuth, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Register the user
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // After successful registration, log the user in
      await login({
        email: formData.email,
        password: formData.password
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If still checking auth or already authenticated, don't show signup form yet
  if (loadingAuth) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="login-page-container">
      <div className="login-form-card">
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username"
              name="username"
              value={formData.username} 
              onChange={handleChange} 
              required 
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email} 
              onChange={handleChange} 
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
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              required 
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input 
              type="password" 
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
              placeholder="Confirm your password"
              disabled={loading}
            />
          </div>
          <button type="submit" className="login-button" disabled={loading || loadingAuth}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
          <p className="login-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage; 
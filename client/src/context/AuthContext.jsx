import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  // loading state for the initial check of authentication status
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    // This effect runs once on component mount to check if the user is already logged in
    // (e.g., due to an existing valid token in localStorage)
    const checkLoggedIn = async () => {
      setLoading(true);
      try {
        const user = await authService.getCurrentAdmin(); // Fetches admin data if token is valid
        if (user) {
          setAdminUser(user);
        } else {
          setAdminUser(null);
        }
      } catch (error) {
        console.error('Error checking login status during initial load:', error);
        setAdminUser(null); // Ensure user is null if token is invalid or API fails
        // authService.logout(); // Optionally, explicitly clear an invalid token
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []); // Empty dependency array means this effect runs only once on mount

  const login = async (credentials) => {
    try {
      const user = await authService.login(credentials);
      setAdminUser(user); // user object from backend upon successful login
      navigate('/dashboard'); 
      return user;
    } catch (error) {
      console.error('AuthContext login error:', error);
      setAdminUser(null); // Reset user on login failure
      throw error; 
    }
  };

  const logout = () => {
    authService.logout(); // Clears token from localStorage
    setAdminUser(null);
    navigate('/login'); 
  };

  const value = {
    adminUser,
    isAuthenticated: !!adminUser, // Boolean flag for authentication status
    login,
    logout,
    loadingAuth: loading // Expose loading state for consumers of the context
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Display a loading indicator while checking auth status, then render children */}
      {!loading ? children : <div className="app-global-loading">Authenticating... Please wait.</div>}
    </AuthContext.Provider>
  );
}; 
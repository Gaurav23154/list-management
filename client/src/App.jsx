import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
// import authService from './services/authService'; // No longer needed here directly
import { useAuth } from './context/AuthContext.jsx'; // Import useAuth

// Page Components
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// ProtectedRoute Component using AuthContext
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

function App() {
  const { isAuthenticated, loadingAuth } = useAuth();

  if (loadingAuth) {
    // ನೀವು ಅಪ್ಲಿಕೇಶನ್‌ನ ಮುಖ್ಯ ವಿಷಯವನ್ನು ನಿರೂಪಿಸಲು ಪ್ರಯತ್ನಿಸುವ ಮೊದಲು ಲೋಡ್ ಆಗುವುದನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು ಬಯಸಬಹುದು
    // ನೀವು ಇಲ್ಲಿ ಜಾಗತಿಕ ಲೋಡರ್ ಅನ್ನು ಹೊಂದಬಹುದು.
    return <div className="app-loading">Initializing Application...</div>;
  }

  return (
    // Router is now in main.jsx
    <div className="App">
      <header className="App-header">
        <h1>MERN App Dashboard (Vite)</h1>
      </header>
      <main>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            }
          />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

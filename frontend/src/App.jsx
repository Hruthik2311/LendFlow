import { useState, useEffect } from 'react';
import './App.css';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import './AppHeader.css';
import sessionManager from './utils/sessionManager';

function App() {
  const [user, setUser] = useState(() => {
    // Check if session is valid on app load
    if (sessionManager.isSessionValid()) {
      const session = sessionManager.getSession();
      return session.userData;
    }
    return null;
  });

  useEffect(() => {
    // Listen for session expiration events
    const handleSessionExpired = () => {
      setUser(null);
      alert('Your session has expired due to inactivity. Please log in again.');
    };

    window.addEventListener('sessionExpired', handleSessionExpired);

    // Check session validity periodically (every minute)
    const sessionCheckInterval = setInterval(() => {
      if (user && !sessionManager.isSessionValid()) {
        setUser(null);
        alert('Your session has expired. Please log in again.');
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
      clearInterval(sessionCheckInterval);
    };
  }, [user]);

  const handleLogin = (userData, token) => {
    setUser(userData);
    sessionManager.initSession(token, userData);
    // Keep the old localStorage for backward compatibility
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    sessionManager.clearSession();
  };

  if (!user) {
    return <Home onLogin={handleLogin} />;
  }

  // Authenticated view
  return (
    <div className="app-bg">
      <header className="app-header">
        <div className="user-info">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
            alt="User" 
            className="user-avatar"
          />
          <span className="user-name">
            Hi, {user.name} <span className="user-role">({user.role})</span>
          </span>
        </div>
        <span className="dashboard-title">
          {user.role} Dashboard
        </span>
        <button className="btn logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" style={{ marginRight: 6 }}></i>Logout
        </button>
      </header>
      <Dashboard user={user} />
    </div>
  );
}

export default App;

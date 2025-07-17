// Session Management Utility
class SessionManager {
  constructor() {
    this.INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.SESSION_DURATION = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
    this.inactivityTimer = null;
    this.setupActivityListeners();
  }

  // Initialize session when user logs in
  initSession(token, userData) {
    const sessionData = {
      token,
      userData,
      loginTime: Date.now(),
      lastActivity: Date.now()
    };
    
    localStorage.setItem('session', JSON.stringify(sessionData));
    this.resetInactivityTimer();
  }

  // Check if session is valid
  isSessionValid() {
    const session = this.getSession();
    if (!session) return false;

    const now = Date.now();
    const timeSinceLogin = now - session.loginTime;
    const timeSinceLastActivity = now - session.lastActivity;

    // Check if session has expired (2 days)
    if (timeSinceLogin > this.SESSION_DURATION) {
      this.clearSession();
      return false;
    }

    // Check if user has been inactive for too long (15 minutes)
    if (timeSinceLastActivity > this.INACTIVITY_TIMEOUT) {
      this.clearSession();
      return false;
    }

    // Update last activity time
    this.updateLastActivity();
    return true;
  }

  // Get current session data
  getSession() {
    try {
      const session = localStorage.getItem('session');
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error parsing session data:', error);
      return null;
    }
  }

  // Update last activity time
  updateLastActivity() {
    const session = this.getSession();
    if (session) {
      session.lastActivity = Date.now();
      localStorage.setItem('session', JSON.stringify(session));
    }
  }

  // Reset inactivity timer
  resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityTimeout();
    }, this.INACTIVITY_TIMEOUT);
  }

  // Handle inactivity timeout
  handleInactivityTimeout() {
    console.log('Session expired due to inactivity');
    this.clearSession();
    // Trigger logout by dispatching a custom event
    window.dispatchEvent(new CustomEvent('sessionExpired'));
  }

  // Clear session data
  clearSession() {
    localStorage.removeItem('session');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  // Setup activity listeners
  setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        if (this.getSession()) {
          this.updateLastActivity();
          this.resetInactivityTimer();
        }
      }, true);
    });
  }

  // Get remaining session time in minutes
  getRemainingSessionTime() {
    const session = this.getSession();
    if (!session) return 0;

    const now = Date.now();
    const timeSinceLogin = now - session.loginTime;
    const remainingTime = this.SESSION_DURATION - timeSinceLogin;
    
    return Math.max(0, Math.floor(remainingTime / (60 * 1000))); // Return minutes
  }

  // Get remaining inactivity time in minutes
  getRemainingInactivityTime() {
    const session = this.getSession();
    if (!session) return 0;

    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;
    const remainingTime = this.INACTIVITY_TIMEOUT - timeSinceLastActivity;
    
    return Math.max(0, Math.floor(remainingTime / (60 * 1000))); // Return minutes
  }
}

export default new SessionManager(); 
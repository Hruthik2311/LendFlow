// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  // Base configuration
  baseURL: API_BASE_URL,
  
  // Helper function to make API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status; // Add status for backward compatibility
      throw error;
    }
    
    return response.json();
  },

  // Auth endpoints
  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Customer endpoints
  async getCustomers() {
    return this.request('/api/customers');
  },

  async createCustomer(customerData) {
    return this.request('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  async updateCustomer(id, customerData) {
    return this.request(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  },

  async deleteCustomer(id) {
    return this.request(`/api/customers/${id}`, {
      method: 'DELETE',
    });
  },

  // Loan endpoints
  async getLoans() {
    return this.request('/api/loans');
  },

  // Legacy method names for backward compatibility
  async getAllLoans() {
    return this.request('/api/loans');
  },

  async getLoansByCustomer(customerId) {
    return this.request(`/api/loans/customer/${customerId}`);
  },

  async getLoansByAgent(agentId) {
    return this.request(`/api/loans/agent/${agentId}`);
  },

  async createLoan(loanData) {
    return this.request('/api/loans', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
  },

  async updateLoan(id, loanData) {
    return this.request(`/api/loans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(loanData),
    });
  },

  async updateLoanStatus(id, status) {
    return this.request(`/api/loans/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async assignAgent(loanId, agentId) {
    return this.request(`/api/loans/${loanId}/assign-agent`, {
      method: 'PATCH',
      body: JSON.stringify({ agentId }),
    });
  },

  async updateRecoveryStatus(loanId, recoveryStatus) {
    return this.request(`/api/loans/${loanId}/recovery-status`, {
      method: 'PATCH',
      body: JSON.stringify({ recoveryStatus }),
    });
  },

  async deleteLoan(id) {
    return this.request(`/api/loans/${id}`, {
      method: 'DELETE',
    });
  },

  // Payment endpoints
  async getPayments() {
    return this.request('/api/payments');
  },

  async getPaymentsByLoan(loanId) {
    return this.request(`/api/payments/loan/${loanId}`);
  },

  async createPayment(paymentData) {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  async updatePayment(id, paymentData) {
    return this.request(`/api/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  },

  async deletePayment(id) {
    return this.request(`/api/payments/${id}`, {
      method: 'DELETE',
    });
  },

  // Agent endpoints
  async getAgents() {
    return this.request('/api/agents');
  },

  // Legacy method name for backward compatibility
  async getAllAgents() {
    return this.request('/api/agents');
  },

  async createAgent(agentData) {
    return this.request('/api/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  },

  async updateAgent(id, agentData) {
    return this.request(`/api/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    });
  },

  async deleteAgent(id) {
    return this.request(`/api/agents/${id}`, {
      method: 'DELETE',
    });
  },

  // Report endpoints
  async getReports() {
    return this.request('/api/reports');
  },

  async getRecoveryReport() {
    return this.request('/api/reports/recovery');
  },

  async getRecoveredLoans() {
    return this.request('/api/reports/recovered');
  },

  async getOutstandingLoans() {
    return this.request('/api/reports/outstanding');
  },

  // Notification endpoints
  async getNotifications() {
    return this.request('/api/notifications');
  },

  async getUnreadCount() {
    return this.request('/api/notifications/unread-count');
  },

  async markAsRead(id) {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllAsRead() {
    return this.request('/api/notifications/mark-all-read', {
      method: 'PATCH',
    });
  },

  async clearNotifications() {
    return this.request('/api/notifications/clear', {
      method: 'DELETE',
    });
  },
};

// Error handling utility
export const handleApiError = (error, setError = null) => {
  console.error('API Error:', error);
  
  let errorMessage = 'An unexpected error occurred.';
  
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    errorMessage = 'Session expired. Please log in again.';
  } else if (error.message.includes('403')) {
    errorMessage = 'Access denied. You do not have permission to perform this action.';
  } else if (error.message.includes('404')) {
    errorMessage = 'Resource not found.';
  } else if (error.message.includes('500')) {
    errorMessage = 'Server error. Please try again later.';
  } else {
    errorMessage = error.message || 'An unexpected error occurred.';
  }
  
  // If setError function is provided, use it (for backward compatibility)
  if (setError && typeof setError === 'function') {
    setError(errorMessage);
  }
  
  return errorMessage;
};

// Success handling utility
export const handleApiSuccess = (message, setSuccess) => {
  if (setSuccess && typeof setSuccess === 'function') {
    setSuccess(message);
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
  }
};

// Token expiration handler
export const handleTokenExpiration = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Dispatch custom event for session expiration
  window.dispatchEvent(new CustomEvent('sessionExpired'));
  window.location.href = '/';
}; 
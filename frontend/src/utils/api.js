const API_BASE_URL = 'http://localhost:5000/api';

// API response handler
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle different error formats
    let errorMessage = 'An error occurred';
    
    if (data.error) {
      if (typeof data.error === 'string') {
        errorMessage = data.error;
      } else if (data.error.message) {
        errorMessage = data.error.message;
      } else if (data.error.validationErrors) {
        // Format validation errors nicely
        errorMessage = data.error.validationErrors.map(err => `${err.field}: ${err.message}`).join('\n');
      }
    } else if (data.message) {
      errorMessage = data.message;
    }
    
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
};

// API request wrapper
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

// API methods
export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  getProfile: () => apiRequest('/auth/profile'),
  
  updateProfile: (profileData) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
  
  // Loans
  getAllLoans: () => apiRequest('/loans'),
  
  getLoanById: (id) => apiRequest(`/loans/${id}`),
  
  createLoan: (loanData) => apiRequest('/loans', {
    method: 'POST',
    body: JSON.stringify(loanData),
  }),
  
  updateLoanStatus: (id, status) => apiRequest(`/loans/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  
  assignAgent: (loanId, agentId) => apiRequest(`/loans/${loanId}/assign-agent`, {
    method: 'PATCH',
    body: JSON.stringify({ agentId }),
  }),
  
  getLoansByCustomer: (customerId) => apiRequest(`/loans/customer/${customerId}`),
  
  getLoansByAgent: (agentId) => apiRequest(`/loans/agent/${agentId}`),
  
  updateRecoveryStatus: (loanId, recoveryStatus) => apiRequest(`/loans/${loanId}/recovery-status`, {
    method: 'PATCH',
    body: JSON.stringify({ recoveryStatus }),
  }),
  
  deleteLoan: (id) => apiRequest(`/loans/${id}`, {
    method: 'DELETE',
  }),
  
  // Payments
  getAllPayments: () => apiRequest('/payments'),
  
  createPayment: (paymentData) => apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),
  
  getPaymentsByLoan: (loanId) => apiRequest(`/payments/loan/${loanId}`),
  
  // Customers
  getAllCustomers: () => apiRequest('/customers'),
  
  createCustomer: (customerData) => apiRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  }),
  
  // Agents
  getAllAgents: () => apiRequest('/agents'),
  
  createAgent: (agentData) => apiRequest('/agents', {
    method: 'POST',
    body: JSON.stringify(agentData),
  }),
  
  // Reports
  getRecoveredLoans: () => apiRequest('/reports/recovered'),
  
  getOutstandingLoans: () => apiRequest('/reports/outstanding'),
  
  getRecoveryReport: () => apiRequest('/reports/recovery'),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  
  getUnreadCount: () => apiRequest('/notifications/unread-count'),
  
  markAsRead: (notificationId) => apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  }),
  
  markAllAsRead: () => apiRequest('/notifications/mark-all-read', {
    method: 'PATCH',
  }),
  
  clearNotifications: () => apiRequest('/notifications/clear', {
    method: 'DELETE',
  }),
};

// Error handler for components
export const handleApiError = (error, setError) => {
  console.error('API Error:', error);
  
  // For validation errors (400), show the specific error message
  if (error.status === 400 && error.data?.error?.validationErrors) {
    const validationMessage = error.data.error.validationErrors
      .map(err => `${err.field}: ${err.message}`)
      .join('\n');
    setError(validationMessage);
    return;
  }
  
  // For authentication errors (401), show the error message first
  if (error.status === 401) {
    setError(error.message || 'Authentication failed');
    return;
  }
  
  if (error.status === 403) {
    setError('Access denied. You do not have permission to perform this action.');
    return;
  }
  
  if (error.status === 404) {
    setError('Resource not found.');
    return;
  }
  
  if (error.status === 422) {
    setError('Validation error. Please check your input.');
    return;
  }
  
  if (error.status >= 500) {
    setError('Server error. Please try again later.');
    return;
  }
  
  setError(error.message || 'An unexpected error occurred.');
};

// Handle token expiration for authenticated users
export const handleTokenExpiration = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
};

// Success handler for components
export const handleApiSuccess = (message, setSuccess) => {
  setSuccess(message);
  // Auto-clear success message after 3 seconds
  setTimeout(() => setSuccess(''), 3000);
}; 
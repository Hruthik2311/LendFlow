import React, { useState } from 'react';
import { api, handleApiError, handleApiSuccess } from '../utils/api';

function Register({ onRegister, onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    setLoading(true);
    
    try {
      const payload = { ...form };
      if (form.role !== 'agent') delete payload.phone;
      
      // Register the user
      const registerData = await api.register(payload);
      
      // Automatically log in the user with the same credentials
      const loginData = await api.login({ 
        email: form.email, 
        password: form.password 
      });
      
      setSuccess('Registration successful! You have been automatically logged in.');
      
      // Call onLogin to set the user session
      onLogin && onLogin(loginData.data.user, loginData.data.token);
      
      // Clear form
      setForm({ name: '', email: '', password: '', role: 'customer', phone: '' });
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const formatErrorMessage = (errorMessage) => {
    if (errorMessage.includes('\n')) {
      return errorMessage.split('\n').map((line, index) => (
        <div key={index} style={{ marginBottom: '0.5rem' }}>
          {line}
        </div>
      ));
    }
    return errorMessage;
  };

  return (
    <>
      {/* Register Form Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ 
          fontWeight: 600, 
          color: '#d9822b', 
          marginBottom: '0.25rem',
          fontSize: '1.5rem'
        }}>
          Create Account
        </h2>
        <p style={{ 
          color: '#666', 
          fontSize: '0.9rem',
          margin: 0
        }}>
          Join our platform and start your loan journey
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.25rem', 
            fontWeight: 600, 
            color: '#333',
            fontSize: '0.9rem'
          }}>
            Full Name
          </label>
          <input 
            className="form-control" 
            name="name" 
            type="text" 
            placeholder="Enter your full name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 0.875rem',
              borderRadius: '8px',
              border: '2px solid #e9ecef',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
              background: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.25rem', 
            fontWeight: 600, 
            color: '#333',
            fontSize: '0.9rem'
          }}>
            Email Address
          </label>
          <input 
            className="form-control" 
            name="email" 
            type="email" 
            placeholder="Enter your email" 
            value={form.email} 
            onChange={handleChange} 
            required 
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 0.875rem',
              borderRadius: '8px',
              border: '2px solid #e9ecef',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
              background: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.25rem', 
            fontWeight: 600, 
            color: '#333',
            fontSize: '0.9rem'
          }}>
            Password
          </label>
          <input 
            className="form-control" 
            name="password" 
            type="password" 
            placeholder="Create a password (min 6 characters)" 
            value={form.password} 
            onChange={handleChange} 
            required 
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 0.875rem',
              borderRadius: '8px',
              border: '2px solid #e9ecef',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
              background: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.25rem', 
            fontWeight: 600, 
            color: '#333',
            fontSize: '0.9rem'
          }}>
            Account Type
          </label>
          <select 
            className="form-control" 
            name="role" 
            value={form.role} 
            onChange={handleChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 0.875rem',
              borderRadius: '8px',
              border: '2px solid #e9ecef',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
              background: '#fff',
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
          >
            <option value="customer">Customer</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {form.role === 'agent' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.25rem', 
              fontWeight: 600, 
              color: '#333',
              fontSize: '0.9rem'
            }}>
              Phone Number
            </label>
            <input 
              className="form-control" 
              name="phone" 
              type="tel" 
              placeholder="Enter your phone number" 
              value={form.phone} 
              onChange={handleChange} 
              required 
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 0.875rem',
                borderRadius: '8px',
                border: '2px solid #e9ecef',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                background: '#fff',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        <button 
          className="btn btn-primary w-100" 
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: 'none',
            background: '#d9822b',
            color: 'white',
            transition: 'all 0.3s ease',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.background = '#cc742b';
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.background = '#d9822b';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {loading ? (
            <>
              <i className="bi bi-arrow-clockwise" style={{ 
                marginRight: '0.5rem',
                animation: 'spin 1s linear infinite'
              }}></i>
              Creating Account...
            </>
          ) : (
            <>
              <i className="bi bi-person-plus" style={{ marginRight: '0.5rem' }}></i>
              Create Account
            </>
          )}
        </button>

        {error && (
          <div className="alert alert-danger mt-3" style={{ 
            whiteSpace: 'pre-line',
            background: '#ffe9e9',
            border: '1px solid #ff6a6a',
            borderRadius: '8px',
            padding: '0.75rem',
            marginTop: '1rem',
            color: '#721c24',
            fontSize: '0.9rem'
          }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '0.5rem' }}></i>
            {formatErrorMessage(error)}
          </div>
        )}

        {success && (
          <div className="alert alert-success mt-3" style={{ 
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '0.75rem',
            marginTop: '1rem',
            color: '#155724',
            fontSize: '0.9rem'
          }}>
            <i className="bi bi-check-circle-fill" style={{ marginRight: '0.5rem' }}></i>
            {success}
          </div>
        )}
      </form>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e9ecef'
      }}>
        <p style={{ 
          color: '#666', 
          fontSize: '0.9rem',
          margin: '0 0 0.75rem 0'
        }}>
          Already have an account?
        </p>
        <button 
          className="btn btn-outline-primary"
          onClick={onRegister}
          style={{
            background: 'transparent',
            border: '2px solid #396afc',
            color: '#396afc',
            fontWeight: 600,
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#396afc';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#396afc';
          }}
        >
          Sign In Instead
        </button>
      </div>
    </>
  );
}

export default Register;

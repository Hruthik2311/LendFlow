import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Register from './Register';
import { api, handleApiError } from '../utils/api';

function Home({ onLogin }) {
  const [showForm, setShowForm] = useState(false); // Controls if any form is shown
  const [showRegister, setShowRegister] = useState(false); // Controls which form to show
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await api.login({ email, password });
      setError('');
      onLogin(data.data.user, data.data.token);
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

  const handleLoginClick = () => {
    setShowForm(true);
    setShowRegister(false);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSignUpClick = () => {
    setShowForm(true);
    setShowRegister(true);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fa' }}>
      {/* Header with Navigation */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '1rem 3rem', 
        background: '#fff', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        borderBottom: '1px solid #e9ecef'
      }}>
        <h2 style={{ 
          fontWeight: 700, 
          letterSpacing: '1px', 
          color: '#222',
          margin: 0,
          fontSize: '1.5rem'
        }}>
          LendFlow
        </h2>
        
        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn"
            style={{
              background: showForm && !showRegister ? '#000000' : 'transparent',
              color: showForm && !showRegister ? '#ffffff' : '#000000',
              border: '2px solid #000000',
              fontWeight: 600,
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
            onClick={handleLoginClick}
            onMouseEnter={(e) => {
              if (!(showForm && !showRegister)) {
                e.target.style.background = '#000000';
                e.target.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!(showForm && !showRegister)) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#000000';
              }
            }}
          >
            Login
          </button>
          <button 
            className="btn"
            style={{
              background: showForm && showRegister ? '#d9822b' : 'transparent',
              color: showForm && showRegister ? '#ffffff' : '#d9822b',
              border: '2px solid #d9822b',
              fontWeight: 600,
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
            onClick={handleSignUpClick}
            onMouseEnter={(e) => {
              if (!(showForm && showRegister)) {
                e.target.style.background = '#d9822b';
                e.target.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!(showForm && showRegister)) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#d9822b';
              }
            }}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'center', 
        minHeight: '80vh', 
        background: '#f6f8fa',
        padding: '2rem',
        gap: '2rem'
      }}>
        {/* Left Section - Lottie Animation */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-start',
          paddingTop: '2rem'
        }}>
          <DotLottieReact
            src="https://lottie.host/78c055e7-95cd-4efd-947b-8e774940ab1b/ESmbq1TYQD.lottie"
            style={{ 
              width: '700px', 
              maxWidth: '100%',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
            loop
            autoplay
          />
        </div>

        {/* Right Section - Content and Form */}
        <div style={{ 
          flex: 1, 
          maxWidth: '500px', 
          padding: '0 2rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {!showForm ? (
            // Hero Content - shown by default
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ 
                fontWeight: 700, 
                fontSize: '2.8rem', 
                margin: '0 0 1rem 0',
                lineHeight: 1.1,
                color: '#222'
              }}>
                Smart Lending
                <br />
                <span style={{ color: '#d9822b' }}>Made Simple</span>
              </h1>
              
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#666', 
                marginBottom: '1.5rem',
                lineHeight: 1.6
              }}>
                LendFlow is a modern financial platform that connects you with trusted lending partners for quick, secure, and transparent loan solutions.
              </p>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.75rem', 
                marginBottom: '2.5rem',
                padding: '1.5rem',
                background: 'rgba(217, 130, 43, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(217, 130, 43, 0.1)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.75rem',
                  minHeight: '20px'
                }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#d9822b',
                    marginTop: '6px',
                    flexShrink: 0
                  }}></div>
                  <span style={{ 
                    fontSize: '0.95rem', 
                    color: '#555', 
                    fontWeight: 500,
                    lineHeight: '1.4',
                    flex: 1
                  }}>
                    Instant approval process with minimal documentation
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.75rem',
                  minHeight: '20px'
                }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#d9822b',
                    marginTop: '6px',
                    flexShrink: 0
                  }}></div>
                  <span style={{ 
                    fontSize: '0.95rem', 
                    color: '#555', 
                    fontWeight: 500,
                    lineHeight: '1.4',
                    flex: 1
                  }}>
                    Competitive interest rates and flexible repayment terms
                  </span>
                </div>
              </div>

              {/* Call to Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn"
                  style={{
                    background: '#000000',
                    color: '#ffffff',
                    border: '2px solid #000000',
                    fontWeight: 600,
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    fontSize: '1.1rem',
                    cursor: 'pointer'
                  }}
                  onClick={handleLoginClick}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#333';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#000000';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Apply Now
                </button>
                <button 
                  className="btn"
                  style={{
                    background: 'transparent',
                    color: '#d9822b',
                    border: '2px solid #d9822b',
                    fontWeight: 600,
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    fontSize: '1.1rem',
                    cursor: 'pointer'
                  }}
                  onClick={handleSignUpClick}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#d9822b';
                    e.target.style.color = '#ffffff';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#d9822b';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>
          ) : (
            // Form Section - shown when Login or Sign Up is clicked
            <div style={{ 
              background: '#fff', 
              borderRadius: '16px', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              padding: '2.5rem',
              border: '1px solid #e9ecef'
            }}>
              {showRegister ? (
                <Register onRegister={() => {
                  setShowForm(false);
                  setShowRegister(false);
                }} onLogin={onLogin} />
              ) : (
                <>
                  {/* Login Form Header */}
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ 
                      fontWeight: 600, 
                      color: '#396afc', 
                      marginBottom: '0.5rem',
                      fontSize: '1.5rem'
                    }}>
                      Welcome to LendFlow
                    </h2>
                    <p style={{ 
                      color: '#666', 
                      fontSize: '0.95rem',
                      margin: 0
                    }}>
                      Access your account to manage loans and track applications
                    </p>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: 600, 
                        color: '#333',
                        fontSize: '0.95rem'
                      }}>
                        Email Address
                      </label>
                      <input 
                        className="form-control" 
                        name="email" 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '0.875rem 1rem',
                          borderRadius: '8px',
                          border: '2px solid #e9ecef',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease',
                          background: '#fff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: 600, 
                        color: '#333',
                        fontSize: '0.95rem'
                      }}>
                        Password
                      </label>
                      <input 
                        className="form-control" 
                        name="password" 
                        type="password" 
                        placeholder="Enter your password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '0.875rem 1rem',
                          borderRadius: '8px',
                          border: '2px solid #e9ecef',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease',
                          background: '#fff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <button 
                      className="btn btn-primary w-100" 
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '1rem',
                        border: 'none',
                        background: '#000000',
                        color: 'white',
                        transition: 'all 0.3s ease',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.target.style.background = '#333';
                          e.target.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.target.style.background = '#000000';
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
                          Signing In...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right" style={{ marginRight: '0.5rem' }}></i>
                          Sign In to Dashboard
                        </>
                      )}
                    </button>

                    {error && (
                      <div className="alert alert-danger mt-3" style={{ 
                        whiteSpace: 'pre-line',
                        background: '#ffe9e9',
                        border: '1px solid #ff6a6a',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginTop: '1.5rem',
                        color: '#721c24',
                        fontSize: '0.95rem'
                      }}>
                        <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '0.5rem' }}></i>
                        {formatErrorMessage(error)}
                      </div>
                    )}
                  </form>

                  {/* Switch to Register */}
                  <div style={{ 
                    textAlign: 'center', 
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #e9ecef'
                  }}>
                    <p style={{ 
                      color: '#666', 
                      fontSize: '0.95rem',
                      margin: '0 0 1rem 0'
                    }}>
                      New to LendFlow?
                    </p>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => setShowRegister(true)}
                      style={{
                        background: 'transparent',
                        border: '2px solid #d9822b',
                        color: '#d9822b',
                        fontWeight: 600,
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        fontSize: '0.95rem',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#d9822b';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#d9822b';
                      }}
                    >
                      Create Account
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home; 
import React, { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { api, handleApiError, handleApiSuccess, handleTokenExpiration } from '../utils/api';

function Payments({ user }) {
  const [payments, setPayments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState({ loanId: '', amount: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Helper: Calculate EMI and balance
  const getLoanDetails = loanId => {
    const loan = loans.find(l => l.id === parseInt(loanId));
    if (!loan) return { emi: '', balance: '' };
    const principal = parseFloat(loan.amount);
    const rate = parseFloat(loan.interestRate) / 100 / 12;
    const n = parseInt(loan.termMonths);
    // EMI formula
    const emi = rate === 0 ? (principal / n) : (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    // Calculate total paid
    const paid = payments.filter(p => p.loanId === loan.id).reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalDue = emi * n;
    const balance = Math.max(0, totalDue - paid);
    
    // Consider fully paid if balance is less than ₹1
    const finalBalance = balance < 1 ? 0 : balance;
    
    return { emi: emi.toFixed(2), balance: finalBalance.toFixed(2) };
  };

  // Update amount when loan changes
  useEffect(() => {
    if (!form.loanId) return;
    const { emi } = getLoanDetails(form.loanId);
    setForm(f => ({ ...f, amount: emi }));
  }, [form.loanId, loans]);

  // Fetch loans for payment (role-based)
  useEffect(() => {
    if (!user) return;
    
    const fetchLoans = async () => {
      try {
        let data;
        if (user.role === 'customer') {
          data = await api.getLoansByCustomer(user.id);
        } else if (user.role === 'agent') {
          data = await api.getLoansByAgent(user.id);
        } else {
          data = await api.getAllLoans();
        }
        setLoans(Array.isArray(data.data.loans) ? data.data.loans : []);
      } catch (err) {
        if (err.status === 401) {
          handleTokenExpiration();
        } else {
          handleApiError(err, setError);
        }
        setLoans([]);
      }
    };
    
    fetchLoans();
  }, [user]);

  // Fetch payments for selected loan
  useEffect(() => {
    if (!form.loanId) return setPayments([]);
    
    const fetchPayments = async () => {
      try {
        const data = await api.getPaymentsByLoan(form.loanId);
        setPayments(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        if (err.status === 401) {
          handleTokenExpiration();
        } else {
          handleApiError(err, setError);
        }
        setPayments([]);
      }
    };
    
    fetchPayments();
  }, [form.loanId]);

  const handlePay = async e => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    setLoading(true);
    setShowSuccessAnimation(false);
    
    try {
      await api.createPayment({ loanId: form.loanId, amount: form.amount });
      
      // Show success animation
      setShowSuccessAnimation(true);
      setSuccess('Payment successful!');
      
      // Refresh payment history
      const data = await api.getPaymentsByLoan(form.loanId);
      setPayments(Array.isArray(data.data) ? data.data : []);
      
      // Hide animation after 3 seconds
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setSuccess('');
      }, 3000);
    } catch (err) {
      if (err.status === 401) {
        handleTokenExpiration();
      } else {
        handleApiError(err, setError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Payment Form Section */}
      <div style={{ 
        background: '#fff', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        overflow: 'hidden', 
        border: '1px solid #e9ecef',
        marginBottom: '2rem'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '1.5rem', 
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '1.5rem' }}>
            💰 Make Payment
          </h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
            Select a loan and make your EMI payment
          </p>
        </div>

        {/* Form Content */}
        <div style={{ padding: '2rem' }}>
          <form onSubmit={handlePay} style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '1.5rem' 
          }}>
            <select 
              className="form-control" 
              style={{ 
                minWidth: 200, 
                fontSize: '1rem', 
                flex: 1,
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                border: '2px solid #e9ecef',
                transition: 'border-color 0.3s ease'
              }} 
              name="loanId" 
              value={form.loanId} 
              onChange={handleFormChange} 
              required
            >
              <option value="" disabled>Select Loan</option>
              {loans.filter(l => l.status === 'approved').map(l => (
                <option key={l.id} value={l.id}>Loan #{l.id} - ₹{l.amount}</option>
              ))}
            </select>
            <input 
              className="form-control" 
              style={{ 
                minWidth: 200, 
                fontSize: '1rem', 
                flex: 1,
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                border: '2px solid #e9ecef',
                transition: 'border-color 0.3s ease',
                background: form.loanId && getLoanDetails(form.loanId).balance === "0.00" ? '#f8f9fa' : '#fff'
              }} 
              name="amount" 
              placeholder="Amount" 
              value={form.amount} 
              onChange={handleFormChange} 
              required 
              disabled={form.loanId && getLoanDetails(form.loanId).balance === "0.00"} 
            />
            <button 
              className="btn btn-success" 
              style={{ 
                fontSize: '1rem', 
                padding: '0.875rem 2rem', 
                minWidth: 140,
                borderRadius: '8px',
                fontWeight: 600,
                border: '2px solid #28a745',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(40, 167, 69, 0.2)',
                opacity: (form.loanId && getLoanDetails(form.loanId).balance === "0.00") || loading ? 0.6 : 1, 
                cursor: (form.loanId && getLoanDetails(form.loanId).balance === "0.00") || loading ? 'not-allowed' : 'pointer' 
              }} 
              type="submit" 
              disabled={(form.loanId && getLoanDetails(form.loanId).balance === "0.00") || loading}
              onMouseEnter={(e) => {
                if (!(form.loanId && getLoanDetails(form.loanId).balance === "0.00") && !loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(form.loanId && getLoanDetails(form.loanId).balance === "0.00") && !loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.2)';
                }
              }}
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-clockwise" style={{ 
                    marginRight: '0.5rem',
                    animation: 'spin 1s linear infinite'
                  }}></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-credit-card" style={{ marginRight: '0.5rem' }}></i>
                  Pay EMI
                </>
              )}
            </button>
          </form>
          
          {/* Loan Details */}
          {form.loanId && (
            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '1rem 1.5rem',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '12px',
              border: '1px solid #dee2e6',
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '2rem', 
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <div style={{ 
                  background: '#fff', 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderLeft: '4px solid #28a745'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>EMI Amount</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#28a745' }}>₹{getLoanDetails(form.loanId).emi}</div>
                </div>
                <div style={{ 
                  background: '#fff', 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderLeft: '4px solid #ffc107'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Remaining Balance</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffc107' }}>₹{getLoanDetails(form.loanId).balance}</div>
                </div>
              </div>
            </div>
          )}

          {/* Fully Paid Status */}
          {form.loanId && getLoanDetails(form.loanId).balance === "0.00" && (
            <div style={{ 
              marginBottom: '1.5rem', 
              textAlign: 'center',
              padding: '1rem'
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '25px',
                fontWeight: 600,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <i className="bi bi-check-circle-fill"></i>
                Fully Paid
              </div>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div style={{ 
              marginTop: '1rem',
              padding: '1rem 1.5rem',
              background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
              color: '#721c24',
              borderRadius: '8px',
              border: '1px solid #f5c6cb',
              fontSize: '0.95rem',
              fontWeight: 500
            }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '0.5rem' }}></i>
              {error}
            </div>
          )}
          {success && (
            <div style={{ 
              marginTop: '1rem',
              padding: '1rem 1.5rem',
              background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
              color: '#155724',
              borderRadius: '8px',
              border: '1px solid #c3e6cb',
              fontSize: '0.95rem',
              fontWeight: 500
            }}>
              <i className="bi bi-check-circle-fill" style={{ marginRight: '0.5rem' }}></i>
              {success}
            </div>
          )}
        </div>
      </div>

      {/* Payment Success Animation */}
      {showSuccessAnimation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <DotLottieReact
              src="https://lottie.host/9701ac69-f35b-46ed-9f46-e58f84ffa77c/QUVXQRcA8Y.lottie"
              style={{
                width: '200px',
                height: '200px',
                margin: '0 auto'
              }}
              loop={false}
              autoplay
            />
            <div style={{
              marginTop: '1rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#28a745'
            }}>
              Payment Successful!
            </div>
          </div>
        </div>
      )}

      {/* Payment History Section */}
      <div style={{ 
        background: '#fff', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        overflow: 'hidden', 
        border: '1px solid #e9ecef'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
          color: 'white', 
          padding: '1.5rem', 
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '1.5rem' }}>
            📋 Payment History
          </h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
            Track all your payment transactions ({payments.length} payments)
          </p>
        </div>

        {/* Table Content */}
        <div style={{ padding: '0', overflowX: 'auto' }}>
          {payments.length > 0 ? (
            <table className="table table-hover mb-0" style={{ margin: 0, minWidth: '100%', tableLayout: 'fixed' }}>
              <thead style={{ 
                background: '#f8f9fa', 
                borderBottom: '2px solid #dee2e6'
              }}>
                <tr>
                  <th style={{ 
                    padding: '1rem', 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    width: '20%'
                  }}>Payment ID</th>
                  <th style={{ 
                    padding: '1rem', 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    width: '20%'
                  }}>Loan ID</th>
                  <th style={{ 
                    padding: '1rem', 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'right',
                    width: '30%'
                  }}>Amount</th>
                  <th style={{ 
                    padding: '1rem', 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    width: '30%'
                  }}>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {payments
                  .slice() // create a copy
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // sort by date descending
                  .map((p, index) => (
                    <tr key={p.id} style={{ 
                      borderBottom: index < payments.length - 1 ? '1px solid #f8f9fa' : 'none'
                    }}>
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ 
                          background: '#28a745', 
                          color: 'white', 
                          width: '35px', 
                          height: '35px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '0.8rem', 
                          fontWeight: 600,
                          margin: '0 auto'
                        }}>
                          #{p.id}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>
                          Loan #{p.loanId}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ 
                          fontWeight: 700, 
                          color: '#28a745', 
                          fontSize: '1rem'
                        }}>
                          ₹{p.amount}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: '#666', 
                          fontWeight: 500
                        }}>
                          {new Date(p.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>💳</div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontWeight: 600 }}>No Payments Yet</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Select a loan above to make your first payment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Payments;

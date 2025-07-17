import React, { useEffect, useState } from 'react';
import Agents from './Agents';
import { api, handleApiError, handleApiSuccess, handleTokenExpiration } from '../utils/api';

function Loans({ user }) {
  const [loans, setLoans] = useState([]);
  const [paymentsByLoan, setPaymentsByLoan] = useState({});
  const [editingRecovery, setEditingRecovery] = useState({}); // { [loanId]: true/false }
  const [selectedRecovery, setSelectedRecovery] = useState({}); // { [loanId]: value }
  const [error, setError] = useState('');
  const [form, setForm] = useState({ amount: '', interestRate: '', termMonths: '' });
  const [success, setSuccess] = useState('');
  const [assignAgentId, setAssignAgentId] = useState({});

  // Calculate interest rate based on amount and term
  const calculateInterestRate = (amount, term) => {
    if (!amount || !term) return '';
    const amt = parseFloat(amount);
    const t = parseInt(term);
    let baseRate = 2.5;
    if (amt >= 10000) baseRate -= 0.5;
    if (t >= 12) baseRate -= 0.3;
    if (amt >= 20000) baseRate -= 0.3;
    // Add a small random variation for realism
    const random = Math.random() * 0.4;
    let rate = baseRate + random;
    rate = Math.max(1.5, Math.min(rate, 3.5));
    return rate.toFixed(2);
  };

  // Update interest rate when amount or term changes
  const handleFormChange = e => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };
    if (name === 'amount' || name === 'termMonths') {
      newForm.interestRate = calculateInterestRate(
        name === 'amount' ? value : form.amount,
        name === 'termMonths' ? value : form.termMonths
      );
    }
    setForm(newForm);
  };

  // Fetch loans for current user
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

  useEffect(() => {
    // Fetch payments for each loan
    if (!loans.length) return;
    
    const fetchPayments = async () => {
      const paymentsMap = {};
      for (const loan of loans) {
        try {
          const data = await api.getPaymentsByLoan(loan.id);
          paymentsMap[loan.id] = Array.isArray(data.data) ? data.data : [];
        } catch (err) {
          if (err.status === 401) {
            handleTokenExpiration();
            return;
          }
          paymentsMap[loan.id] = [];
        }
      }
      setPaymentsByLoan(paymentsMap);
    };
    
    fetchPayments();
  }, [loans]);

  // Customer loan application
  const handleApply = async e => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    
    try {
      // Convert form data to correct data types
      const loanData = {
        customerId: user.id,
        amount: parseFloat(form.amount),
        interestRate: parseFloat(form.interestRate),
        termMonths: parseInt(form.termMonths)
      };
      
      const data = await api.createLoan(loanData);
      handleApiSuccess('Loan application submitted!', setSuccess);
      setForm({ amount: '', interestRate: '', termMonths: '' });
      
      // Refresh loans list
      const loansData = await api.getLoansByCustomer(user.id);
      setLoans(Array.isArray(loansData.data.loans) ? loansData.data.loans : []);
    } catch (err) {
      if (err.status === 401) {
        handleTokenExpiration();
      } else {
        handleApiError(err, setError);
      }
    }
  };

  // Approve/Reject loan
  const handleStatus = async (id, status) => {
    setError(''); 
    setSuccess('');
    
    try {
      await api.updateLoanStatus(id, status);
      handleApiSuccess('Loan status updated!', setSuccess);
      
      // Refresh loans list
      let loansData;
      if (user.role === 'customer') {
        loansData = await api.getLoansByCustomer(user.id);
      } else if (user.role === 'agent') {
        loansData = await api.getLoansByAgent(user.id);
      } else {
        loansData = await api.getAllLoans();
      }
      setLoans(Array.isArray(loansData.data.loans) ? loansData.data.loans : []);
    } catch (err) {
      if (err.status === 401) {
        handleTokenExpiration();
      } else {
        handleApiError(err, setError);
      }
    }
  };

  // Assign agent
  const handleAssignAgent = async (id, agentId) => {
    setError(''); 
    setSuccess('');
    
    console.log('Assigning agent:', { loanId: id, agentId: agentId }); // Debug log
    
    try {
      const response = await api.assignAgent(id, agentId);
      console.log('Agent assignment response:', response); // Debug log
      handleApiSuccess('Agent assigned!', setSuccess);
      
      // Refresh loans list
      const loansData = await api.getAllLoans();
      console.log('Refreshed loans data:', loansData); // Debug log
      setLoans(Array.isArray(loansData.data.loans) ? loansData.data.loans : []);
    } catch (err) {
      console.error('Agent assignment error:', err); // Debug log
      if (err.status === 401) {
        handleTokenExpiration();
      } else {
        handleApiError(err, setError);
      }
    }
  };

  // Agent: Update recovery status
  const handleRecoveryStatus = async (id, recoveryStatus) => {
    setError(''); 
    setSuccess('');
    
    try {
      await api.updateRecoveryStatus(id, recoveryStatus);
      handleApiSuccess('Recovery status updated!', setSuccess);
    } catch (err) {
      if (err.status === 401) {
        handleTokenExpiration();
      } else {
        handleApiError(err, setError);
      }
    }
  };

  const handleRecoverySelect = (loanId, value) => {
    setSelectedRecovery(prev => ({ ...prev, [loanId]: value }));
    setEditingRecovery(prev => ({ ...prev, [loanId]: true }));
  };

  const handleRecoverySave = async (loanId) => {
    try {
      console.log('Saving recovery status:', { loanId, recoveryStatus: selectedRecovery[loanId], userRole: user.role });
      await api.updateRecoveryStatus(loanId, selectedRecovery[loanId]);
      
      // Update the loan in the local state
      setLoans(loans.map(loan => 
        loan.id === loanId 
          ? { ...loan, recoveryStatus: selectedRecovery[loanId] }
          : loan
      ));
      
      // Clear the editing state and selected recovery for this loan
      setEditingRecovery(prev => ({ ...prev, [loanId]: false }));
      setSelectedRecovery(prev => ({ ...prev, [loanId]: '' }));
      handleApiSuccess('Recovery status updated successfully', setSuccess);
    } catch (err) {
      console.error('Error updating recovery status:', err);
      if (err.status === 401) {
        handleTokenExpiration();
      } else {
        handleApiError(err, setError);
      }
    }
  };

  const handleRecoveryEdit = (loanId) => {
    setEditingRecovery(prev => ({ ...prev, [loanId]: true }));
  };

  // Delete loan (only for rejected loans)
  const handleDeleteLoan = async (id) => {
    setError(''); 
    setSuccess('');
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this rejected loan? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.deleteLoan(id);
      handleApiSuccess('Loan deleted successfully!', setSuccess);
      
      // Refresh loans list
      let loansData;
      if (user.role === 'customer') {
        loansData = await api.getLoansByCustomer(user.id);
      } else if (user.role === 'agent') {
        loansData = await api.getLoansByAgent(user.id);
      } else {
        loansData = await api.getAllLoans();
      }
      setLoans(Array.isArray(loansData.data.loans) ? loansData.data.loans : []);
    } catch (err) {
      if (err.status === 401) {
        handleTokenExpiration();
      } else {
        handleApiError(err, setError);
      }
    }
  };

  // Helper: Calculate EMI and balance for a loan (copied from Payments.jsx)
  function getLoanDetails(loan, payments) {
    if (!loan) return { emi: '', balance: '' };
    const principal = parseFloat(loan.amount);
    const rate = parseFloat(loan.interestRate) / 100 / 12;
    const n = parseInt(loan.termMonths);
    const emi = rate === 0 ? (principal / n) : (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    // Calculate total paid
    const paid = payments && payments.length ? payments.reduce((sum, p) => sum + parseFloat(p.amount), 0) : 0;
    const totalDue = emi * n;
    const balance = Math.max(0, totalDue - paid);
    return { emi: emi.toFixed(2), balance: balance.toFixed(2) };
  }

  // Helper: Format recovery status text
  const formatRecoveryStatus = (status) => {
    if (!status) return '-';
    const statusMap = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'recovered': 'Recovered'
    };
    return statusMap[status] || status;
  };

  // Helper: Calculate payment progress (payments made vs total term)
  const getPaymentProgress = (loan) => {
    const payments = paymentsByLoan[loan.id] || [];
    const paymentsMade = payments.length;
    const totalTerm = loan.termMonths;
    const progressPercentage = totalTerm > 0 ? (paymentsMade / totalTerm) * 100 : 0;
    return {
      text: `${paymentsMade}/${totalTerm}`,
      percentage: progressPercentage,
      isGood: progressPercentage >= 50 // Green if 50% or more payments done
    };
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Agent view: show only relevant fields */}
      {user.role === 'agent' ? (
        <div style={{ 
          background: '#fff', 
          borderRadius: '16px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          overflow: 'hidden', 
          border: '1px solid #e9ecef'
        }}>
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)', 
            color: 'white', 
            padding: '1.5rem', 
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '1.5rem' }}>
              🔍 Recovery Management
            </h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
              Manage recovery status for your assigned loans
            </p>
          </div>

          {/* Table Content */}
          <div style={{ padding: '0', overflowX: 'auto' }}>
            {loans.length > 0 ? (
              <table className="table table-hover mb-0" style={{ margin: 0, minWidth: '100%', tableLayout: 'fixed' }}>
                <thead style={{ 
                  background: '#f8f9fa', 
                  borderBottom: '2px solid #dee2e6'
                }}>
                  <tr>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '7%'
                    }}>Loan ID</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '10%'
                    }}>Customer</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'right',
                      width: '9%'
                    }}>Amount</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'center',
                      width: '7%'
                    }}>Interest</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'center',
                      width: '7%'
                    }}>Term</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'center',
                      width: '9%'
                    }}>Status</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'center',
                      width: '10%'
                    }}>Recovery</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'center',
                      width: '10%'
                    }}>Progress</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'right',
                      width: '11%'
                    }}>Balance</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'center',
                      width: '20%'
                    }}>Update Recovery</th>
              </tr>
            </thead>
            <tbody>
              {[...loans].sort((a, b) => {
                if (a.status === 'rejected' && b.status !== 'rejected') return 1;
                if (a.status !== 'rejected' && b.status === 'rejected') return -1;
                return 0;
                  }).map((loan, index) => (
                    <tr key={loan.id} style={{ 
                      borderBottom: index < loans.length - 1 ? '1px solid #f8f9fa' : 'none'
                    }}>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>
                        <div style={{ 
                          background: '#ffc107', 
                          color: 'white', 
                          width: '30px', 
                          height: '30px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '0.7rem', 
                          fontWeight: 600,
                          margin: '0 auto'
                        }}>
                          #{loan.id}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>
                          {loan.Customer ? loan.Customer.name : '-'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>
                          ₹{loan.amount}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#666', 
                          fontWeight: 500
                        }}>
                          {loan.interestRate}%
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#666', 
                          fontWeight: 500
                        }}>
                          {loan.termMonths}m
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 500,
                          padding: '0.15rem 0.4rem',
                          borderRadius: '8px',
                          display: 'inline-block',
                          background: loan.status === 'approved' ? '#d4edda' : 
                                     loan.status === 'pending' ? '#fff3cd' : 
                                     loan.status === 'rejected' ? '#f8d7da' : '#e2e3e5',
                          color: loan.status === 'approved' ? '#155724' : 
                                loan.status === 'pending' ? '#856404' : 
                                loan.status === 'rejected' ? '#721c24' : '#6c757d',
                          whiteSpace: 'nowrap'
                        }}>
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 500,
                          padding: '0.15rem 0.4rem',
                          borderRadius: '8px',
                          display: 'inline-block',
                          background: loan.recoveryStatus === 'recovered' ? '#d4edda' : 
                                     loan.recoveryStatus === 'pending' ? '#fff3cd' : 
                                     loan.recoveryStatus === 'in_progress' ? '#d1ecf1' : '#e2e3e5',
                          color: loan.recoveryStatus === 'recovered' ? '#155724' : 
                                loan.recoveryStatus === 'pending' ? '#856404' : 
                                loan.recoveryStatus === 'in_progress' ? '#0c5460' : '#6c757d',
                          whiteSpace: 'nowrap'
                        }}>
                          {formatRecoveryStatus(loan.recoveryStatus)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 500,
                          padding: '0.15rem 0.4rem',
                          borderRadius: '8px',
                          display: 'inline-block',
                          background: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          whiteSpace: 'nowrap'
                        }}>
                          <div style={{ 
                            fontSize: '0.65rem', 
                            fontWeight: 600,
                            marginBottom: '0.2rem',
                            color: '#495057'
                          }}>
                            {getPaymentProgress(loan).text}
                          </div>
                          <div style={{ 
                            width: '100%', 
                            minWidth: '80px',
                            height: '6px', 
                            background: '#e9ecef', 
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${Math.min(getPaymentProgress(loan).percentage, 100)}%`,
                              height: '100%',
                              background: getPaymentProgress(loan).isGood ? '#28a745' : '#dc3545',
                              borderRadius: '3px',
                              transition: 'width 0.3s ease'
                            }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ 
                          fontWeight: 700, 
                          fontSize: '0.85rem',
                          color: getLoanDetails(loan, paymentsByLoan[loan.id] || []).balance === "0.00" ? '#28a745' : '#dc3545'
                        }}>
                          {getLoanDetails(loan, paymentsByLoan[loan.id] || []).balance === "0.00" ? (
                            <span style={{ fontSize: '0.7rem' }}>Fully Paid</span>
                          ) : (
                            `₹${getLoanDetails(loan, paymentsByLoan[loan.id] || []).balance}`
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                    {loan.agentId === user.id && (
                      editingRecovery[loan.id] ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <select 
                                className="form-control form-control-sm" 
                            value={selectedRecovery[loan.id] || ''}
                            onChange={e => handleRecoverySelect(loan.id, e.target.value)}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '0.2rem 0.4rem',
                                  borderRadius: '4px'
                                }}
                          >
                            <option value="">Select Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="recovered">Recovered</option>
                          </select>
                          {selectedRecovery[loan.id] && (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleRecoverySave(loan.id)}
                                  style={{
                                    fontSize: '0.7rem',
                                    padding: '0.2rem 0.4rem',
                                    borderRadius: '4px'
                                  }}
                            >
                              Save
                            </button>
                          )}
                        </div>
                      ) : (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleRecoveryEdit(loan.id)}
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '4px'
                              }}
                        >
                          Edit
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            ) : (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🔍</div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontWeight: 600 }}>No Assigned Loans</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  No loans have been assigned to you for recovery yet
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // ...existing customer/admin view...
        <>
          {/* Customer Loan Application Section */}
          {user.role === 'customer' && (
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
                  📝 Apply for Loan
                </h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
                  Submit your loan application with automatic interest rate calculation
                </p>
              </div>

              {/* Form Content */}
              <div style={{ padding: '2rem' }}>
                <form onSubmit={handleApply} style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '1rem', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '1.5rem' 
                }}>
                  <input 
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
                    name="amount" 
                    placeholder="Loan Amount" 
                    value={form.amount} 
                    onChange={handleFormChange} 
                    required 
                  />
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
                    name="termMonths" 
                    value={form.termMonths} 
                    onChange={handleFormChange} 
                    required
                  >
                <option value="" disabled>Term (months)</option>
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="9">9 months</option>
                    <option value="12">12 months</option>
                    <option value="15">15 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
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
                      background: '#f8f9fa',
                      color: '#396afc',
                      fontWeight: 600,
                      cursor: 'not-allowed'
                    }} 
                    name="interestRate" 
                    placeholder="Interest Rate (%)" 
                    value={form.interestRate} 
                    readOnly 
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
                      boxShadow: '0 2px 8px rgba(40, 167, 69, 0.2)'
                    }} 
                    type="submit"
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.2)';
                    }}
                  >
                    <i className="bi bi-send" style={{ marginRight: '0.5rem' }}></i>
                    Apply for Loan
                  </button>
            </form>

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
          )}
          {/* Loans Table Section */}
      <div style={{ 
        background: '#fff', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        overflow: 'hidden', 
        border: '1px solid #e9ecef'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)', 
          color: 'white', 
          padding: '1.5rem', 
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '1.5rem' }}>
            📊 Loan Overview
          </h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
            {user.role === 'customer' ? 'Your loan applications and status' : 
             user.role === 'agent' ? 'Your assigned loans for recovery' : 
             'All loan applications and management'}
          </p>
        </div>

        {/* Table Content */}
        <div style={{ padding: '0', overflowX: 'auto' }}>
          {loans.length > 0 ? (
            <table className="table table-hover mb-0" style={{ margin: 0, minWidth: '100%', tableLayout: 'fixed' }}>
              <thead style={{ 
                background: '#f8f9fa', 
                borderBottom: '2px solid #dee2e6'
              }}>
                <tr>
                  <th style={{ 
                    padding: '0.75rem', 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    width: '7%'
                  }}>Loan ID</th>
                  {(user.role === 'admin' || user.role === 'agent') && (
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '10%'
                    }}>Customer</th>
                  )}
                  <th style={{ 
                    padding: '0.75rem', 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'right',
                    width: '9%'
                  }}>Amount</th>
                  <th style={{ 
                    padding: '0.75rem', 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    width: '7%'
                  }}>Interest</th>
                  <th style={{ 
                    padding: '0.75rem', 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    width: '7%'
                  }}>Term</th>
                  <th style={{ 
                    padding: '0.75rem', 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    width: '9%'
                  }}>Status</th>
                  {(user.role === 'admin' || user.role === 'agent') && (
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'center',
                      width: '10%'
                    }}>Agent</th>
                  )}
                  <th style={{ 
                    padding: '0.75rem', 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    width: '10%'
                  }}>Recovery</th>
                  <th style={{ 
                    padding: '0.75rem', 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    width: '10%'
                  }}>Progress</th>
                  <th style={{ 
                    padding: '0.75rem', 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'right',
                    width: '15%'
                  }}>Balance</th>
                  <th style={{ 
                    padding: '0.75rem', 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    width: '10%'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
              {[...loans].sort((a, b) => {
                if (a.status === 'rejected' && b.status !== 'rejected') return 1;
                if (a.status !== 'rejected' && b.status === 'rejected') return -1;
                return 0;
                }).map((loan, index) => (
                  <tr key={loan.id} style={{ 
                    borderBottom: index < loans.length - 1 ? '1px solid #f8f9fa' : 'none'
                  }}>
                    <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>
                      <div style={{ 
                        background: '#17a2b8', 
                        color: 'white', 
                        width: '30px', 
                        height: '30px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '0.7rem', 
                        fontWeight: 600,
                        margin: '0 auto'
                      }}>
                        #{loan.id}
                      </div>
                    </td>
                    {(user.role === 'admin' || user.role === 'agent') && (
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>
                          {loan.Customer ? loan.Customer.name : '-'}
                        </div>
                      </td>
                    )}
                    <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>
                        ₹{loan.amount}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#666', 
                        fontWeight: 500
                      }}>
                        {loan.interestRate}%
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#666', 
                        fontWeight: 500
                      }}>
                        {loan.termMonths}m
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 500,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '8px',
                        display: 'inline-block',
                        background: loan.status === 'approved' ? '#d4edda' : 
                                   loan.status === 'pending' ? '#fff3cd' : 
                                   loan.status === 'rejected' ? '#f8d7da' : '#e2e3e5',
                        color: loan.status === 'approved' ? '#155724' : 
                              loan.status === 'pending' ? '#856404' : 
                              loan.status === 'rejected' ? '#721c24' : '#6c757d',
                        whiteSpace: 'nowrap'
                      }}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </div>
                    </td>
                    {(user.role === 'admin' || user.role === 'agent') && (
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>
                          {loan.Agent ? loan.Agent.name : '-'}
                        </div>
                        {/* Show assign agent select for approved loans without agent */}
                        {user.role === 'admin' && loan.status === 'approved' && !loan.Agent && (
                          <div style={{ marginTop: '0.25rem' }}>
                            <Agents onSelect={agentId => setAssignAgentId(prev => ({ ...prev, [loan.id]: agentId }))} />
                            <button 
                              className="btn btn-primary btn-sm mt-1" 
                              disabled={!assignAgentId[loan.id]} 
                              onClick={() => handleAssignAgent(loan.id, assignAgentId[loan.id])}
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '4px'
                              }}
                            >
                              Assign
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                    <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 500,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '8px',
                        display: 'inline-block',
                        background: loan.recoveryStatus === 'recovered' ? '#d4edda' : 
                                   loan.recoveryStatus === 'pending' ? '#fff3cd' : 
                                   loan.recoveryStatus === 'in_progress' ? '#d1ecf1' : '#e2e3e5',
                        color: loan.recoveryStatus === 'recovered' ? '#155724' : 
                              loan.recoveryStatus === 'pending' ? '#856404' : 
                              loan.recoveryStatus === 'in_progress' ? '#0c5460' : '#6c757d',
                        whiteSpace: 'nowrap'
                      }}>
                        {formatRecoveryStatus(loan.recoveryStatus)}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 500,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '8px',
                        display: 'inline-block',
                        background: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        whiteSpace: 'nowrap'
                      }}>
                        <div style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 600,
                          marginBottom: '0.2rem',
                          color: '#495057'
                        }}>
                          {getPaymentProgress(loan).text}
                        </div>
                        <div style={{ 
                          width: '100%', 
                          minWidth: '80px',
                          height: '4px', 
                          background: '#e9ecef', 
                          borderRadius: '2px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${Math.min(getPaymentProgress(loan).percentage, 100)}%`,
                            height: '100%',
                            background: getPaymentProgress(loan).isGood ? '#28a745' : '#dc3545',
                            borderRadius: '2px',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ 
                        fontWeight: 700, 
                        fontSize: '0.85rem',
                        color: getLoanDetails(loan, paymentsByLoan[loan.id] || []).balance === "0.00" ? '#28a745' : '#dc3545'
                      }}>
                        {getLoanDetails(loan, paymentsByLoan[loan.id] || []).balance === "0.00" ? (
                          <span style={{ fontSize: '0.7rem' }}>Fully Paid</span>
                        ) : (
                          `₹${getLoanDetails(loan, paymentsByLoan[loan.id] || []).balance}`
                        )}
                      </div>
                    </td>
                    {(user.role === 'admin' || user.role === 'agent') && (
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {/* Approve/Reject buttons for pending loans */}
                          {loan.status === 'pending' && user.role !== 'agent' && (
                            <>
                                  <button 
                                    className="btn btn-success btn-sm"
                                onClick={() => handleStatus(loan.id, 'approved')}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '0.2rem 0.4rem',
                                  borderRadius: '4px'
                                }}
                              >
                                Approve
                                  </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleStatus(loan.id, 'rejected')}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '0.2rem 0.4rem',
                                  borderRadius: '4px'
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {/* Recovery status update */}
                          {(user.role === 'admin' || (user.role === 'agent' && loan.agentId === user.id)) && (
                            <div>
                            {editingRecovery[loan.id] ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <select 
                                    className="form-control form-control-sm" 
                                  value={selectedRecovery[loan.id] || ''}
                                  onChange={e => handleRecoverySelect(loan.id, e.target.value)}
                                    style={{
                                      fontSize: '0.7rem',
                                      padding: '0.2rem 0.4rem',
                                      borderRadius: '4px'
                                    }}
                                >
                                  <option value="">Select Status</option>
                                  <option value="pending">Pending</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="recovered">Recovered</option>
                                </select>
                                {selectedRecovery[loan.id] && (
                                  <button 
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleRecoverySave(loan.id)}
                                      style={{
                                        fontSize: '0.7rem',
                                        padding: '0.2rem 0.4rem',
                                        borderRadius: '4px'
                                      }}
                                  >
                                    Save
                                  </button>
                                )}
                              </div>
                            ) : (
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => handleRecoveryEdit(loan.id)}
                                  style={{
                                    fontSize: '0.7rem',
                                    padding: '0.2rem 0.4rem',
                                    borderRadius: '4px'
                                  }}
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                        
                        {/* Delete button for rejected loans */}
                        {loan.status === 'rejected' && (
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteLoan(loan.id)}
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.4rem',
                              borderRadius: '4px'
                            }}
                          >
                            Delete
                          </button>
                        )}
                        </div>
                      </td>
                    )}
                    {user.role === 'customer' && loan.status === 'rejected' && (
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteLoan(loan.id)}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📊</div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontWeight: 600 }}>
                {user.role === 'customer' ? 'No Loans Yet' : 'No Loans Found'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {user.role === 'customer' ? 'Apply for your first loan above' : 
                 user.role === 'agent' ? 'No loans have been assigned to you yet' : 
                 'No loan applications in the system'}
              </p>
            </div>
          )}
        </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Loans;

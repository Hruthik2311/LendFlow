import React, { useEffect, useState } from 'react';
import { api, handleApiError, handleTokenExpiration } from '../utils/api';

function Reports({ user }) {
  const [recoveredLoans, setRecoveredLoans] = useState([]);
  const [outstandingLoans, setOutstandingLoans] = useState([]);
  const [recoverySummary, setRecoverySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'recovered', 'outstanding'
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  // Add CSS animation for refresh icon
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setRefreshing(true);
    setError('');
    setRefreshSuccess(false);
    
    try {
      // Load comprehensive recovery report
      const reportData = await api.getRecoveryReport();
      setRecoverySummary(reportData.data.summary);
      setRecoveredLoans(reportData.data.recoveredLoans || []);
      setOutstandingLoans(reportData.data.outstandingLoans || []);
      setRefreshSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (err) {
      if (err.status === 401) {
        handleTokenExpiration();
      } else {
        handleApiError(err, setError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to format recovery status
  const formatRecoveryStatus = (status) => {
    if (!status) return '-';
    const statusMap = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'recovered': 'Recovered'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error Loading Reports</h4>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadReports}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Summary Cards */}
      {recoverySummary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Total Loans</h4>
            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', fontWeight: 700 }}>{recoverySummary.totalLoans}</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Approved loans in system</p>
          </div>
          
          <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Recovered Loans</h4>
            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', fontWeight: 700 }}>{recoverySummary.recoveredLoans}</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Successfully recovered</p>
          </div>
          
          <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Outstanding Loans</h4>
            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', fontWeight: 700 }}>{recoverySummary.outstandingLoans}</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Pending recovery</p>
          </div>
          
          <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Recovery Rate</h4>
            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', fontWeight: 700 }}>{recoverySummary.recoveryRate}</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Success percentage</p>
          </div>
        </div>
      )}

      {/* Amount Summary */}
      {recoverySummary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #28a745' }}>
            <h4 style={{ color: '#28a745', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Total Recovered Amount</h4>
            <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#333' }}>
              {formatCurrency(recoverySummary.totalRecoveredAmount)}
            </h3>
          </div>
          
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #ffc107' }}>
            <h4 style={{ color: '#ffc107', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Total Outstanding Amount</h4>
            <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#333' }}>
              {formatCurrency(recoverySummary.totalOutstandingAmount)}
            </h3>
          </div>
          
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #17a2b8' }}>
            <h4 style={{ color: '#17a2b8', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Total Loans Amount</h4>
            <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#333' }}>
              {formatCurrency(recoverySummary.totalLoansAmount)}
            </h3>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        marginBottom: '2rem', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        padding: '1rem',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        border: '1px solid #dee2e6'
      }}>
        <button 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('overview')}
          style={{ 
            padding: '0.875rem 2rem',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: '2px solid',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'overview' ? '0 4px 12px rgba(13, 110, 253, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            minWidth: '140px',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'overview') {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(13, 110, 253, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'overview') {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }
          }}
        >
          📊 Overview
        </button>
        <button 
          className={`btn ${activeTab === 'recovered' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => setActiveTab('recovered')}
          style={{ 
            padding: '0.875rem 2rem',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: '2px solid',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'recovered' ? '0 4px 12px rgba(25, 135, 84, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            minWidth: '180px',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'recovered') {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(25, 135, 84, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'recovered') {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }
          }}
        >
          ✅ Recovered ({recoveredLoans.length})
        </button>
        <button 
          className={`btn ${activeTab === 'outstanding' ? 'btn-warning' : 'btn-outline-warning'}`}
          onClick={() => setActiveTab('outstanding')}
          style={{ 
            padding: '0.875rem 2rem',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: '2px solid',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'outstanding' ? '0 4px 12px rgba(255, 193, 7, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            minWidth: '180px',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'outstanding') {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(255, 193, 7, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'outstanding') {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }
          }}
        >
          ⏳ Outstanding ({outstandingLoans.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Overview Header */}
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', color: 'white', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '1.5rem' }}>
              📊 Recovery Overview Dashboard
            </h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
              Real-time insights into loan recovery performance and outstanding balances
            </p>
          </div>

          {/* Quick Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: '4px solid #28a745' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#28a745', marginBottom: '0.5rem' }}>
                {recoveredLoans.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Recovered Loans</div>
            </div>
            
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: '4px solid #ffc107' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffc107', marginBottom: '0.5rem' }}>
                {outstandingLoans.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Outstanding Loans</div>
            </div>
            
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: '4px solid #17a2b8' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#17a2b8', marginBottom: '0.5rem' }}>
                {recoveredLoans.length + outstandingLoans.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Total Active Loans</div>
            </div>
            
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: '4px solid #43e97b' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#43e97b', marginBottom: '0.5rem' }}>
                { recoveredLoans.length > 0 ? ((recoveredLoans.length / (recoveredLoans.length + outstandingLoans.length)) * 100).toPrecision(3) : '0'} %
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Recovery Rate</div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'recovered' && (
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e9ecef' }}>
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
            color: 'white', 
            padding: '1.5rem', 
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '1.5rem' }}>
              ✅ Recovered Loans
            </h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
              Successfully recovered loans ({recoveredLoans.length})
            </p>
          </div>

          {/* Table Content */}
          <div style={{ padding: '0', overflowX: 'auto' }}>
            {recoveredLoans.length > 0 ? (
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
                      width: '12%'
                    }}>Loan ID</th>
                    <th style={{ 
                      padding: '1rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '20%'
                    }}>Customer</th>
                    <th style={{ 
                      padding: '1rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '20%'
                    }}>Agent</th>
                    <th style={{ 
                      padding: '1rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'right',
                      width: '20%'
                    }}>Amount</th>
                    <th style={{ 
                      padding: '1rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'right',
                      width: '20%'
                    }}>Recovered</th>
                    <th style={{ 
                      padding: '1rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'center',
                      width: '8%'
                    }}>Recovery Date</th>
              </tr>
            </thead>
            <tbody>
                  {recoveredLoans.map((loan, index) => (
                    <tr key={loan.id} style={{ 
                      borderBottom: index < recoveredLoans.length - 1 ? '1px solid #f8f9fa' : 'none'
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
                          #{loan.id}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>
                          {loan.Customer?.name || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>
                          {loan.Agent?.name || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>
                          {formatCurrency(loan.amount)}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ 
                          fontWeight: 700, 
                          color: '#28a745', 
                          fontSize: '1rem'
                        }}>
                          {formatCurrency(loan.totalPaid)}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: '#28a745', 
                          fontWeight: 500
                        }}>
                          {formatDate(loan.updatedAt)}
                        </div>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
            ) : (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📋</div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontWeight: 600 }}>No Recovered Loans</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  No loans have been recovered yet
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'outstanding' && (
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e9ecef' }}>
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)', 
            color: 'white', 
            padding: '1.5rem', 
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '1.5rem' }}>
              ⏳ Outstanding Loans
            </h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
              Loans pending recovery ({outstandingLoans.length})
            </p>
      </div>

          {/* Table Content */}
          <div style={{ padding: '0', overflowX: 'auto' }}>
            {outstandingLoans.length > 0 ? (
              <table className="table table-hover mb-0" style={{ margin: 0, minWidth: '100%', tableLayout: 'fixed', fontSize: '0.9rem' }}>
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
                      width: '10%'
                    }}>Loan ID</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '18%'
                    }}>Customer</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '18%'
                    }}>Agent</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'right',
                      width: '16%'
                    }}>Amount</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'right',
                      width: '16%'
                    }}>Paid</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'right',
                      width: '16%'
                    }}>Outstanding</th>
                    <th style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#495057',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'center',
                      width: '6%'
                    }}>Status</th>
              </tr>
            </thead>
            <tbody>
                  {outstandingLoans.map((loan, index) => (
                    <tr key={loan.id} style={{ 
                      borderBottom: index < outstandingLoans.length - 1 ? '1px solid #f8f9fa' : 'none'
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
                          {loan.Customer?.name || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>
                          {loan.Agent?.name || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>
                          {formatCurrency(loan.amount)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ 
                          fontWeight: 700, 
                          color: '#28a745', 
                          fontSize: '0.9rem'
                        }}>
                          {formatCurrency(loan.totalPaid)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ 
                          fontWeight: 700, 
                          color: '#dc3545', 
                          fontSize: '0.9rem'
                        }}>
                          {formatCurrency(loan.outstandingAmount)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 500,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '10px',
                          display: 'inline-block',
                          background: loan.recoveryStatus === 'pending' ? '#fff3cd' : '#d1ecf1',
                          color: loan.recoveryStatus === 'pending' ? '#856404' : '#0c5460',
                          whiteSpace: 'nowrap'
                        }}>
                          {formatRecoveryStatus(loan.recoveryStatus)}
                        </div>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
            ) : (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>✅</div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontWeight: 600 }}>No Outstanding Loans</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  All loans have been successfully recovered!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '2.5rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        border: '1px solid #dee2e6'
      }}>
        <button 
          className="btn btn-primary" 
          onClick={loadReports}
          disabled={refreshing}
          style={{ 
            padding: '1rem 2.5rem',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '1rem',
            border: '2px solid #0d6efd',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(13, 110, 253, 0.2)',
            minWidth: '200px',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
            opacity: refreshing ? 0.7 : 1,
            cursor: refreshing ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!refreshing) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(13, 110, 253, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!refreshing) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.2)';
            }
          }}
        >
          <i className={`bi ${refreshing ? 'bi-arrow-clockwise' : 'bi-arrow-clockwise'}`} style={{ 
            marginRight: '0.75rem',
            fontSize: '1.1rem',
            animation: refreshing ? 'spin 1s linear infinite' : 'none'
          }}></i>
          {refreshing ? 'Refreshing...' : 'Refresh Reports'}
        </button>
        <div style={{ 
          marginTop: '0.75rem', 
          fontSize: '0.9rem', 
          color: '#6c757d',
          fontStyle: 'italic'
        }}>
          Click to refresh all report data and get the latest statistics
        </div>
        {refreshSuccess && (
          <div style={{ 
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
            color: '#155724',
            borderRadius: '8px',
            border: '1px solid #c3e6cb',
            fontSize: '0.9rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: '1rem' }}></i>
            Reports refreshed successfully!
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;

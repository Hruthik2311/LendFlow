import React, { useState } from 'react';
import Loans from './Loans';
import Payments from './Payments';
import Reports from './Reports';

function Dashboard({ user }) {
  const [page, setPage] = useState('loans');

  return (
    <div style={{ width: '100%', padding: '0 2rem' }}>
      {/* Horizontal Navigation Bar - Full Width */}
      <div style={{ 
        background: '#fff', 
        borderRadius: '0', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        marginBottom: '2rem',
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <button 
          className={`btn ${page === 'loans' ? 'btn-primary' : 'btn-outline-primary'}`} 
          style={{ 
            fontSize: '1.1rem', 
            padding: '0.875rem 2.5rem', 
            borderRadius: '12px',
            fontWeight: 600,
            minWidth: '140px',
            transition: 'all 0.3s ease',
            border: page === 'loans' ? 'none' : '2px solid #396afc',
            background: page === 'loans' ? 'linear-gradient(135deg, #396afc 0%, #2948ff 100%)' : 'transparent',
            color: page === 'loans' ? '#fff' : '#396afc',
            boxShadow: page === 'loans' ? '0 4px 12px rgba(57, 106, 252, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
          }} 
          onClick={() => setPage('loans')}
          onMouseEnter={(e) => {
            if (page !== 'loans') {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (page !== 'loans') {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }
          }}
        >
          <i className="bi bi-bank" style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}></i>
          Loans
        </button>
        <button 
          className={`btn ${page === 'payments' ? 'btn-primary' : 'btn-outline-primary'}`} 
          style={{ 
            fontSize: '1.1rem', 
            padding: '0.875rem 2.5rem', 
            borderRadius: '12px',
            fontWeight: 600,
            minWidth: '140px',
            transition: 'all 0.3s ease',
            border: page === 'payments' ? 'none' : '2px solid #396afc',
            background: page === 'payments' ? 'linear-gradient(135deg, #396afc 0%, #2948ff 100%)' : 'transparent',
            color: page === 'payments' ? '#fff' : '#396afc',
            boxShadow: page === 'payments' ? '0 4px 12px rgba(57, 106, 252, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
          }} 
          onClick={() => setPage('payments')}
          onMouseEnter={(e) => {
            if (page !== 'payments') {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (page !== 'payments') {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }
          }}
        >
          <i className="bi bi-credit-card" style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}></i>
          Payments
        </button>
        {user.role === 'admin' && (
          <button 
            className={`btn ${page === 'reports' ? 'btn-primary' : 'btn-outline-primary'}`} 
            style={{ 
              fontSize: '1.1rem', 
              padding: '0.875rem 2.5rem', 
              borderRadius: '12px',
              fontWeight: 600,
              minWidth: '140px',
              transition: 'all 0.3s ease',
              border: page === 'reports' ? 'none' : '2px solid #396afc',
              background: page === 'reports' ? 'linear-gradient(135deg, #396afc 0%, #2948ff 100%)' : 'transparent',
              color: page === 'reports' ? '#fff' : '#396afc',
              boxShadow: page === 'reports' ? '0 4px 12px rgba(57, 106, 252, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
            }} 
            onClick={() => setPage('reports')}
            onMouseEnter={(e) => {
              if (page !== 'reports') {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (page !== 'reports') {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }
            }}
          >
            <i className="bi bi-graph-up" style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}></i>
            Reports
          </button>
        )}
      </div>

      {/* Content Area - Full Width */}
      <div style={{ 
        background: '#fff', 
        borderRadius: '0', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        padding: '2rem',
        minHeight: '600px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {page === 'loans' && <Loans user={user} />}
        {page === 'payments' && <Payments user={user} />}
        {page === 'reports' && user.role === 'admin' && <Reports user={user} />}
      </div>
    </div>
  );
}

export default Dashboard;

import React, { useState, useEffect } from 'react';
import Loans from './Loans';
import Payments from './Payments';
import Reports from './Reports';
import Notifications from '../components/Notifications';
import { api, handleApiError } from '../utils/api';

function Dashboard({ user }) {
  const [page, setPage] = useState('loans');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count for agents
  const fetchUnreadCount = async () => {
    if (user.role !== 'agent') return;
    
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.data.unreadCount || 0);
    } catch (err) {
      // Silently handle error - don't show error for notification count
      console.error('Failed to fetch unread count:', err);
    }
  };

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

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
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Navigation Buttons */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.5rem',
          flexWrap: 'wrap'
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
            <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>🏦</span>
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
            <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>💳</span>
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
              <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>📊</span>
              Reports
            </button>
          )}
        </div>

        {/* Notification Bell for Agents */}
        {user.role === 'agent' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(true)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.3rem',
                color: 'white',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.05)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
            >
              🔔
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
                  animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </button>
            <style>
              {`
                @keyframes pulse {
                  0% { transform: scale(1); }
                  50% { transform: scale(1.1); }
                  100% { transform: scale(1); }
                }
              `}
            </style>
          </div>
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

      {/* Notifications Modal */}
      <Notifications 
        user={user}
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          fetchUnreadCount(); // Refresh count when closing
        }}
      />
    </div>
  );
}

export default Dashboard;

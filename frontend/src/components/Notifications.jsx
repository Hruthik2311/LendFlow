import React, { useState, useEffect } from 'react';
import { api, handleApiError } from '../utils/api';

function Notifications({ user, isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.unreadCount || 0);
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    try {
      await api.clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  // Fetch notifications when component mounts or user changes
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  // Auto-refresh notifications every 30 seconds when open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '1.5rem' }}>
              🔔 Notifications
            </h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
              {unreadCount} unread • {notifications.length} total
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              style={{
                background: unreadCount === 0 ? '#e9ecef' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
                opacity: unreadCount === 0 ? 0.6 : 1
              }}
            >
              Mark All Read
            </button>
            <button
              onClick={handleClearAll}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading notifications...</div>
            </div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ color: '#dc3545', fontSize: '1rem' }}>{error}</div>
              <button
                onClick={fetchNotifications}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  marginTop: '1rem',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🔔</div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontWeight: 600 }}>No Notifications</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: index < notifications.length - 1 ? '1px solid #f8f9fa' : 'none',
                    background: notification.isRead ? '#fff' : '#f8f9ff',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  onMouseEnter={(e) => {
                    e.target.style.background = notification.isRead ? '#f8f9fa' : '#e3f2fd';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = notification.isRead ? '#fff' : '#f8f9ff';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: notification.isRead ? '#e9ecef' : '#007bff',
                      marginTop: '0.5rem',
                      flexShrink: 0
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.95rem',
                        color: '#333',
                        marginBottom: '0.5rem',
                        fontWeight: notification.isRead ? 400 : 600
                      }}>
                        {notification.message}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        {notification.type && (
                          <span style={{
                            background: '#e9ecef',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.7rem'
                          }}>
                            {notification.type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      {notification.data && notification.data.loanId && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem',
                          background: '#f8f9fa',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: '#666'
                        }}>
                          <strong>Loan #{notification.data.loanId}</strong> • 
                          ₹{notification.data.loanAmount} • 
                          {notification.data.customerName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications; 
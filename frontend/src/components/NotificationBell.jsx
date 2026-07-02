import React, { useState, useEffect, useRef, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [animateBell, setAnimateBell] = useState(false);
  
  const dropdownRef = useRef(null);
  const prevUnreadRef = useRef(0);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/notifications');
      if (response.data && response.data.notifications) {
        setNotifications(response.data.notifications);
        const unread = response.data.notifications.filter(n => !n.read).length;
        
        // Trigger shake only if we received a NEW unread notification
        if (unread > prevUnreadRef.current) {
          setAnimateBell(true);
          setTimeout(() => setAnimateBell(false), 800);
        }
        prevUnreadRef.current = unread;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Poll for notifications every 20 seconds
    const interval = setInterval(fetchNotifications, 20000);

    // Event listener for click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      // Update local state
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      const newUnread = Math.max(0, unreadCount - 1);
      prevUnreadRef.current = newUnread;
      setUnreadCount(newUnread);
    } catch (error) {
      console.error('Error marking notification as read:', error.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      prevUnreadRef.current = 0;
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error.message);
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          color: '#f8fafc',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'background-color 0.2s',
          animation: animateBell ? 'bellShake 0.6s ease-out' : 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {/* Bell SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: '#e11d48',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '700',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(225,29,72,0.6)',
              animation: 'bellPulse 1.5s infinite',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="glass-card"
          style={{
            position: 'absolute',
            top: '45px',
            right: '0',
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '16px',
            zIndex: 999,
            borderRadius: '12px',
            backgroundColor: 'rgba(26, 34, 51, 0.98)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
            border: '1px solid var(--border-glass)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif' }}>Alert Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--theme-accent, #3B82F6)',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No active notifications.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => !item.read && handleMarkAsRead(item._id)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: item.read ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
                    borderLeft: `3px solid ${item.read ? 'transparent' : item.type === 'High Priority Alert' ? '#E0384D' : '#F5A623'}`,
                    cursor: item.read ? 'default' : 'pointer',
                    transition: 'background-color 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!item.read) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!item.read) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      color: item.type === 'High Priority Alert' ? '#E0384D' : item.type === 'New Case Assigned' ? '#3B82F6' : '#F5A623'
                    }}>
                      {item.type}
                    </span>
                    <span style={{ fontSize: '9px', color: '#64748b' }}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: item.read ? '#94a3b8' : '#f8fafc', lineHeight: 1.3 }}>
                    {item.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bellPulse {
          0% { box-shadow: 0 0 0 0 rgba(224,56,77,0.6); }
          70% { box-shadow: 0 0 0 6px rgba(224,56,77,0); }
          100% { box-shadow: 0 0 0 0 rgba(224,56,77,0); }
        }
        @keyframes bellShake {
          0% { transform: rotate(0); }
          15% { transform: rotate(15deg); }
          30% { transform: rotate(-15deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-10deg); }
          75% { transform: rotate(4deg); }
          85% { transform: rotate(-4deg); }
          100% { transform: rotate(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;

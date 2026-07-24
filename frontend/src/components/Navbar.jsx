import React, { useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { renderDepartmentBadge } from '../api/departmentHelper';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, details } = useContext(AuthContext);
  const location = useLocation();

  const getRoleTheme = () => {
    if (!user) return {};
    if (user.role === 'admin') return { color: '#E0384D', text: 'Admin' };
    if (user.role === 'analyst') return { color: '#F5A623', text: 'Analyst' };
    if (user.role === 'citizen') return { color: '#4DA3FF', text: 'Citizen' };
    return { color: '#3B82F6', text: 'Officer' };
  };

  const theme = getRoleTheme();
  const isPublicPath = ['/', '/about', '/contact', '/overview'].includes(location.pathname);

  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'analyst') return '/analyst/dashboard';
    if (user.role === 'citizen') return '/citizen/dashboard';
    return '/officer/dashboard';
  };

  return (
    <header
      style={{
        height: '64px',
        padding: '0 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(11, 15, 25, 0.8)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* CrimePilot brand logo & title as a link to home */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img
            src="/assets/logo.webp"
            alt="CrimePilot Logo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              objectFit: 'cover',
              boxShadow: '0 0 8px rgba(6,182,212,0.25)',
              border: '1px solid rgba(6, 182, 212, 0.25)'
            }}
          />
          <span style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CrimePilot
          </span>
        </Link>

        {/* Sidebar Toggle Button - Only visible on protected routes */}
        {user && !isPublicPath && (
          <button
            onClick={toggleSidebar}
            title="Toggle Sidebar"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '6px',
              marginLeft: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Right side controls */}
      {isPublicPath ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <Link
              to={getDashboardUrl()}
              style={{
                textDecoration: 'none',
                color: '#fff',
                backgroundColor: theme.color || '#3B82F6',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.2s',
                boxShadow: `0 0 10px ${(theme.color || '#3B82F6')}44`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'none';
              }}
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              style={{
                textDecoration: 'none',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.2s',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              Access Terminal
            </Link>
          )}
        </div>
      ) : (
        user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Department Division Badge */}
            {user.role !== 'citizen' && renderDepartmentBadge(user.email, { marginRight: '4px' })}

            {/* Role Badge */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.color,
                border: `1px solid ${theme.color}33`,
                background: `${theme.color}11`,
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {theme.text} Portal
            </span>

            {/* Alert Bell */}
            <NotificationBell />

            {/* Profile & Logout Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>
                  {user.email}
                </span>
              </div>
              
              {/* User Avatar - Conditional rendering of picture */}
              {user?.profilePicture || details?.profilePicture ? (
                <img
                  src={`http://localhost:5000${user.profilePicture || details.profilePicture}`}
                  alt="Profile"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `1px solid ${theme.color || '#334155'}`,
                    boxShadow: `0 0 10px ${theme.color}22`
                  }}
                />
              ) : (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: theme.color || '#334155',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 10px ${theme.color}22`
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Logout button */}
              <button
                onClick={logout}
                title="Logout from session"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s, background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f43f5e';
                  e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        )
      )}
    </header>
  );
};

export default Navbar;

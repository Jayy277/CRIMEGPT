import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Link } from 'react-router-dom';
import AnimatedCounter from '../../components/AnimatedCounter';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/dashboard/admin');
        if (res.data && res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Failed to load system stats. Check connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderLeftColor: 'var(--theme-accent, #E0384D)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="glass-card" style={{ borderLeft: '4px solid #E0384D', padding: '16px', color: '#fda4af' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Space Grotesk, sans-serif', color: '#fff' }}>
          System Control Panel
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Manage user authentications, audit logs, locations, and global configurations.
        </p>
      </div>

      {/* Admin Stats Cards - Staggered & Counters */}
      <div className="dashboard-grid stagger-container">
        {/* Total Users */}
        <div className="glass-card dashboard-stat-card stagger-item" style={{ animationDelay: '40ms', borderLeft: '4px solid #E0384D' }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Authorized Users</span>
            <div className="dashboard-stat-value" style={{ color: '#E0384D' }}>
              <AnimatedCounter value={stats.totalUsers} />
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{stats.activeUsers} active session slots</span>
          </div>
          <div style={{ backgroundColor: 'rgba(224,56,77,0.1)', padding: '12px', borderRadius: '12px', color: '#E0384D' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
        </div>

        {/* Active Officers */}
        <div className="glass-card dashboard-stat-card stagger-item" style={{ animationDelay: '80ms', borderLeft: '4px solid #F5A623' }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Active Officers</span>
            <div className="dashboard-stat-value" style={{ color: '#F5A623' }}>
              <AnimatedCounter value={stats.activeOfficers} />
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Assigned to local field stations</span>
          </div>
          <div style={{ backgroundColor: 'rgba(245,166,35,0.1)', padding: '12px', borderRadius: '12px', color: '#F5A623' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
        </div>

        {/* Active cases */}
        <div className="glass-card dashboard-stat-card stagger-item" style={{ animationDelay: '120ms', borderLeft: '4px solid #3B82F6' }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Active Cases (Pending)</span>
            <div className="dashboard-stat-value" style={{ color: '#3B82F6' }}>
              <AnimatedCounter value={stats.activeCases} />
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Currently under active inquiry</span>
          </div>
          <div style={{ backgroundColor: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: '12px', color: '#3B82F6' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
        </div>

        {/* Solved Cases */}
        <div className="glass-card dashboard-stat-card stagger-item" style={{ animationDelay: '160ms', borderLeft: '4px solid #22C55E' }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Resolved / Solved Cases</span>
            <div className="dashboard-stat-value" style={{ color: '#22C55E' }}>
              <AnimatedCounter value={stats.solvedCases} />
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Archived or solved FIRs</span>
          </div>
          <div style={{ backgroundColor: 'rgba(34,197,94,0.1)', padding: '12px', borderRadius: '12px', color: '#22C55E' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Admin Quick Action Hub */}
      <div className="glass-card stagger-item" style={{ animationDelay: '200ms' }}>
        <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>System Administrator Command Center</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Link to="/admin/users" className="btn btn-secondary" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#E0384D', fontWeight: '800' }}>Manage Users</span>
            <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>Add/Update portal logins and roles</span>
          </Link>
          <Link to="/admin/categories" className="btn btn-secondary" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#06b6d4', fontWeight: '800' }}>Crime Categories</span>
            <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>Configure acts and section schedules</span>
          </Link>
          <Link to="/admin/locations" className="btn btn-secondary" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#F5A623', fontWeight: '800' }}>Locations & Stations</span>
            <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>Update police station registries</span>
          </Link>
          <Link to="/admin/logs" className="btn btn-secondary" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#a855f7', fontWeight: '800' }}>System Audit Logs</span>
            <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>Audit administrator and officer logs</span>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

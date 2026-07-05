import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [actionSearch, setActionSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [emailSearch, setEmailSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosInstance.get('/admin/logs');
      if (res.data && res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to fetch system audit logs database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const actionMatch = !actionSearch || log.action.toLowerCase().includes(actionSearch.toLowerCase()) || (log.details && log.details.toLowerCase().includes(actionSearch.toLowerCase()));
    
    // User details match
    const userEmail = log.user?.email || '';
    const userRole = log.user?.role || '';

    const emailMatch = !emailSearch || userEmail.toLowerCase().includes(emailSearch.toLowerCase());
    const roleMatch = !roleFilter || userRole === roleFilter;

    return actionMatch && emailMatch && roleMatch;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderLeftColor: '#e11d48',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
          System Audit & Security Logs
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          View read-only audit trails of login history, database updates, and supervisor operations.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '16px', color: '#fda4af' }}>
          {error}
        </div>
      )}

      {/* Filters Form */}
      <div className="glass-card">
        <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Filter Action / Keywords</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. POST, signup, login"
              value={actionSearch}
              onChange={e => setActionSearch(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>User Email</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. officer@crimepilot.com"
              value={emailSearch}
              onChange={e => setEmailSearch(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>User Role</label>
            <select
              className="form-control"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="officer">Officer</option>
              <option value="analyst">Analyst</option>
            </select>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>System Audit Trail</h3>
        
        {filteredLogs.length === 0 ? (
          <div style={{ color: '#64748b', fontStyle: 'italic', padding: '20px 0', textAlign: 'center' }}>
            No audit logs found matching criteria.
          </div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Operator</th>
                  <th>Role</th>
                  <th>Action Logged</th>
                  <th>Details / Payload</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => {
                  const stamp = log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A';
                  const name = log.user?.name || 'Anonymous Session';
                  const email = log.user?.email ? `(${log.user.email})` : '';

                  return (
                    <tr key={log._id || idx}>
                      <td style={{ color: '#cbd5e1', fontSize: '12px' }}>{stamp}</td>
                      <td style={{ fontWeight: '700', color: '#fff' }}>
                        {name}
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>
                          {email}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          color: log.user?.role === 'admin' ? '#f43f5e' : log.user?.role === 'analyst' ? '#06b6d4' : '#f59e0b'
                        }}>
                          {log.user?.role || 'Guest'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#fbbf24' }}>
                        {log.action}
                      </td>
                      <td style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={log.details}>
                        {log.details || 'N/A'}
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>{log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Logs;

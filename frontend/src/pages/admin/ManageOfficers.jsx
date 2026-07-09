import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { renderDepartmentBadge } from '../../api/departmentHelper';

const ManageOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWorkloads = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch staff details (officers list) and general crimes to map workloads
      const [staffRes, crimesRes] = await Promise.all([
        axiosInstance.get('/admin/staff-search?role=officer'),
        axiosInstance.get('/crimes')
      ]);

      if (staffRes.data && staffRes.data.success) {
        setOfficers(staffRes.data.officers || []);
      }
      if (crimesRes.data && crimesRes.data.success) {
        setCrimes(crimesRes.data.crimes || []);
      }
    } catch (err) {
      console.error('Error fetching officer directory workloads:', err);
      setError('Failed to compute officer workloads. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkloads();
  }, []);

  // Compute officer case metrics helper
  const getOfficerStats = (officerId) => {
    const assignedCases = crimes.filter(c => c.officer && String(c.officer._id || c.officer) === String(officerId));
    const active = assignedCases.filter(c => c.isPending).length;
    const resolved = assignedCases.length - active;

    return {
      total: assignedCases.length,
      active,
      resolved
    };
  };

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
          Officers Directory & Workload Logs
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Audit officer workloads, badge schedules, and active investigations progress.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '16px', color: '#fda4af' }}>
          {error}
        </div>
      )}

      {/* Directory Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>Caseload Auditing</h3>

        {officers.length === 0 ? (
          <div style={{ color: '#64748b', fontStyle: 'italic', padding: '20px 0' }}>No officers registered in systems.</div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Badge No</th>
                  <th>Officer Name</th>
                  <th>Contact</th>
                  <th>Jurisdiction Station</th>
                  <th>Active Cases</th>
                  <th>Solved Cases</th>
                  <th>Total Cases</th>
                  <th>Caseload Status</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer) => {
                  const stats = getOfficerStats(officer._id);
                  const isOverloaded = stats.active >= 5;

                  return (
                    <tr key={officer._id}>
                      <td style={{ fontWeight: '700', color: '#fbbf24', fontFamily: 'monospace' }}>
                        {officer.badgeNo}
                      </td>
                      <td style={{ fontWeight: '700', color: '#fff' }}>
                        {officer.user?.name || 'Staff Officer'}
                        <div style={{ marginTop: '4px' }}>{officer.user?.email && renderDepartmentBadge(officer.user.email)}</div>
                      </td>
                      <td>{officer.contact || 'N/A'}</td>
                      <td>
                        {officer.station?.policeStation || 'N/A'}
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>
                          {officer.station?.city}
                        </span>
                      </td>
                      <td style={{ fontWeight: '700', color: '#e11d48' }}>{stats.active}</td>
                      <td style={{ fontWeight: '700', color: '#10b981' }}>{stats.resolved}</td>
                      <td style={{ fontWeight: '700', color: '#fff' }}>{stats.total}</td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          color: isOverloaded ? '#e11d48' : '#10b981',
                          backgroundColor: isOverloaded ? 'rgba(225,29,72,0.1)' : 'rgba(16,185,129,0.1)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: `1px solid ${isOverloaded ? 'rgba(225,29,72,0.2)' : 'rgba(16,185,129,0.2)'}`
                        }}>
                          {isOverloaded ? 'Overloaded' : 'Optimal'}
                        </span>
                      </td>
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

export default ManageOfficers;

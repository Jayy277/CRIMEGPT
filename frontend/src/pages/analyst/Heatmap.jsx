import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const Heatmap = () => {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/dashboard/analyst');
        if (res.data && res.data.success) {
          setHotspots(res.data.hotspotStats || []);
          if (res.data.hotspotStats && res.data.hotspotStats.length > 0) {
            setSelectedStation(res.data.hotspotStats[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching hotspot stats:', err);
        setError('Failed to load geographical hotspot risk statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotspots();
  }, []);

  const getRiskStatus = (count) => {
    if (count >= 10) return { label: 'CRITICAL RISK', color: '#e11d48', bg: 'rgba(225,29,72,0.1)' };
    if (count >= 5) return { label: 'MEDIUM WARNING', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    return { label: 'LOW ACTIVITY', color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderLeftColor: '#06b6d4',
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
          Tactical Risk Hotspot Matrix
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Grid-based threat level analysis computed from active case counts across jurisdictions.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '16px', color: '#fda4af' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Heatmap Grid Panel */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
            Tactical Geographic Heat Matrix (Interactive Grid)
          </h3>

          {hotspots.length === 0 ? (
            <div style={{ color: '#64748b', fontStyle: 'italic', padding: '30px 0', textAlign: 'center' }}>
              No geographic logs recorded in database yet.
            </div>
          ) : (
            <div>
              {/* representational grid matrix */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '12px',
                background: 'rgba(7, 10, 19, 0.4)',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '20px',
                borderRadius: '12px'
              }}>
                {hotspots.map((hot, idx) => {
                  const risk = getRiskStatus(hot.count);
                  const isSelected = selectedStation && selectedStation._id === hot._id;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedStation(hot)}
                      style={{
                        aspectRatio: '1',
                        border: isSelected ? `2px solid ${risk.color}` : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        background: isSelected ? risk.bg : 'rgba(15, 22, 42, 0.5)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '12px',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? `0 0 16px ${risk.color}33` : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = risk.color;
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      }}
                    >
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', fontFamily: 'monospace' }}>
                        SEC-{idx + 10}
                      </span>
                      
                      {/* Grid risk node */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
                          {hot.policeStation.split(' ')[0]}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: risk.color,
                            boxShadow: `0 0 6px ${risk.color}`
                          }} />
                          <span style={{ fontSize: '11px', fontWeight: '800', color: risk.color }}>
                            {hot.count}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '20px', marginTop: '16px', justifyContent: 'center', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e11d48' }} />
                  <span style={{ color: '#94a3b8' }}>High Threat (&gt;= 10 incidents)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <span style={{ color: '#94a3b8' }}>Medium Threat (5 - 9 incidents)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ color: '#94a3b8' }}>Low Threat (&lt; 5 incidents)</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Selected Area Details Panel */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
            Risk Assessment Breakdown
          </h3>

          {selectedStation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '12px',
                textAlign: 'center',
                letterSpacing: '0.08em',
                color: getRiskStatus(selectedStation.count).color,
                backgroundColor: getRiskStatus(selectedStation.count).bg,
                border: `1px solid ${getRiskStatus(selectedStation.count).color}33`
              }}>
                {getRiskStatus(selectedStation.count).label}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Police Station Jurisdiction</label>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{selectedStation.policeStation}</div>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>City / District</label>
                  <div style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '2px' }}>{selectedStation.city}, {selectedStation.district}</div>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>State Zone</label>
                  <div style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '2px' }}>{selectedStation.state}</div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  <label style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Active Incidents Filed</label>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{selectedStation.count} Cases</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b', fontStyle: 'italic', fontSize: '13px' }}>
              Select a grid cell to inspect.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Heatmap;

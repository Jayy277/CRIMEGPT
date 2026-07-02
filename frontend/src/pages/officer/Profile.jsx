import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { user, details } = useContext(AuthContext);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
          Officer Profile
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Your verified credentials and jurisdiction mapping.
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-card" style={{ padding: '32px', borderTop: '4px solid #f59e0b' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            color: '#fff',
            fontSize: '24px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(245,158,11,0.3)'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', color: '#fff', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
              {user?.name}
            </h2>
            <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Field Squad Officer
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Email Address:</span>
            <span style={{ color: '#f8fafc', fontSize: '14px' }}>{user?.email}</span>
          </div>

          {/* Badge Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Badge Number:</span>
            <span style={{ color: '#f8fafc', fontSize: '14px', fontFamily: 'monospace', fontWeight: '700', color: '#f59e0b' }}>
              {details?.badgeNo || 'N/A'}
            </span>
          </div>

          {/* Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Contact Phone:</span>
            <span style={{ color: '#f8fafc', fontSize: '14px' }}>{details?.contact || 'N/A'}</span>
          </div>

          {/* Police Station / Jurisdiction */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Assigned Station:</span>
            <div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>
                {details?.station?.policeStation || 'N/A'}
              </div>
              {details?.station && (
                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>
                  {details.station.city}, {details.station.district}, {details.station.state}
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>System Status:</span>
            <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>
              ✓ ACTIVE SECURE ROOT
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Profile;

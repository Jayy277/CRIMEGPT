import React from 'react';

const PulsingDot = ({ label = 'Active' }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span
        style={{
          width: '8px',
          height: '8px',
          backgroundColor: '#E0384D',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(224, 56, 77, 0.6)',
          animation: 'pulsingDotAnim 1.5s infinite ease-in-out'
        }}
      />
      {label && (
        <span style={{ fontSize: '10px', color: '#E0384D', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      )}
      <style>{`
        @keyframes pulsingDotAnim {
          0% { transform: scale(0.9); opacity: 0.6; box-shadow: 0 0 6px rgba(224, 56, 77, 0.4); }
          50% { transform: scale(1.15); opacity: 1; box-shadow: 0 0 14px rgba(224, 56, 77, 0.8); }
          100% { transform: scale(0.9); opacity: 0.6; box-shadow: 0 0 6px rgba(224, 56, 77, 0.4); }
        }
      `}</style>
    </div>
  );
};

export default PulsingDot;

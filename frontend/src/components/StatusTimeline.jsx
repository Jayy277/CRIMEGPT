import React from 'react';

const STATUS_ORDER = [
  'Reported',
  'Assigned',
  'Under Investigation',
  'Evidence Collected',
  'Solved',
  'Closed'
];

const StatusTimeline = ({ currentStatus, mini = false }) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  if (mini) {
    // Mini representation for CaseCard: small dots with progress bar
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', margin: '8px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#64748b' }}>
          <span>Progression</span>
          <span style={{ color: 'var(--theme-accent, #3B82F6)', fontWeight: '700' }}>{currentStatus}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative', width: '100%', height: '6px' }}>
          {STATUS_ORDER.map((step, idx) => {
            const isCompleted = idx <= activeIndex;
            const isActive = idx === activeIndex;

            return (
              <div
                key={step}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: isCompleted ? 'var(--theme-accent, #3B82F6)' : 'rgba(255,255,255,0.08)',
                  transition: 'background-color 0.4s ease',
                  boxShadow: isActive ? '0 0 8px var(--theme-accent, #3B82F6)' : 'none'
                }}
                title={step}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Full detailed timeline for CrimeDetails
  return (
    <div style={{ padding: '24px 0', width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        width: '100%'
      }}>
        {/* Background connector line */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '20px',
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          zIndex: 1,
          borderRadius: '2px'
        }} />

        {/* Foreground completed connector line */}
        <div style={{
          position: 'absolute',
          left: 0,
          width: `${(activeIndex / (STATUS_ORDER.length - 1)) * 100}%`,
          top: '20px',
          height: '4px',
          backgroundColor: 'var(--theme-accent, #3B82F6)',
          zIndex: 2,
          borderRadius: '2px',
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 10px var(--theme-accent, #3B82F6)'
        }} />

        {/* Step Nodes */}
        {STATUS_ORDER.map((step, idx) => {
          const isCompleted = idx <= activeIndex;
          const isActive = idx === activeIndex;

          return (
            <div
              key={step}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 3,
                flex: 1,
                position: 'relative'
              }}
            >
              {/* Node dot */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? 'rgba(15, 20, 32, 0.9)' : '#1A2233',
                  border: `2px solid ${isCompleted ? 'var(--theme-accent, #3B82F6)' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted ? 'var(--theme-accent, #3B82F6)' : '#64748b',
                  fontWeight: '800',
                  fontSize: '14px',
                  boxShadow: isActive 
                    ? '0 0 20px var(--theme-accent, #3B82F6), inset 0 0 8px var(--theme-accent, #3B82F6)' 
                    : 'none',
                  transition: 'all 0.4s ease',
                  animation: isActive ? 'nodeActivePulse 2s infinite ease-in-out' : 'none'
                }}
              >
                {idx + 1}
              </div>

              {/* Step Label */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: isActive ? '#fff' : isCompleted ? 'var(--text-primary, #f8fafc)' : '#64748b',
                  marginTop: '12px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'Outfit, sans-serif',
                  maxWidth: '90px',
                  lineHeight: '1.3'
                }}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes nodeActivePulse {
          0% { box-shadow: 0 0 12px var(--theme-accent, #3B82F6); }
          50% { box-shadow: 0 0 24px var(--theme-accent, #3B82F6), inset 0 0 12px var(--theme-accent, #3B82F6); }
          100% { box-shadow: 0 0 12px var(--theme-accent, #3B82F6); }
        }
      `}</style>
    </div>
  );
};

export default StatusTimeline;
export { STATUS_ORDER };

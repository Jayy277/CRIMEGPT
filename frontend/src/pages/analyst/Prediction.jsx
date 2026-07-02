import React from 'react';

const Prediction = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
          AI Crime Forecaster & Probability Modeler
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Predict crime densities, location risk indexes, and model criminal recidivism probabilities.
        </p>
      </div>

      {/* Cyberpunk Coming Soon Badge */}
      <div className="glass-card" style={{
        padding: '60px 40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(6,182,212,0.03) 0%, rgba(225,29,72,0.03) 100%)',
        border: '1px solid rgba(6,182,212,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Hologram lines */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(to right, transparent, #06b6d4, transparent)',
          animation: 'scanLine 3s linear infinite'
        }} />

        <div style={{
          display: 'inline-flex',
          backgroundColor: 'rgba(6,182,212,0.1)',
          color: '#22d3ee',
          border: '1px solid rgba(6,182,212,0.3)',
          padding: '4px 16px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '20px'
        }}>
          Coming Soon (Next-Gen Release)
        </div>

        <h2 style={{ fontSize: '32px', color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '16px' }}>
          Neural Network Recidivism MO Modeling
        </h2>
        
        <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '500px', margin: '0 auto 36px', lineHeight: '1.6' }}>
          We are training local NLP transformer embeddings on registered case logs to map predictive coordinates, temporal crime clusters, and recidivism hazard curves.
        </p>

        {/* Mock visual widgets */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '32px'
        }}>
          <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', textAlign: 'left', border: '1px solid rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>RISK PROJECTION ACCURACY</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#06b6d4', marginTop: '4px' }}>91.4% (Est)</div>
          </div>
          <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', textAlign: 'left', border: '1px solid rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>TEMPORAL SHIFT FORECASTING</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>Active training</div>
          </div>
          <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', textAlign: 'left', border: '1px solid rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>HOTSPOT PROBABILITY MODEL</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>Grid matrix mapped</div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes scanLine {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(400px); opacity: 0; }
        }
      `}</style>

    </div>
  );
};

export default Prediction;

import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(circle at top, rgba(6,182,212,0.06) 0%, transparent 60%)',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px' }}>
        
        {/* Badge */}
        <span style={{
          backgroundColor: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          color: '#22d3ee',
          fontSize: '12px',
          fontWeight: '700',
          padding: '4px 12px',
          borderRadius: '9999px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          display: 'inline-block',
          marginBottom: '20px'
        }}>
          Next-Gen Crime Intelligence
        </span>

        {/* Hero Title */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: '800',
          fontFamily: 'Outfit, sans-serif',
          lineHeight: '1.15',
          background: 'linear-gradient(to right, #fff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '20px'
        }}>
          Automated Crime Records, Analytics & Intelligence
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#94a3b8',
          maxWidth: '600px',
          margin: '0 auto 36px',
          lineHeight: '1.6'
        }}>
          CrimePilot matches case modalities, tracks suspects through active judicial categories (BNS/BNSS/BSA), and generates aggregated intelligence reports for administrative, analyst, and field squads.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
            Open Secure Terminal
          </Link>
          <Link to="/about" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: '15px' }}>
            Learn More
          </Link>
        </div>

        {/* Feature grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginTop: '64px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '40px'
        }}>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '16px', color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>
              Field Registration
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
              Officers register cases, log evidence metadata, and select crime categories to populate dropdowns of legal acts.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '16px', color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>
              Modus Operandi Scanner
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
              Automatically scans cases for matching crime categories, location proximity, and keyword definitions.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '16px', color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>
              Analyst aggregation
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
              Provides hotspots analytics, temporal peaks, category clusters, and dynamic report downloads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

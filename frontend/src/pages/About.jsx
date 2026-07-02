import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 20px',
      background: 'radial-gradient(circle at top, rgba(6,182,212,0.05) 0%, transparent 60%)',
    }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '800',
            fontFamily: 'Outfit, sans-serif',
            background: 'linear-gradient(to right, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px'
          }}>
            About CrimeGPT Portal
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
            Next-generation Crime Management and Modus Operandi Intelligence System for modern law enforcement agencies.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', color: '#fff', marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>
            Mission & Architecture
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
            CrimeGPT is an end-to-end digitised case registration and analytical system designed in accordance with current judicial framework structures. It allows local field squads, analytical units, and system supervisors to collaborate instantly on active cases, suspect records, and evidence management.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '24px'
          }}>
            <div>
              <h4 style={{ color: '#06b6d4', fontWeight: '700', marginBottom: '6px' }}>Dynamic Legal Mapping</h4>
              <p style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.4' }}>
                Integrates the latest legal statutes (BNS, BNSS, BSA) directly with crime categories to suggest relevant legal provisions automatically during filing.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#f59e0b', fontWeight: '700', marginBottom: '6px' }}>Modus Operandi Scans</h4>
              <p style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.4' }}>
                Applies automated textual matching algorithms to identify duplicate criminals, matched MOs, and jurisdiction clusters.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#e11d48', fontWeight: '700', marginBottom: '6px' }}>Visual Data Streams</h4>
              <p style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.4' }}>
                Empowers tactical crime analysts to aggregate statistics, view heat maps, identify peak activity hours, and generate signed PDFs.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/login" className="btn btn-primary">
            Access Portal
          </Link>
          <Link to="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;

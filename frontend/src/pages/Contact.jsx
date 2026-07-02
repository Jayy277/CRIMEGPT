import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 20px',
      background: 'radial-gradient(circle at top, rgba(6,182,212,0.05) 0%, transparent 60%)',
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
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
            Secure Contact Line
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Submit an encrypted inquiry or request technical support.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16,185,129,0.1)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                margin: '0 auto 16px'
              }}>
                ✓
              </div>
              <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>Transmission Complete</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
                Your message was logged under encrypted transport. The system administrator will respond to your registered terminal email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Officer / Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Secure Response Email</label>
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Support Query / Message</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your issue or query..."
                  className="form-control"
                  style={{ resize: 'vertical' }}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                Send Message
              </button>
            </form>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Contact;

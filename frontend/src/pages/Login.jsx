import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { user, login } = useContext(AuthContext);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'analyst') navigate('/analyst/dashboard');
      else navigate('/officer/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(usernameOrEmail, password);
    setLoading(false);

    if (result.success) {
      if (result.role === 'admin') navigate('/admin/dashboard');
      else if (result.role === 'analyst') navigate('/analyst/dashboard');
      else navigate('/officer/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.04) 0%, transparent 60%)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #e11d48)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '24px',
            color: '#fff',
            margin: '0 auto 12px',
            boxShadow: '0 0 20px rgba(6,182,212,0.3)'
          }}>
            C
          </div>
          <h2 style={{ fontSize: '24px', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>Access CrimeGPT</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Enter credentials to access secure terminal</p>
        </div>

        {error && (
          <div className="glass-card" style={{
            padding: '12px',
            borderLeft: '4px solid #e11d48',
            backgroundColor: 'rgba(225,29,72,0.06)',
            color: '#fda4af',
            fontSize: '13px',
            marginBottom: '20px',
            borderRadius: '6px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Username or Email Address</label>
            <input
              type="text"
              placeholder="e.g. admin@crimegpt.com"
              className="form-control"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label>Secure Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', height: '45px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In Securely'}
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Authorized Personnel Only. Logins are audited.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;

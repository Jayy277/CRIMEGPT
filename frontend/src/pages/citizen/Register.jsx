import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const CitizenRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [identityType, setIdentityType] = useState('Aadhaar Card');
  const [identityNumber, setIdentityNumber] = useState('');
  const [idFile, setIdFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }
    setError('');
    setIdFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const phoneRegex = /^[789]\d{9}$/;
    if (!phoneRegex.test(mobile)) {
      setError('Mobile number must be 10 digits starting with 7, 8, or 9.');
      return;
    }
    if (!idFile) {
      setError('Please upload your identity proof.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('mobile', mobile);
    formData.append('dob', dob);
    formData.append('gender', gender);
    formData.append('address', address);
    formData.append('state', state);
    formData.append('city', city);
    formData.append('pincode', pincode);
    formData.append('identityType', identityType);
    formData.append('identityNumber', identityNumber);
    formData.append('idProof', idFile);

    try {
      const res = await axios.post('/api/citizen/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/citizen/login');
        }, 2000);
      } else {
        setError(res.data.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: "url('/assets/citizen_bg_clean.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      backgroundColor: '#0B1220',
      color: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Subtle Light Dark Overlay (rgba(11,18,32,0.15)) - Background map stays crisp, sharp and highly visible */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 18, 32, 0.15)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* FOREGROUND: Center aligned glassmorphism register card */}
      <div className="glass-card" style={{
        width: '700px', // Width exactly 700px
        maxWidth: '100%',
        maxHeight: '90vh', // Keeps the layout clean and fits inside the viewport
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        border: '1px solid rgba(0, 217, 255, 0.15)',
        background: 'rgba(18, 27, 45, 0.82)', // Dark translucent card background
        backdropFilter: 'blur(12px)', // Backdrop blur is on the card itself only
        boxShadow: '0 0 35px rgba(0, 217, 255, 0.25), inset 0 0 15px rgba(0, 217, 255, 0.05)', // Cyan border glow
        zIndex: 2,
        position: 'relative',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box'
      }}>
        
        {/* Scrollable inner content container to prevent whole-page scrolling */}
        <div style={{
          padding: '40px',
          overflowY: 'auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '11px', color: '#9AA4B2', display: 'block', marginBottom: '4px' }}>Join CrimePilot AI Citizen Network</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, Outfit, sans-serif' }}>
              Create Citizen Account
            </h2>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              borderLeft: '3.5px solid #ef4444',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#fca5a5',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              borderLeft: '3.5px solid #10b981',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#a7f3d0',
              marginBottom: '20px'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Credentials */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Full Name</label>
              <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required placeholder="Enter Your Full Name" />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Email Address</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter email address" />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Mobile Number</label>
              <input type="text" className="form-control" value={mobile} onChange={e => setMobile(e.target.value)} required placeholder="Enter mobile number" />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Password</label>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Confirm Password</label>
              <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
            </div>

            {/* Personal details */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Date of Birth</label>
              <input type="date" className="form-control" value={dob} onChange={e => setDob(e.target.value)} required />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Gender</label>
              <select className="form-control" value={gender} onChange={e => setGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Address</label>
              <textarea className="form-control" value={address} onChange={e => setAddress(e.target.value)} required placeholder="House No, Street, Landmark" style={{ minHeight: '60px' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>City</label>
              <input type="text" className="form-control" value={city} onChange={e => setCity(e.target.value)} required placeholder="Ahmedabad" />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>State</label>
              <input type="text" className="form-control" value={state} onChange={e => setState(e.target.value)} required placeholder="Gujarat" />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Pincode</label>
              <input type="text" className="form-control" value={pincode} onChange={e => setPincode(e.target.value)} required placeholder="380015" />
            </div>

            {/* Identity Proof */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Identity Type</label>
              <select className="form-control" value={identityType} onChange={e => setIdentityType(e.target.value)}>
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Identity Card Number</label>
              <input type="text" className="form-control" value={identityNumber} onChange={e => setIdentityNumber(e.target.value)} required placeholder="Card ID Number" />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Upload Identity Document (Max 5MB, JPG/PNG/PDF)</label>
              <input type="file" onChange={handleFileChange} required accept=".jpg,.jpeg,.png,.pdf" style={{
                width: '100%',
                backgroundColor: '#0B1220',
                border: '1px solid rgba(0, 217, 255, 0.15)',
                borderRadius: '8px',
                padding: '10px',
                color: '#fff',
                fontSize: '13px',
                boxSizing: 'border-box'
              }} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                gridColumn: 'span 2',
                padding: '14px',
                backgroundColor: '#00D9FF',
                color: '#0B1220',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '10px',
                transition: 'all 0.25s ease'
              }}
            >
              {loading ? 'Submitting Registration...' : 'Submit Citizen Credentials'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#9AA4B2' }}>
            Already have an account?{' '}
            <Link to="/citizen/login" style={{ color: '#00D9FF', textDecoration: 'none', fontWeight: 'bold' }}>
              Login Here
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .form-control {
          width: 100%;
          background-color: #0B1220;
          border: 1px solid rgba(0, 217, 255, 0.15);
          border-radius: 8px;
          padding: 10px 14px;
          color: #fff;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .form-control:focus {
          border-color: #00D9FF !important;
        }
        .glass-card:hover {
          box-shadow: 0 0 50px rgba(0, 217, 255, 0.4) !important;
          border-color: rgba(0, 217, 255, 0.3) !important;
        }
        /* Custom scrollbar styling for the inner form container */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(18, 27, 45, 0.5);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 217, 255, 0.3);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 217, 255, 0.6);
        }
      `}</style>
    </div>
  );
};

export default CitizenRegister;

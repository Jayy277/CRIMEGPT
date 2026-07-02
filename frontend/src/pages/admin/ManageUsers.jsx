import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Toggle Forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // New User Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('officer');
  const [badgeNo, setBadgeNo] = useState('');
  const [station, setStation] = useState('');
  const [contact, setContact] = useState('');
  const [department, setDepartment] = useState('');

  // Edit User Form States
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editBadgeNo, setEditBadgeNo] = useState('');
  const [editStation, setEditStation] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editDepartment, setEditDepartment] = useState('');

  const fetchUsersAndLocations = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersRes, locationsRes] = await Promise.all([
        axiosInstance.get('/admin/users'),
        axiosInstance.get('/admin/locations'),
      ]);

      if (usersRes.data && usersRes.data.success) {
        setUsers(usersRes.data.users || []);
      }
      if (locationsRes.data && locationsRes.data.locations) {
        setLocations(locationsRes.data.locations || []);
      }
    } catch (err) {
      console.error('Error fetching admin user management:', err);
      setError('Failed to fetch user directory or police station locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndLocations();
  }, []);

  // Handle User Signup (Create User)
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name,
        email,
        password,
        role,
      };

      if (role === 'officer') {
        payload.badgeNo = badgeNo;
        payload.station = station;
        payload.contact = contact;
      } else if (role === 'analyst') {
        payload.department = department;
      }

      const res = await axiosInstance.post('/auth/signup', payload);
      if (res.data && res.data.success) {
        setSuccess(`User ${name} registered successfully as ${role.toUpperCase()}.`);
        setShowAddForm(false);
        // Clear fields
        setName('');
        setEmail('');
        setPassword('');
        setRole('officer');
        setBadgeNo('');
        setStation('');
        setContact('');
        setDepartment('');
        fetchUsersAndLocations();
      }
    } catch (err) {
      console.error('Error adding user:', err);
      setError(err.response?.data?.message || 'Failed to register new user.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Toggle Active/Deactive login status
  const handleToggleActive = async (userId) => {
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.patch(`/admin/users/${userId}/toggle-active`);
      if (res.data && res.data.success) {
        setSuccess(res.data.message);
        setUsers(prev =>
          prev.map(item =>
            item.user._id === userId
              ? { ...item, user: { ...item.user, isActive: res.data.isActive } }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Error toggling active status:', err);
      setError(err.response?.data?.message || 'Failed to update user login active state.');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user: ${userName}? This will clean up their profiles.`)) return;

    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.delete(`/admin/users/${userId}`);
      if (res.data && res.data.success) {
        setSuccess(`User ${userName} deleted successfully.`);
        setUsers(prev => prev.filter(item => item.user._id !== userId));
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Start Edit Mode
  const startEdit = (item) => {
    setEditingUser(item.user);
    setEditName(item.user.name);
    setEditEmail(item.user.email);
    setEditRole(item.user.role);
    setEditBadgeNo(item.details?.badgeNo || '');
    setEditStation(item.details?.station?._id || item.details?.station || '');
    setEditContact(item.details?.contact || '');
    setEditDepartment(item.details?.department || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Edit Submit
  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: editName,
        email: editEmail,
        role: editRole,
      };

      if (editRole === 'officer') {
        payload.badgeNo = editBadgeNo;
        payload.station = editStation;
        payload.contact = editContact;
      } else if (editRole === 'analyst') {
        payload.department = editDepartment;
      }

      const res = await axiosInstance.put(`/admin/users/${editingUser._id}`, payload);
      if (res.data && res.data.success) {
        setSuccess('User details updated successfully.');
        setEditingUser(null);
        fetchUsersAndLocations();
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderLeftColor: '#e11d48',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
            Manage System Users
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Create, update, de-activate, or delete logs for Officers and Analysts.
          </p>
        </div>

        {!editingUser && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-crimson" style={{ fontSize: '13px' }}>
            {showAddForm ? 'Hide Form' : '+ Add System User'}
          </button>
        )}
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '16px', color: '#fda4af' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="glass-card" style={{ borderLeft: '4px solid #10b981', padding: '16px', color: '#a7f3d0' }}>
          {success}
        </div>
      )}

      {/* ==============================================
          ADD USER FORM
          ============================================== */}
      {showAddForm && (
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>Register New Personnel</h3>
          
          <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" required placeholder="e.g. Inspector John" className="form-control" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" required placeholder="email@crimegpt.com" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Default Password *</label>
                <input type="password" required placeholder="••••••••" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>System Portal Role *</label>
                <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="officer">Officer (Field Squad)</option>
                  <option value="analyst">Analyst (Data Analytics)</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              {/* Conditional Officer fields */}
              {role === 'officer' && (
                <>
                  <div className="form-group">
                    <label>Badge Number *</label>
                    <input type="text" required placeholder="e.g. BD-90812" className="form-control" value={badgeNo} onChange={e => setBadgeNo(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Assigned Station *</label>
                    <select required className="form-control" value={station} onChange={e => setStation(e.target.value)}>
                      <option value="">-- Choose Location --</option>
                      {locations.map(loc => (
                        <option key={loc._id} value={loc._id}>{loc.policeStation} ({loc.city})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contact Phone *</label>
                    <input type="text" required placeholder="Contact" className="form-control" value={contact} onChange={e => setContact(e.target.value)} />
                  </div>
                </>
              )}

              {/* Conditional Analyst fields */}
              {role === 'analyst' && (
                <div className="form-group">
                  <label>Department / Branch *</label>
                  <input type="text" required placeholder="e.g. Cyber Trends Unit" className="form-control" value={department} onChange={e => setDepartment(e.target.value)} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-crimson" disabled={submitting}>{submitting ? 'Registering...' : 'Register User'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ==============================================
          EDIT USER FORM
          ============================================== */}
      {editingUser && (
        <div className="glass-card" style={{ border: '1px solid #06b6d4' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>
            Edit Personnel Details: <span style={{ color: '#06b6d4' }}>{editingUser.name}</span>
          </h3>
          
          <form onSubmit={handleUpdateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" required className="form-control" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" required className="form-control" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Portal Role *</label>
                <select className="form-control" value={editRole} onChange={e => setEditRole(e.target.value)}>
                  <option value="officer">Officer (Field Squad)</option>
                  <option value="analyst">Analyst (Data Analytics)</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {editRole === 'officer' && (
                <>
                  <div className="form-group">
                    <label>Badge Number *</label>
                    <input type="text" required className="form-control" value={editBadgeNo} onChange={e => setEditBadgeNo(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Assigned Station *</label>
                    <select required className="form-control" value={editStation} onChange={e => setEditStation(e.target.value)}>
                      <option value="">-- Choose Location --</option>
                      {locations.map(loc => (
                        <option key={loc._id} value={loc._id}>{loc.policeStation} ({loc.city})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contact Phone *</label>
                    <input type="text" required className="form-control" value={editContact} onChange={e => setEditContact(e.target.value)} />
                  </div>
                </>
              )}

              {editRole === 'analyst' && (
                <div className="form-group">
                  <label>Department / Branch *</label>
                  <input type="text" required className="form-control" value={editDepartment} onChange={e => setEditDepartment(e.target.value)} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Updating...' : 'Save Updates'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ==============================================
          USERS LIST DIRECTORY
          ============================================== */}
      <div className="glass-card">
        <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>System Personnel Registry</h3>
        {users.length === 0 ? (
          <div style={{ color: '#64748b', fontStyle: 'italic', padding: '20px 0' }}>No users recorded.</div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Affiliation / Badge</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => {
                  const u = item.user;
                  const details = item.details;
                  
                  // Role color mapping
                  const getRoleColor = (roleVal) => {
                    if (roleVal === 'admin') return '#f43f5e';
                    if (roleVal === 'analyst') return '#06b6d4';
                    return '#f59e0b';
                  };

                  return (
                    <tr key={u._id}>
                      <td style={{ fontWeight: '700', color: '#fff' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          color: getRoleColor(u.role),
                          backgroundColor: `${getRoleColor(u.role)}11`,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: `1px solid ${getRoleColor(u.role)}22`
                        }}>{u.role}</span>
                      </td>
                      <td>
                        {u.role === 'officer' && details ? (
                          <span>Badge: <strong>{details.badgeNo}</strong> ({details.station?.policeStation || 'No Station'})</span>
                        ) : u.role === 'analyst' && details ? (
                          <span>Dept: {details.department}</span>
                        ) : (
                          <span style={{ color: '#64748b', fontStyle: 'italic' }}>System Admin</span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: u.isActive ? '#10b981' : '#64748b'
                        }}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => handleToggleActive(u._id)}
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px', color: u.isActive ? '#fbbf24' : '#10b981' }}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => startEdit(item)}
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px', color: '#f43f5e', borderColor: 'rgba(244,63,94,0.1)' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default ManageUsers;

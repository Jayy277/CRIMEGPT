import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import CaseCard from '../../components/CaseCard';

const Analytics = () => {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [crimeCategory, setCrimeCategory] = useState('');
  const [location, setLocation] = useState('');

  // Results
  const [crimes, setCrimes] = useState([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0, pending: 0, solved: 0 });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setFetchingOptions(true);
        const [categoriesRes, locationsRes] = await Promise.all([
          axiosInstance.get('/admin/crime-categories'),
          axiosInstance.get('/admin/locations'),
        ]);

        if (categoriesRes.data && categoriesRes.data.categories) {
          setCategories(categoriesRes.data.categories);
        }
        if (locationsRes.data && locationsRes.data.locations) {
          setLocations(locationsRes.data.locations);
        }
      } catch (err) {
        console.error('Error fetching deep analytics filters:', err);
        setError('Failed to fetch filter options.');
      } finally {
        setFetchingOptions(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleApplyFilters = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (crimeCategory) params.append('crimeCategory', crimeCategory);
      if (location) params.append('location', location);
      // Wait, date ranges are queried on /api/dashboard/report or /api/crimes?
      // Let's check how the backend handles date range. In getReport, date range is handled, but let's see if general crimes list supports date range or if we can filter client-side / call /api/dashboard/report.
      // Wait! /api/dashboard/report can return the filtered list of crimes!
      // In dashboardController.getReport:
      // "startDate || endDate" -> filter.date = {}; ...
      // And it returns `crimes` in JSON format if no format='pdf' is passed!
      // This is perfect! We can query `/dashboard/report` with startDate, endDate, crimeCategory, location, and it will return the exact filtered list of crimes!
      // Wait, let's verify if getReport supports category and location. In dashboardController.js:
      // it supports startDate, endDate, priority, status.
      // Wait, what about general crimes endpoint? Let's check if the general crimes endpoint in crimeController.js supports date ranges.
      // In crimeController.js, lines 85+ doesn't explicitly filter dates from query params, but it supports crimeCategory and location.
      // Let's call /api/crimes first, and we can filter by date range on the client-side, or call `/dashboard/report` which filters dates on the database!
      // Let's query `/crimes` with category and location, and then apply date filters on the returned array, or query `/dashboard/report?startDate=...&endDate=...` directly!
      // Let's do both: query `/crimes?crimeCategory=...&location=...` and filter dates on the client side, which is extremely robust.
      const queryParams = new URLSearchParams();
      if (crimeCategory) queryParams.append('crimeCategory', crimeCategory);
      if (location) queryParams.append('location', location);

      const res = await axiosInstance.get(`/crimes?${queryParams.toString()}`);
      if (res.data && res.data.success) {
        let list = res.data.crimes || [];

        // Apply date filtering client-side if specified
        if (startDate) {
          const start = new Date(startDate);
          list = list.filter(c => new Date(c.date) >= start);
        }
        if (endDate) {
          const end = new Date(endDate + 'T23:59:59.999Z');
          list = list.filter(c => new Date(c.date) <= end);
        }

        setCrimes(list);

        // Calculate distribution stats
        const summaryStats = list.reduce((acc, c) => {
          acc.total += 1;
          if (c.priority === 'Critical') acc.critical += 1;
          else if (c.priority === 'High') acc.high += 1;
          else if (c.priority === 'Medium') acc.medium += 1;
          else acc.low += 1;

          if (c.isPending) acc.pending += 1;
          else acc.solved += 1;

          return acc;
        }, { total: 0, critical: 0, high: 0, medium: 0, low: 0, pending: 0, solved: 0 });

        setStats(summaryStats);
      }
    } catch (err) {
      console.error('Error fetching analytics breakdown:', err);
      setError('Failed to compute deep analytics values.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchingOptions) {
      handleApplyFilters();
    }
  }, [fetchingOptions, crimeCategory, location, startDate, endDate]);

  if (fetchingOptions) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderLeftColor: '#06b6d4',
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
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
          Deep Case Breakdown
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Deconstruct case loads, priority mappings, and resolution progress.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '16px', color: '#fda4af' }}>
          {error}
        </div>
      )}

      {/* Advanced Interactive Filters */}
      <div className="glass-card">
        <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>End Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Crime Category</label>
            <select
              className="form-control"
              value={crimeCategory}
              onChange={e => setCrimeCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Police Station Station</label>
            <select
              className="form-control"
              value={location}
              onChange={e => setLocation(e.target.value)}
            >
              <option value="">All Stations</option>
              {locations.map(l => (
                <option key={l._id} value={l._id}>{l.policeStation}</option>
              ))}
            </select>
          </div>

        </form>
      </div>

      {/* Stats Breakdown Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
        
        {/* Total Matches */}
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Filtered Cases</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>{stats.total}</div>
        </div>

        {/* Critical */}
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderBottom: '3px solid #e11d48' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Critical Prio</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#e11d48', marginTop: '4px' }}>{stats.critical}</div>
        </div>

        {/* High */}
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderBottom: '3px solid #f43f5e' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>High Prio</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#f43f5e', marginTop: '4px' }}>{stats.high}</div>
        </div>

        {/* Medium */}
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderBottom: '3px solid #f59e0b' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Medium Prio</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>{stats.medium}</div>
        </div>

        {/* Low */}
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderBottom: '3px solid #38bdf8' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Low Prio</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>{stats.low}</div>
        </div>

        {/* Solved vs Pending */}
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Solved / Active</span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', marginTop: '8px' }}>
            {stats.solved} <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>/</span> <span style={{ color: '#e11d48' }}>{stats.pending}</span>
          </div>
        </div>

      </div>

      {/* Case Grid */}
      <div>
        <h2 style={{ fontSize: '18px', fontFamily: 'Outfit, sans-serif', color: '#fff', marginBottom: '16px' }}>
          Filtered Records List
        </h2>
        
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '20vh' }}>
            <div style={{
              border: '3px solid rgba(255,255,255,0.1)',
              borderLeftColor: '#06b6d4',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ) : crimes.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No crime records match the filtered criteria.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {crimes.map(crime => (
              <CaseCard key={crime._id} crime={crime} role="analyst" />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Analytics;

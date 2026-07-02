import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const LegalSectionDropdown = ({ categoryId, selectedSections, onChange }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!categoryId) {
      setSections([]);
      return;
    }

    const fetchSections = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get(`/crime-categories/${categoryId}/sections`);
        if (response.data && response.data.sections) {
          setSections(response.data.sections);
        }
      } catch (err) {
        console.error('Error fetching sections:', err);
        setError('Failed to load legal sections for this category.');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [categoryId]);

  const handleToggleSection = (sectionObj) => {
    const isSelected = selectedSections.some(
      (s) => s.act === sectionObj.act && s.section === sectionObj.section
    );

    let updated;
    if (isSelected) {
      updated = selectedSections.filter(
        (s) => !(s.act === sectionObj.act && s.section === sectionObj.section)
      );
    } else {
      updated = [...selectedSections, sectionObj];
    }
    onChange(updated);
  };

  if (!categoryId) {
    return (
      <div style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic', padding: '10px 0' }}>
        Please select a Crime Category first to load legal sections.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0', color: '#06b6d4', fontSize: '13px' }}>
        <div style={{
          border: '2px solid rgba(6, 182, 212, 0.2)',
          borderLeftColor: '#06b6d4',
          borderRadius: '50%',
          width: '16px',
          height: '16px',
          animation: 'spin 0.8s linear infinite'
        }} />
        Loading legal sections (BNS / BNSS)...
      </div>
    );
  }

  if (error) {
    return <div style={{ color: '#e11d48', fontSize: '13px', padding: '10px 0' }}>{error}</div>;
  }

  if (sections.length === 0) {
    return (
      <div style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic', padding: '10px 0' }}>
        No legal sections configured for this crime type.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>
        Select Applicable Acts & Legal Sections (Custom Feature A)
      </label>
      
      {/* Scrollable Checkbox Container */}
      <div
        style={{
          maxHeight: '160px',
          overflowY: 'auto',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          background: 'rgba(7, 10, 19, 0.6)',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        {sections.map((sec) => {
          const isChecked = selectedSections.some(
            (s) => s.act === sec.act && s.section === sec.section
          );

          return (
            <label
              key={`${sec.act}-${sec.section}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: isChecked ? 'rgba(6,182,212,0.08)' : 'transparent',
                border: `1px solid ${isChecked ? 'rgba(6,182,212,0.2)' : 'transparent'}`,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isChecked) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
              }}
              onMouseLeave={(e) => {
                if (!isChecked) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggleSection(sec)}
                style={{
                  marginTop: '3px',
                  accentColor: '#06b6d4',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                <span style={{ fontWeight: '700', color: isChecked ? '#22d3ee' : '#fff' }}>
                  {sec.act} Section {sec.section}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '11px', lineHeight: '1.3' }}>
                  {sec.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default LegalSectionDropdown;

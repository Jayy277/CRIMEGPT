import React from 'react';

export const getDepartmentLabel = (emailOrRole) => {
  if (!emailOrRole) return '';
  const val = emailOrRole.toLowerCase();
  if (val.includes('officer') || val.includes('field') || val.includes('john') || val.includes('sarah') || val.includes('david') || val.includes('emily') || val.includes('james')) return 'FIELD DIVISION';
  if (val.includes('analyst') || val.includes('intel') || val.includes('carl') || val.includes('neha')) return 'INTELLIGENCE DIVISION';
  if (val.includes('admin') || val.includes('command')) return 'COMMAND DIVISION';
  return '';
};

export const getDepartmentColor = (emailOrRole) => {
  if (!emailOrRole) return '#3B82F6';
  const val = emailOrRole.toLowerCase();
  if (val.includes('officer') || val.includes('field') || val.includes('john') || val.includes('sarah') || val.includes('david') || val.includes('emily') || val.includes('james')) return '#fbbf24'; // Amber/Gold for Field
  if (val.includes('analyst') || val.includes('intel') || val.includes('carl') || val.includes('neha')) return '#06b6d4'; // Cyan for Intel
  if (val.includes('admin') || val.includes('command')) return '#f43f5e'; // Crimson/Rose for Command
  return '#3B82F6'; // Default Cobalt
};

export const renderDepartmentBadge = (emailOrRole, customStyle = {}) => {
  const label = getDepartmentLabel(emailOrRole);
  if (!label) return null;
  const color = getDepartmentColor(emailOrRole);
  
  return (
    <span
      style={{
        fontSize: '9px',
        fontWeight: '800',
        color: color,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}33`,
        padding: '2px 8px',
        borderRadius: '4px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontFamily: 'JetBrains Mono, monospace',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: `0 0 8px ${color}10`,
        ...customStyle
      }}
    >
      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
      {label}
    </span>
  );
};

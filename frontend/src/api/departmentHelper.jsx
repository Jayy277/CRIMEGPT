import React from 'react';

export const getDepartmentLabel = (email) => {
  if (!email) return '';
  const emailLower = email.toLowerCase();
  if (emailLower.endsWith('@field.crimepilot.com')) return 'FIELD DIVISION';
  if (emailLower.endsWith('@intel.crimepilot.com')) return 'INTELLIGENCE DIVISION';
  if (emailLower.endsWith('@command.crimepilot.com')) return 'COMMAND DIVISION';
  return '';
};

export const getDepartmentColor = (email) => {
  if (!email) return '#3B82F6';
  const emailLower = email.toLowerCase();
  if (emailLower.endsWith('@field.crimepilot.com')) return '#fbbf24'; // Amber/Gold for Field
  if (emailLower.endsWith('@intel.crimepilot.com')) return '#06b6d4'; // Cyan for Intel
  if (emailLower.endsWith('@command.crimepilot.com')) return '#f43f5e'; // Crimson/Rose for Command
  return '#3B82F6'; // Default Cobalt
};

export const renderDepartmentBadge = (email, customStyle = {}) => {
  const label = getDepartmentLabel(email);
  if (!label) return null;
  const color = getDepartmentColor(email);
  
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

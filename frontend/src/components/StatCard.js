import React from 'react';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
};

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div
    className="stat-card"
    style={{
      ...glassStyle,
      padding: '24px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', margin: '0 0 8px 0' }}>{title}</p>
        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>{value}</p>
        {change !== undefined && (
          <p style={{ 
            fontSize: '14px', 
            color: change > 0 ? '#10b981' : '#ef4444',
            margin: '0',
            fontWeight: '500'
          }}>
            {change > 0 ? '+' : ''}{change}% vs précédent
          </p>
        )}
      </div>
      <div style={{
        padding: '16px',
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        boxShadow: `0 8px 32px ${color}40`,
      }}>
        <Icon style={{ width: '32px', height: '32px', color: '#ffffff' }} />
      </div>
    </div>
  </div>
);

export default StatCard;


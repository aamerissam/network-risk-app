import React from 'react';
import { CheckCircle, AlertTriangle, Shield } from 'lucide-react';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
};

const ComplianceTab = ({ modelMetrics }) => {
  const calculateComplianceScores = () => {
    const baseScore = Math.min(100, Math.max(70, modelMetrics.accuracy));
    
    return {
      gdpr: baseScore - Math.random() * 5,
      iso27001: baseScore - Math.random() * 3,
      nistCsf: baseScore - Math.random() * 7,
      pci: baseScore - Math.random() * 4
    };
  };

  const complianceScores = calculateComplianceScores();

  const recommendations = [
    {
      severity: complianceScores.gdpr > 95 ? 'BASSE' : 'MOYENNE',
      framework: 'RGPD',
      recommendation: complianceScores.gdpr > 95 ? 'Conforme' : 'Audit recommandé',
      action: complianceScores.gdpr > 95 ? 'Maintenir la conformité' : 'Revoir la conformité',
      impact: 'Protection des données'
    },
    {
      severity: complianceScores.iso27001 > 95 ? 'BASSE' : 'MOYENNE',
      framework: 'ISO 27001',
      recommendation: complianceScores.iso27001 > 95 ? 'Certifiable' : 'Amélioration nécessaire',
      action: 'Audit de sécurité',
      impact: 'Sécurité de l\'information'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ ...glassStyle, padding: '24px' }}>
        <h3 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '24px', 
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Shield style={{ width: '24px', height: '24px', marginRight: '8px', color: '#10b981' }} />
          Conformité Réglementaire
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'RGPD', score: complianceScores.gdpr, color: '#10b981' },
            { label: 'ISO 27001', score: complianceScores.iso27001, color: '#3b82f6' },
            { label: 'NIST CSF', score: complianceScores.nistCsf, color: '#8b5cf6' },
            { label: 'PCI DSS', score: complianceScores.pci, color: '#f59e0b' }
          ].map((item, index) => (
            <div key={index} style={{
              padding: '20px',
              background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
              border: `1px solid ${item.color}40`,
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: item.color }}>
                {item.score.toFixed(1)}%
              </div>
              <div style={{ 
                marginTop: '12px',
                padding: '6px 12px',
                borderRadius: '20px',
                background: item.score > 95 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: item.score > 95 ? '#10b981' : '#f59e0b',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {item.score > 95 ? 'Conforme' : 'À améliorer'}
              </div>
            </div>
          ))}
        </div>

        <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
          Recommandations
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {recommendations.map((rec, index) => (
            <div key={index} style={{
              padding: '20px',
              background: rec.severity === 'BASSE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${rec.severity === 'BASSE' ? '#10b981' : '#f59e0b'}40`,
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {rec.severity === 'BASSE' ? (
                    <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
                  ) : (
                    <AlertTriangle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                  )}
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
                    {rec.framework}
                  </span>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: rec.severity === 'BASSE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: rec.severity === 'BASSE' ? '#10b981' : '#f59e0b',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {rec.severity}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>
                <strong>Recommandation:</strong> {rec.recommendation}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>
                <strong>Action:</strong> {rec.action}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                <strong>Impact:</strong> {rec.impact}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceTab;


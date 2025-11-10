import React from 'react';
import { Database } from 'lucide-react';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
};

const PredictionsTab = ({ analysisResults }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={{ ...glassStyle, padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#ffffff',
          margin: 0,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Database style={{ width: '24px', height: '24px', marginRight: '8px', color: '#3b82f6' }} />
          Résultats d'Analyse XGBoost (Backend FastAPI)
        </h3>
      </div>

      {analysisResults && Array.isArray(analysisResults) && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{
              padding: '16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {analysisResults.filter(r => r.prediction === '0' || r.threatType === 'Normal').length}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(16, 185, 129, 0.8)' }}>Trafic Bénin</div>
            </div>
            
            <div style={{
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                {analysisResults.filter(r => r.prediction !== '0' && r.threatType !== 'Normal').length}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(239, 68, 68, 0.8)' }}>Trafic Malveillant</div>
            </div>
            
            <div style={{
              padding: '16px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                {(analysisResults.reduce((sum, r) => sum + parseFloat(r.confidence || 0), 0) / analysisResults.length).toFixed(3)}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(59, 130, 246, 0.8)' }}>Confiance Moyenne</div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ 
        maxHeight: '600px', 
        overflowY: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', color: '#ffffff', fontWeight: '600', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                ID
              </th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#ffffff', fontWeight: '600', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                Timestamp
              </th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#ffffff', fontWeight: '600', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                Prédiction
              </th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#ffffff', fontWeight: '600', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                Confiance
              </th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#ffffff', fontWeight: '600', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                Type de Menace
              </th>
            </tr>
          </thead>
          <tbody>
            {(analysisResults || []).map((result, index) => (
              <tr key={result.id || index} style={{ 
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                  #{result.id}
                </td>
                <td style={{ padding: '12px 16px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                  {result.timestamp}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: result.prediction !== '0' && result.threatType !== 'Normal'
                      ? 'rgba(239, 68, 68, 0.2)' 
                      : 'rgba(16, 185, 129, 0.2)',
                    color: result.prediction !== '0' && result.threatType !== 'Normal' ? '#ef4444' : '#10b981',
                    border: `1px solid ${result.prediction !== '0' && result.threatType !== 'Normal' ? '#ef4444' : '#10b981'}40`
                  }}>
                    {result.prediction === '0' || result.threatType === 'Normal' ? 'BENIGN' : 'MALICIOUS'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#ffffff', fontWeight: '500' }}>
                  {result.confidence}
                </td>
                <td style={{ padding: '12px 16px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  {result.threatType || 'Normal'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default PredictionsTab;


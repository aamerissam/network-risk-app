import React from 'react';

const glassStyle = {
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
};

const DualModelPredictionsTab = ({ benchmarkResults }) => {
  if (!benchmarkResults) {
    return (
      <div style={{ ...glassStyle, padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>
          Aucune donnée de prédiction disponible. Uploadez un fichier pour voir les résultats.
        </p>
      </div>
    );
  }

  const { xgboost, mlp } = benchmarkResults;
  const totalSamples = Math.min(xgboost.results.length, mlp.results.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ ...glassStyle, padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>
          📊 Prédictions Détaillées - XGBoost vs MLP
        </h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 24px 0' }}>
          Comparaison côte à côte des prédictions des deux modèles (affichage de {Math.min(50, totalSamples)} échantillons)
        </p>

        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '600px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.95)', zIndex: 10 }}>
              <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                <th rowSpan="2" style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', fontSize: '14px', borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>ID</th>
                <th colSpan="3" style={{ padding: '12px 16px', textAlign: 'center', color: '#3b82f6', fontWeight: '600', fontSize: '14px', borderRight: '1px solid rgba(255, 255, 255, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  🚀 XGBoost
                </th>
                <th colSpan="3" style={{ padding: '12px 16px', textAlign: 'center', color: '#8b5cf6', fontWeight: '600', fontSize: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  🧠 MLP
                </th>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', fontSize: '13px' }}>Prédiction</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', fontSize: '13px' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', fontSize: '13px', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>Confiance</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', fontSize: '13px' }}>Prédiction</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', fontSize: '13px' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', fontSize: '13px' }}>Confiance</th>
              </tr>
            </thead>
            <tbody>
              {xgboost.results.slice(0, 50).map((xgbResult, index) => {
                const mlpResult = mlp.results[index];
                const agree = xgbResult.prediction_label === mlpResult.prediction_label;
                
                return (
                  <tr 
                    key={index}
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.2s ease',
                      background: !agree ? 'rgba(245, 158, 11, 0.05)' : 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = !agree ? 'rgba(245, 158, 11, 0.05)' : 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      #{index}
                      {!agree && <span style={{ marginLeft: '8px', fontSize: '12px' }}>⚠️</span>}
                    </td>
                    
                    {/* XGBoost */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: xgbResult.is_malicious ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: xgbResult.is_malicious ? '#ef4444' : '#10b981',
                        border: `1px solid ${xgbResult.is_malicious ? '#ef4444' : '#10b981'}40`
                      }}>
                        {xgbResult.is_malicious ? 'MALICIOUS' : 'BENIGN'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px' }}>
                      {xgbResult.threat_type}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontWeight: '500', fontSize: '13px', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      {xgbResult.confidence.toFixed(3)}
                    </td>
                    
                    {/* MLP */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: mlpResult.is_malicious ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: mlpResult.is_malicious ? '#ef4444' : '#10b981',
                        border: `1px solid ${mlpResult.is_malicious ? '#ef4444' : '#10b981'}40`
                      }}>
                        {mlpResult.is_malicious ? 'MALICIOUS' : 'BENIGN'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px' }}>
                      {mlpResult.threat_type}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontWeight: '500', fontSize: '13px' }}>
                      {mlpResult.confidence.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DualModelPredictionsTab;


import React from 'react';

const glassStyle = {
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
};

const BenchmarkTab = ({ benchmarkResults }) => {
  if (!benchmarkResults) {
    return (
      <div style={{ ...glassStyle, padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>
          No benchmark results available. Upload a file to compare XGBoost vs MLP models.
        </p>
      </div>
    );
  }

  const { xgboost, mlp, comparison, file_info } = benchmarkResults;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Info */}
      <div style={{ ...glassStyle, padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>
          📊 Model Comparison Results
        </h3>
        {file_info && (
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
            <p style={{ margin: '4px 0' }}>File: <strong>{file_info.filename}</strong></p>
            <p style={{ margin: '4px 0' }}>Total rows: {file_info.total_rows} | Analyzed: {file_info.analyzed_rows}</p>
          </div>
        )}
      </div>

      {/* Performance Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        {/* XGBoost Stats */}
        <div style={{ ...glassStyle, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🚀
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                XGBoost
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
                {xgboost.processing_time.toFixed(3)}s
              </div>
            </div>
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
            <p style={{ margin: '4px 0' }}>Malicious: {comparison.xgboost_malicious_count}</p>
            <p style={{ margin: '4px 0' }}>Avg: {(xgboost.avg_time_per_sample * 1000).toFixed(2)}ms/sample</p>
          </div>
        </div>

        {/* MLP Stats */}
        <div style={{ ...glassStyle, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🧠
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                MLP
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
                {mlp.processing_time.toFixed(3)}s
              </div>
            </div>
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
            <p style={{ margin: '4px 0' }}>Malicious: {comparison.mlp_malicious_count}</p>
            <p style={{ margin: '4px 0' }}>Avg: {(mlp.avg_time_per_sample * 1000).toFixed(2)}ms/sample</p>
          </div>
        </div>

        {/* Agreement Stats */}
        <div style={{ ...glassStyle, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px',
              background: comparison.agreement_rate >= 90 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              {comparison.agreement_rate >= 90 ? '✅' : '⚠️'}
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                Agreement
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
                {comparison.agreement_rate.toFixed(1)}%
              </div>
            </div>
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
            <p style={{ margin: '4px 0' }}>Agreements: {comparison.agreements}</p>
            <p style={{ margin: '4px 0' }}>Disagreements: {comparison.disagreements_count}</p>
          </div>
        </div>
      </div>

      {/* Disagreements Table */}
      {comparison.disagreements && comparison.disagreements.length > 0 && (
        <div style={{ ...glassStyle, padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
            🔍 Model Disagreements
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', fontSize: '14px' }}>ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', fontSize: '14px' }}>XGBoost</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', fontSize: '14px' }}>Confidence</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', fontSize: '14px' }}>MLP</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', fontSize: '14px' }}>Confidence</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', fontSize: '14px' }}>Original</th>
                </tr>
              </thead>
              <tbody>
                {comparison.disagreements.map((disagree, index) => (
                  <tr 
                    key={index} 
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                      #{disagree.id}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: disagree.xgboost_correct ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: disagree.xgboost_correct ? '#10b981' : '#ef4444',
                        border: `1px solid ${disagree.xgboost_correct ? '#10b981' : '#ef4444'}40`
                      }}>
                        {disagree.xgboost_threat}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px' }}>
                      {disagree.xgboost_confidence.toFixed(3)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: disagree.mlp_correct ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: disagree.mlp_correct ? '#10b981' : '#ef4444',
                        border: `1px solid ${disagree.mlp_correct ? '#10b981' : '#ef4444'}40`
                      }}>
                        {disagree.mlp_threat}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px' }}>
                      {disagree.mlp_confidence.toFixed(3)}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                      {disagree.original_label || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenchmarkTab;


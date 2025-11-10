import React from 'react';
import { Activity, Zap, Target, TrendingUp, RefreshCw } from 'lucide-react';
import FileUpload from './FileUpload';

const glassStyle = {
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
};

const BenchmarkDashboard = ({ 
  benchmarkResults, 
  modelMetrics,
  uploadedFile,
  onFileSelect,
  onClearFile,
  isBenchmarking,
  onRunBenchmark
}) => {
  // Get metrics from benchmark results or use defaults
  const xgbSamples = benchmarkResults?.dataset_info?.total_samples || 0;
  const mlpSamples = benchmarkResults?.dataset_info?.total_samples || 0;
  const xgbThreats = benchmarkResults?.comparison?.xgboost_malicious_count || 0;
  const mlpThreats = benchmarkResults?.comparison?.mlp_malicious_count || 0;

  const metrics = [
    {
      label: 'Précision du Modèle',
      icon: Target,
      xgboost: { value: `${modelMetrics.xgboost.accuracy}%`, color: '#3b82f6' },
      mlp: { value: `${modelMetrics.mlp.accuracy}%`, color: '#8b5cf6' }
    },
    {
      label: 'Échantillons Analysés',
      icon: Activity,
      xgboost: { value: xgbSamples, color: '#10b981' },
      mlp: { value: mlpSamples, color: '#10b981' }
    },
    {
      label: 'Menaces Détectées',
      icon: TrendingUp,
      xgboost: { value: xgbThreats, color: '#ef4444' },
      mlp: { value: mlpThreats, color: '#ef4444' }
    },
    {
      label: 'F1-Score',
      icon: Zap,
      xgboost: { value: `${modelMetrics.xgboost.f1Score}%`, color: '#f59e0b' },
      mlp: { value: `${modelMetrics.mlp.f1Score}%`, color: '#f59e0b' }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* File Upload Section */}
      <div style={{ ...glassStyle, padding: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#ffffff', 
          margin: '0 0 8px 0' 
        }}>
          🔬 XGBoost vs MLP Benchmark
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 24px 0', fontSize: '15px' }}>
          Uploadez un fichier CSV pour comparer les performances des deux modèles côte à côte
        </p>
        
        <FileUpload 
          uploadedFile={uploadedFile}
          onFileSelect={onFileSelect}
          onClearFile={onClearFile}
          isDisabled={isBenchmarking}
        />
        
        <button
          onClick={onRunBenchmark}
          disabled={isBenchmarking || !uploadedFile}
          style={{
            width: '100%',
            padding: '16px 32px',
            marginTop: '20px',
            background: isBenchmarking || !uploadedFile
              ? 'rgba(100, 116, 139, 0.5)'
              : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            cursor: isBenchmarking || !uploadedFile ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: !isBenchmarking && uploadedFile ? '0 8px 24px rgba(59, 130, 246, 0.3)' : 'none'
          }}
        >
          {isBenchmarking ? (
            <>
              <RefreshCw style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
              Analyse en cours...
            </>
          ) : (
            <>
              <Activity style={{ width: '20px', height: '20px' }} />
              Lancer le Benchmark
            </>
          )}
        </button>
      </div>

      {/* Metrics Grid - Side by Side Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} style={{ ...glassStyle, padding: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Icon style={{ width: '24px', height: '24px', color: metric.xgboost.color }} />
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                  {metric.label}
                </h3>
              </div>
              
              {/* XGBoost vs MLP Side by Side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* XGBoost */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <div style={{ fontSize: '12px', color: 'rgba(59, 130, 246, 0.8)', marginBottom: '8px', fontWeight: '500' }}>
                    🚀 XGBoost
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>
                    {metric.xgboost.value}
                  </div>
                </div>

                {/* MLP */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(109, 40, 217, 0.05))',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <div style={{ fontSize: '12px', color: 'rgba(139, 92, 246, 0.8)', marginBottom: '8px', fontWeight: '500' }}>
                    🧠 MLP
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>
                    {metric.mlp.value}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      {benchmarkResults && (
        <div style={{ ...glassStyle, padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '20px' }}>
            ⚡ Performance Comparison
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                XGBoost Processing Time
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
                {benchmarkResults.xgboost.processing_time.toFixed(3)}s
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                {(benchmarkResults.xgboost.avg_time_per_sample * 1000).toFixed(2)} ms/sample
              </div>
            </div>

            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                MLP Processing Time
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6' }}>
                {benchmarkResults.mlp.processing_time.toFixed(3)}s
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                {(benchmarkResults.mlp.avg_time_per_sample * 1000).toFixed(2)} ms/sample
              </div>
            </div>

            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: benchmarkResults.comparison.agreement_rate >= 90
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${benchmarkResults.comparison.agreement_rate >= 90 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
            }}>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                Agreement Rate
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: benchmarkResults.comparison.agreement_rate >= 90 ? '#10b981' : '#f59e0b' }}>
                {benchmarkResults.comparison.agreement_rate.toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                {benchmarkResults.comparison.disagreements_count} disagreements
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenchmarkDashboard;


import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, Activity, AlertTriangle, Database, Server, RefreshCw, Eye, TrendingUp, Zap } from 'lucide-react';
import StatCard from './StatCard';
import FileUpload from './FileUpload';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
};

const Dashboard = ({
  analysisResults,
  modelMetrics,
  backendStatus,
  threatDistributionData,
  uploadedFile,
  isAnalyzing,
  checkBackendHealth,
  handleFileSelection,
  clearSelectedFile,
  runBatchAnalysis
}) => {
  const threatStats = analysisResults ? {
    total: Array.isArray(analysisResults) ? analysisResults.length : 0,
    malicious: Array.isArray(analysisResults) ? analysisResults.filter(r => r.prediction !== '0' && r.threatType !== 'Normal').length : 0,
    benign: Array.isArray(analysisResults) ? analysisResults.filter(r => r.prediction === '0' || r.threatType === 'Normal').length : 0,
    accuracy: modelMetrics.accuracy
  } : { total: 0, malicious: 0, benign: 0, accuracy: modelMetrics.accuracy };

  const threatDistribution = threatDistributionData.length > 0 ? threatDistributionData : [
    { name: 'BENIGN', value: threatStats.benign, color: '#10b981' },
    { name: 'MALICIOUS', value: threatStats.malicious, color: '#ef4444' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Indicateur de connexion backend */}
      <div style={{
        ...glassStyle,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: backendStatus === 'connected' 
          ? 'rgba(16, 185, 129, 0.1)' 
          : backendStatus === 'disconnected' 
          ? 'rgba(239, 68, 68, 0.1)' 
          : 'rgba(245, 158, 11, 0.1)',
        border: `1px solid ${backendStatus === 'connected' ? '#10b981' : backendStatus === 'disconnected' ? '#ef4444' : '#f59e0b'}40`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Server style={{ 
            width: '20px', 
            height: '20px', 
            color: backendStatus === 'connected' ? '#10b981' : backendStatus === 'disconnected' ? '#ef4444' : '#f59e0b'
          }} />
          <span style={{ 
            color: '#ffffff', 
            fontWeight: '500' 
          }}>
            Backend Status: {backendStatus === 'connected' ? '✅ Connecté' : backendStatus === 'disconnected' ? '❌ Déconnecté' : '⏳ Vérification...'}
          </span>
        </div>
        <button
          onClick={checkBackendHealth}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Vérifier
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <StatCard 
          title="Précision du Modèle" 
          value={`${modelMetrics.accuracy.toFixed(2)}%`}
          icon={Shield} 
          color="#10b981"
        />
        <StatCard 
          title="Échantillons Analysés" 
          value={threatStats.total.toLocaleString()} 
          icon={Database} 
          color="#3b82f6"
        />
        <StatCard 
          title="Menaces Détectées" 
          value={threatStats.malicious} 
          icon={AlertTriangle} 
          color="#ef4444"
        />
        <StatCard 
          title="F1-Score" 
          value={`${modelMetrics.f1Score.toFixed(2)}%`}
          icon={TrendingUp} 
          color="#8b5cf6"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
        <FileUpload 
          uploadedFile={uploadedFile}
          onFileSelect={handleFileSelection}
          onFileClear={clearSelectedFile}
          isDisabled={isAnalyzing}
        />
        
        <button
          onClick={runBatchAnalysis}
          disabled={isAnalyzing || backendStatus !== 'connected'}
          style={{
            padding: '16px 32px',
            borderRadius: '16px',
            border: 'none',
            background: isAnalyzing 
              ? 'rgba(107, 114, 128, 0.5)' 
              : backendStatus !== 'connected'
              ? 'rgba(107, 114, 128, 0.5)'
              : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '16px',
            cursor: isAnalyzing || backendStatus !== 'connected' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.3s ease',
            boxShadow: backendStatus === 'connected' ? '0 8px 32px rgba(139, 92, 246, 0.3)' : 'none',
            minWidth: '250px'
          }}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
              Analyse en cours...
            </>
          ) : backendStatus !== 'connected' ? (
            <>
              <AlertTriangle style={{ width: '20px', height: '20px' }} />
              Backend déconnecté
            </>
          ) : (
            <>
              <Zap style={{ width: '20px', height: '20px' }} />
              Lancer l'analyse XGBoost
            </>
          )}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        <div style={{ ...glassStyle, padding: '24px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '16px', 
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Database style={{ width: '20px', height: '20px', marginRight: '8px', color: '#3b82f6' }} />
            Analyse de Dataset (CIC-IDS-2017)
          </h3>
          
          <div style={{
            padding: '20px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 16px',
              borderRadius: '16px',
              background: modelMetrics.accuracy > 90 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              border: `1px solid ${modelMetrics.accuracy > 90 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              backdropFilter: 'blur(10px)'
            }}>
              <Zap style={{ 
                width: '20px', 
                height: '20px', 
                marginRight: '8px', 
                color: modelMetrics.accuracy > 90 ? '#10b981' : '#f59e0b' 
              }} />
              <span style={{
                fontWeight: '500',
                color: modelMetrics.accuracy > 90 ? '#10b981' : '#f59e0b'
              }}>
                Modèle XGBoost: {modelMetrics.accuracy > 90 ? 'Optimal' : 'Bon'}
              </span>
            </div>
            <div style={{ fontSize: '16px', color: '#3b82f6', marginTop: '12px', marginBottom: '8px' }}>
              Dataset utilisé: test_api.csv
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
              Backend FastAPI sur port 8000
            </div>
          </div>
        </div>

        <div style={{ ...glassStyle, padding: '24px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '16px', 
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Activity style={{ width: '20px', height: '20px', marginRight: '8px', color: '#10b981' }} />
            Performance du Modèle XGBoost
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Accuracy', value: modelMetrics.accuracy, color: '#10b981' },
              { label: 'Precision', value: modelMetrics.precision, color: '#3b82f6' },
              { label: 'Recall', value: modelMetrics.recall, color: '#8b5cf6' },
              { label: 'F1-Score', value: modelMetrics.f1Score, color: '#f59e0b' }
            ].map((metric, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>{metric.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '80px',
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(100, metric.value)}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${metric.color}, ${metric.color}aa)`,
                      borderRadius: '4px',
                    }}></div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', minWidth: '55px' }}>
                    {metric.value.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {analysisResults && Array.isArray(analysisResults) && analysisResults.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
          <div style={{ ...glassStyle, padding: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '16px', 
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Eye style={{ width: '20px', height: '20px', marginRight: '8px', color: '#3b82f6' }} />
              Distribution des Prédictions
            </h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={threatDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {threatDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
              {threatDistribution.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#ffffff' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    marginRight: '8px', 
                    backgroundColor: item.color 
                  }}></div>
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...glassStyle, padding: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '16px', 
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center'
            }}>
              <TrendingUp style={{ width: '20px', height: '20px', marginRight: '8px', color: '#8b5cf6' }} />
              Niveau de Confiance des Prédictions
            </h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisResults.slice(0, 10).map((item, idx) => ({
                  name: `S${idx + 1}`,
                  confidence: parseFloat(item.confidence || 0),
                  prediction: item.prediction
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.7)" />
                  <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff'
                    }}
                  />
                  <Bar dataKey="confidence" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Shield, Activity, AlertTriangle, CheckCircle, FileText, Eye, TrendingUp, Zap, Lock, Database, Server, RefreshCw } from 'lucide-react';

import { API_ENDPOINTS } from './config';
import FileUpload from './components/FileUpload';
import BenchmarkDashboard from './components/BenchmarkDashboard';
import DualModelPredictionsTab from './components/DualModelPredictionsTab';
import BenchmarkTab from './components/BenchmarkTab';


const XGBoostSecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uploadedFile, setUploadedFile] = useState(null);
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [modelMetrics, setModelMetrics] = useState({
    xgboost: { accuracy: 99.86, precision: 100, recall: 100, f1Score: 99.87 },
    mlp: { accuracy: 99.5, precision: 99.2, recall: 99.8, f1Score: 99.5 }
  });

  // Vérifier l'état du backend au démarrage
  useEffect(() => {
    checkBackendHealth();
    loadModelInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mise à jour de l'heure
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.health);
      const data = await response.json();
      
      if (data.status === 'healthy') {
        setBackendStatus('connected');
        console.log('✅ Backend connecté avec succès');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      setBackendStatus('disconnected');
      console.error('❌ Backend non accessible:', error);
    }
  };

  const loadModelInfo = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.benchmarkModelsInfo);
      const data = await response.json();
      
      // Charger les métriques des DEUX modèles
      setModelMetrics({
        xgboost: {
          accuracy: data.xgboost.performance_metrics.accuracy,
          precision: data.xgboost.performance_metrics.precision,
          recall: data.xgboost.performance_metrics.recall,
          f1Score: data.xgboost.performance_metrics.f1_score
        },
        mlp: {
          accuracy: data.mlp.performance_metrics.accuracy,
          precision: data.mlp.performance_metrics.precision,
          recall: data.mlp.performance_metrics.recall,
          f1Score: data.mlp.performance_metrics.f1_score
        }
      });
      
      console.log('✅ Métriques des deux modèles chargées');
    } catch (error) {
      console.error('❌ Erreur chargement métriques:', error);
    }
  };

  const handleFileSelection = useCallback((file) => {
    console.log('=== handleFileSelection called ===', file);
    
    if (!file) {
      console.log('❌ No file provided');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Veuillez sélectionner un fichier CSV (.csv)');
      return;
    }

    console.log('✅ Setting file:', file.name, file);
    setUploadedFile(file);
  }, []);

  const clearSelectedFile = useCallback(() => {
    console.log('=== Clearing file ===');
    setUploadedFile(null);
  }, []);

  // Benchmark both models
  const runBenchmark = async () => {
    if (!uploadedFile) {
      alert('Veuillez sélectionner un fichier CSV à analyser');
      return;
    }

    setIsBenchmarking(true);
    
    try {
      console.log('🚀 Lancement du benchmark XGBoost vs MLP...');
      
      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      const url = `${API_ENDPOINTS.benchmarkCompare}?sample_size=500`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur HTTP ${response.status}: ${errorData.detail || 'Erreur inconnue'}`);
      }
      
      const data = await response.json();
      
      console.log('✅ Benchmark terminé:', data);
      console.log(`   Agreement rate: ${data.comparison.agreement_rate}%`);
      console.log(`   XGBoost time: ${data.xgboost.processing_time}s`);
      console.log(`   MLP time: ${data.mlp.processing_time}s`);
      
      setBenchmarkResults(data);
      setActiveTab('overview'); // Switch to overview tab to show results
      
    } catch (error) {
      console.error('❌ Erreur lors du benchmark:', error);
      alert(`Erreur lors du benchmark:\n${error.message}`);
    } finally {
      setIsBenchmarking(false);
    }
  };


  // Styles
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  };

  const backgroundStyle = {
    minHeight: '100vh',
    background: `
      radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, #06b6d4 0%, transparent 50%),
      linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)
    `,
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .stat-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 64px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
        `}
      </style>
      
      <div style={backgroundStyle}>
        <header style={{
          ...glassStyle,
          margin: 0,
          borderRadius: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(30px)',
          padding: '20px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
              }}>
                <Shield style={{ width: '32px', height: '32px', color: '#ffffff' }} />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  color: '#ffffff', 
                  margin: '0 0 4px 0',
                }}>🔬 XGBoost vs MLP Benchmark Platform</h1>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  margin: 0,
                  fontSize: '14px'
                }}>Comparaison de Performance des Modèles de Détection d'Intrusion - CIC-IDS-2017</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 4px 0' }}>Dernière analyse</p>
                <p style={{ fontWeight: '600', color: '#ffffff', margin: 0 }}>{currentTime.toLocaleString()}</p>
              </div>
              <div style={{
                width: '12px',
                height: '12px',
                background: backendStatus === 'connected' ? '#10b981' : '#ef4444',
                borderRadius: '50%',
                boxShadow: `0 0 20px ${backendStatus === 'connected' ? '#10b98160' : '#ef444460'}`,
                animation: 'pulse 2s infinite'
              }}></div>
            </div>
          </div>
        </header>

        <div style={{ display: 'flex' }}>
          <aside style={{
            width: '280px',
            minHeight: 'calc(100vh - 120px)',
            padding: '24px',
            ...glassStyle,
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '0 24px 0 0',
            margin: 0,
            position: 'sticky',
            top: '120px'
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: Activity, label: 'Vue d\'Ensemble', id: 'overview' },
                { icon: Database, label: 'Prédictions Détaillées', id: 'predictions' },
                { icon: TrendingUp, label: 'Désaccords & Analyse', id: 'disagreements' }
              ].map(({ icon: Icon, label, id }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '16px',
                    margin: '8px 0',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: activeTab === id 
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8))' 
                      : 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    color: activeTab === id ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                    fontWeight: '500',
                    width: '100%',
                    textAlign: 'left',
                    boxShadow: activeTab === id ? '0 8px 32px rgba(59, 130, 246, 0.3)' : 'none',
                  }}
                >
                  <Icon style={{ width: '20px', height: '20px', marginRight: '12px' }} />
                  {label}
                </button>
              ))}
            </nav>
            
            {/* Models Info */}
            <div style={{ marginTop: '32px' }}>
              <h4 style={{ 
                color: '#ffffff', 
                fontWeight: '600', 
                margin: '0 0 16px 0',
                fontSize: '16px',
                display: 'flex', 
                alignItems: 'center'
              }}>
                <Shield style={{ width: '20px', height: '20px', marginRight: '8px', color: '#3b82f6' }} />
                Modèles Chargés
              </h4>
            </div>

            {/* Models Accuracy */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              ...glassStyle,
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}>
              <h5 style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' }}>
                🚀 XGBoost: {modelMetrics.xgboost.accuracy}%
              </h5>
              <h5 style={{ color: '#8b5cf6', fontSize: '13px', fontWeight: '600', margin: '0' }}>
                🧠 MLP: {modelMetrics.mlp.accuracy}%
              </h5>
            </div>
          </aside>

          <main style={{ flex: 1, padding: '24px' }}>
            {(() => {
              switch (activeTab) {
                case 'predictions':
                  return <DualModelPredictionsTab benchmarkResults={benchmarkResults} />;
                case 'disagreements':
                  return <BenchmarkTab benchmarkResults={benchmarkResults} />;
                case 'overview':
                default:
                  return <BenchmarkDashboard 
                    benchmarkResults={benchmarkResults} 
                    modelMetrics={modelMetrics}
                    uploadedFile={uploadedFile}
                    onFileSelect={handleFileSelection}
                    onClearFile={clearSelectedFile}
                    isBenchmarking={isBenchmarking}
                    onRunBenchmark={runBenchmark}
                  />;
              }
            })()}
          </main>
        </div>
        
        <footer style={{
          ...glassStyle,
          margin: 0,
          borderRadius: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '20px 24px',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            fontSize: '14px', 
            color: 'rgba(255, 255, 255, 0.8)' 
          }}>
            <p style={{ margin: 0 }}>
              XGBoost vs MLP Benchmark Platform v2.0 • FastAPI Backend • CIC-IDS-2017 Dataset
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  background: backendStatus === 'connected' ? '#10b981' : '#ef4444', 
                  borderRadius: '50%', 
                  marginRight: '8px', 
                  boxShadow: `0 0 10px ${backendStatus === 'connected' ? '#10b98160' : '#ef444460'}`
                }}></div>
                Backend {backendStatus === 'connected' ? 'Actif' : 'Inactif'}
              </span>
              <span>Port: 8000</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default XGBoostSecurityDashboard;

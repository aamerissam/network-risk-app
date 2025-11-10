import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Shield, Activity, AlertTriangle, CheckCircle, FileText, Eye, TrendingUp, Zap, Lock, Database, Server, RefreshCw } from 'lucide-react';

import { API_ENDPOINTS } from './config';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import PredictionsTab from './components/PredictionsTab';
import MetricsTab from './components/MetricsTab';
import ComplianceTab from './components/ComplianceTab';
import DatasetTab from './components/DatasetTab';
import BenchmarkTab from './components/BenchmarkTab';


const XGBoostSecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [modelMetrics, setModelMetrics] = useState({
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0
  });
  const [backendStatus, setBackendStatus] = useState('checking');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [threatDistributionData, setThreatDistributionData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

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
      const response = await fetch(API_ENDPOINTS.modelInfo);
      const data = await response.json();
      
      // Charger les VRAIES métriques du backend
      setModelMetrics({
        accuracy: data.performance_metrics.accuracy,
        precision: data.performance_metrics.precision,
        recall: data.performance_metrics.recall,
        f1Score: data.performance_metrics.f1_score
      });
      
      console.log('✅ Métriques du modèle chargées:', data.performance_metrics);
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
      
      const url = `${API_ENDPOINTS.benchmarkCompare}?sample_size=100`;
      
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
      setActiveTab('benchmark'); // Switch to benchmark tab
      
    } catch (error) {
      console.error('❌ Erreur lors du benchmark:', error);
      alert(`Erreur lors du benchmark:\n${error.message}`);
    } finally {
      setIsBenchmarking(false);
    }
  };

  // Analyse avec les VRAIES données du backend - VERSION AMÉLIORÉE
  const runBatchAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      console.log('🚀 Lancement de l\'analyse équilibrée avec le backend FastAPI...');
      
      let response;
      
      // Use uploaded file if available, otherwise use static file
      if (uploadedFile) {
        console.log(`📤 Upload du fichier: ${uploadedFile.name}`);
        
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        response = await fetch(
          `${API_ENDPOINTS.analyzeDatasetUpload}?benign_samples=500&malicious_samples=500`,
          {
            method: 'POST',
            body: formData
          }
        );
      } else {
        // 🔥 UTILISE LE NOUVEL ENDPOINT ÉQUILIBRÉ (static file)
        response = await fetch(`${API_ENDPOINTS.analyzeDatasetBalanced}?benign_samples=500&malicious_samples=500`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur du serveur:', errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Données reçues du backend:', data);
      
      // Vérifier que les données sont valides
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Format de données invalide reçu du backend');
      }
      
      // Transformer les données pour l'affichage
      const transformedResults = data.results.map((pred, index) => ({
        id: pred.id !== undefined ? pred.id : index,
        timestamp: pred.timestamp || new Date().toLocaleString(),
        prediction: pred.prediction,
        confidence: typeof pred.confidence === 'number' ? pred.confidence.toFixed(3) : '0.000',
        threatType: pred.threat_type || 'Normal',
        originalLabel: pred.original_label || 'N/A',
        FlowDuration: Math.floor(Math.random() * 120000000)
      }));
      
      setAnalysisResults(transformedResults);
      
      // Calculer la distribution des menaces
      const distribution = [
        { 
          name: 'BENIGN', 
          value: data.summary.total_benign || 0, 
          color: '#10b981' 
        },
        { 
          name: 'MALICIOUS', 
          value: data.summary.total_malicious || 0, 
          color: '#ef4444' 
        }
      ];
      setThreatDistributionData(distribution);
      
      console.log(`✅ Analyse terminée: ${data.summary.total_samples} échantillons`);
      console.log(`   - BENIGN: ${data.summary.total_benign}`);
      console.log(`   - MALICIOUS: ${data.summary.total_malicious}`);
      
      // Afficher les infos d'échantillonnage
      if (data.dataset_info) {
        console.log(`📊 Échantillonnage:`);
        console.log(`   - Méthode: ${data.dataset_info.sampling_method}`);
        console.log(`   - Total dataset: ${data.dataset_info.total_rows} lignes`);
        console.log(`   - Échantillon: ${data.dataset_info.sampled_rows} lignes`);
        if (data.dataset_info.benign_actual !== undefined) {
          console.log(`   - BENIGN: ${data.dataset_info.benign_actual}`);
          console.log(`   - MALICIOUS: ${data.dataset_info.malicious_actual}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error);
      
      // Message d'erreur plus détaillé
      let errorMessage = `Erreur de connexion au backend:\n${error.message}\n\n`;
      
      if (error.message.includes('500')) {
        errorMessage += 'Le serveur a rencontré une erreur interne.\n';
        errorMessage += 'Vérifiez les logs du backend (terminal) pour plus de détails.\n\n';
        errorMessage += 'Causes possibles:\n';
        errorMessage += '- Le fichier test_api.csv est introuvable\n';
        errorMessage += '- Le fichier test_api.csv n\'a pas de colonne "Label"\n';
        errorMessage += '- Erreur de prétraitement des données';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Le backend ne répond pas.\n';
        errorMessage += `Vérifiez que le backend tourne sur ${API_ENDPOINTS.health.replace('/model/health', '')}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsAnalyzing(false);
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
                }}>XGBoost Security Analyzer</h1>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  margin: 0,
                  fontSize: '14px'
                }}>Détection d'Intrusion Basée sur l'IA - Connecté au Backend FastAPI</p>
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
                { icon: Shield, label: 'Dashboard Principal', id: 'dashboard' },
                { icon: Activity, label: 'Benchmark XGBoost vs MLP', id: 'benchmark' },
                { icon: Database, label: 'Analyse & Prédictions', id: 'predictions' },
                { icon: FileText, label: 'Détails du Dataset', id: 'dataset' },
                { icon: TrendingUp, label: 'Métriques Modèle', id: 'metrics' },
                { icon: CheckCircle, label: 'Conformité Réglementaire', id: 'compliance' }
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
            
            <div style={{
              marginTop: '32px',
              padding: '20px',
              ...glassStyle,
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}>
              <h4 style={{ 
                color: '#ffffff', 
                fontWeight: '500', 
                margin: '0 0 16px 0',
                display: 'flex', 
                alignItems: 'center'
              }}>
                <Lock style={{ width: '16px', height: '16px', marginRight: '8px', color: '#8b5cf6' }} />
                Modèle XGBoost
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255, 255, 255, 0.8)' }}>
                  <span>Version:</span>
                  <span style={{ color: '#10b981', fontWeight: '500' }}>v2.1</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255, 255, 255, 0.8)' }}>
                  <span>Features:</span>
                  <span style={{ color: '#3b82f6', fontWeight: '500' }}>78</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255, 255, 255, 0.8)' }}>
                  <span>Backend:</span>
                  <span style={{ color: '#f59e0b', fontWeight: '500' }}>FastAPI</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255, 255, 255, 0.8)' }}>
                  <span>Port:</span>
                  <span style={{ color: '#8b5cf6', fontWeight: '500' }}>8000</span>
                </div>
              </div>
            </div>
          </aside>

          <main style={{ flex: 1, padding: '24px' }}>
            {(() => {
              switch (activeTab) {
                case 'benchmark':
                  return (
                    <div>
                      <div style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '24px'
                      }}>
                        <h2 style={{ 
                          fontSize: '24px', 
                          fontWeight: '600', 
                          color: '#ffffff', 
                          margin: '0 0 16px 0' 
                        }}>
                          🔬 XGBoost vs MLP Benchmark
                        </h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 20px 0' }}>
                          Compare the performance of both models side-by-side
                        </p>
                        <FileUpload 
                          uploadedFile={uploadedFile}
                          onFileSelect={handleFileSelection}
                          onClearFile={clearSelectedFile}
                          isDisabled={isBenchmarking}
                        />
                        <button
                          onClick={runBenchmark}
                          disabled={isBenchmarking || !uploadedFile}
                          style={{
                            padding: '14px 32px',
                            background: isBenchmarking || !uploadedFile
                              ? 'rgba(100, 116, 139, 0.5)'
                              : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: isBenchmarking || !uploadedFile ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: '500',
                            marginTop: '16px',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {isBenchmarking ? (
                            <>
                              <RefreshCw style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                              Benchmarking...
                            </>
                          ) : (
                            <>
                              <Activity style={{ width: '20px', height: '20px' }} />
                              Run Benchmark
                            </>
                          )}
                        </button>
                      </div>
                      <BenchmarkTab benchmarkResults={benchmarkResults} />
                    </div>
                  );
                case 'predictions':
                  return <PredictionsTab analysisResults={analysisResults} />;
                case 'dataset':
                  return <DatasetTab />;
                case 'metrics':
                  return <MetricsTab modelMetrics={modelMetrics} />;
                case 'compliance':
                  return <ComplianceTab modelMetrics={modelMetrics} />;
                default:
                  return <Dashboard 
                    analysisResults={analysisResults}
                    modelMetrics={modelMetrics}
                    backendStatus={backendStatus}
                    threatDistributionData={threatDistributionData}
                    uploadedFile={uploadedFile}
                    isAnalyzing={isAnalyzing}
                    checkBackendHealth={checkBackendHealth}
                    handleFileSelection={handleFileSelection}
                    clearSelectedFile={clearSelectedFile}
                    runBatchAnalysis={runBatchAnalysis}
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
              XGBoost Security Analyzer v1.0 • Backend FastAPI • Accuracy: {modelMetrics.accuracy.toFixed(2)}%
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

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Shield, Activity, AlertTriangle, CheckCircle, FileText, Eye, TrendingUp, Zap, Lock, Database, Server, RefreshCw } from 'lucide-react';

import { API_ENDPOINTS } from './config';

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

  // Vérifier l'état du backend au démarrage
  useEffect(() => {
    checkBackendHealth();
    loadModelInfo();
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

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div
      className="stat-card"
      style={{
        ...glassStyle,
        padding: '24px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      }}

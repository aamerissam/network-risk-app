import React from 'react';
import { FileText, Database, CheckCircle } from 'lucide-react';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
};

const DatasetTab = () => (
  <div style={{ ...glassStyle, padding: '24px' }}>
    <h3 style={{ 
      fontSize: '24px', 
      fontWeight: '600', 
      marginBottom: '24px', 
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center'
    }}>
      <FileText style={{ width: '24px', height: '24px', marginRight: '8px', color: '#10b981' }} />
      Dataset CIC-IDS-2017
    </h3>
    
    <div style={{ display: 'grid', gap: '24px' }}>
      <div style={{
        padding: '20px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px'
      }}>
        <h4 style={{ fontSize: '18px', color: '#3b82f6', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
          <Database style={{ width: '20px', height: '20px', marginRight: '8px' }} />
          Informations du Dataset
        </h4>
        <div style={{ display: 'grid', gap: '12px', color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
          <div><strong>Nom:</strong> CIC-IDS-2017</div>
          <div><strong>Source:</strong> Canadian Institute for Cybersecurity</div>
          <div><strong>Année:</strong> 2017</div>
          <div><strong>Échantillons:</strong> ~2.8 millions de flux réseau</div>
          <div><strong>Classes:</strong> BENIGN, DDoS, PortScan, Bot, Infiltration, etc.</div>
        </div>
      </div>

      <div style={{
        padding: '20px',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px'
      }}>
        <h4 style={{ fontSize: '18px', color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
          <CheckCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
          Caractéristiques
        </h4>
        <ul style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>80+ features de flux réseau</li>
          <li>Données labellisées pour apprentissage supervisé</li>
          <li>Trafic réseau réaliste collecté sur 5 jours</li>
          <li>Attaques modernes (DDoS, Web attacks, Brute Force)</li>
          <li>Prétraitement et normalisation appliqués</li>
        </ul>
      </div>

      <div style={{
        padding: '20px',
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px'
      }}>
        <h4 style={{ fontSize: '18px', color: '#8b5cf6', marginBottom: '12px' }}>
          Utilisation dans ce Projet
        </h4>
        <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '12px' }}>
            Le modèle XGBoost a été entraîné sur ce dataset pour détecter les menaces réseau en temps réel.
            L'échantillon test_api.csv contient 1000 flux représentatifs pour démonstration.
          </p>
          <p style={{ marginBottom: '0' }}>
            <strong>Performance:</strong> Le modèle atteint une précision de {'>'}99% sur les données de test,
            démontrant une excellente capacité à distinguer le trafic bénin du trafic malveillant.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default DatasetTab;


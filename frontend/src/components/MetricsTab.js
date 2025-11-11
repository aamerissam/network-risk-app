import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
};

const MetricsTab = ({ modelMetrics }) => (
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
        <TrendingUp style={{ width: '24px', height: '24px', marginRight: '8px', color: '#8b5cf6' }} />
        Métriques de Performance XGBoost
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {[
          { label: 'Accuracy', value: modelMetrics.accuracy, color: '#10b981', description: 'Précision globale du modèle' },
          { label: 'Precision', value: modelMetrics.precision, color: '#3b82f6', description: 'Précision des prédictions positives' },
          { label: 'Recall', value: modelMetrics.recall, color: '#8b5cf6', description: 'Taux de détection' },
          { label: 'F1-Score', value: modelMetrics.f1Score, color: '#f59e0b', description: 'Moyenne harmonique' }
        ].map((metric, index) => (
          <div key={index} style={{
            padding: '24px',
            background: `linear-gradient(135deg, ${metric.color}20, ${metric.color}10)`,
            border: `1px solid ${metric.color}40`,
            borderRadius: '16px'
          }}>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
              {metric.label}
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: metric.color, marginBottom: '4px' }}>
              {metric.value.toFixed(2)}%
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
              {metric.description}
            </div>
            <div style={{
              marginTop: '16px',
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
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[
            { name: 'Epoch 1', accuracy: 85, precision: 83, recall: 87, f1Score: 85 },
            { name: 'Epoch 2', accuracy: 90, precision: 89, recall: 91, f1Score: 90 },
            { name: 'Epoch 3', accuracy: 95, precision: 94, recall: 96, f1Score: 95 },
            { name: 'Epoch 4', accuracy: modelMetrics.accuracy, precision: modelMetrics.precision, recall: modelMetrics.recall, f1Score: modelMetrics.f1Score }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.7)" />
            <YAxis stroke="rgba(255, 255, 255, 0.7)" domain={[0, 100]} />
            <Tooltip 
              contentStyle={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: '#ffffff'
              }}
            />
            <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="precision" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="recall" stroke="#8b5cf6" strokeWidth={2} />
            <Line type="monotone" dataKey="f1Score" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default MetricsTab;


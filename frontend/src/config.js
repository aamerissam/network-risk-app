/**
 * Centralized configuration for API endpoints
 */

// Use environment variable or fallback to default
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// API endpoint paths
export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/model/health`,
  modelInfo: `${API_BASE_URL}/model/info`,
  predictOne: `${API_BASE_URL}/predict/one`,
  predictCsv: `${API_BASE_URL}/predict/csv`,
  analyzeDataset: `${API_BASE_URL}/analyze-dataset`,
  analyzeDatasetBalanced: `${API_BASE_URL}/analyze-dataset/balanced`,
  analyzeDatasetUpload: `${API_BASE_URL}/analyze-dataset/upload`,
  analyzeDatasetAllAttacks: `${API_BASE_URL}/analyze-dataset/all-attacks`,
  realtimeMetrics: `${API_BASE_URL}/realtime-metrics`,
  benchmarkCompare: `${API_BASE_URL}/benchmark/compare`,
  benchmarkModelsInfo: `${API_BASE_URL}/benchmark/models-info`,
  benchmarkHealth: `${API_BASE_URL}/benchmark/health`
};


"""
Unit tests for prediction service
"""
import pytest
import pandas as pd
import numpy as np
from unittest.mock import Mock, patch

from prediction.services import PredictionService
from model_management.services import ModelLoader


@pytest.fixture
def mock_model_loader():
    """Mock model loader for testing"""
    loader = Mock(spec=ModelLoader)
    loader.model = Mock()
    loader.model.classes_ = np.array(['BENIGN', 'DDoS', 'PortScan'])
    loader.model.predict_proba.return_value = np.array([
        [0.8, 0.1, 0.1]  # High confidence for BENIGN
    ])
    loader.model.predict.return_value = np.array(['BENIGN'])
    loader.encoder = Mock()
    loader.scaler = Mock()
    loader.feature_columns = [f'feature_{i}' for i in range(10)]
    return loader


@pytest.fixture
def prediction_service(mock_model_loader):
    """Create prediction service with mocked dependencies"""
    with patch('prediction.services.get_model_loader', return_value=mock_model_loader):
        service = PredictionService()
        return service


def test_predict_single(prediction_service, mock_model_loader):
    """Test single prediction"""
    features = {f'feature_{i}': 0.5 for i in range(10)}
    
    with patch('prediction.services.preprocess_dataframe') as mock_preprocess:
        mock_preprocess.return_value = pd.DataFrame(
            np.zeros((1, 10)), 
            columns=[f'feature_{i}' for i in range(10)]
        )
        
        result = prediction_service.predict_single(features)
        
        assert 'prediction' in result
        assert 'confidence' in result
        assert 'probabilities' in result
        assert 'timestamp' in result


def test_predict_batch(prediction_service, mock_model_loader):
    """Test batch prediction"""
    df = pd.DataFrame({
        f'feature_{i}': np.random.rand(5) 
        for i in range(10)
    })
    
    with patch('prediction.services.preprocess_dataframe') as mock_preprocess:
        mock_preprocess.return_value = pd.DataFrame(
            np.zeros((5, 10)), 
            columns=[f'feature_{i}' for i in range(10)]
        )
        
        mock_model_loader.model.predict.return_value = np.array(
            ['BENIGN'] * 5
        )
        mock_model_loader.model.predict_proba.return_value = np.array([
            [0.8, 0.1, 0.1] for _ in range(5)
        ])
        
        result = prediction_service.predict_batch(df)
        
        assert 'summary' in result
        assert 'results' in result
        assert 'model_metrics' in result
        assert len(result['results']) == 5


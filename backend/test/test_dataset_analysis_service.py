"""
Unit tests for dataset analysis service
"""
import pytest
import pandas as pd
from unittest.mock import Mock, patch
import os

from dataset_analysis.services import DatasetAnalysisService
from common.config import TEST_CSV_PATH


@pytest.fixture
def mock_model_loader():
    """Mock model loader"""
    loader = Mock()
    loader.model = Mock()
    loader.encoder = Mock()
    loader.scaler = Mock()
    loader.feature_columns = [f'feature_{i}' for i in range(10)]
    return loader


@pytest.fixture
def mock_prediction_service():
    """Mock prediction service"""
    service = Mock()
    service.predict_batch.return_value = {
        "summary": {
            "total_samples": 100,
            "total_malicious": 50,
            "total_benign": 50,
            "detection_rate": 50.0,
            "by_label": {"BENIGN": 50, "DDoS": 50},
            "processed_at": "2024-01-01T00:00:00"
        },
        "results": [],
        "model_metrics": {}
    }
    return service


@pytest.fixture
def sample_csv_data():
    """Sample CSV data for testing"""
    return pd.DataFrame({
        'Feature1': [1, 2, 3, 4, 5],
        'Feature2': [0.1, 0.2, 0.3, 0.4, 0.5],
        'Label': ['BENIGN', 'DDoS', 'BENIGN', 'PortScan', 'BENIGN']
    })


def test_analyze_dataset_balanced(
    mock_model_loader, 
    mock_prediction_service, 
    sample_csv_data
):
    """Test balanced dataset analysis"""
    with patch('dataset_analysis.services.get_model_loader', return_value=mock_model_loader), \
         patch('dataset_analysis.services.get_prediction_service', return_value=mock_prediction_service), \
         patch('pandas.read_csv', return_value=sample_csv_data), \
         patch('os.path.exists', return_value=True):
        
        service = DatasetAnalysisService()
        result = service.analyze_dataset_balanced(benign_samples=2, malicious_samples=2)
        
        assert 'dataset_info' in result
        assert 'summary' in result
        assert result['dataset_info']['sampling_method'] == 'balanced'


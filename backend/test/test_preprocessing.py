"""
Unit tests for preprocessing functions
"""
import pytest
import pandas as pd
import numpy as np
from unittest.mock import Mock

from common.preprocessing import split_columns, preprocess_dataframe


def test_split_columns():
    """Test column splitting"""
    df = pd.DataFrame({
        'cat1': ['a', 'b', 'c'],
        'cat2': ['x', 'y', 'z'],
        'num1': [1, 2, 3],
        'num2': [0.1, 0.2, 0.3]
    })
    
    encoder = Mock()
    encoder.feature_names_in_ = ['cat1', 'cat2']
    
    scaler = Mock()
    scaler.feature_names_in_ = ['num1', 'num2']
    
    cat_cols, num_cols = split_columns(df, encoder, scaler)
    
    assert 'cat1' in cat_cols
    assert 'cat2' in cat_cols
    assert 'num1' in num_cols
    assert 'num2' in num_cols


"""
Model management services - handles model loading and information
"""
import os
import json
import joblib
import xgboost as xgb
from typing import Optional, Dict, Any, List

from common.config import (
    MODEL_PATH, 
    ENCODER_PATH, 
    SCALER_PATH, 
    FEATURE_COLUMNS_PATH
)
from common.logger import logger
from common.constants import MODEL_METRICS, MODEL_PARAMETERS


class ModelLoader:
    """Service for loading and managing ML models"""
    
    def __init__(self):
        self.model: Optional[xgb.XGBClassifier] = None
        self.encoder = None
        self.scaler = None
        self.feature_columns: List[str] = []
        self._load_model()
        self._load_preprocessing_components()
    
    def _load_model(self) -> None:
        """Load the XGBoost model"""
        try:
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
            
            self.model = xgb.XGBClassifier()
            self.model.load_model(MODEL_PATH)
            logger.info(f"XGBoost model loaded from: {MODEL_PATH}")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def _load_preprocessing_components(self) -> None:
        """Load encoder, scaler, and feature columns"""
        try:
            if not os.path.exists(ENCODER_PATH):
                raise FileNotFoundError(f"Encoder file not found: {ENCODER_PATH}")
            if not os.path.exists(SCALER_PATH):
                raise FileNotFoundError(f"Scaler file not found: {SCALER_PATH}")
            if not os.path.exists(FEATURE_COLUMNS_PATH):
                raise FileNotFoundError(f"Feature columns file not found: {FEATURE_COLUMNS_PATH}")
            
            self.encoder = joblib.load(ENCODER_PATH)
            self.scaler = joblib.load(SCALER_PATH)
            
            with open(FEATURE_COLUMNS_PATH, "r", encoding="utf-8") as f:
                self.feature_columns = json.load(f)
            
            logger.info("Encoder, scaler, and features loaded successfully")
        except Exception as e:
            logger.error(f"Error loading preprocessing components: {e}")
            raise
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model is not None and self.encoder is not None and self.scaler is not None
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        if not self.model:
            raise ValueError("Model not loaded")
        
        return {
            "model_info": {
                "algorithm": "XGBoost",
                "version": "Latest",
                "features_count": len(self.feature_columns),
                "classes": [str(cls) for cls in self.model.classes_] if hasattr(self.model, 'classes_') else [],
                "dataset": "CIC-IDS-2017"
            },
            "performance_metrics": MODEL_METRICS,
            "model_parameters": MODEL_PARAMETERS,
            "feature_columns_preview": self.feature_columns[:10]  # First 10 features
        }
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check on the model"""
        try:
            if not self.is_loaded():
                return {
                    "status": "unhealthy",
                    "error": "Model components not fully loaded"
                }
            
            # Test model with dummy data
            import pandas as pd
            import numpy as np
            test_data = pd.DataFrame(
                np.zeros((1, len(self.feature_columns))), 
                columns=self.feature_columns
            )
            _ = self.model.predict_proba(test_data)
            
            return {
                "status": "healthy",
                "model_loaded": True,
                "encoder_loaded": self.encoder is not None,
                "scaler_loaded": self.scaler is not None,
                "features_count": len(self.feature_columns)
            }
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }


# Global model loader instance
_model_loader: Optional[ModelLoader] = None


def get_model_loader() -> ModelLoader:
    """Get or create the global model loader instance"""
    global _model_loader
    if _model_loader is None:
        _model_loader = ModelLoader()
    return _model_loader


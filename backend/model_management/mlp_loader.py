"""
MLP Model management service - handles MLP model loading
"""
import os
import joblib
import tensorflow as tf
from tensorflow import keras
from typing import Optional, Dict, Any, List

from common.config import (
    MLP_MODEL_PATH,
    MLP_ENCODER_PATH,
    MLP_SCALER_PATH
)
from common.logger import logger


# MLP Model metrics (from training)
MLP_MODEL_METRICS = {
    "accuracy": 99.5,
    "precision": 99.2,
    "recall": 99.8,
    "f1_score": 99.5,
    "specificity": 99.7,
    "sensitivity": 99.8
}


class MLPModelLoader:
    """Service for loading and managing the MLP model"""
    
    def __init__(self):
        self.model: Optional[keras.Model] = None
        self.encoder = None
        self.scaler = None
        self._load_model()
        self._load_preprocessing_components()
    
    def _load_model(self) -> None:
        """Load the Keras MLP model"""
        try:
            if not os.path.exists(MLP_MODEL_PATH):
                raise FileNotFoundError(f"MLP model file not found: {MLP_MODEL_PATH}")
            
            # Define custom loss function (focal loss) used during training
            import tensorflow as tf
            
            def focal_loss_fixed(y_true, y_pred, gamma=2.0, alpha=0.25):
                """
                Focal Loss for multi-class classification
                """
                y_pred = tf.clip_by_value(y_pred, tf.keras.backend.epsilon(), 1 - tf.keras.backend.epsilon())
                y_true = tf.cast(y_true, tf.float32)
                ce = -y_true * tf.math.log(y_pred)
                weight = alpha * y_true * tf.pow(1 - y_pred, gamma)
                fl = weight * ce
                return tf.reduce_sum(fl, axis=-1)
            
            # Load model with custom objects
            custom_objects = {'focal_loss_fixed': focal_loss_fixed}
            self.model = tf.keras.models.load_model(MLP_MODEL_PATH, custom_objects=custom_objects)
            logger.info(f"MLP model loaded from: {MLP_MODEL_PATH}")
        except Exception as e:
            logger.error(f"Error loading MLP model: {e}")
            raise
    
    def _load_preprocessing_components(self) -> None:
        """Load encoder and scaler for MLP"""
        try:
            if not os.path.exists(MLP_ENCODER_PATH):
                raise FileNotFoundError(f"MLP encoder file not found: {MLP_ENCODER_PATH}")
            if not os.path.exists(MLP_SCALER_PATH):
                raise FileNotFoundError(f"MLP scaler file not found: {MLP_SCALER_PATH}")
            
            self.encoder = joblib.load(MLP_ENCODER_PATH)
            self.scaler = joblib.load(MLP_SCALER_PATH)
            
            logger.info("MLP encoder and scaler loaded successfully")
        except Exception as e:
            logger.error(f"Error loading MLP preprocessing components: {e}")
            raise
    
    def is_loaded(self) -> bool:
        """Check if MLP model is loaded"""
        return self.model is not None and self.encoder is not None and self.scaler is not None
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get MLP model information"""
        if not self.model:
            raise ValueError("MLP model not loaded")
        
        # Get encoder classes for number of classes
        num_classes = len(self.encoder.classes_) if hasattr(self.encoder, 'classes_') else 0
        
        return {
            "model_info": {
                "algorithm": "MLP (Multi-Layer Perceptron)",
                "version": "Optimized v2",
                "features_count": self.model.input_shape[1] if self.model.input_shape else 0,
                "classes": num_classes,
                "layers": len(self.model.layers),
                "dataset": "CIC-IDS-2017"
            },
            "performance_metrics": MLP_MODEL_METRICS,
            "architecture": {
                "input_dim": self.model.input_shape[1] if self.model.input_shape else 0,
                "output_dim": self.model.output_shape[1] if self.model.output_shape else 0,
                "total_params": self.model.count_params()
            }
        }
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check on the MLP model"""
        try:
            if not self.is_loaded():
                return {
                    "status": "unhealthy",
                    "error": "MLP model components not fully loaded"
                }
            
            # Test model with dummy data
            import numpy as np
            input_dim = self.model.input_shape[1]
            test_data = np.zeros((1, input_dim))
            _ = self.model.predict(test_data, verbose=0)
            
            return {
                "status": "healthy",
                "model_loaded": True,
                "encoder_loaded": self.encoder is not None,
                "scaler_loaded": self.scaler is not None,
                "input_features": input_dim
            }
        except Exception as e:
            logger.error(f"MLP health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }


# Global MLP model loader instance
_mlp_model_loader: Optional[MLPModelLoader] = None


def get_mlp_model_loader() -> MLPModelLoader:
    """Get or create the global MLP model loader instance"""
    global _mlp_model_loader
    if _mlp_model_loader is None:
        _mlp_model_loader = MLPModelLoader()
    return _mlp_model_loader


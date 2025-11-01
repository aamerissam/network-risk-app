"""
Prediction services - business logic for predictions
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from datetime import datetime

from model_management.services import get_model_loader
from common.preprocessing import preprocess_dataframe
from common.constants import THREAT_TYPES, MODEL_METRICS
from common.logger import logger


class PredictionService:
    """Service for making predictions"""
    
    def __init__(self):
        self.model_loader = get_model_loader()
    
    def predict_single(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make a single prediction
        
        Args:
            features: Dictionary of feature names to values
        
        Returns:
            Dictionary with prediction results
        """
        try:
            # Convert to DataFrame
            df = pd.DataFrame([features])
            
            # Preprocess
            X = preprocess_dataframe(
                df,
                self.model_loader.encoder,
                self.model_loader.scaler,
                self.model_loader.feature_columns
            )
            
            # Get prediction
            model = self.model_loader.model
            probs = model.predict_proba(X)[0]
            pred = model.classes_[np.argmax(probs)]
            confidence = float(np.max(probs))
            
            # Determine threat type
            threat_type = THREAT_TYPES.get(str(pred), "Unknown")
            
            return {
                "prediction": str(pred),
                "confidence": confidence,
                "threat_type": threat_type if str(pred) != 'BENIGN' else None,
                "probabilities": {
                    str(cls): float(prob) 
                    for cls, prob in zip(model.classes_, probs)
                },
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in predict_single: {e}")
            raise
    
    def predict_batch(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Make batch predictions on a DataFrame
        
        Args:
            df: DataFrame with features
        
        Returns:
            Dictionary with batch prediction results
        """
        try:
            # Preprocess
            X = preprocess_dataframe(
                df,
                self.model_loader.encoder,
                self.model_loader.scaler,
                self.model_loader.feature_columns
            )
            
            # Get predictions
            model = self.model_loader.model
            y_pred = model.predict(X)
            y_proba = model.predict_proba(X)
            
            # Build detailed results
            results = []
            for i, (pred, proba_row) in enumerate(zip(y_pred, y_proba)):
                confidence = float(np.max(proba_row))
                threat_type = THREAT_TYPES.get(str(pred), "Unknown")
                
                result = {
                    "id": i,
                    "prediction": str(pred),
                    "confidence": confidence,
                    "threat_type": threat_type if str(pred) != 'BENIGN' else None,
                    "timestamp": datetime.now().isoformat(),
                    "probabilities": {
                        str(cls): float(prob) 
                        for cls, prob in zip(model.classes_, proba_row)
                    }
                }
                
                # Add important features for display
                if i < len(df):
                    for col in ['Flow Duration', 'Total Fwd Packets', 'Total Backward Packets']:
                        if col in df.columns:
                            col_name = col.replace(' ', '_').lower()
                            result[col_name] = float(df.iloc[i][col]) if pd.notna(df.iloc[i][col]) else 0
                
                results.append(result)
            
            # Statistics
            counts = pd.Series(y_pred).value_counts().to_dict()
            total_malicious = sum(v for k, v in counts.items() if k != 'BENIGN')
            
            return {
                "summary": {
                    "total_samples": len(df),
                    "total_malicious": int(total_malicious),
                    "total_benign": int(counts.get('BENIGN', 0)),
                    "detection_rate": float(total_malicious / len(df) * 100) if len(df) > 0 else 0,
                    "by_label": {str(k): int(v) for k, v in counts.items()},
                    "processed_at": datetime.now().isoformat()
                },
                "results": results[:100],  # Limit to first 100 for display
                "model_metrics": MODEL_METRICS
            }
        except Exception as e:
            logger.error(f"Error in predict_batch: {e}")
            raise


# Global prediction service instance
_prediction_service: Optional[PredictionService] = None


def get_prediction_service() -> PredictionService:
    """Get or create the global prediction service instance"""
    global _prediction_service
    if _prediction_service is None:
        _prediction_service = PredictionService()
    return _prediction_service


"""
Benchmarking services - Compare XGBoost and MLP models
"""
import time
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from datetime import datetime

from model_management.services import get_model_loader
from model_management.mlp_loader import get_mlp_model_loader
from common.preprocessing import preprocess_dataframe
from common.constants import THREAT_TYPES
from common.logger import logger


class BenchmarkingService:
    """Service for benchmarking XGBoost vs MLP models"""
    
    def __init__(self):
        self.xgboost_loader = get_model_loader()
        self.mlp_loader = get_mlp_model_loader()
    
    def compare_models(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Compare XGBoost and MLP models on the same data
        
        Args:
            df: DataFrame with features
        
        Returns:
            Dictionary with comparison results from both models
        """
        try:
            logger.info(f"Starting model comparison on {len(df)} samples")
            
            # Store original labels if available
            original_labels = df['Label'].tolist() if 'Label' in df.columns else None
            
            # XGBoost predictions
            xgboost_start = time.time()
            xgboost_results = self._predict_xgboost(df)
            xgboost_time = time.time() - xgboost_start
            
            # MLP predictions
            mlp_start = time.time()
            mlp_results = self._predict_mlp(df)
            mlp_time = time.time() - mlp_start
            
            # Compare predictions
            comparison = self._compare_predictions(
                xgboost_results, 
                mlp_results, 
                original_labels
            )
            
            logger.info(
                f"Comparison complete: XGBoost={xgboost_time:.3f}s, "
                f"MLP={mlp_time:.3f}s"
            )
            
            return {
                "xgboost": {
                    "results": xgboost_results,
                    "processing_time": xgboost_time,
                    "avg_time_per_sample": xgboost_time / len(df) if len(df) > 0 else 0
                },
                "mlp": {
                    "results": mlp_results,
                    "processing_time": mlp_time,
                    "avg_time_per_sample": mlp_time / len(df) if len(df) > 0 else 0
                },
                "comparison": comparison,
                "dataset_info": {
                    "total_samples": len(df),
                    "timestamp": datetime.now().isoformat()
                }
            }
        except Exception as e:
            logger.error(f"Error in compare_models: {e}")
            raise
    
    def _predict_xgboost(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Make predictions using XGBoost model"""
        try:
            # Preprocess
            X = preprocess_dataframe(
                df.copy(),
                self.xgboost_loader.encoder,
                self.xgboost_loader.scaler,
                self.xgboost_loader.feature_columns
            )
            
            # Predict
            model = self.xgboost_loader.model
            y_pred = model.predict(X)
            y_proba = model.predict_proba(X)
            
            # Decode predictions
            y_pred_labels = self.xgboost_loader.encoder.inverse_transform(y_pred)
            
            # Build results
            results = []
            for i, (pred, pred_label, proba_row) in enumerate(zip(y_pred, y_pred_labels, y_proba)):
                confidence = float(np.max(proba_row))
                threat_type = THREAT_TYPES.get(pred_label, "Unknown")
                
                results.append({
                    "id": i,
                    "prediction": str(pred),
                    "prediction_label": pred_label,
                    "confidence": confidence,
                    "threat_type": threat_type if pred_label != 'BENIGN' else 'Normal',
                    "is_malicious": pred_label != 'BENIGN'
                })
            
            return results
        except Exception as e:
            logger.error(f"Error in XGBoost prediction: {e}")
            raise
    
    def _predict_mlp(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Make predictions using MLP model"""
        try:
            # Preprocess
            X = preprocess_dataframe(
                df.copy(),
                self.mlp_loader.encoder,
                self.mlp_loader.scaler,
                None  # MLP doesn't use feature_columns file
            )
            
            # Predict
            model = self.mlp_loader.model
            y_proba = model.predict(X, verbose=0)
            y_pred = np.argmax(y_proba, axis=1)
            
            # Decode predictions
            y_pred_labels = self.mlp_loader.encoder.inverse_transform(y_pred)
            
            # Build results
            results = []
            for i, (pred, pred_label, proba_row) in enumerate(zip(y_pred, y_pred_labels, y_proba)):
                confidence = float(np.max(proba_row))
                threat_type = THREAT_TYPES.get(pred_label, "Unknown")
                
                results.append({
                    "id": i,
                    "prediction": str(pred),
                    "prediction_label": pred_label,
                    "confidence": confidence,
                    "threat_type": threat_type if pred_label != 'BENIGN' else 'Normal',
                    "is_malicious": pred_label != 'BENIGN'
                })
            
            return results
        except Exception as e:
            logger.error(f"Error in MLP prediction: {e}")
            raise
    
    def _compare_predictions(
        self,
        xgboost_results: List[Dict[str, Any]],
        mlp_results: List[Dict[str, Any]],
        original_labels: List[str] = None
    ) -> Dict[str, Any]:
        """Compare predictions from both models"""
        try:
            total_samples = len(xgboost_results)
            
            # Count agreements and disagreements
            agreements = 0
            disagreements = []
            
            for i, (xgb_res, mlp_res) in enumerate(zip(xgboost_results, mlp_results)):
                if xgb_res['prediction_label'] == mlp_res['prediction_label']:
                    agreements += 1
                else:
                    disagreement = {
                        "id": i,
                        "xgboost_prediction": xgb_res['prediction_label'],
                        "xgboost_threat": xgb_res['threat_type'],
                        "xgboost_confidence": xgb_res['confidence'],
                        "mlp_prediction": mlp_res['prediction_label'],
                        "mlp_threat": mlp_res['threat_type'],
                        "mlp_confidence": mlp_res['confidence']
                    }
                    
                    if original_labels and i < len(original_labels):
                        disagreement['original_label'] = original_labels[i]
                        disagreement['xgboost_correct'] = (
                            xgb_res['prediction_label'] == original_labels[i]
                        )
                        disagreement['mlp_correct'] = (
                            mlp_res['prediction_label'] == original_labels[i]
                        )
                    
                    disagreements.append(disagreement)
            
            agreement_rate = (agreements / total_samples * 100) if total_samples > 0 else 0
            
            # Summary statistics
            xgb_malicious = sum(1 for r in xgboost_results if r['is_malicious'])
            mlp_malicious = sum(1 for r in mlp_results if r['is_malicious'])
            
            return {
                "total_samples": total_samples,
                "agreements": agreements,
                "disagreements_count": len(disagreements),
                "agreement_rate": agreement_rate,
                "disagreement_rate": 100 - agreement_rate,
                "xgboost_malicious_count": xgb_malicious,
                "mlp_malicious_count": mlp_malicious,
                "disagreements": disagreements[:50]  # Limit to first 50 for display
            }
        except Exception as e:
            logger.error(f"Error comparing predictions: {e}")
            raise


# Global benchmarking service instance
_benchmarking_service = None


def get_benchmarking_service() -> BenchmarkingService:
    """Get or create the global benchmarking service instance"""
    global _benchmarking_service
    if _benchmarking_service is None:
        _benchmarking_service = BenchmarkingService()
    return _benchmarking_service


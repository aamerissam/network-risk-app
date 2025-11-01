"""
Pydantic models for prediction requests and responses
"""
from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class Sample(BaseModel):
    """Request model for single prediction"""
    features: Dict[str, Any]


class PredictionResponse(BaseModel):
    """Response model for single prediction"""
    prediction: str
    confidence: float
    threat_type: Optional[str]
    probabilities: Dict[str, float]
    timestamp: str


class BatchAnalysisResponse(BaseModel):
    """Response model for batch predictions"""
    summary: Dict[str, Any]
    results: List[Dict[str, Any]]
    model_metrics: Dict[str, float]


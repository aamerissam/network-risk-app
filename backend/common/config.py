"""
Configuration settings for the application
"""
import os

# Application root directory
APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Models directories
MODELS_BASE_DIR = os.path.join(APP_ROOT, "models")
XGBOOST_DIR = os.path.join(MODELS_BASE_DIR, "xgboost")
MLP_DIR = os.path.join(MODELS_BASE_DIR, "mlp")

# XGBoost Model file paths (default/primary model)
MODELS_DIR = XGBOOST_DIR  # For backwards compatibility
MODEL_PATH = os.path.join(XGBOOST_DIR, "xgb_model_train_optimized2.json")
ENCODER_PATH = os.path.join(XGBOOST_DIR, "encoder_xgb2.pkl")
SCALER_PATH = os.path.join(XGBOOST_DIR, "scaler_xgb2.pkl")
FEATURE_COLUMNS_PATH = os.path.join(XGBOOST_DIR, "feature_columns.json")

# MLP Model file paths
MLP_MODEL_PATH = os.path.join(MLP_DIR, "mlp_cicids2017_v2_optimized.keras")
MLP_ENCODER_PATH = os.path.join(MLP_DIR, "label_encoder_mlp_optimized.pkl")
MLP_SCALER_PATH = os.path.join(MLP_DIR, "scaler_mlp_optimized.pkl")

# CORS origins
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
]

# Test CSV path
TEST_CSV_PATH = os.path.join(APP_ROOT, "test_api.csv")


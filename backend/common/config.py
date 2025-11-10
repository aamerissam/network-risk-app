"""
Configuration settings for the application
"""
import os

# Application root directory
APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Models directory
MODELS_DIR = os.path.join(APP_ROOT, "models", "xgboost")

# Model file paths
MODEL_PATH = os.path.join(MODELS_DIR, "xgb_model_train_optimized2.json")
ENCODER_PATH = os.path.join(MODELS_DIR, "encoder_xgb2.pkl")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler_xgb2.pkl")
FEATURE_COLUMNS_PATH = os.path.join(MODELS_DIR, "feature_columns.json")

# CORS origins
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
]

# Test CSV path
TEST_CSV_PATH = os.path.join(APP_ROOT, "test_api.csv")


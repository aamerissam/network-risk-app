# Network Risk Detection Backend

FastAPI backend for network intrusion detection using XGBoost with CIC-IDS-2017 dataset.

## Architecture

The backend follows a modular architecture with separation of concerns:

### Modules

- **common/**: Shared utilities
  - `config.py`: Application configuration and paths
  - `constants.py`: Constants (threat types, model metrics)
  - `preprocessing.py`: Data preprocessing utilities
  - `logger.py`: Logging configuration

- **model_management/**: Model loading and management
  - `services.py`: ModelLoader service
  - `endpoints.py`: Model info and health check endpoints

- **prediction/**: Prediction functionality
  - `models.py`: Pydantic request/response models
  - `services.py`: PredictionService business logic
  - `endpoints.py`: Prediction API endpoints

- **dataset_analysis/**: Dataset analysis functionality
  - `services.py`: DatasetAnalysisService business logic
  - `endpoints.py`: Dataset analysis API endpoints

- **test/**: Unit tests
  - Service unit tests
  - Preprocessing tests

## Setup

1. Create virtual environment:
```bash
python -m venv venv
```

2. Activate virtual environment:
```bash
# Windows
.\venv\Scripts\Activate.ps1

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload
```

## API Endpoints

- `GET /`: API information
- `GET /model/health`: Health check
- `GET /model/info`: Model information
- `POST /predict/one`: Single prediction
- `POST /predict/csv`: Batch prediction from CSV
- `GET /analyze-dataset`: Analyze test dataset
- `GET /analyze-dataset/balanced`: Balanced analysis
- `GET /analyze-dataset/all-attacks`: Analysis by attack type
- `GET /realtime-metrics`: Real-time metrics

## Testing

Run tests:
```bash
pytest test/
```


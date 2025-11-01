"""
Prediction API endpoints
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pandas.io.common import BytesIO
import pandas as pd

from prediction.models import Sample, PredictionResponse, BatchAnalysisResponse
from prediction.services import get_prediction_service
from common.logger import logger

router = APIRouter(prefix="/predict", tags=["prediction"])


@router.post("/one", response_model=PredictionResponse)
def predict_one(sample: Sample):
    """Make a single prediction from feature dictionary"""
    try:
        prediction_service = get_prediction_service()
        result = prediction_service.predict_single(sample.features)
        return PredictionResponse(**result)
    except Exception as e:
        logger.error(f"Error in predict_one: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/csv", response_model=BatchAnalysisResponse)
async def predict_csv(file: UploadFile = File(...)):
    """Make batch predictions from uploaded CSV file"""
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=400, 
                detail="Only CSV files are accepted"
            )
        
        # Read CSV
        content = await file.read()
        df = pd.read_csv(BytesIO(content))
        
        logger.info(
            f"CSV file received: {len(df)} rows, {len(df.columns)} columns"
        )
        
        # Make predictions
        prediction_service = get_prediction_service()
        result = prediction_service.predict_batch(df)
        
        # Add filename to summary
        result["summary"]["filename"] = file.filename
        
        return BatchAnalysisResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in predict_csv: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing file: {str(e)}"
        )


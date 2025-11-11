"""
Dataset analysis API endpoints
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from io import BytesIO
import pandas as pd

from dataset_analysis.services import get_dataset_analysis_service
from common.logger import logger

router = APIRouter(prefix="/analyze-dataset", tags=["dataset-analysis"])


@router.get("")
def analyze_dataset():
    """Analyze test_api.csv directly on the server (simple sampling)"""
    try:
        service = get_dataset_analysis_service()
        result = service.analyze_dataset()
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error during dataset analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@router.get("/balanced")
def analyze_dataset_balanced(
    benign_samples: int = 500,
    malicious_samples: int = 500
):
    """
    Analyze dataset with balanced sampling
    
    Args:
        benign_samples: Number of BENIGN samples to take (default: 500)
        malicious_samples: Number of malicious samples to take (default: 500)
    """
    try:
        service = get_dataset_analysis_service()
        result = service.analyze_dataset_balanced(
            benign_samples, 
            malicious_samples
        )
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error during balanced dataset analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all-attacks")
def analyze_dataset_all_attacks(samples_per_attack: int = 50):
    """
    Analyze with a sample from each attack type
    
    Args:
        samples_per_attack: Number of samples per attack type (default: 50)
    """
    try:
        service = get_dataset_analysis_service()
        result = service.analyze_dataset_all_attacks(samples_per_attack)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error during all-attacks analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def analyze_dataset_upload(
    file: UploadFile = File(...),
    benign_samples: int = Query(500, ge=1, le=10000),
    malicious_samples: int = Query(500, ge=1, le=10000)
):
    """
    Analyze uploaded CSV file with balanced sampling
    
    Args:
        file: CSV file to upload
        benign_samples: Number of BENIGN samples to take (default: 500)
        malicious_samples: Number of malicious samples to take (default: 500)
    """
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
            f"CSV file received: {file.filename}, {len(df)} rows, {len(df.columns)} columns"
        )
        
        # Validate dataset is not empty
        if df.empty:
            raise HTTPException(
                status_code=400,
                detail="Uploaded CSV file is empty"
            )
        
        # Analyze with balanced sampling
        service = get_dataset_analysis_service()
        result = service.analyze_dataset_balanced_from_dataframe(
            df=df,
            benign_samples=benign_samples,
            malicious_samples=malicious_samples,
            filename=file.filename
        )
        
        return result
        
    except HTTPException:
        raise
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty or invalid")
    except pd.errors.ParserError as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")
    except Exception as e:
        logger.error(f"Error during uploaded dataset analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


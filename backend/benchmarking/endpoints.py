"""
Benchmarking API endpoints - Compare XGBoost vs MLP models
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
import pandas as pd
from io import BytesIO

from benchmarking.services import get_benchmarking_service
from common.logger import logger

router = APIRouter(prefix="/benchmark", tags=["benchmarking"])


@router.post("/compare")
async def compare_models_endpoint(
    file: UploadFile = File(...),
    sample_size: int = Query(100, ge=1, le=1000, description="Number of samples to analyze")
):
    """
    Compare XGBoost and MLP models on uploaded CSV data
    
    Args:
        file: CSV file with network traffic data
        sample_size: Number of samples to analyze (max 1000)
    
    Returns:
        Comparison results from both models
    """
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Please upload a CSV file."
            )
        
        # Read CSV
        contents = await file.read()
        df = pd.read_csv(BytesIO(contents))
        
        logger.info(
            f"Benchmarking: Loaded {len(df)} rows from {file.filename}"
        )
        
        # Validate dataset
        if df.empty:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty"
            )
        
        # Sample if needed
        if len(df) > sample_size:
            df_sample = df.sample(n=sample_size, random_state=42)
            logger.info(f"Sampled {sample_size} rows from {len(df)}")
        else:
            df_sample = df
        
        # Run comparison
        benchmarking_service = get_benchmarking_service()
        result = benchmarking_service.compare_models(df_sample)
        
        # Add file info
        result['file_info'] = {
            "filename": file.filename,
            "total_rows": len(df),
            "analyzed_rows": len(df_sample)
        }
        
        logger.info(
            f"Benchmarking complete: {result['comparison']['agreement_rate']:.2f}% agreement"
        )
        
        return result
        
    except pd.errors.ParserError as e:
        logger.error(f"CSV parsing error: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse CSV file: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Benchmarking error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Benchmarking error: {str(e)}"
        )


@router.get("/models-info")
def get_models_info():
    """
    Get information about both models
    
    Returns:
        Information about XGBoost and MLP models
    """
    try:
        benchmarking_service = get_benchmarking_service()
        
        xgboost_info = benchmarking_service.xgboost_loader.get_model_info()
        mlp_info = benchmarking_service.mlp_loader.get_model_info()
        
        return {
            "xgboost": xgboost_info,
            "mlp": mlp_info
        }
    except Exception as e:
        logger.error(f"Error getting models info: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting models info: {str(e)}"
        )


@router.get("/health")
def benchmark_health_check():
    """
    Check health status of both models
    
    Returns:
        Health status of XGBoost and MLP models
    """
    try:
        benchmarking_service = get_benchmarking_service()
        
        xgboost_health = benchmarking_service.xgboost_loader.health_check()
        mlp_health = benchmarking_service.mlp_loader.health_check()
        
        both_healthy = (
            xgboost_health['status'] == 'healthy' and 
            mlp_health['status'] == 'healthy'
        )
        
        return {
            "status": "healthy" if both_healthy else "unhealthy",
            "xgboost": xgboost_health,
            "mlp": mlp_health
        }
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }


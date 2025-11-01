"""
Model management API endpoints
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime

from model_management.services import get_model_loader
from common.logger import logger

router = APIRouter(prefix="/model", tags=["model"])


@router.get("/info")
def get_model_info():
    """Get detailed information about the model and metrics"""
    try:
        model_loader = get_model_loader()
        info = model_loader.get_model_info()
        info["last_updated"] = datetime.now().isoformat()
        return info
    except Exception as e:
        logger.error(f"Error in model-info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
def health_check():
    """Health check endpoint for the model"""
    try:
        model_loader = get_model_loader()
        result = model_loader.health_check()
        result["timestamp"] = datetime.now().isoformat()
        
        if result["status"] == "unhealthy":
            return JSONResponse(
                status_code=500,
                content=result
            )
        return result
    except Exception as e:
        logger.error(f"Error in health check: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "unhealthy", "error": str(e)}
        )


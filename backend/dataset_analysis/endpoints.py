"""
Dataset analysis API endpoints
"""
from fastapi import APIRouter, HTTPException

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


"""
Dataset analysis services - business logic for dataset analysis
"""
import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime

from model_management.services import get_model_loader
from prediction.services import get_prediction_service
from common.config import TEST_CSV_PATH
from common.preprocessing import preprocess_dataframe
from common.constants import THREAT_TYPES
from common.logger import logger


class DatasetAnalysisService:
    """Service for analyzing datasets"""
    
    def __init__(self):
        self.model_loader = get_model_loader()
        self.prediction_service = get_prediction_service()
    
    def analyze_dataset(self, sample_size: int = 1000) -> Dict[str, Any]:
        """
        Analyze the test dataset with simple random sampling
        
        Args:
            sample_size: Number of samples to analyze
        
        Returns:
            Dictionary with analysis results
        """
        try:
            if not os.path.exists(TEST_CSV_PATH):
                raise FileNotFoundError(f"Test CSV not found: {TEST_CSV_PATH}")
            
            # Load dataset
            df = pd.read_csv(TEST_CSV_PATH)
            logger.info(f"Dataset test_api.csv loaded: {len(df)} rows")
            
            # Random sampling
            df_sample = df.sample(n=min(sample_size, len(df)), random_state=42)
            
            # Make predictions
            result = self.prediction_service.predict_batch(df_sample)
            
            # Add dataset info
            result["dataset_info"] = {
                "total_rows": len(df),
                "sampled_rows": len(df_sample),
                "file_path": "test_api.csv"
            }
            
            return result
        except Exception as e:
            logger.error(f"Error in analyze_dataset: {e}")
            raise
    
    def analyze_dataset_balanced(
        self, 
        benign_samples: int = 500, 
        malicious_samples: int = 500
    ) -> Dict[str, Any]:
        """
        Analyze dataset with balanced sampling
        
        Args:
            benign_samples: Number of BENIGN samples
            malicious_samples: Number of malicious samples
        
        Returns:
            Dictionary with balanced analysis results
        """
        try:
            if not os.path.exists(TEST_CSV_PATH):
                raise FileNotFoundError(f"Test CSV not found: {TEST_CSV_PATH}")
            
            # Load dataset
            df = pd.read_csv(TEST_CSV_PATH)
            logger.info(f"Dataset test_api.csv loaded: {len(df)} rows, {len(df.columns)} columns")
            
            # Validate dataset is not empty
            if df.empty:
                raise ValueError(f"Dataset at {TEST_CSV_PATH} is empty")
            
            # Stratified sampling
            if 'Label' in df.columns:
                df_benign = df[df['Label'] == 'BENIGN']
                df_malicious = df[df['Label'] != 'BENIGN']
                
                logger.info(
                    f"Dataset original: {len(df_benign)} BENIGN, "
                    f"{len(df_malicious)} MALICIOUS"
                )
                
                # Sample
                n_benign = min(benign_samples, len(df_benign))
                n_malicious = min(malicious_samples, len(df_malicious))
                
                sample_benign = (
                    df_benign.sample(n=n_benign, random_state=42) 
                    if n_benign > 0 
                    else pd.DataFrame()
                )
                sample_malicious = (
                    df_malicious.sample(n=n_malicious, random_state=42) 
                    if n_malicious > 0 
                    else pd.DataFrame()
                )
                
                # Combine and shuffle
                if len(sample_benign) > 0 and len(sample_malicious) > 0:
                    df_sample = pd.concat(
                        [sample_benign, sample_malicious], 
                        ignore_index=True
                    )
                elif len(sample_benign) > 0:
                    df_sample = sample_benign
                elif len(sample_malicious) > 0:
                    df_sample = sample_malicious
                else:
                    raise ValueError("No samples available after filtering")
                
                # Only shuffle if we have more than one row
                if len(df_sample) > 1:
                    df_sample = df_sample.sample(
                        frac=1, random_state=42
                    ).reset_index(drop=True)
                else:
                    df_sample = df_sample.reset_index(drop=True)
                
                logger.info(
                    f"✅ Balanced sample created: {n_benign} BENIGN, "
                    f"{n_malicious} MALICIOUS"
                )
            else:
                # Simple sampling if no Label column
                df_sample = df.sample(
                    n=min(benign_samples + malicious_samples, len(df)), 
                    random_state=42
                )
                n_benign = 0
                n_malicious = 0
                logger.warning(
                    "Column 'Label' not found, simple sampling performed"
                )
            
            # Make predictions
            result = self.prediction_service.predict_batch(df_sample)
            
            # Add original labels if available
            if 'Label' in df_sample.columns:
                for i, (_, row) in enumerate(df_sample.iterrows()):
                    if i < len(result["results"]):
                        result["results"][i]['original_label'] = str(row['Label'])
            
            # Add dataset info
            result["dataset_info"] = {
                "total_rows": len(df),
                "sampled_rows": len(df_sample),
                "benign_requested": benign_samples,
                "malicious_requested": malicious_samples,
                "benign_actual": n_benign if 'Label' in df.columns else 0,
                "malicious_actual": n_malicious if 'Label' in df.columns else 0,
                "sampling_method": "balanced"
            }
            
            return result
        except Exception as e:
            logger.error(f"Error in analyze_dataset_balanced: {e}")
            raise
    
    def analyze_dataset_all_attacks(
        self, 
        samples_per_attack: int = 50
    ) -> Dict[str, Any]:
        """
        Analyze dataset with samples from each attack type
        
        Args:
            samples_per_attack: Number of samples per attack type
        
        Returns:
            Dictionary with analysis results by attack type
        """
        try:
            if not os.path.exists(TEST_CSV_PATH):
                raise FileNotFoundError(f"Test CSV not found: {TEST_CSV_PATH}")
            
            # Load dataset
            df = pd.read_csv(TEST_CSV_PATH)
            logger.info(f"Dataset test_api.csv loaded: {len(df)} rows")
            
            if 'Label' in df.columns:
                samples = []
                attack_types = df['Label'].unique()
                logger.info(f"Attack types found: {list(attack_types)}")
                
                attack_distribution = {}
                for attack_type in attack_types:
                    df_attack = df[df['Label'] == attack_type]
                    n_samples = min(samples_per_attack, len(df_attack))
                    
                    if n_samples > 0:
                        sample = df_attack.sample(n=n_samples, random_state=42)
                        samples.append(sample)
                        attack_distribution[str(attack_type)] = n_samples
                        logger.info(f"  ✅ {attack_type}: {n_samples} samples")
                
                # Combine all samples
                df_sample = pd.concat(samples, ignore_index=True)
                df_sample = df_sample.sample(
                    frac=1, random_state=42
                ).reset_index(drop=True)
                
                logger.info(
                    f"✅ Total samples with all attack types: {len(df_sample)}"
                )
            else:
                df_sample = df.sample(
                    n=min(1000, len(df)), random_state=42
                )
                attack_distribution = {}
                attack_types = []
                logger.warning("Column 'Label' not found")
            
            # Make predictions
            result = self.prediction_service.predict_batch(df_sample)
            
            # Add original labels if available
            if 'Label' in df_sample.columns:
                original_distribution = df_sample['Label'].value_counts().to_dict()
                original_distribution = {
                    str(k): int(v) 
                    for k, v in original_distribution.items()
                }
                for i, (_, row) in enumerate(df_sample.iterrows()):
                    if i < len(result["results"]):
                        result["results"][i]['original_label'] = str(row['Label'])
            else:
                original_distribution = {}
            
            # Add dataset info
            result["dataset_info"] = {
                "total_rows": len(df),
                "sampled_rows": len(df_sample),
                "samples_per_attack_type": samples_per_attack,
                "attack_types_found": len(attack_types) if 'Label' in df.columns else 0,
                "attack_types_list": (
                    [str(at) for at in attack_types] 
                    if 'Label' in df.columns 
                    else []
                ),
                "sampling_method": "all_attack_types"
            }
            
            result["original_distribution"] = original_distribution
            result["attack_distribution"] = attack_distribution
            
            return result
        except Exception as e:
            logger.error(f"Error in analyze_dataset_all_attacks: {e}")
            raise


# Global dataset analysis service instance
_dataset_analysis_service: Optional[DatasetAnalysisService] = None


def get_dataset_analysis_service() -> DatasetAnalysisService:
    """Get or create the global dataset analysis service instance"""
    global _dataset_analysis_service
    if _dataset_analysis_service is None:
        _dataset_analysis_service = DatasetAnalysisService()
    return _dataset_analysis_service


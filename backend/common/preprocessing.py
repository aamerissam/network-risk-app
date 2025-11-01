"""
Data preprocessing utilities
"""
import pandas as pd
import numpy as np
from typing import Tuple

from common.config import FEATURE_COLUMNS_PATH
from common.logger import logger
import json


def split_columns(df: pd.DataFrame, encoder, scaler) -> Tuple[list, list]:
    """
    Split columns into categorical and numerical based on encoder and scaler
    
    Args:
        df: DataFrame to process
        encoder: Fitted encoder with feature_names_in_ attribute
        scaler: Fitted scaler with feature_names_in_ attribute
    
    Returns:
        Tuple of (categorical columns, numerical columns)
    """
    enc_in = list(getattr(encoder, "feature_names_in_", []))
    scl_in = list(getattr(scaler, "feature_names_in_", []))

    if not enc_in:
        enc_in = [c for c in df.columns if df[c].dtype == "object"]
    if not scl_in:
        scl_in = [c for c in df.columns if c not in enc_in]

    enc_in = [c for c in enc_in if c in df.columns]
    scl_in = [c for c in scl_in if c in df.columns]
    return enc_in, scl_in


def preprocess_dataframe(
    df: pd.DataFrame, 
    encoder, 
    scaler, 
    feature_columns: list
) -> pd.DataFrame:
    """
    Preprocess DataFrame for model prediction
    
    Args:
        df: Raw DataFrame
        encoder: Fitted encoder
        scaler: Fitted scaler
        feature_columns: List of feature column names expected by the model
    
    Returns:
        Preprocessed DataFrame ready for model prediction
    """
    df = df.copy()
    
    # Validate DataFrame is not empty
    if df.empty:
        raise ValueError("DataFrame is empty. Cannot preprocess empty data.")
    
    # Remove unnecessary columns
    if "Timestamp" in df.columns:
        df.drop("Timestamp", axis=1, inplace=True)
    if "Label" in df.columns:
        df.drop("Label", axis=1, inplace=True)
    
    # Check if DataFrame still has columns after removing Timestamp/Label
    if df.empty or len(df.columns) == 0:
        raise ValueError("DataFrame has no columns after removing Timestamp and Label.")
    
    # Handle missing values and infinities
    for c in df.columns:
        if df[c].dtype == "object":
            df[c] = df[c].fillna("missing")
        else:
            df[c] = df[c].replace([np.inf, -np.inf], np.nan)
            df[c] = df[c].fillna(0)

    # Split categorical and numerical columns
    cat_cols, num_cols = split_columns(df, encoder, scaler)
    
    # Validate that we have at least some columns
    if len(cat_cols) == 0 and len(num_cols) == 0:
        raise ValueError("No valid columns found for preprocessing. DataFrame is empty or has no matching columns.")

    # Encode categorical columns
    if len(cat_cols) > 0:
        try:
            X_cat = encoder.transform(df[cat_cols])
            if hasattr(X_cat, "toarray"):
                X_cat = X_cat.toarray()
            try:
                cat_names = list(encoder.get_feature_names_out(cat_cols))
            except Exception:
                cat_names = [f"cat_{i}" for i in range(X_cat.shape[1])]
        except Exception as e:
            logger.error(f"Error encoding categorical columns: {e}")
            logger.error(f"Categorical columns: {cat_cols}")
            logger.error(f"DataFrame shape: {df.shape}, columns: {list(df.columns)}")
            raise ValueError(f"Failed to encode categorical columns: {str(e)}") from e
    else:
        X_cat = np.array([]).reshape(len(df), 0)
        cat_names = []

    # Scale numerical columns
    if len(num_cols) > 0:
        try:
            X_num = scaler.transform(df[num_cols])
            num_names = num_cols
        except Exception as e:
            logger.error(f"Error scaling numerical columns: {e}")
            logger.error(f"Numerical columns: {num_cols}")
            logger.error(f"DataFrame shape: {df.shape}, columns: {list(df.columns)}")
            raise ValueError(f"Failed to scale numerical columns: {str(e)}") from e
    else:
        X_num = np.array([]).reshape(len(df), 0)
        num_names = []

    # Concatenate
    if X_cat.size > 0 and X_num.size > 0:
        X = np.hstack([X_num, X_cat])
    elif X_num.size > 0:
        X = X_num
    elif X_cat.size > 0:
        X = X_cat
    else:
        raise ValueError("Both categorical and numerical arrays are empty after preprocessing")
    
    cols = list(num_names) + list(cat_names)
    X_df = pd.DataFrame(X, columns=cols)

    # Reindex columns in the exact order expected by the model
    X_df = X_df.reindex(columns=feature_columns, fill_value=0)
    
    return X_df


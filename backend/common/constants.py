"""
Constants used across the application
"""

# Threat types mapping for CIC-IDS-2017
THREAT_TYPES = {
    'BENIGN': 'Normal',
    'Bot': 'Botnet',
    'Comb': 'Combined Attack',
    'DDoS': 'DDoS Attack',
    'DoS GoldenEye': 'DoS Attack',
    'DoS Hulk': 'DoS Attack', 
    'DoS Slowhttptest': 'DoS Attack',
    'DoS slowloris': 'DoS Attack',
    'FTP-Patator': 'Brute Force',
    'SSH-Patator': 'Brute Force',
    'Heartbleed': 'Vulnerability Exploit',
    'Infiltration': 'Infiltration',
    'PortScan': 'Port Scan',
    'Web Attack – Brute Force': 'Web Attack',
    'Web Attack – Sql Injection': 'Web Attack',
    'Web Attack – XSS': 'Web Attack'
}

# Model performance metrics
MODEL_METRICS = {
    "accuracy": 99.86,
    "precision": 100.0,
    "recall": 100.0,
    "f1_score": 99.87,
    "specificity": 99.9,
    "sensitivity": 100.0
}

# Model parameters
MODEL_PARAMETERS = {
    "max_depth": 6,
    "learning_rate": 0.1,
    "n_estimators": 1000,
    "subsample": 0.8,
    "colsample_bytree": 0.8
}


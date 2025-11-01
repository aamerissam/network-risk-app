# prepare_csv.py
import pandas as pd
import json

# ==========================
# Chemins des fichiers
# ==========================
CSV_INPUT_PATH = "D:/Desktop/PFE/Pratique/network-risk-app/server/CIC-IDS-2017-V2.csv"
FEATURE_COLUMNS_PATH = "D:/Desktop/PFE/Pratique/network-risk-app/server/models/feature_columns.json"
CSV_OUTPUT_PATH = "D:/Desktop/PFE/Pratique/network-risk-app/server/test_api.csv"

# ==========================
# Charger seulement 1000 lignes du dataset
# ==========================
print("Chargement des 1000 premières lignes du CSV...")
df = pd.read_csv(CSV_INPUT_PATH, nrows=1000)

print("Chargement des colonnes du modèle...")
with open(FEATURE_COLUMNS_PATH, "r", encoding="utf-8") as f:
    feature_cols = json.load(f)

# Vérifier si toutes les colonnes nécessaires sont présentes
missing_cols = [col for col in feature_cols if col not in df.columns]
if missing_cols:
    print(f"⚠️ Colonnes manquantes dans le CSV : {missing_cols}")
else:
    print("✅ Toutes les colonnes nécessaires sont présentes.")

# ==========================
# Filtrer uniquement les colonnes utiles
# ==========================
df_model = df[feature_cols]

# ==========================
# Sauvegarder le CSV réduit
# ==========================
df_model.to_csv(CSV_OUTPUT_PATH, index=False)
print(f"✅ CSV filtré et réduit créé : {CSV_OUTPUT_PATH}")

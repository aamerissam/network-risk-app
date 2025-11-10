import pandas as pd
import numpy as np
import joblib
import tensorflow as tf
import xgboost as xgb
from collections import Counter
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import os
import warnings
warnings.filterwarnings('ignore')

# ==========================
# CONFIGURATION
# ==========================
# Get the backend directory (parent of test directory)
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BACKEND_DIR, "models")

# Chemins des modèles MLP
MLP_MODEL_PATH = os.path.join(MODELS_DIR, "mlp", "mlp_cicids2017_v2_optimized.keras")
MLP_SCALER_PATH = os.path.join(MODELS_DIR, "mlp", "scaler_mlp_optimized.pkl")
MLP_ENCODER_PATH = os.path.join(MODELS_DIR, "mlp", "label_encoder_mlp_optimized.pkl")

# Chemins des modèles XGBoost
XGB_MODEL_PATH = os.path.join(MODELS_DIR, "xgboost", "xgb_model_train_optimized2.json")
XGB_SCALER_PATH = os.path.join(MODELS_DIR, "xgboost", "scaler_xgb2.pkl")
XGB_ENCODER_PATH = os.path.join(MODELS_DIR, "xgboost", "encoder_xgb2.pkl")

# Chemin vers votre extrait de dataset
DATA_PATH = os.path.join(MODELS_DIR, "xgboost", "CIC-IDS-2017-V2.csv")

# ==========================
# 1) CHARGEMENT DES MODÈLES
# ==========================
print("="*70)
print("🔧 CHARGEMENT DES MODÈLES ET PRÉPROCESSEURS")
print("="*70)

# MLP
print("\n📥 Chargement du modèle MLP...")
mlp_model = tf.keras.models.load_model(MLP_MODEL_PATH, compile=False)
mlp_scaler = joblib.load(MLP_SCALER_PATH)
mlp_encoder = joblib.load(MLP_ENCODER_PATH)
print("✅ MLP chargé avec succès")

# XGBoost
print("\n📥 Chargement du modèle XGBoost...")
xgb_model = xgb.Booster()
xgb_model.load_model(XGB_MODEL_PATH)
xgb_scaler = joblib.load(XGB_SCALER_PATH)
xgb_encoder = joblib.load(XGB_ENCODER_PATH)
print("✅ XGBoost chargé avec succès")

# Classes disponibles
classes_mlp = mlp_encoder.classes_
classes_xgb = xgb_encoder.classes_
print(f"\n📋 Classes détectables: {list(classes_mlp)}")

# ==========================
# 2) CHARGEMENT DES DONNÉES
# ==========================
print("\n" + "="*70)
print("📂 CHARGEMENT DES DONNÉES À ANALYSER")
print("="*70)

df = pd.read_csv(DATA_PATH)
print(f"✅ Dataset chargé: {df.shape[0]} lignes, {df.shape[1]} colonnes")

# Afficher les premières lignes
print("\n📊 Aperçu des données:")
print(df.head())

# Vérifier si la colonne 'label' existe
has_labels = 'label' in df.columns

if has_labels:
    print("\n✅ Labels réels trouvés dans le dataset")
    y_true = df['label']
    X = df.drop('label', axis=1)
else:
    print("\n⚠️  Pas de labels dans le dataset (détection sur données non étiquetées)")
    X = df.copy()
    y_true = None

# Supprimer Timestamp si présent
if 'Timestamp' in X.columns:
    X = X.drop('Timestamp', axis=1)

# Nettoyage
X.replace([np.inf, -np.inf], np.nan, inplace=True)
X.fillna(0, inplace=True)

print(f"\n✅ Données préparées: {X.shape[0]} échantillons, {X.shape[1]} features")

# ==========================
# 3) FONCTION DE PRÉDICTION
# ==========================
def predict_with_both_models(X_data):
    """Effectue les prédictions avec les deux modèles"""

    print("\n" + "="*70)
    print("🔍 DÉTECTION DES ATTAQUES EN COURS...")
    print("="*70)

    # Prédiction MLP
    print("\n🧠 Prédiction avec MLP...")
    X_scaled_mlp = mlp_scaler.transform(X_data)
    mlp_proba = mlp_model.predict(X_scaled_mlp, batch_size=256, verbose=0)
    mlp_pred_encoded = np.argmax(mlp_proba, axis=1)
    mlp_pred = mlp_encoder.inverse_transform(mlp_pred_encoded)
    mlp_confidence = np.max(mlp_proba, axis=1)
    print("✅ Prédictions MLP terminées")

    # Prédiction XGBoost
    print("\n🌳 Prédiction avec XGBoost...")
    X_scaled_xgb = xgb_scaler.transform(X_data)
    dmatrix = xgb.DMatrix(X_scaled_xgb)
    xgb_proba = xgb_model.predict(dmatrix)
    xgb_pred_encoded = np.argmax(xgb_proba, axis=1)
    xgb_pred = xgb_encoder.inverse_transform(xgb_pred_encoded)
    xgb_confidence = np.max(xgb_proba, axis=1)
    print("✅ Prédictions XGBoost terminées")

    return {
        'mlp_pred': mlp_pred,
        'mlp_confidence': mlp_confidence,
        'mlp_proba': mlp_proba,
        'xgb_pred': xgb_pred,
        'xgb_confidence': xgb_confidence,
        'xgb_proba': xgb_proba
    }

# ==========================
# 4) EFFECTUER LES PRÉDICTIONS
# ==========================
predictions = predict_with_both_models(X)

# ==========================
# 5) CRÉER UN DATAFRAME DE RÉSULTATS
# ==========================
print("\n" + "="*70)
print("📊 CRÉATION DU RAPPORT DE DÉTECTION")
print("="*70)

results_df = pd.DataFrame({
    'Index': range(len(X)),
    'MLP_Prediction': predictions['mlp_pred'],
    'MLP_Confidence': predictions['mlp_confidence'],
    'XGBoost_Prediction': predictions['xgb_pred'],
    'XGBoost_Confidence': predictions['xgb_confidence'],
    'Accord_Modeles': predictions['mlp_pred'] == predictions['xgb_pred']
})

# Ajouter les labels réels si disponibles
if has_labels:
    results_df.insert(1, 'Label_Reel', y_true.values)
    results_df['MLP_Correct'] = results_df['MLP_Prediction'] == results_df['Label_Reel']
    results_df['XGBoost_Correct'] = results_df['XGBoost_Prediction'] == results_df['Label_Reel']

# Catégoriser les attaques
results_df['MLP_Est_Attaque'] = results_df['MLP_Prediction'] != 'BENIGN'
results_df['XGBoost_Est_Attaque'] = results_df['XGBoost_Prediction'] != 'BENIGN'

print("\n✅ Rapport créé avec succès")

# ==========================
# 6) AFFICHAGE DES RÉSULTATS
# ==========================
print("\n" + "="*70)
print("🎯 RÉSULTATS DE LA DÉTECTION")
print("="*70)

# Statistiques globales
total_samples = len(results_df)
mlp_attacks = results_df['MLP_Est_Attaque'].sum()
xgb_attacks = results_df['XGBoost_Est_Attaque'].sum()
both_attacks = (results_df['MLP_Est_Attaque'] & results_df['XGBoost_Est_Attaque']).sum()
accord = results_df['Accord_Modeles'].sum()

print(f"\n📊 STATISTIQUES GLOBALES:")
print(f"   • Total d'échantillons analysés: {total_samples}")
print(f"   • Attaques détectées par MLP: {mlp_attacks} ({mlp_attacks/total_samples*100:.2f}%)")
print(f"   • Attaques détectées par XGBoost: {xgb_attacks} ({xgb_attacks/total_samples*100:.2f}%)")
print(f"   • Attaques détectées par les DEUX: {both_attacks} ({both_attacks/total_samples*100:.2f}%)")
print(f"   • Accord entre les modèles: {accord} ({accord/total_samples*100:.2f}%)")

# Distribution des prédictions
print(f"\n📋 DISTRIBUTION DES PRÉDICTIONS MLP:")
mlp_counts = Counter(predictions['mlp_pred'])
for attack_type, count in mlp_counts.most_common():
    print(f"   • {attack_type}: {count} ({count/total_samples*100:.2f}%)")

print(f"\n📋 DISTRIBUTION DES PRÉDICTIONS XGBOOST:")
xgb_counts = Counter(predictions['xgb_pred'])
for attack_type, count in xgb_counts.most_common():
    print(f"   • {attack_type}: {count} ({count/total_samples*100:.2f}%)")

# Si labels réels disponibles
if has_labels:
    mlp_accuracy = results_df['MLP_Correct'].sum() / total_samples * 100
    xgb_accuracy = results_df['XGBoost_Correct'].sum() / total_samples * 100
    print(f"\n🎯 PRÉCISION SUR CET EXTRAIT:")
    print(f"   • MLP: {mlp_accuracy:.2f}%")
    print(f"   • XGBoost: {xgb_accuracy:.2f}%")

# ==========================
# 7) AFFICHER LES DÉSACCORDS
# ==========================
print("\n" + "="*70)
print("⚠️  DÉSACCORDS ENTRE LES MODÈLES")
print("="*70)

disagreements = results_df[~results_df['Accord_Modeles']]
if len(disagreements) > 0:
    print(f"\n❌ {len(disagreements)} désaccords trouvés ({len(disagreements)/total_samples*100:.2f}%)")
    print("\nPremiers exemples de désaccords:")
    cols_to_show = ['Index', 'MLP_Prediction', 'MLP_Confidence',
                    'XGBoost_Prediction', 'XGBoost_Confidence']
    if has_labels:
        cols_to_show.insert(1, 'Label_Reel')
    print(disagreements[cols_to_show].head(10).to_string(index=False))
else:
    print("\n✅ Accord parfait entre les deux modèles!")

# ==========================
# 8) EXEMPLES D'ATTAQUES DÉTECTÉES
# ==========================
print("\n" + "="*70)
print("🚨 EXEMPLES D'ATTAQUES DÉTECTÉES")
print("="*70)

attacks_detected = results_df[results_df['MLP_Est_Attaque'] | results_df['XGBoost_Est_Attaque']]
if len(attacks_detected) > 0:
    print(f"\n⚠️  {len(attacks_detected)} attaques détectées au total")
    print("\nPremiers exemples:")
    cols_to_show = ['Index', 'MLP_Prediction', 'MLP_Confidence',
                    'XGBoost_Prediction', 'XGBoost_Confidence', 'Accord_Modeles']
    if has_labels:
        cols_to_show.insert(1, 'Label_Reel')
    print(attacks_detected[cols_to_show].head(15).to_string(index=False))
else:
    print("\n✅ Aucune attaque détectée - Tout le trafic semble bénin")

# ==========================
# 9) VISUALISATIONS
# ==========================
print("\n" + "="*70)
print("📊 GÉNÉRATION DES VISUALISATIONS")
print("="*70)

# Graphique 1: Distribution des prédictions
fig, axes = plt.subplots(1, 2, figsize=(16, 6))
fig.suptitle('Distribution des Prédictions par Modèle', fontsize=16, fontweight='bold')

# MLP
mlp_df = pd.DataFrame.from_dict(mlp_counts, orient='index', columns=['Count'])
mlp_df = mlp_df.sort_values('Count', ascending=False)
axes[0].bar(range(len(mlp_df)), mlp_df['Count'], color='#3498db', alpha=0.8, edgecolor='black')
axes[0].set_xticks(range(len(mlp_df)))
axes[0].set_xticklabels(mlp_df.index, rotation=45, ha='right')
axes[0].set_title('MLP', fontweight='bold')
axes[0].set_ylabel('Nombre de détections')
axes[0].grid(axis='y', alpha=0.3)

# XGBoost
xgb_df = pd.DataFrame.from_dict(xgb_counts, orient='index', columns=['Count'])
xgb_df = xgb_df.sort_values('Count', ascending=False)
axes[1].bar(range(len(xgb_df)), xgb_df['Count'], color='#e74c3c', alpha=0.8, edgecolor='black')
axes[1].set_xticks(range(len(xgb_df)))
axes[1].set_xticklabels(xgb_df.index, rotation=45, ha='right')
axes[1].set_title('XGBoost', fontweight='bold')
axes[1].set_ylabel('Nombre de détections')
axes[1].grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.savefig('predictions_distribution.png', dpi=300, bbox_inches='tight')
print("✅ Graphique 'predictions_distribution.png' créé")
plt.show()

# Graphique 2: Comparaison Attaques vs Bénin
fig, ax = plt.subplots(figsize=(10, 6))
categories = ['Bénin', 'Attaque']
mlp_data = [total_samples - mlp_attacks, mlp_attacks]
xgb_data = [total_samples - xgb_attacks, xgb_attacks]

x = np.arange(len(categories))
width = 0.35

bars1 = ax.bar(x - width/2, mlp_data, width, label='MLP', color='#3498db', alpha=0.8, edgecolor='black')
bars2 = ax.bar(x + width/2, xgb_data, width, label='XGBoost', color='#e74c3c', alpha=0.8, edgecolor='black')

ax.set_xlabel('Type de trafic', fontweight='bold')
ax.set_ylabel('Nombre de détections', fontweight='bold')
ax.set_title('Comparaison: Trafic Bénin vs Attaques', fontweight='bold', fontsize=14)
ax.set_xticks(x)
ax.set_xticklabels(categories)
ax.legend()
ax.grid(axis='y', alpha=0.3)

# Ajouter les valeurs sur les barres
for bars in [bars1, bars2]:
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
               f'{int(height)}',
               ha='center', va='bottom', fontweight='bold')

plt.tight_layout()
plt.savefig('benign_vs_attacks.png', dpi=300, bbox_inches='tight')
print("✅ Graphique 'benign_vs_attacks.png' créé")
plt.show()

# Graphique 3: Accord entre modèles
fig, ax = plt.subplots(figsize=(10, 6))
accord_data = [accord, total_samples - accord]
colors = ['#2ecc71', '#e67e22']
explode = (0.1, 0)

ax.pie(accord_data, explode=explode, labels=['Accord', 'Désaccord'],
       colors=colors, autopct='%1.1f%%', shadow=True, startangle=90)
ax.set_title('Accord entre MLP et XGBoost', fontweight='bold', fontsize=14)

plt.tight_layout()
plt.savefig('model_agreement.png', dpi=300, bbox_inches='tight')
print("✅ Graphique 'model_agreement.png' créé")
plt.show()

# Graphique 4: Distribution des niveaux de confiance
fig, axes = plt.subplots(1, 2, figsize=(16, 6))
fig.suptitle('Distribution des Niveaux de Confiance', fontsize=16, fontweight='bold')

axes[0].hist(predictions['mlp_confidence'], bins=50, color='#3498db', alpha=0.7, edgecolor='black')
axes[0].axvline(predictions['mlp_confidence'].mean(), color='red', linestyle='--',
                linewidth=2, label=f'Moyenne: {predictions["mlp_confidence"].mean():.3f}')
axes[0].set_xlabel('Confiance')
axes[0].set_ylabel('Fréquence')
axes[0].set_title('MLP', fontweight='bold')
axes[0].legend()
axes[0].grid(alpha=0.3)

axes[1].hist(predictions['xgb_confidence'], bins=50, color='#e74c3c', alpha=0.7, edgecolor='black')
axes[1].axvline(predictions['xgb_confidence'].mean(), color='red', linestyle='--',
                linewidth=2, label=f'Moyenne: {predictions["xgb_confidence"].mean():.3f}')
axes[1].set_xlabel('Confiance')
axes[1].set_ylabel('Fréquence')
axes[1].set_title('XGBoost', fontweight='bold')
axes[1].legend()
axes[1].grid(alpha=0.3)

plt.tight_layout()
plt.savefig('confidence_distribution.png', dpi=300, bbox_inches='tight')
print("✅ Graphique 'confidence_distribution.png' créé")
plt.show()

# ==========================
# 10) SAUVEGARDE DES RÉSULTATS
# ==========================
print("\n" + "="*70)
print("💾 SAUVEGARDE DES RÉSULTATS")
print("="*70)

# Sauvegarder le DataFrame complet
output_filename = f"detection_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
results_df.to_csv(output_filename, index=False)
print(f"✅ Résultats sauvegardés dans '{output_filename}'")

# Sauvegarder uniquement les attaques détectées
if len(attacks_detected) > 0:
    attacks_filename = f"attacks_detected_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    attacks_detected.to_csv(attacks_filename, index=False)
    print(f"✅ Attaques détectées sauvegardées dans '{attacks_filename}'")

# Sauvegarder les désaccords
if len(disagreements) > 0:
    disagreements_filename = f"model_disagreements_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    disagreements.to_csv(disagreements_filename, index=False)
    print(f"✅ Désaccords sauvegardés dans '{disagreements_filename}'")

# ==========================
# 11) RÉSUMÉ FINAL
# ==========================
print("\n" + "="*70)
print("✅ DÉTECTION TERMINÉE - RÉSUMÉ")
print("="*70)

print(f"\n📊 RÉSULTATS PRINCIPAUX:")
print(f"   • {total_samples} échantillons analysés")
print(f"   • {mlp_attacks} attaques détectées par MLP")
print(f"   • {xgb_attacks} attaques détectées par XGBoost")
print(f"   • {both_attacks} attaques confirmées par les deux modèles")
print(f"   • {accord/total_samples*100:.2f}% d'accord entre les modèles")

if has_labels:
    print(f"\n🎯 PRÉCISION:")
    print(f"   • MLP: {mlp_accuracy:.2f}%")
    print(f"   • XGBoost: {xgb_accuracy:.2f}%")
    better_model = "MLP" if mlp_accuracy > xgb_accuracy else "XGBoost" if xgb_accuracy > mlp_accuracy else "Égalité"
    print(f"   • Meilleur modèle: {better_model}")

print(f"\n📁 FICHIERS GÉNÉRÉS:")
print(f"   • {output_filename}")
if len(attacks_detected) > 0:
    print(f"   • {attacks_filename}")
if len(disagreements) > 0:
    print(f"   • {disagreements_filename}")
print(f"   • predictions_distribution.png")
print(f"   • benign_vs_attacks.png")
print(f"   • model_agreement.png")
print(f"   • confidence_distribution.png")

print("\n" + "="*70)
print("🎉 ANALYSE COMPLÈTE TERMINÉE !")
print("="*70)
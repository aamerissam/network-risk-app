import requests

# URL de ton API FastAPI (à adapter si elle tourne sur un autre port ou machine)
API_URL = "http://127.0.0.1:8000/predict-csv"

# Le fichier CSV préparé
CSV_FILE = "test_api.csv"

def test_api():
    try:
        with open(CSV_FILE, "rb") as f:
            files = {"file": (CSV_FILE, f, "text/csv")}
            response = requests.post(API_URL, files=files)

        if response.status_code == 200:
            print("✅ Réponse de l'API :")
            print(response.json())
        else:
            print(f"❌ Erreur {response.status_code} : {response.text}")

    except Exception as e:
        print(f"⚠️ Problème lors de l'appel API : {e}")

if __name__ == "__main__":
    test_api()

# 🚀 Setup Instructions - XGBoost vs MLP Benchmark Platform

This guide will help you set up the project on your local machine.

## 📋 Prerequisites

- **Python 3.9+** (recommended: Python 3.10 or 3.11)
- **Node.js 16+** and **npm** (or **yarn**)
- **Git**

---

## 🔧 Step 0: First-Time Git Setup (If Needed)

### Configure Git (one-time setup):
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### For GitHub/GitLab (if using SSH):
If you want to use SSH keys for authentication:
1. Generate SSH key (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your.email@example.com"
   ```
2. Add SSH key to your GitHub/GitLab account
3. Test connection:
   ```bash
   ssh -T git@github.com  # For GitHub
   # or
   ssh -T git@gitlab.com  # For GitLab
   ```

---

## 🔄 Step 1: Clone and Checkout the Branch

### For your friend (first time cloning the branch):
Replace `<REPOSITORY_URL>` with the actual repository link (e.g., `https://github.com/username/network-risk-app.git` or `git@github.com:username/network-risk-app.git`):

```bash
# Clone the repository and checkout the specific branch in one command
git clone -b xbst_vs_mlp_benchmarking <REPOSITORY_URL>
cd network-risk-app
```

**Example with HTTPS:**
```bash
git clone -b xbst_vs_mlp_benchmarking https://github.com/username/network-risk-app.git
cd network-risk-app
```

**Example with SSH:**
```bash
git clone -b xbst_vs_mlp_benchmarking git@github.com:username/network-risk-app.git
cd network-risk-app
```

### If you already have the repository:
```bash
cd network-risk-app
git fetch origin
git checkout xbst_vs_mlp_benchmarking
git pull origin xbst_vs_mlp_benchmarking
```

### Hard pull (force update - discards local changes):
**⚠️ Warning:** This will discard any local changes and force your branch to match the remote exactly.

```bash
cd network-risk-app
git fetch origin
git checkout xbst_vs_mlp_benchmarking
git reset --hard origin/xbst_vs_mlp_benchmarking
```

---

## 🐍 Step 2: Backend Setup

### 2.1 Navigate to backend directory
```bash
cd backend
```

### 2.2 Create Python virtual environment

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### 2.3 Install Python dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Note:** This will install:
- FastAPI, Uvicorn (web framework)
- XGBoost, TensorFlow (ML models)
- Pandas, NumPy, Scikit-learn (data processing)
- And other required packages

### 2.4 Verify model files exist

Make sure these directories and files exist:
```
backend/
├── models/
│   ├── xgboost/
│   │   ├── xgb_model_train_optimized2.json
│   │   ├── encoder_xgb2.pkl
│   │   ├── scaler_xgb2.pkl
│   │   └── feature_columns.json
│   └── mlp/
│       ├── mlp_cicids2017_v2_optimized.keras
│       ├── label_encoder_mlp_optimized.pkl
│       └── scaler_mlp_optimized.pkl
```

**⚠️ Important:** If model files are missing, you'll need to obtain them separately as they may be too large for Git.

### 2.5 Run the backend server
```bash
# Make sure you're in the backend directory with venv activated
python -m uvicorn main:app --reload --port 8000
```

Or simply:
```bash
python main.py
```

The backend will start on `http://localhost:8000`

**Verify it's working:**
- Open `http://localhost:8000` in your browser
- You should see API information
- Check `http://localhost:8000/benchmark/health` to verify both models are loaded

---

## ⚛️ Step 3: Frontend Setup

### 3.1 Navigate to frontend directory
Open a **new terminal window** (keep backend running) and:
```bash
cd frontend
```

### 3.2 Install Node.js dependencies
```bash
npm install
```

Or if you prefer yarn:
```bash
yarn install
```

### 3.3 Start the React development server
```bash
npm start
```

Or:
```bash
yarn start
```

The frontend will start on `http://localhost:3000` and should automatically open in your browser.

---

## ✅ Step 4: Verify Everything Works

1. **Backend is running** on `http://localhost:8000`
2. **Frontend is running** on `http://localhost:3000`
3. **Check backend health:**
   - Visit: `http://localhost:8000/benchmark/health`
   - Should show both XGBoost and MLP as "healthy"
4. **Test the app:**
   - Upload a CSV file in the frontend
   - Click "Lancer le Benchmark"
   - You should see results from both models

---

## 📁 Project Structure

```
network-risk-app/
├── backend/
│   ├── venv/              # Python virtual environment (created by you)
│   ├── models/            # ML model files (XGBoost & MLP)
│   ├── benchmarking/       # Benchmarking service
│   ├── model_management/  # Model loaders
│   ├── prediction/        # Prediction services
│   ├── dataset_analysis/  # Dataset analysis
│   ├── common/            # Shared utilities
│   ├── requirements.txt   # Python dependencies
│   └── main.py            # FastAPI entry point
│
└── frontend/
    ├── node_modules/      # Node dependencies (created by npm install)
    ├── src/
    │   ├── components/    # React components
    │   ├── App.js         # Main app component
    │   └── config.js      # API configuration
    ├── package.json       # Node dependencies
    └── public/            # Static files
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError` or import errors
- **Solution:** Make sure virtual environment is activated and all dependencies are installed
  ```bash
  pip install -r requirements.txt
  ```

**Problem:** Model files not found
- **Solution:** Check that model files exist in `backend/models/xgboost/` and `backend/models/mlp/`
- If missing, contact the team to obtain the model files

**Problem:** Port 8000 already in use
- **Solution:** Change the port in `main.py` or kill the process using port 8000
  ```bash
  # Windows
  netstat -ano | findstr :8000
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:8000 | xargs kill
  ```

### Frontend Issues

**Problem:** `npm install` fails
- **Solution:** Try clearing npm cache and reinstalling
  ```bash
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
  ```

**Problem:** Frontend can't connect to backend
- **Solution:** 
  1. Verify backend is running on port 8000
  2. Check `frontend/src/config.js` - API_BASE_URL should be `http://localhost:8000`
  3. Check browser console for CORS errors

**Problem:** Port 3000 already in use
- **Solution:** React will ask to use a different port, or you can specify:
  ```bash
  PORT=3001 npm start
  ```

---

## 🔧 Development Commands

### Backend
```bash
# Activate venv (Windows)
venv\Scripts\activate

# Activate venv (macOS/Linux)
source venv/bin/activate

# Run backend
python main.py

# Run with auto-reload
python -m uvicorn main:app --reload --port 8000
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

---

## 📝 Notes

- **Branch:** `xbst_vs_mlp_benchmarking`
- **Backend Port:** 8000
- **Frontend Port:** 3000
- **Python Version:** 3.9+ (tested with 3.10, 3.11)
- **Node Version:** 16+ (tested with 18, 20)

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Make sure you're on the correct branch: `xbst_vs_mlp_benchmarking`
4. Check that both backend and frontend are running
5. Review the browser console and terminal logs for errors

---

**Happy Coding! 🚀**


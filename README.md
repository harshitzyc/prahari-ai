# 🛡️ PRAHARI: AI-Powered MPLADS Anomaly Detection

**Smart India Hackathon (SIH) 2026 | Problem Statement: 26102**  
**Team:** HexaCore  

---

## 🔗 Live Links
*   **🌐 Live App:** [https://prahari-ai.vercel.app](https://prahari-ai.vercel.app) *(Replace with your URL)*
*   **⚙️ Live API:** [https://praharibackend.onrender.com](https://praharibackend.onrender.com)
*   **🎬 Demo Video:** [Watch Here](https://youtube.com/your-link) *(Replace with your URL)*
*   **📚 API Docs:** [https://praharibackend.onrender.com/docs](https://praharibackend.onrender.com/docs)

> *Note: The backend is on a free tier. The first request may take 30s to wake up. Subsequent requests are instant.*

---

## 🚀 About PRAHARI
PRAHARI is an API-first AI oversight layer for the MPLADS eSAKSHI portal. It detects ghost assets, inflated costs, and stalled works in real-time using Computer Vision, NLP, and Explainable AI (XAI), transitioning oversight from periodic manual audits to continuous monitoring.

---

## ✨ Key Features
*   **👁️ Computer Vision:** Detects duplicate photos (pHash) and validates GPS geo-fencing (5km radius).
*   **📊 Explainable AI (XAI):** "Why Flagged?" SHAP-style breakdowns for every risk score.
*   **🏛️ Citizen Loop:** Multilingual, no-login public portal for anonymous work verification and reporting.
*   **📥 Live Ingestion:** Drag-and-drop CSV upload with instant, bulk AI risk scoring.
*   **👮 Human-in-the-Loop:** AI flags are strictly advisory; officers make final structured decisions logged to an audit trail.

---

## 🛠️ Tech Stack
*   **Frontend:** React (Vite), Tailwind CSS, Recharts, Leaflet, jsPDF
*   **Backend:** Python 3.11, FastAPI, Uvicorn, Custom Heuristic AI Engine

---

## 💻 Quick Local Setup

**1. Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 

**2. Frontend (Open a new terminal)**
bash

cd frontend
npm install
npm run dev


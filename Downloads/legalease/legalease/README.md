# ⚖️ LegalEase
### Legal documents are written for lawyers. We built this for everyone else.

## 🎯 Problem
90% of Indians sign legal documents they don't understand. Rental agreements, loan papers, college bonds, employment contracts — most people sign without reading.

## 💡 Solution
LegalEase lets anyone upload a legal document and instantly:
- Get a plain English summary
- See dangerous clauses highlighted in red
- Understand it in their own language
- Listen to it in Hindi, Telugu, Tamil and 7 more Indian languages

## ✨ Features
- 📄 Upload legal documents (PDF/Image)
- 📋 Plain English AI summary
- 🔴🟡🟢 Risk Flag Highlighter
- 🌐 Translation in 10 Indian languages
- 🔊 Text-to-speech in regional languages
- 🤖 AI Processing powered by Supervity AI Agent
- 🧠 Document Analysis via Gemini Vision API

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite
- **Backend:** FastAPI, Python
- **AI:** Google Gemini 2.0 Flash
- **AI Automation:** Supervity AI Agent
- **Deployment:** Vercel (frontend), Render (backend)

## 🚀 How to Run

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
# Add your Gemini API key to .env file
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 👥 Target Users
- Students signing college bonds
- Families signing rental agreements
- Workers signing employment contracts
- Anyone who can't afford a lawyer

## 🏆 Impact
Making legal literacy accessible to 1 billion Indians.

## 🔗 Links
- GitHub: github.com/puzziii/legalease
- Hackathon: Supervity AI Hackathon 2026

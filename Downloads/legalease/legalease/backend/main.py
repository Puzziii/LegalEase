from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import fitz
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    raise RuntimeError("OPENROUTER_API_KEY not set in .env")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "deepseek/deepseek-v3-base:free"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

document_store = {}


def extract_text_from_pdf(contents: bytes) -> str:
    pdf = fitz.open(stream=contents, filetype="pdf")
    full_text = ""
    for page in pdf:
        full_text += page.get_text()
    return full_text.strip()


async def call_openrouter(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://legal-ease-psi-black.vercel.app",
        "X-Title": "LegalEase",
    }
    body = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(OPENROUTER_URL, headers=headers, json=body)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()


@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...), language: str = "Hindi"):
    try:
        contents = await file.read()

        if file.filename.lower().endswith(".pdf"):
            doc_text = extract_text_from_pdf(contents)
        else:
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

        if not doc_text:
            return {"error": "Could not extract text from PDF. It may be scanned/image-based."}

        document_store["current"] = doc_text

        prompt = f"""
        You are LegalEase, an AI legal assistant helping everyday Indians understand legal documents.
        Analyze this legal document text and return ONLY this JSON:
        {{
          "summary": "2-3 sentence plain English summary",
          "entities": {{
            "names": [],
            "dates": [],
            "amounts": [],
            "locations": []
          }},
          "risk_flags": [
            {{
              "level": "red",
              "clause": "clause title",
              "explanation": "one line plain explanation"
            }}
          ],
          "translated_summary": "summary translated to {language}"
        }}
        Return ONLY JSON. No markdown. No extra text.

        Document text:
        {doc_text[:8000]}
        """

        text = await call_openrouter(prompt)
        text = re.sub(r"```json|```", "", text).strip()
        result = json.loads(text)
        return result

    except json.JSONDecodeError:
        return {"error": "Model returned invalid JSON. Try again."}
    except httpx.HTTPStatusError as e:
        return {"error": f"OpenRouter error: {e.response.status_code} — {e.response.text}"}
    except Exception as e:
        return {"error": str(e)}


class ChatRequest(BaseModel):
    question: str


@app.post("/chat")
async def chat_with_document(req: ChatRequest):
    try:
        doc_text = document_store.get("current")
        if not doc_text:
            return {"error": "No document uploaded yet. Please analyze a document first."}

        prompt = f"""
        You are LegalEase, an AI legal assistant. A user has uploaded a legal document and wants to ask questions about it.
        Answer clearly and simply, as if explaining to someone with no legal background.
        Keep answers concise (2-4 sentences max).

        Document:
        {doc_text[:8000]}

        User's question: {req.question}
        """

        answer = await call_openrouter(prompt)
        return {"answer": answer}

    except httpx.HTTPStatusError as e:
        return {"error": f"OpenRouter error: {e.response.status_code} — {e.response.text}"}
    except Exception as e:
        return {"error": str(e)}


@app.get("/")
def root():
    return {"status": "LegalEase backend running!"}
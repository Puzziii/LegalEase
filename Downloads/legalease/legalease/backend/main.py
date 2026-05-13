from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from PIL import Image
import io
import os
import json
import re
import fitz
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("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"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = genai.GenerativeModel("gemini-2.0-flash")

@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...), language: str = "Hindi"):
    try:
        contents = await file.read()

        if file.filename.lower().endswith(".pdf"):
            pdf = fitz.open(stream=contents, filetype="pdf")
            page = pdf[0]
            pix = page.get_pixmap()
            img_bytes = pix.tobytes("png")
            image = Image.open(io.BytesIO(img_bytes))
        else:
            image = Image.open(io.BytesIO(contents))

        prompt = f"""
        You are LegalEase, an AI legal assistant helping everyday Indians understand legal documents.
        Analyze this legal document and return ONLY this JSON:
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
        """

        response = model.generate_content([prompt, image])
        text = response.text.strip()
        text = re.sub(r"```json|```", "", text).strip()
        result = json.loads(text)
        return result

    except Exception as e:
        return {"error": str(e)}

@app.get("/")
def root():
    return {"status": "LegalEase backend running!"}

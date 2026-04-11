from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import base64
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/supervity-analyze")
async def supervity_analyze(file: UploadFile = File(...), language: str = "Hindi"):
    contents = await file.read()
    base64_doc = base64.b64encode(contents).decode()
    
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            "https://auto.supervity.ai/u/alpha/agent/019d7e97-6c5e-7000-9120-1a9ad0a7e88cs",
            json={
                "document": base64_doc,
                "language": language,
                "filename": file.filename
            }
        )
    return response.json()

@app.get("/")
def root():
    return {"status": "LegalEase backend running!"}
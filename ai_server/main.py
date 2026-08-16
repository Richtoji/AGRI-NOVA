"""
AGRI-NOVA Python AI FastAPI Microservice Server
Exposes endpoints for ML Crop Recommendation & Computer Vision Disease Detection
"""

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from models.crop_recommender import crop_recommender
from models.disease_detector import disease_detector

app = FastAPI(
    title="AGRI-NOVA AI Intelligence Microservice",
    description="Enterprise Machine Learning & Computer Vision APIs for Precision Farming",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CropPredictRequest(BaseModel):
    n: float
    p: float
    k: float
    ph: float
    rainfall: float
    temperature: float
    latitude: Optional[float] = 28.6139
    longitude: Optional[float] = 77.2090

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AGRI-NOVA AI Microservice Server",
        "endpoints": ["/api/v1/predict-crop", "/api/v1/detect-disease", "/health"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "gpu_available": False, "device": "cpu"}

@app.post("/api/v1/predict-crop")
def predict_crop(req: CropPredictRequest):
    result = crop_recommender.predict(
        n=req.n,
        p=req.p,
        k=req.k,
        ph=req.ph,
        rainfall=req.rainfall,
        temp=req.temperature
    )
    return {"success": True, "data": result}

@app.post("/api/v1/detect-disease")
async def detect_disease(file: UploadFile = File(...)):
    result = disease_detector.analyze_image(file.filename)
    return {"success": True, "filename": file.filename, "data": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from typing import List, Dict, Any
import logging
import time
from datetime import datetime
import os

from .models.prediction_models import ThreatPredictor
from .schemas.prediction_schemas import (
    PredictionRequest, 
    PredictionResponse, 
    BatchPredictionRequest,
    BatchPredictionResponse,
    ModelInfo
)
from .core.config import settings
from .utils.data_processor import DataProcessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Threat Analysis ML Service",
    description="Machine Learning service for network threat detection and analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
threat_predictor = None
data_processor = None

@app.on_event("startup")
async def startup_event():
    """Initialize ML models and processors on startup"""
    global threat_predictor, data_processor
    
    try:
        logger.info("Loading ML models...")
        threat_predictor = ThreatPredictor()
        data_processor = DataProcessor()
        
        # Load pre-trained models
        await threat_predictor.load_models()
        logger.info("ML models loaded successfully")
        
    except Exception as e:
        logger.error(f"Failed to load ML models: {str(e)}")
        raise e

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Threat Analysis ML Service",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "models_loaded": threat_predictor is not None,
        "processor_ready": data_processor is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/model/info", response_model=ModelInfo)
async def get_model_info():
    """Get information about loaded models"""
    if not threat_predictor:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    return await threat_predictor.get_model_info()

@app.post("/predict", response_model=PredictionResponse)
async def predict_threat(request: PredictionRequest):
    """Predict threat for a single log entry"""
    if not threat_predictor:
        raise HTTPException(status_code=503, detail="ML models not loaded")
    
    try:
        start_time = time.time()
        
        # Process the input data
        processed_data = data_processor.process_single_entry(request.dict())
        
        # Make prediction
        prediction = await threat_predictor.predict_single(processed_data)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return PredictionResponse(
            **prediction,
            processing_time_ms=processing_time,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_threats_batch(request: BatchPredictionRequest):
    """Predict threats for multiple log entries"""
    if not threat_predictor:
        raise HTTPException(status_code=503, detail="ML models not loaded")
    
    try:
        start_time = time.time()
        
        # Process the batch data
        processed_data = data_processor.process_batch(request.log_entries)
        
        # Make batch predictions
        predictions = await threat_predictor.predict_batch(processed_data)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return BatchPredictionResponse(
            predictions=predictions,
            total_processed=len(predictions),
            processing_time_ms=processing_time,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@app.post("/predict/csv")
async def predict_from_csv(file: UploadFile = File(...)):
    """Predict threats from uploaded CSV file"""
    if not threat_predictor:
        raise HTTPException(status_code=503, detail="ML models not loaded")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        start_time = time.time()
        
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(pd.io.common.StringIO(contents.decode('utf-8')))
        
        # Process the CSV data
        processed_data = data_processor.process_csv_data(df)
        
        # Make predictions
        predictions = await threat_predictor.predict_batch(processed_data)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return {
            "filename": file.filename,
            "total_rows": len(df),
            "predictions": predictions,
            "processing_time_ms": processing_time,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"CSV prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CSV prediction failed: {str(e)}")

@app.post("/retrain")
async def retrain_model(file: UploadFile = File(...)):
    """Retrain the model with new data (Admin only)"""
    if not threat_predictor:
        raise HTTPException(status_code=503, detail="ML models not loaded")
    
    try:
        # Read training data
        contents = await file.read()
        df = pd.read_csv(pd.io.common.StringIO(contents.decode('utf-8')))
        
        # Retrain the model
        result = await threat_predictor.retrain_model(df)
        
        return {
            "message": "Model retrained successfully",
            "training_samples": result["training_samples"],
            "accuracy": result["accuracy"],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Retraining error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)

"""
Model Deployment Module for PC Utility Backend
Deploy and manage custom machine learning models.
"""

import os
import uuid
import time
import pickle
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
import torch
import onnxruntime as ort
from sqlalchemy import create_engine, Column, String, DateTime, Integer, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

router = APIRouter(prefix="/api/models", tags=["models"])

Base = declarative_base()

# Database setup
engine = create_engine("sqlite:///./models.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Model storage directory
MODELS_DIR = Path("./models")
MODELS_DIR.mkdir(exist_ok=True)


class ModelMetadata(Base):
    """Database model for ML model metadata"""
    __tablename__ = "models"
    
    model_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    model_type = Column(String, nullable=False)  # pytorch, tensorflow, onnx, sklearn, etc.
    version = Column(String, default="1.0.0")
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    inference_count = Column(Integer, default=0)
    avg_latency_ms = Column(Float, default=0.0)
    use_gpu = Column(String, default="false")
    description = Column(Text)


# Create tables
Base.metadata.create_all(bind=engine)

# In-memory model cache
loaded_models: Dict[str, Any] = {}


class ModelUploadRequest(BaseModel):
    name: str
    model_type: str  # pytorch, tensorflow, onnx, sklearn, etc.
    version: str = "1.0.0"
    use_gpu: bool = False
    description: Optional[str] = None


class ModelUploadResponse(BaseModel):
    model_id: str
    status: str
    name: str
    model_type: str


class ModelInferenceRequest(BaseModel):
    model_id: str
    input_data: Any
    batch_size: int = 1
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None


class ModelInferenceResponse(BaseModel):
    prediction: Any
    confidence: Optional[Any] = None
    latency_ms: float
    model_id: str


class ModelListItem(BaseModel):
    model_id: str
    name: str
    model_type: str
    version: str
    created_at: str
    inference_count: int
    avg_latency_ms: float


class ModelABTestRequest(BaseModel):
    model_a_id: str
    model_b_id: str
    input_data: Any
    metrics: List[str] = ["latency", "prediction"]


SUPPORTED_MODEL_TYPES = [
    "pytorch",
    "tensorflow",
    "onnx",
    "sklearn",
    "huggingface",
    "lightgbm",
    "xgboost",
    "custom",
]


def load_model(model_id: str, model_path: str, model_type: str, use_gpu: bool = False):
    """Load model into memory"""
    try:
        if model_id in loaded_models:
            return loaded_models[model_id]
        
        device = "cuda" if use_gpu and torch.cuda.is_available() else "cpu"
        
        if model_type == "pytorch":
            model = torch.load(model_path, map_location=device)
            model.eval()
        elif model_type == "onnx":
            providers = ['CUDAExecutionProvider', 'CPUExecutionProvider'] if use_gpu else ['CPUExecutionProvider']
            model = ort.InferenceSession(model_path, providers=providers)
        elif model_type == "sklearn":
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
        else:
            # For other types, just store the path
            model = {"path": model_path, "type": model_type}
        
        loaded_models[model_id] = {
            "model": model,
            "type": model_type,
            "device": device,
        }
        
        return loaded_models[model_id]
        
    except Exception as e:
        raise ValueError(f"Failed to load model: {str(e)}")


@router.post("/upload", response_model=ModelUploadResponse)
async def upload_model(
    name: str,
    model_type: str,
    version: str = "1.0.0",
    use_gpu: bool = False,
    description: Optional[str] = None,
    file: UploadFile = File(...)
):
    """Upload and register a custom model"""
    try:
        # Validate model type
        if model_type not in SUPPORTED_MODEL_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported model type. Must be one of: {', '.join(SUPPORTED_MODEL_TYPES)}"
            )
        
        # Generate model ID
        model_id = str(uuid.uuid4())
        
        # Determine file extension based on model type
        extensions = {
            "pytorch": ".pt",
            "tensorflow": ".h5",
            "onnx": ".onnx",
            "sklearn": ".pkl",
            "lightgbm": ".pkl",
            "xgboost": ".pkl",
        }
        ext = extensions.get(model_type, ".bin")
        
        # Save model file
        file_path = MODELS_DIR / f"{model_id}{ext}"
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Store metadata in database
        db = SessionLocal()
        try:
            db_model = ModelMetadata(
                model_id=model_id,
                name=name,
                model_type=model_type,
                version=version,
                file_path=str(file_path),
                use_gpu=str(use_gpu),
                description=description,
            )
            db.add(db_model)
            db.commit()
            db.refresh(db_model)
            
            return ModelUploadResponse(
                model_id=model_id,
                status="uploaded",
                name=name,
                model_type=model_type,
            )
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload model: {str(e)}")


@router.post("/inference", response_model=ModelInferenceResponse)
async def run_inference(request: ModelInferenceRequest):
    """Run inference on a deployed model"""
    try:
        # Get model metadata
        db = SessionLocal()
        try:
            db_model = db.query(ModelMetadata).filter(
                ModelMetadata.model_id == request.model_id
            ).first()
            
            if not db_model:
                raise HTTPException(status_code=404, detail="Model not found")
            
            # Load model if not already loaded
            use_gpu = db_model.use_gpu == "true"
            model_data = load_model(
                request.model_id,
                db_model.file_path,
                db_model.model_type,
                use_gpu
            )
            
            # Measure inference time
            start_time = time.time()
            
            # Run inference based on model type
            if db_model.model_type == "pytorch":
                model = model_data["model"]
                device = model_data["device"]
                
                # Convert input to tensor
                if isinstance(request.input_data, list):
                    input_tensor = torch.tensor(request.input_data, dtype=torch.float32).to(device)
                else:
                    input_tensor = torch.tensor([request.input_data], dtype=torch.float32).to(device)
                
                with torch.no_grad():
                    output = model(input_tensor)
                    prediction = output.cpu().numpy().tolist()
                    
            elif db_model.model_type == "onnx":
                model = model_data["model"]
                input_name = model.get_inputs()[0].name
                
                # Prepare input
                import numpy as np
                if isinstance(request.input_data, list):
                    input_array = np.array(request.input_data, dtype=np.float32)
                else:
                    input_array = np.array([request.input_data], dtype=np.float32)
                
                output = model.run(None, {input_name: input_array})
                prediction = output[0].tolist()
                
            elif db_model.model_type == "sklearn":
                model = model_data["model"]
                
                # Prepare input
                import numpy as np
                if isinstance(request.input_data, list):
                    input_array = np.array(request.input_data).reshape(1, -1)
                else:
                    input_array = np.array([[request.input_data]])
                
                prediction = model.predict(input_array).tolist()
                
            else:
                # Placeholder for other model types
                prediction = {"result": "Model type not fully implemented", "input": request.input_data}
            
            # Calculate latency
            latency_ms = (time.time() - start_time) * 1000
            
            # Update statistics
            db_model.inference_count += 1
            if db_model.avg_latency_ms == 0:
                db_model.avg_latency_ms = latency_ms
            else:
                # Running average
                db_model.avg_latency_ms = (
                    db_model.avg_latency_ms * (db_model.inference_count - 1) + latency_ms
                ) / db_model.inference_count
            db.commit()
            
            return ModelInferenceResponse(
                prediction=prediction,
                confidence=None,  # Would need to extract from model output
                latency_ms=round(latency_ms, 2),
                model_id=request.model_id,
            )
            
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")


@router.get("/list", response_model=List[ModelListItem])
async def list_models(model_type: Optional[str] = None):
    """List all deployed models"""
    try:
        db = SessionLocal()
        try:
            query = db.query(ModelMetadata)
            
            if model_type:
                query = query.filter(ModelMetadata.model_type == model_type)
            
            models = query.all()
            
            return [
                ModelListItem(
                    model_id=model.model_id,
                    name=model.name,
                    model_type=model.model_type,
                    version=model.version,
                    created_at=model.created_at.isoformat(),
                    inference_count=model.inference_count,
                    avg_latency_ms=round(model.avg_latency_ms, 2),
                )
                for model in models
            ]
        finally:
            db.close()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")


@router.delete("/delete/{model_id}")
async def delete_model(model_id: str):
    """Delete a deployed model"""
    try:
        db = SessionLocal()
        try:
            db_model = db.query(ModelMetadata).filter(
                ModelMetadata.model_id == model_id
            ).first()
            
            if not db_model:
                raise HTTPException(status_code=404, detail="Model not found")
            
            # Remove from memory cache if loaded
            if model_id in loaded_models:
                del loaded_models[model_id]
            
            # Delete file
            file_path = Path(db_model.file_path)
            if file_path.exists():
                file_path.unlink()
            
            # Delete from database
            model_name = db_model.name
            db.delete(db_model)
            db.commit()
            
            return {
                "message": "Model deleted successfully",
                "model_id": model_id,
                "name": model_name,
            }
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete model: {str(e)}")


@router.post("/ab-test")
async def ab_test_models(request: ModelABTestRequest):
    """A/B test two models and compare performance"""
    try:
        results = {
            "model_a": {"model_id": request.model_a_id},
            "model_b": {"model_id": request.model_b_id},
            "comparison": {},
        }
        
        # Run inference on model A
        try:
            start_a = time.time()
            result_a = await run_inference(ModelInferenceRequest(
                model_id=request.model_a_id,
                input_data=request.input_data
            ))
            results["model_a"]["prediction"] = result_a.prediction
            results["model_a"]["latency_ms"] = result_a.latency_ms
        except Exception as e:
            results["model_a"]["error"] = str(e)
        
        # Run inference on model B
        try:
            start_b = time.time()
            result_b = await run_inference(ModelInferenceRequest(
                model_id=request.model_b_id,
                input_data=request.input_data
            ))
            results["model_b"]["prediction"] = result_b.prediction
            results["model_b"]["latency_ms"] = result_b.latency_ms
        except Exception as e:
            results["model_b"]["error"] = str(e)
        
        # Compare metrics
        if "latency" in request.metrics:
            if "latency_ms" in results["model_a"] and "latency_ms" in results["model_b"]:
                if results["model_a"]["latency_ms"] < results["model_b"]["latency_ms"]:
                    results["comparison"]["faster"] = "model_a"
                    results["comparison"]["latency_diff_ms"] = (
                        results["model_b"]["latency_ms"] - results["model_a"]["latency_ms"]
                    )
                else:
                    results["comparison"]["faster"] = "model_b"
                    results["comparison"]["latency_diff_ms"] = (
                        results["model_a"]["latency_ms"] - results["model_b"]["latency_ms"]
                    )
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"A/B test failed: {str(e)}")


@router.get("/metrics/{model_id}")
async def get_model_metrics(model_id: str):
    """Get performance metrics for a model"""
    try:
        db = SessionLocal()
        try:
            db_model = db.query(ModelMetadata).filter(
                ModelMetadata.model_id == model_id
            ).first()
            
            if not db_model:
                raise HTTPException(status_code=404, detail="Model not found")
            
            return {
                "model_id": model_id,
                "name": db_model.name,
                "model_type": db_model.model_type,
                "version": db_model.version,
                "inference_count": db_model.inference_count,
                "avg_latency_ms": round(db_model.avg_latency_ms, 2),
                "created_at": db_model.created_at.isoformat(),
                "updated_at": db_model.updated_at.isoformat(),
                "use_gpu": db_model.use_gpu == "true",
            }
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")


@router.get("/types")
async def list_model_types():
    """List all supported model types"""
    return {
        "model_types": SUPPORTED_MODEL_TYPES,
        "total": len(SUPPORTED_MODEL_TYPES),
    }

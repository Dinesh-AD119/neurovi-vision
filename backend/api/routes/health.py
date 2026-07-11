from fastapi import APIRouter
from backend.core.model_loader import ModelLoader
from backend.config import MODEL_NAME

router = APIRouter()

@router.get("/health")
def get_health():
    model_loaded = ModelLoader.model is not None
    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "model_name": MODEL_NAME if model_loaded else None
    }

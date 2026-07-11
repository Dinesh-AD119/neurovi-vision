import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.core.model_loader import ModelLoader
from backend.config import FRONTEND_ORIGIN
from backend.api.routes import health, predict, gradcam, metrics, records, misclassifications

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load Model once on startup
    try:
        ModelLoader.load()
    except Exception as e:
        print(f"CRITICAL: Failed to load model during startup lifespan: {e}")
        # We let the startup continue but health checks will reflect failure
    yield
    # Cleanup if needed
    print("Shutting down Brain Tumor MRI Classifier Backend...")

app = FastAPI(
    title="Brain Tumor MRI Classifier API",
    description="Backend API serving predictions and Grad-CAM for fine-tuned ResNet50 model.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configurations
origins = [
    FRONTEND_ORIGIN,
    "http://localhost:5173",  # fallback local dev port
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router, prefix="/api", tags=["System"])
app.include_router(predict.router, prefix="/api", tags=["Inference"])
app.include_router(gradcam.router, prefix="/api", tags=["Inference"])
app.include_router(metrics.router, prefix="/api", tags=["Analytics"])
app.include_router(records.router, prefix="/api", tags=["Records"])
app.include_router(misclassifications.router, prefix="/api", tags=["Analytics"])

# Global exception handlers for standard formats
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full exception for server diagnostic purposes
    import traceback
    traceback.print_exc()
    
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred."
            }
        }
    )

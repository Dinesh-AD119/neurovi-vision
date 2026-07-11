import json
import os
from fastapi import APIRouter, Query, HTTPException, status
from backend.config import METRICS_FILE

router = APIRouter()

def _load_metrics() -> dict:
    if not os.path.exists(METRICS_FILE):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Metrics file not initialized."
        )
    with open(METRICS_FILE, "r") as f:
        return json.load(f)

@router.get("/model/metrics")
def get_metrics():
    metrics = _load_metrics()
    return {
        "official": {
            "accuracy": metrics["official"]["accuracy"],
            "evaluated_images": metrics["official"]["evaluated_images"],
            "classification_report": metrics["official"]["classification_report"]
        },
        "external": {
            "accuracy": metrics["external"]["accuracy"],
            "evaluated_images": metrics["external"]["evaluated_images"],
            "classification_report": metrics["external"]["classification_report"]
        }
    }

@router.get("/model/confusion-matrix")
def get_confusion_matrix(dataset: str = Query("official", pattern="^(official|external)$")):
    metrics = _load_metrics()
    return {
        "dataset": dataset,
        "confusion_matrix": metrics[dataset]["confusion_matrix"]
    }

@router.get("/model/classification-report")
def get_classification_report(dataset: str = Query("official", pattern="^(official|external)$")):
    metrics = _load_metrics()
    return {
        "dataset": dataset,
        "classification_report": metrics[dataset]["classification_report"]
    }

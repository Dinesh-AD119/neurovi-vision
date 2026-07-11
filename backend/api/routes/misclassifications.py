import json
import os
from fastapi import APIRouter, Query, HTTPException, status
from backend.config import MISCLASSIFICATIONS_FILE
from backend.core.preprocessing import preprocess_image
from backend.core.gradcam import generate_gradcam
from backend.core.exceptions import InvalidImageException

router = APIRouter()

def _load_misclassifications() -> list:
    if not os.path.exists(MISCLASSIFICATIONS_FILE):
        return []
    with open(MISCLASSIFICATIONS_FILE, "r") as f:
        return json.load(f)

@router.get("/misclassifications")
def get_misclassifications():
    return _load_misclassifications()

@router.post("/misclassifications/gradcam")
def get_misclassification_gradcam(
    relative_path: str = Query(...),
    target_class: str = Query(None)
):
    # Resolve the absolute paths to prevent arbitrary file read
    base_dataset_dir = os.path.abspath("dataset")
    cleaned_rel_path = relative_path
    if cleaned_rel_path.startswith("dataset/"):
        cleaned_rel_path = cleaned_rel_path[len("dataset/"):]
    elif cleaned_rel_path.startswith("dataset\\"):
        cleaned_rel_path = cleaned_rel_path[len("dataset\\"):]
        
    absolute_img_path = os.path.abspath(os.path.join(base_dataset_dir, cleaned_rel_path))
    
    # Verify the file remains inside the dataset directory
    if not absolute_img_path.startswith(base_dataset_dir) or ".." in relative_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image path: Access denied."
        )
        
    if not os.path.exists(absolute_img_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Misclassification image file not found."
        )
        
    # Load image and generate Grad-CAM
    try:
        from PIL import Image
        import numpy as np
        img = Image.open(absolute_img_path).convert("RGB").resize((224, 224), Image.Resampling.BILINEAR)
        image_array = np.array(img).astype(np.float32)
        
        cam_result = generate_gradcam(image_array, target_class)
        return {
            "file": os.path.basename(absolute_img_path),
            "heatmap": cam_result["heatmap"],
            "overlay": cam_result["overlay"],
            "target_class": cam_result["target_class"],
            "layer_name": cam_result["layer_name"]
        }
    except Exception as e:
        raise InvalidImageException(f"Failed to compute Grad-CAM for misclassified file: {e}")

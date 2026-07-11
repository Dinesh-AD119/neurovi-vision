import base64
import io
import numpy as np
from PIL import Image
from fastapi import APIRouter, Query
from backend.services.record_service import RecordService
from backend.core.gradcam import generate_gradcam
from backend.core.exceptions import AnalysisNotFoundException, InvalidImageException

router = APIRouter()

@router.post("/gradcam/{analysis_id}")
def post_gradcam(analysis_id: str, target_class: str = Query(None)):
    # Retrieve record
    record = RecordService.get_record(analysis_id)
    if not record:
        raise AnalysisNotFoundException()
        
    # Decode base64 image
    img_b64 = record["image_data_b64"]
    try:
        if "," in img_b64:
            img_b64 = img_b64.split(",")[1]
        img_bytes = base64.b64decode(img_b64)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        image_array = np.array(img).astype(np.float32)
    except Exception as e:
        raise InvalidImageException(f"Failed to decode stored image for Grad-CAM: {e}")
        
    # Generate Grad-CAM
    cam_result = generate_gradcam(image_array, target_class)
    
    return {
        "analysis_id": analysis_id,
        "heatmap": cam_result["heatmap"],
        "overlay": cam_result["overlay"],
        "target_class": cam_result["target_class"],
        "layer_name": cam_result["layer_name"]
    }

import base64
from fastapi import APIRouter, UploadFile, File
from datetime import datetime
from backend.core.preprocessing import validate_image_file, preprocess_image
from backend.core.inference import run_inference
from backend.services.record_service import RecordService
from backend.schemas.prediction import PredictionResponse, ModelInfo
from backend.config import MODEL_NAME

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict_mri(file: UploadFile = File(...)):
    # Validate extension and presence of file
    validate_image_file(file.filename, file.size)
    
    # Read bytes
    image_bytes = await file.read()
    
    # Validate decoding and size limits using bytes
    validate_image_file(file.filename, file.size, image_bytes)
        
    # Preprocess image
    image_array = preprocess_image(image_bytes)
    
    # Run inference
    inference_result = run_inference(image_array)
    
    # Convert preprocessed image to base64 for records persistence (jpeg format)
    # This allows retrieving it for Grad-CAM without having to read original uploads again.
    import io
    from PIL import Image
    pil_img = Image.fromarray(image_array.astype("uint8"))
    buffered = io.BytesIO()
    pil_img.save(buffered, format="JPEG")
    image_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    image_data_b64 = f"data:image/jpeg;base64,{image_b64}"
    
    # Save analysis record
    record = RecordService.create_record(
        filename=file.filename,
        prediction_result=inference_result,
        image_data_b64=image_data_b64
    )
    
    # Return response
    return PredictionResponse(
        analysis_id=record["analysis_id"],
        predicted_class=record["predicted_class"],
        display_name=record["display_name"],
        confidence=record["confidence"],
        confidence_level=record["confidence_level"],
        uncertainty_warning=record["uncertainty_warning"],
        prediction_margin=record["prediction_margin"],
        top_2=record["top_2"],
        probabilities=record["probabilities"],
        model=ModelInfo(
            name=MODEL_NAME,
            architecture="ResNet50",
            input_size=[224, 224, 3],
            preprocessing="resnet50.preprocess_input"
        ),
        timestamp=record["timestamp"]
    )

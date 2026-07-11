from pydantic import BaseModel
from typing import List, Dict, Any

class RecordItem(BaseModel):
    analysis_id: str
    original_filename: str
    predicted_class: str
    display_name: str
    confidence: float
    confidence_level: str
    uncertainty_warning: bool
    prediction_margin: float
    timestamp: str

class RecordDetailResponse(BaseModel):
    analysis_id: str
    original_filename: str
    predicted_class: str
    display_name: str
    confidence: float
    confidence_level: str
    uncertainty_warning: bool
    prediction_margin: float
    top_2: List[Dict[str, Any]]
    probabilities: List[Dict[str, Any]]
    timestamp: str
    image_data_b64: str

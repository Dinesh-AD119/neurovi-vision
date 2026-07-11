from pydantic import BaseModel
from typing import List, Optional

class ProbabilityItem(BaseModel):
    class_name: str
    display_name: str
    probability: float

class ModelInfo(BaseModel):
    name: str
    architecture: str
    input_size: List[int]
    preprocessing: str

class PredictionResponse(BaseModel):
    analysis_id: str
    predicted_class: str
    display_name: str
    confidence: float
    confidence_level: str
    uncertainty_warning: bool
    prediction_margin: float
    top_2: List[ProbabilityItem]
    probabilities: List[ProbabilityItem]
    model: ModelInfo
    timestamp: str

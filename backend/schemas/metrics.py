from pydantic import BaseModel
from typing import List, Dict

class ClassMetric(BaseModel):
    precision: float
    recall: float
    f1_score: float  # Or f1-score mapped via field alias
    support: int

class DatasetStats(BaseModel):
    accuracy: float
    evaluated_images: int
    confusion_matrix: List[List[int]]
    classification_report: Dict[str, Dict[str, float]]

class MetricsResponse(BaseModel):
    official: DatasetStats
    external: DatasetStats

import json
import os
import uuid
from datetime import datetime, timezone
from backend.config import RECORDS_FILE

class RecordService:
    @classmethod
    def _load_all(cls) -> list:
        if not os.path.exists(RECORDS_FILE):
            return []
        try:
            with open(RECORDS_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return []

    @classmethod
    def _save_all(cls, records: list):
        try:
            with open(RECORDS_FILE, "w") as f:
                json.dump(records, f, indent=2)
        except Exception as e:
            print(f"Error saving records: {e}")

    @classmethod
    def create_record(cls, filename: str, prediction_result: dict, image_data_b64: str) -> dict:
        records = cls._load_all()
        
        analysis_id = str(uuid.uuid4())
        record = {
            "analysis_id": analysis_id,
            "original_filename": filename,
            "predicted_class": prediction_result["predicted_class"],
            "display_name": prediction_result["display_name"],
            "confidence": prediction_result["confidence"],
            "confidence_level": prediction_result["confidence_level"],
            "uncertainty_warning": prediction_result["uncertainty_warning"],
            "prediction_margin": prediction_result["prediction_margin"],
            "top_2": prediction_result["top_2"],
            "probabilities": prediction_result["probabilities"],
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "image_data_b64": image_data_b64  # Storing preprocessed image for Grad-CAM retrieval
        }
        
        records.insert(0, record)
        cls._save_all(records)
        return record

    @classmethod
    def get_all_records(cls) -> list:
        records = cls._load_all()
        # Return records without the heavy image data to keep list query light
        light_records = []
        for r in records:
            r_copy = r.copy()
            r_copy.pop("image_data_b64", None)
            light_records.append(r_copy)
        return light_records

    @classmethod
    def get_record(cls, analysis_id: str) -> dict:
        records = cls._load_all()
        for r in records:
            if r["analysis_id"] == analysis_id:
                return r
        return None

    @classmethod
    def delete_record(cls, analysis_id: str) -> bool:
        records = cls._load_all()
        initial_len = len(records)
        records = [r for r in records if r["analysis_id"] != analysis_id]
        cls._save_all(records)
        return len(records) < initial_len

    @classmethod
    def clear_all(cls):
        cls._save_all([])

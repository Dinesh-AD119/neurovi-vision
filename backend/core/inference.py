import numpy as np
import tensorflow as tf
from backend.core.model_loader import ModelLoader
from backend.core.exceptions import InferenceFailedException

CLASSES = [
    {"class_name": "glioma", "display_name": "Glioma"},
    {"class_name": "meningioma", "display_name": "Meningioma"},
    {"class_name": "notumor", "display_name": "No Tumor"},
    {"class_name": "pituitary", "display_name": "Pituitary"}
]

def run_inference(image_array: np.ndarray):
    try:
        model = ModelLoader.get_model()
        
        # Add batch dimension
        x = np.expand_dims(image_array, axis=0)
        
        # Run prediction
        predictions = model.predict(x, verbose=0)
        probs = predictions[0].tolist()
        
        # Predicted index and confidence
        predicted_idx = int(np.argmax(probs))
        predicted_class_info = CLASSES[predicted_idx]
        confidence = float(probs[predicted_idx] * 100)
        
        # Formulate probabilities list
        probabilities_list = []
        for i, p in enumerate(probs):
            probabilities_list.append({
                "class_name": CLASSES[i]["class_name"],
                "display_name": CLASSES[i]["display_name"],
                "probability": round(float(p * 100), 2)
            })
            
        # Top-2 calculation
        sorted_probs = sorted(
            probabilities_list,
            key=lambda item: item["probability"],
            reverse=True
        )
        top_2 = sorted_probs[:2]
        
        # Prediction Margin (difference in probability scale, 0-1)
        top_1_val = top_2[0]["probability"] / 100.0
        top_2_val = top_2[1]["probability"] / 100.0 if len(top_2) > 1 else 0.0
        prediction_margin = float((top_1_val - top_2_val) * 100)
        
        # Confidence Category
        if confidence >= 95.0:
            confidence_level = "VERY HIGH"
        elif confidence >= 85.0:
            confidence_level = "HIGH"
        elif confidence >= 70.0:
            confidence_level = "MODERATE"
        else:
            confidence_level = "LOW"
            
        # Uncertainty warning: True if confidence < 70% OR margin < 15%
        uncertainty_warning = bool(confidence < 70.0 or prediction_margin < 15.0)
        
        return {
            "predicted_class": predicted_class_info["class_name"],
            "display_name": predicted_class_info["display_name"],
            "confidence": round(confidence, 2),
            "confidence_level": confidence_level,
            "uncertainty_warning": uncertainty_warning,
            "prediction_margin": round(prediction_margin, 2),
            "top_2": top_2,
            "probabilities": probabilities_list
        }
    except Exception as e:
        raise InferenceFailedException(f"Error during inference: {str(e)}")

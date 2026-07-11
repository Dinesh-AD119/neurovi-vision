import os
import json
import numpy as np
import tensorflow as tf
from PIL import Image
from backend.core.model_loader import ModelLoader
from backend.core.inference import run_inference
from backend.config import MISCLASSIFICATIONS_FILE

# Initialize model loader
ModelLoader.load()

dataset_path = "dataset/Testing"
class_names = ["glioma", "meningioma", "notumor", "pituitary"]
display_names = {
    "glioma": "Glioma",
    "meningioma": "Meningioma",
    "notumor": "No Tumor",
    "pituitary": "Pituitary"
}

misclassified_cases = []

print("Scanning testing dataset for misclassifications...")
for actual_class in class_names:
    folder = os.path.join(dataset_path, actual_class)
    if not os.path.exists(folder):
        print(f"Directory not found: {folder}")
        continue
        
    for img_name in os.listdir(folder):
        img_path = os.path.join(folder, img_name)
        if not img_path.lower().endswith(('.png', '.jpg', '.jpeg')):
            continue
            
        try:
            # Load and preprocess image (raw RGB 0-255, Bilinear resize)
            img = Image.open(img_path).convert("RGB").resize((224, 224), Image.Resampling.BILINEAR)
            img_array = np.array(img).astype(np.float32)
            
            # Run inference
            res = run_inference(img_array)
            
            # If wrong prediction, record it
            if res["predicted_class"] != actual_class:
                misclassified_cases.append({
                    "file": img_name,
                    "relative_path": img_path.replace("\\", "/"),
                    "actual": display_names[actual_class],
                    "predicted": res["display_name"],
                    "conf": round(res["confidence"] / 100.0, 4),
                    "confidence_level": res["confidence_level"],
                    "prediction_margin": res["prediction_margin"],
                    "top_2": res["top_2"],
                    "probabilities": res["probabilities"]
                })
        except Exception as e:
            print(f"Error processing {img_name}: {e}")

# Save to file
os.makedirs(os.path.dirname(MISCLASSIFICATIONS_FILE), exist_ok=True)
with open(MISCLASSIFICATIONS_FILE, "w") as f:
    json.dump(misclassified_cases, f, indent=2)

print(f"Generation completed! Found {len(misclassified_cases)} misclassified cases.")
print(f"Saved to {MISCLASSIFICATIONS_FILE}")

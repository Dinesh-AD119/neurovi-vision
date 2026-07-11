import base64
import io
import numpy as np
import tensorflow as tf
from PIL import Image
from tensorflow.keras.applications.resnet50 import preprocess_input
from backend.core.model_loader import ModelLoader
from backend.core.exceptions import GradCamFailedException
from backend.config import GRADCAM_LAYER_NAME

def apply_custom_colormap(heatmap: np.ndarray) -> np.ndarray:
    # Interpolates between transparent/dark -> deep rose -> crimson -> burnt amber -> warm yellow-white
    # No blue tones.
    h, w = heatmap.shape
    colored = np.zeros((h, w, 3), dtype=np.uint8)
    
    for y in range(h):
        for x in range(w):
            v = heatmap[y, x]
            if v < 0.3:
                # (0, 0, 0) to (150, 0, 50) [Deep Rose]
                t = v / 0.3
                colored[y, x] = [int(150 * t), 0, int(50 * t)]
            elif v < 0.6:
                # (150, 0, 50) to (220, 20, 60) [Crimson]
                t = (v - 0.3) / 0.3
                colored[y, x] = [int(150 + 70 * t), int(20 * t), int(50 + 10 * t)]
            elif v < 0.85:
                # (220, 20, 60) to (238, 140, 20) [Burnt Amber]
                t = (v - 0.6) / 0.25
                colored[y, x] = [int(220 + 18 * t), int(20 + 120 * t), int(60 - 40 * t)]
            else:
                # (238, 140, 20) to (255, 235, 150) [Warm Gold/White]
                t = (v - 0.85) / 0.15
                colored[y, x] = [int(238 + 17 * t), int(140 + 95 * t), int(20 + 130 * t)]
    return colored

def generate_gradcam(image_array: np.ndarray, target_class_name: str = None) -> dict:
    try:
        grad_model = ModelLoader.get_grad_model()
        
        # We need preprocessed BGR input for the nested resnet50 model
        img_preprocessed = preprocess_input(image_array.copy())
        img_tensor = np.expand_dims(img_preprocessed, axis=0)
        
        # Class index mappings
        class_mappings = ["glioma", "meningioma", "notumor", "pituitary"]
        
        # Execute tape
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_tensor)
            
            # Identify target class index
            if target_class_name and target_class_name.lower() in class_mappings:
                target_idx = class_mappings.index(target_class_name.lower())
            else:
                target_idx = int(np.argmax(predictions[0]))
                
            loss = predictions[:, target_idx]
            
        # Gradients
        grads = tape.gradient(loss, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        
        # Weight the conv outputs
        conv_outputs_val = conv_outputs[0].numpy()
        pooled_grads_val = pooled_grads.numpy()
        
        heatmap = np.dot(conv_outputs_val, pooled_grads_val)
        
        # ReLU and normalize
        heatmap = np.maximum(heatmap, 0)
        max_val = np.max(heatmap)
        if max_val == 0:
            max_val = 1e-10
        heatmap /= max_val
        
        # Convert heatmap to PIL Image, resize to 224x224
        heatmap_img = Image.fromarray((heatmap * 255).astype(np.uint8)).resize((224, 224), Image.Resampling.BILINEAR)
        heatmap_norm = np.array(heatmap_img).astype(np.float32) / 255.0
        
        # Generate custom colored heatmap
        colored_heatmap = apply_custom_colormap(heatmap_norm)
        
        # Create overlay: Original image + Colored heatmap
        original_pil = Image.fromarray(image_array.astype(np.uint8))
        heatmap_pil = Image.fromarray(colored_heatmap)
        
        # Overlay using simple blend (alpha=0.6 for heatmap)
        overlay_pil = Image.blend(original_pil, heatmap_pil, alpha=0.6)
        
        # Save images to base64 strings
        def to_base64(pil_img: Image.Image) -> str:
            buffered = io.BytesIO()
            pil_img.save(buffered, format="JPEG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            return f"data:image/jpeg;base64,{img_str}"
            
        return {
            "heatmap": to_base64(heatmap_pil),
            "overlay": to_base64(overlay_pil),
            "target_class": class_mappings[target_idx],
            "layer_name": GRADCAM_LAYER_NAME
        }
    except Exception as e:
        raise GradCamFailedException(f"Failed to generate Grad-CAM: {str(e)}")

import io
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient
from backend.main import app
from backend.core.model_loader import ModelLoader

client = TestClient(app)

def test_prediction_endpoint():
    # Make sure model is loaded
    ModelLoader.load()
    
    # Create a small dummy grayscale PIL image representing a scan
    img = Image.new("RGB", (224, 224), color=(50, 50, 50))
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    img_bytes = buffered.getvalue()
    
    # Send request
    response = client.post(
        "/api/predict",
        files={"file": ("test_mri.jpg", img_bytes, "image/jpeg")}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verification
    assert "analysis_id" in data
    assert "predicted_class" in data
    assert "display_name" in data
    assert "confidence" in data
    assert "confidence_level" in data
    assert "prediction_margin" in data
    assert "top_2" in data
    assert len(data["top_2"]) == 2
    assert "probabilities" in data
    assert len(data["probabilities"]) == 4
    
    # Verify probabilities values
    probs = [p["probability"] for p in data["probabilities"]]
    for p in probs:
        assert p >= 0.0
        assert p <= 100.0
    assert abs(sum(probs) - 100.0) < 1e-1  # Approx 100%
    
    # Verify top predicted class match
    max_idx = int(np.argmax(probs))
    expected_class = data["probabilities"][max_idx]["class_name"]
    assert data["predicted_class"] == expected_class
    assert abs(data["confidence"] - probs[max_idx]) < 1e-3
    
    # Test Grad-CAM on the returned analysis_id
    analysis_id = data["analysis_id"]
    cam_response = client.post(f"/api/gradcam/{analysis_id}")
    assert cam_response.status_code == 200
    cam_data = cam_response.json()
    assert "heatmap" in cam_data
    assert "overlay" in cam_data
    assert cam_data["heatmap"].startswith("data:image/jpeg;base64,")
    assert cam_data["overlay"].startswith("data:image/jpeg;base64,")
    assert cam_data["layer_name"] == "conv5_block3_out"

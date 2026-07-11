from fastapi.testclient import TestClient
from backend.main import app
from backend.core.model_loader import ModelLoader

client = TestClient(app)

def test_health():
    # Make sure model is loaded (mock/real doesn't matter, lifespan loads it)
    ModelLoader.load()
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert data["model_name"] == "07_resnet50_phase2_final.keras"

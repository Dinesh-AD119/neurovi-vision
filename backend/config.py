import os

# Project root path resolution
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Model Configuration
MODEL_PATH = os.path.join(BASE_DIR, "models", "final", "07_resnet50_phase2_final.keras")
MODEL_NAME = os.path.basename(MODEL_PATH)

# Persistence Directories
DATA_DIR = os.path.join(BASE_DIR, "backend", "data")
RECORDS_FILE = os.path.join(DATA_DIR, "records.json")
METRICS_FILE = os.path.join(DATA_DIR, "metrics.json")
MISCLASSIFICATIONS_FILE = os.path.join(DATA_DIR, "misclassifications.json")

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)

# CORS configuration
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

# Grad-CAM target layer name inside nested ResNet50
GRADCAM_LAYER_NAME = "conv5_block3_out"

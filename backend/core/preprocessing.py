import io
import numpy as np
from PIL import Image
from backend.core.exceptions import InvalidImageException, UnsupportedFileTypeException, FileTooLargeException

def validate_image_file(filename: str, file_size: int = None, image_bytes: bytes = None):
    # Validate extension
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ["jpg", "jpeg", "png"]:
        raise UnsupportedFileTypeException(f"Unsupported file type '.{ext}'. Supported types are: .jpg, .jpeg, .png.")
        
    # Validate file size (max 15MB)
    if file_size is not None:
        if file_size == 0:
            raise InvalidImageException("Uploaded file is empty.")
        if file_size > 15 * 1024 * 1024:
            raise FileTooLargeException("Uploaded file size exceeds the 15MB limit.")
            
    # Validate decoding if bytes are provided
    if image_bytes is not None:
        try:
            img = Image.open(io.BytesIO(image_bytes))
            img.verify()
        except Exception as e:
            raise InvalidImageException(f"The uploaded file could not be decoded as an image. Details: {str(e)}")

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    try:
        # Load image safely
        img = Image.open(io.BytesIO(image_bytes))
        
        # Check corrupt image
        img.verify()
        
        # Re-open because verify() closes or invalidates the stream
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB
        img_rgb = img.convert("RGB")
        
        # Resize to 224x224
        # Note: We use Bilinear interpolation, which matches tf.keras.utils.image_dataset_from_directory default.
        img_resized = img_rgb.resize((224, 224), Image.Resampling.BILINEAR)
        
        # Convert to float32 NumPy array (values 0-255)
        img_array = np.array(img_resized).astype(np.float32)
        
        return img_array
    except Exception as e:
        raise InvalidImageException(f"The uploaded file could not be decoded as an image. Details: {str(e)}")

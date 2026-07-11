import numpy as np
import io
from PIL import Image
import pytest
from backend.core.preprocessing import preprocess_image, validate_image_file
from backend.core.exceptions import UnsupportedFileTypeException, InvalidImageException

def test_validate_image_file():
    # Valid files
    validate_image_file("mri.png", 100)
    validate_image_file("mri.jpg", 100)
    validate_image_file("mri.jpeg", 100)
    
    # Invalid extension
    with pytest.raises(UnsupportedFileTypeException):
        validate_image_file("mri.gif", 100)
        
    with pytest.raises(UnsupportedFileTypeException):
        validate_image_file("mri.pdf", 100)
        
    # Empty files
    with pytest.raises(InvalidImageException):
        validate_image_file("mri.png", 0)

def test_preprocess_image():
    # Create a small dummy grayscale PIL image
    img = Image.new("L", (100, 100), color=128)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_bytes = buffered.getvalue()
    
    # Process
    img_array = preprocess_image(img_bytes)
    
    # Assertions
    assert isinstance(img_array, np.ndarray)
    assert img_array.shape == (224, 224, 3)  # RGB conversion and resized to 224x224
    assert img_array.dtype == np.float32
    # Grayscale pixel 128 should stay approximately 128 across all channels
    assert np.allclose(img_array[0, 0], [128.0, 128.0, 128.0], atol=1.0)

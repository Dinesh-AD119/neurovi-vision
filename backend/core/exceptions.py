from fastapi import HTTPException, status

class BaseAPIException(HTTPException):
    code = "INTERNAL_SERVER_ERROR"
    message = "An unexpected error occurred."
    
    def __init__(self, message: str = None, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        if message:
            self.message = message
        super().__init__(
            status_code=status_code,
            detail={"error": {"code": self.code, "message": self.message}}
        )

class InvalidImageException(BaseAPIException):
    code = "INVALID_IMAGE"
    message = "The uploaded file could not be decoded as an image."
    def __init__(self, message: str = None):
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST)

class UnsupportedFileTypeException(BaseAPIException):
    code = "UNSUPPORTED_FILE_TYPE"
    message = "Supported file types are: .jpg, .jpeg, .png."
    def __init__(self, message: str = None):
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST)

class FileTooLargeException(BaseAPIException):
    code = "FILE_TOO_LARGE"
    message = "The uploaded file exceeds the maximum size limit."
    def __init__(self, message: str = None):
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST)

class ModelNotReadyException(BaseAPIException):
    code = "MODEL_NOT_READY"
    message = "The classification model is still loading or unavailable."
    def __init__(self, message: str = None):
        super().__init__(message, status_code=status.HTTP_503_SERVICE_UNAVAILABLE)

class InferenceFailedException(BaseAPIException):
    code = "INFERENCE_FAILED"
    message = "Failed to run classification inference on the image."
    def __init__(self, message: str = None):
        super().__init__(message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AnalysisNotFoundException(BaseAPIException):
    code = "ANALYSIS_NOT_FOUND"
    message = "The requested analysis record was not found."
    def __init__(self, message: str = None):
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND)

class GradCamFailedException(BaseAPIException):
    code = "GRADCAM_FAILED"
    message = "Grad-CAM visualization failed to generate."
    def __init__(self, message: str = None):
        super().__init__(message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

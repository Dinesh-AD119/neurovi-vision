import os
import tensorflow as tf
from backend.config import MODEL_PATH, GRADCAM_LAYER_NAME
from backend.core.exceptions import ModelNotReadyException

class ModelLoader:
    model = None
    grad_model = None
    resnet_model = None
    post_resnet_model = None

    @classmethod
    def load(cls):
        if cls.model is not None:
            return
        
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
            
        print(f"Loading Keras model from {MODEL_PATH}...")
        cls.model = tf.keras.models.load_model(MODEL_PATH)
        print("Model loaded successfully!")
        
        # Build Grad-CAM components
        try:
            cls.resnet_model = cls.model.get_layer("resnet50")
            last_conv_layer = cls.resnet_model.get_layer(GRADCAM_LAYER_NAME)
            
            # Post-resnet submodel builder
            resnet_output_tensor = tf.keras.Input(shape=(7, 7, 2048))
            x = cls.model.get_layer("global_average_pooling2d")(resnet_output_tensor)
            x = cls.model.get_layer("dense")(x)
            x = cls.model.get_layer("dropout")(x, training=False)
            predictions_tensor = cls.model.get_layer("dense_1")(x)
            cls.post_resnet_model = tf.keras.Model(inputs=resnet_output_tensor, outputs=predictions_tensor)
            
            # Grad-CAM model: inputs are resnet_model's input, outputs are conv layer output + final predictions
            cls.grad_model = tf.keras.Model(
                inputs=cls.resnet_model.inputs,
                outputs=[last_conv_layer.output, cls.post_resnet_model(cls.resnet_model.output)]
            )
            print("Grad-CAM sub-model constructed successfully.")
        except Exception as e:
            print(f"Warning: Failed to construct Grad-CAM submodel: {e}")

    @classmethod
    def get_model(cls):
        if cls.model is None:
            raise ModelNotReadyException()
        return cls.model

    @classmethod
    def get_grad_model(cls):
        if cls.grad_model is None:
            raise ModelNotReadyException("Grad-CAM capabilities are not initialized.")
        return cls.grad_model
        
    @classmethod
    def get_post_resnet_model(cls):
        if cls.post_resnet_model is None:
            raise ModelNotReadyException("Post-ResNet layer mapping is not initialized.")
        return cls.post_resnet_model

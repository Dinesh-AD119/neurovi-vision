import streamlit as st
import tensorflow as tf
import numpy as np
from PIL import Image
from tensorflow.keras.applications.resnet50 import preprocess_input

# ==========================================
# Page Settings
# ==========================================

st.set_page_config(
    page_title="Brain Tumor Classifier",
    page_icon="🧠",
    layout="centered"
)

st.title("🧠 Brain Tumor MRI Classification")
st.write("Upload an MRI image to predict the brain tumor type.")

# ==========================================
# Load Model
# ==========================================

@st.cache_resource
def load_model():
    return tf.keras.models.load_model("models/final/07_resnet50_phase2_final.keras")

model = load_model()

# ==========================================
# Classes
# ==========================================

class_names = [
    "Glioma",
    "Meningioma",
    "No Tumor",
    "Pituitary"
]

# ==========================================
# Upload Image
# ==========================================

uploaded_file = st.file_uploader(
    "Choose an MRI Image",
    type=["jpg", "jpeg", "png"]
)

if uploaded_file is not None:

    image = Image.open(uploaded_file).convert("RGB")

    st.image(
        image,
        caption="Uploaded MRI Image",
        use_container_width=True
    )

    img = image.resize((224,224))

    img = np.array(img)

    img = preprocess_input(img.astype(np.float32))

    img = np.expand_dims(img, axis=0)

    prediction = model.predict(img, verbose=0)

    st.write("Filename:", uploaded_file.name)
    st.write("Raw Prediction:", prediction)

    predicted_index = np.argmax(prediction)

    predicted_class = class_names[predicted_index]

    confidence = prediction[0][predicted_index] * 100

    st.success(f"Prediction : {predicted_class}")

    st.info(f"Confidence : {confidence:.2f}%")

    st.subheader("Probability for each class")

    for i, cls in enumerate(class_names):
        st.progress(float(prediction[0][i]))
        st.write(f"{cls} : {prediction[0][i]*100:.2f}%")
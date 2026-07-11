import tensorflow as tf
import os
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix

# ==========================================
# Load Best Fine-Tuned ResNet50 Model
# ==========================================
model = tf.keras.models.load_model("models/final/07_resnet50_phase2_final.keras")

# ==========================================
# Load Testing Dataset
# ==========================================
test_dataset = tf.keras.utils.image_dataset_from_directory(
    "dataset/Testing",
    image_size=(224, 224),
    batch_size=32,
    shuffle=False
)

class_names = test_dataset.class_names

print("\nClass Names:", class_names)

# ==========================================
# Get True Labels
# ==========================================
y_true = np.concatenate(
    [labels.numpy() for images, labels in test_dataset]
)

# ==========================================
# Predict
# ==========================================
predictions = model.predict(test_dataset, verbose=1)

y_pred = np.argmax(predictions, axis=1)

file_paths = test_dataset.file_paths

print("\nWrong Predictions:\n")

for i in range(len(file_paths)):
    if y_true[i] != y_pred[i]:
        print(os.path.basename(file_paths[i]))
        print("Actual   :", class_names[y_true[i]])
        print("Predicted:", class_names[y_pred[i]])
        print("-" * 40)

# ==========================================
# Overall Accuracy
# ==========================================
accuracy = np.mean(y_true == y_pred)

print("\n========================================")
print("      MODEL EVALUATION REPORT")
print("========================================")
print(f"Overall Accuracy : {accuracy*100:.2f}%")

# ==========================================
# Classification Report
# ==========================================
print("\nClassification Report\n")

print(
    classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        digits=4
    )
)

# ==========================================
# Confusion Matrix
# ==========================================
print("\nConfusion Matrix\n")

cm = confusion_matrix(y_true, y_pred)

print(cm)

print("\n========================================")
print("Evaluation Completed Successfully!")
print("========================================")
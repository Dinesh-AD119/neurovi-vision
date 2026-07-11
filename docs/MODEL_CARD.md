# Model Card: ResNet50 Brain Tumor MRI Classifier

## Model Details
- **Developed by:** College Project Team
- **Model Date:** July 2026
- **Model Type:** Deep Convolutional Neural Network (Transfer Learning & Fine-tuning)
- **Model Backbone:** ResNet50 (Fine-tuned last 50 layers)
- **Modality:** Brain Magnetic Resonance Imaging (MRI)
- **Format:** Keras (`.keras`)
- **Version:** Phase 2 Final (07)
- **Artifact Name:** `07_resnet50_phase2_final.keras`

## Intended Use
- **Primary Intended Use:** Educational and academic research prototype for automated classification of brain MRI scans. It acts as a decision-support prototype.
- **Out-of-scope Use:** Clinical diagnosis, medical advice, treatment planning, or direct use in healthcare patient pipelines. This model is **not clinically validated** and is **not a medical device**.

## Target Classes
1. `glioma` (Glioma tumor)
2. `meningioma` (Meningioma tumor)
3. `notumor` (Healthy / No Tumor)
4. `pituitary` (Pituitary tumor)

## Verified Evaluation Metrics
Evaluation conducted on the official test set:
- **Test Dataset Size:** 1,595 images
- **Overall Accuracy:** 94.80%

### Per-Class Metrics
| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| Glioma | 98.78% | 82.28% | 89.78% | 395 |
| Meningioma | 89.79% | 96.75% | 93.14% | 400 |
| No Tumor | 93.90% | 100.00% | 96.85% | 400 |
| Pituitary | 97.80% | 100.00% | 98.89% | 400 |

## Preprocessing Specification
- **Input Size:** `(224, 224, 3)`
- **Color Space:** RGB (reordered internally to BGR)
- **Pixel Range:** `[0, 255]` float32 (zero-centered internally by subtracting ImageNet means)
- **Resize Interpolation:** Bilinear
- **Note:** All normalization and BGR conversion is embedded directly inside the functional Keras model graph. The API expects raw RGB float32 `[0, 255]` values.

## Limitations & Warnings
- **Softmax Confidence:** Softmax scores represent model class selection confidence, not calibrated probabilities. A high score does not guarantee correctness.
- **Glioma Recall Weakness:** The model exhibits lower recall (82.28%) on Glioma cases, most frequently confusing Glioma with Meningioma and No Tumor.
- **Grad-CAM Visualizations:** Grad-CAM shows model attention and feature influence, not anatomical boundaries or physical tumor localization.
- **Generalization:** Performance is highly tied to the class balance and acquisition parameters of the training dataset.

## Medical Safety Statement
This application is an academic research prototype. It does not replace qualified medical professionals. Predictions should always be reviewed alongside professional radiological reports.

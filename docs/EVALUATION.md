# Evaluation Report: ResNet50 Classifier

This document details the evaluation results of the final model `07_resnet50_phase2_final.keras`.

## 1. Test Dataset Setup
- **Dataset location:** `dataset/Testing`
- **Total images evaluated:** 1,595
- **Distribution:**
  - Glioma: 395 images
  - Meningioma: 400 images
  - No Tumor: 400 images
  - Pituitary: 400 images

---

## 2. Overall Performance Metrics
- **Accuracy:** 94.80%
- **Evaluation Command:** `python full_evaluation.py`

### Confusion Matrix
```
Actual \\ Pred | Glioma | Meningioma | No Tumor | Pituitary
Glioma         |  325   |     44     |    25    |     1
Meningioma     |    4   |    387     |     1    |     8
No Tumor       |    0   |      0     |   400    |     0
Pituitary      |    0   |      0     |     0    |   400
```

---

## 3. Findings & Weakness Analysis
- **Glioma Sensitivity:** The model has a lower recall of **82.28%** for Glioma. It tends to misclassify Glioma as Meningioma (44 cases) and No Tumor (25 cases).
- **Specificity for Normal/Pituitary:** The model shows 100% recall for No Tumor and Pituitary classes.
- **Recommendations:** Users must exercise caution with Glioma predictions, as false negatives are the primary error mode.

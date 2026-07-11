\# Model Experiments



This directory represents the model development and experimentation history of the Brain Tumor MRI Classification project.



All models were evaluated on the same Testing dataset containing 1,595 MRI images across four classes:



\- Glioma

\- Meningioma

\- No Tumor

\- Pituitary



| ID | Model | Test Accuracy |

|---|---|---:|

| 01 | CNN Baseline | 85.71% |

| 02 | CNN V4 | 90.91% |

| 03 | CNN V5 | 81.63% |

| 04 | ResNet50 Phase 1 | 90.72% |

| 05 | ResNet50 V6 | 93.98% |

| 06 | Xception V7 | 88.59% |



The experiment artifacts are excluded from normal Git tracking because trained Keras model files are large.



The experiments demonstrate the progression from custom CNN architectures to transfer learning using ResNet50 and Xception.



The strongest experimental model was ResNet50 V6 with 93.98% test accuracy, which motivated further fine-tuning in ResNet50 Phase 2.


import tensorflow as tf
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

# ==========================================
# Load Dataset
# ==========================================
train_dataset = tf.keras.utils.image_dataset_from_directory(
    "dataset/Training",
    image_size=(224,224),
    batch_size=32,
    shuffle=True
)

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    "dataset/Testing",
    image_size=(224,224),
    batch_size=32,
    shuffle=False
)

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(AUTOTUNE)
validation_dataset = validation_dataset.prefetch(AUTOTUNE)

# ==========================================
# Load Best Phase-1 Model
# ==========================================
model = tf.keras.models.load_model("best_resnet50_model.keras")

# ==========================================
# Find ResNet50 Base Model
# ==========================================
base_model = None

for layer in model.layers:
    if "resnet50" in layer.name.lower():
        base_model = layer
        break

# ==========================================
# Unfreeze ResNet
# ==========================================
base_model.trainable = True

# Freeze first layers
for layer in base_model.layers[:-50]:
    layer.trainable = False

# Unfreeze last 50 layers
for layer in base_model.layers[-50:]:
    layer.trainable = True

# ==========================================
# Compile
# ==========================================
model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-5
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

# ==========================================
# Callbacks
# ==========================================
early_stop = EarlyStopping(
    monitor="val_accuracy",
    patience=5,
    restore_best_weights=True,
    mode="max",
    verbose=1
)

checkpoint = ModelCheckpoint(
    "best_resnet50_phase2.keras",
    monitor="val_accuracy",
    save_best_only=True,
    mode="max",
    verbose=1
)

# ==========================================
# Fine Tune
# ==========================================
history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=20,
    callbacks=[early_stop, checkpoint]
)

# ==========================================
# Save Model
# ==========================================
model.save("resnet50_phase2.keras")

print("\n====================================")
print("Phase 2 Fine-Tuning Completed!")
print("Best Model : best_resnet50_phase2.keras")
print("Final Model: resnet50_phase2.keras")
print("====================================")
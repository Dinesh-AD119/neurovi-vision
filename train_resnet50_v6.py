import tensorflow as tf
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau
)

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

# Stronger Augmentation
data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.15),
    tf.keras.layers.RandomZoom(0.15),
    tf.keras.layers.RandomContrast(0.10)
])

train_dataset = train_dataset.map(
    lambda x, y: (data_augmentation(x, training=True), y),
    num_parallel_calls=AUTOTUNE
)

train_dataset = train_dataset.prefetch(AUTOTUNE)
validation_dataset = validation_dataset.prefetch(AUTOTUNE)

# ==========================================
# Load Best Phase2 Model
# ==========================================

model = tf.keras.models.load_model(
    "best_resnet50_phase2.keras"
)

# ==========================================
# Find ResNet50
# ==========================================

base_model = None

for layer in model.layers:
    if "resnet" in layer.name.lower():
        base_model = layer
        break

if base_model is None:
    raise ValueError("ResNet50 layer not found!")

# ==========================================
# Fine Tune Last 80 Layers
# ==========================================

base_model.trainable = True

for layer in base_model.layers[:-80]:
    layer.trainable = False

for layer in base_model.layers[-80:]:
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
    verbose=1,
    mode="max"
)

checkpoint = ModelCheckpoint(
    "best_resnet50_v6.keras",
    monitor="val_accuracy",
    save_best_only=True,
    mode="max",
    verbose=1
)

reduce_lr = ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.2,
    patience=2,
    min_lr=1e-7,
    verbose=1
)

# ==========================================
# Train
# ==========================================

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=20,
    callbacks=[
        early_stop,
        checkpoint,
        reduce_lr
    ]
)

# ==========================================
# Save
# ==========================================

model.save("resnet50_v6.keras")

print("\n====================================")
print(" V6 Training Completed!")
print(" Best Model : best_resnet50_v6.keras")
print(" Final Model: resnet50_v6.keras")
print("====================================")
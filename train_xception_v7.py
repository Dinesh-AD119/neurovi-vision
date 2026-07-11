import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import Xception
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
    image_size=(299, 299),
    batch_size=32,
    shuffle=True
)

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    "dataset/Testing",
    image_size=(299, 299),
    batch_size=32,
    shuffle=False
)

AUTOTUNE = tf.data.AUTOTUNE

# ==========================================
# Data Augmentation
# ==========================================

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
])



train_dataset = train_dataset.prefetch(AUTOTUNE)
validation_dataset = validation_dataset.prefetch(AUTOTUNE)

# ==========================================
# Load Xception
# ==========================================

base_model = Xception(
    weights="imagenet",
    include_top=False,
    input_shape=(299, 299, 3)
)

base_model.trainable = False

# ==========================================
# Build Model
# ==========================================

inputs = tf.keras.Input(shape=(299, 299, 3))

x = data_augmentation(inputs)

x = tf.keras.applications.xception.preprocess_input(x)

x = base_model(x, training=False)

x = layers.GlobalAveragePooling2D()(x)

x = layers.BatchNormalization()(x)

x = layers.Dense(
    256,
    activation="relu"
)(x)

x = layers.Dropout(0.5)(x)

outputs = layers.Dense(
    4,
    activation="softmax"
)(x)

model = models.Model(
    inputs,
    outputs
)

# ==========================================
# Model Summary
# ==========================================

model.summary()

# ==========================================
# Compile
# ==========================================

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-4
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
    "best_xception_v7.keras",
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
# Train Model
# ==========================================

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=50,
    callbacks=[
        early_stop,
        checkpoint,
        reduce_lr
    ]
)

# ==========================================
# Save Final Model
# ==========================================

model.save("xception_v7.keras")

print("\n========================================")
print(" Xception V7 Training Completed!")
print(" Best Model : best_xception_v7.keras")
print(" Final Model: xception_v7.keras")
print("========================================")
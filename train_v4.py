import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Rescaling,
    Conv2D,
    BatchNormalization,
    MaxPooling2D,
    Flatten,
    Dense,
    Dropout
)
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

# ==========================================
# Load Training Dataset
# ==========================================
train_dataset = tf.keras.utils.image_dataset_from_directory(
    "dataset/Training",
    image_size=(224,224),
    batch_size=32,
    shuffle=True
)

# ==========================================
# Load Validation Dataset
# ==========================================
validation_dataset = tf.keras.utils.image_dataset_from_directory(
    "dataset/Testing",
    image_size=(224,224),
    batch_size=32,
    shuffle=False
)

# ==========================================
# Improve Performance
# ==========================================
AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(AUTOTUNE)
validation_dataset = validation_dataset.prefetch(AUTOTUNE)

# ==========================================
# Build CNN
# ==========================================
model = Sequential()

# Normalize Images
model.add(Rescaling(1./255, input_shape=(224,224,3)))

# -------------------------
# Block 1
# -------------------------
model.add(Conv2D(32,(3,3),padding="same",activation="relu"))
model.add(BatchNormalization())
model.add(MaxPooling2D((2,2)))

# -------------------------
# Block 2
# -------------------------
model.add(Conv2D(64,(3,3),padding="same",activation="relu"))
model.add(BatchNormalization())
model.add(MaxPooling2D((2,2)))

# -------------------------
# Block 3
# -------------------------
model.add(Conv2D(128,(3,3),padding="same",activation="relu"))
model.add(BatchNormalization())
model.add(MaxPooling2D((2,2)))

# -------------------------
# Block 4
# -------------------------
model.add(Conv2D(256,(3,3),padding="same",activation="relu"))
model.add(BatchNormalization())
model.add(MaxPooling2D((2,2)))

# -------------------------
# Classification
# -------------------------
model.add(Flatten())

model.add(Dense(256,activation="relu"))

model.add(Dropout(0.5))

model.add(Dense(4,activation="softmax"))

# ==========================================
# Model Summary
# ==========================================
model.summary()

# ==========================================
# Compile
# ==========================================
optimizer = tf.keras.optimizers.Adam(
    learning_rate=0.0001
)

model.compile(
    optimizer=optimizer,
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
    "best_brain_tumor_model_v4.keras",
    monitor="val_accuracy",
    save_best_only=True,
    mode="max",
    verbose=1
)

# ==========================================
# Train
# ==========================================
history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=50,
    callbacks=[early_stop,checkpoint]
)

# ==========================================
# Save
# ==========================================
model.save("brain_tumor_model_v4.keras")

print("\n====================================")
print("Training Completed Successfully!")
print("Best Model : best_brain_tumor_model_v4.keras")
print("Final Model: brain_tumor_model_v4.keras")
print("====================================")
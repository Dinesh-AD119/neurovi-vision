import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Conv2D,
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
    image_size=(224, 224),
    batch_size=32,
    shuffle=True
)

# ==========================================
# Load Validation Dataset
# ==========================================
validation_dataset = tf.keras.utils.image_dataset_from_directory(
    "dataset/Testing",
    image_size=(224, 224),
    batch_size=32,
    shuffle=False
)

# ==========================================
# Improve Dataset Performance
# ==========================================
AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(buffer_size=AUTOTUNE)
validation_dataset = validation_dataset.prefetch(buffer_size=AUTOTUNE)

# ==========================================
# Build CNN Model
# ==========================================
model = Sequential()

# First Convolution Block
model.add(
    Conv2D(
        filters=32,
        kernel_size=(3,3),
        activation="relu",
        padding="same",
        input_shape=(224,224,3)
    )
)
model.add(MaxPooling2D(pool_size=(2,2)))

# Second Convolution Block
model.add(
    Conv2D(
        filters=64,
        kernel_size=(3,3),
        activation="relu",
        padding="same"
    )
)
model.add(MaxPooling2D(pool_size=(2,2)))

# Third Convolution Block
model.add(
    Conv2D(
        filters=128,
        kernel_size=(3,3),
        activation="relu",
        padding="same"
    )
)
model.add(MaxPooling2D(pool_size=(2,2)))

# Classification
model.add(Flatten())
model.add(Dense(128, activation="relu"))
model.add(Dropout(0.5))
model.add(Dense(4, activation="softmax"))

# ==========================================
# Display Model Summary
# ==========================================
model.summary()

# ==========================================
# Compile Model
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
    "best_brain_tumor_model.keras",
    monitor="val_accuracy",
    save_best_only=True,
    mode="max",
    verbose=1
)

# ==========================================
# Train Model
# ==========================================
history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=50,
    callbacks=[early_stop, checkpoint]
)

# ==========================================
# Save Final Model
# ==========================================
model.save("brain_tumor_model.keras")

print("\n====================================")
print(" Training Completed Successfully!")
print(" Best Model Saved : best_brain_tumor_model.keras")
print(" Final Model Saved: brain_tumor_model.keras")
print("====================================")
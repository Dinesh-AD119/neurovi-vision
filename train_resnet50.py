import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import ResNet50
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
# Data Augmentation
# ==========================================
data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1)
])

# ==========================================
# Load ResNet50
# ==========================================
base_model = ResNet50(
    weights="imagenet",
    include_top=False,
    input_shape=(224,224,3)
)

# Freeze ResNet50
base_model.trainable = False

# ==========================================
# Build Model
# ==========================================
inputs = tf.keras.Input(shape=(224,224,3))

x = data_augmentation(inputs)

x = tf.keras.applications.resnet50.preprocess_input(x)

x = base_model(x, training=False)

x = layers.GlobalAveragePooling2D()(x)

x = layers.Dense(256, activation="relu")(x)

x = layers.Dropout(0.5)(x)

outputs = layers.Dense(4, activation="softmax")(x)

model = models.Model(inputs, outputs)

# ==========================================
# Summary
# ==========================================
model.summary()

# ==========================================
# Compile
# ==========================================
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
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
    "best_resnet50_model.keras",
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
    callbacks=[early_stop, checkpoint]
)

# ==========================================
# Save Model
# ==========================================
model.save("resnet50_model.keras")

print("\n====================================")
print("ResNet50 Training Completed!")
print("Best Model : best_resnet50_model.keras")
print("Final Model: resnet50_model.keras")
print("====================================")
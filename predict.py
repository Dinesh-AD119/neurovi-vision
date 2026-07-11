import os
import random
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image

# Load Model
model = tf.keras.models.load_model("brain_tumor_model.keras")

# Dataset Path
dataset_path = "dataset/Testing"

# Class Names
class_names = [
    "glioma",
    "meningioma",
    "notumor",
    "pituitary"
]

correct = 0
total = 0

print("=" * 70)
print("Testing Random Images")
print("=" * 70)

for actual_class in class_names:

    folder = os.path.join(dataset_path, actual_class)

    images = os.listdir(folder)

    random_images = random.sample(images, min(10, len(images)))

    for img_name in random_images:

        img_path = os.path.join(folder, img_name)

        img = image.load_img(img_path, target_size=(224,224))
        img_array = image.img_to_array(img)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array, verbose=0)

        predicted_index = np.argmax(prediction)

        predicted_class = class_names[predicted_index]

        confidence = prediction[0][predicted_index] * 100

        total += 1

        if predicted_class == actual_class:
            correct += 1
            result = "Correct"
        else:
            result = "Wrong"

        print(f"\nImage      : {img_name}")
        print(f"Actual     : {actual_class}")
        print(f"Predicted  : {predicted_class}")
        print(f"Confidence : {confidence:.2f}%")
        print(f"Result     : {result}")

print("\n" + "=" * 70)

accuracy = (correct / total) * 100

print(f"Total Tested : {total}")
print(f"Correct      : {correct}")
print(f"Wrong        : {total-correct}")
print(f"Accuracy     : {accuracy:.2f}%")

print("=" * 70)
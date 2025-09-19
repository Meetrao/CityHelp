import os
import numpy as np
from PIL import Image
import io, requests
import tensorflow as tf

MODEL_PATH = os.getenv("MODEL_PATH", "./ml/saved_model")
IMAGE_SIZE = int(os.getenv("IMAGE_SIZE", "224"))
CLASS_NAMES = os.getenv("CLASS_NAMES", "pothole,trash,graffiti,streetlight").split(",")
SEVERITY_LABELS = ["low","medium","high"]

_model = None

def load_model():
    global _model
    if _model is None:
        _model = tf.keras.models.load_model(MODEL_PATH)
    return _model

def preprocess_image(img: Image.Image):
    img = img.convert("RGB").resize((IMAGE_SIZE, IMAGE_SIZE))
    arr = np.array(img).astype("float32") / 255.0
    arr = np.expand_dims(arr, axis=0)
    return arr

def read_image_from_input(file_storage=None, image_url=None):
    if file_storage:
        img = Image.open(file_storage.stream)
        return img
    elif image_url:
        r = requests.get(image_url, timeout=10)
        r.raise_for_status()
        return Image.open(io.BytesIO(r.content))
    else:
        raise ValueError("No image provided")

def predict_category_and_severity(file_storage=None, image_url=None, description=""):
    model = load_model()
    img = read_image_from_input(file_storage, image_url)
    x = preprocess_image(img)
    preds = model.predict(x, verbose=0)[0]
    cat_idx = int(np.argmax(preds))
    category = CLASS_NAMES[cat_idx]
    confidence = float(preds[cat_idx])

    desc = (description or "").lower()
    sev_score = confidence
    if any(k in desc for k in ["urgent","danger","blocked","flood","fire"]):
        sev_score = min(1.0, sev_score + 0.3)
    severity = SEVERITY_LABELS[2] if sev_score > 0.75 else (SEVERITY_LABELS[1] if sev_score > 0.45 else SEVERITY_LABELS[0])

    return {"category": category, "confidence": confidence, "severity": severity}

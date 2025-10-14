#streamlit run app.py

import streamlit as st
import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import resnet18, ResNet18_Weights
from ultralytics import YOLO
from PIL import Image
import speech_recognition as sr
import tempfile
from deep_translator import GoogleTranslator  # ✅ stable translator
import requests   # ✅ Firebase backend ko hit karne ke liye

# =====================
# CONFIG
# =====================
FAKE_MODEL_PATH = "fake_detector_model.pth"   # upload in repo
CIVIC_MODEL_PATH = "best.pt"                  # upload in repo
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# =====================
# TRANSFORM (Fake Detector)
# =====================
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# =====================
# LOAD MODELS
# =====================
weights = ResNet18_Weights.DEFAULT
fake_model = resnet18(weights=weights)
fake_model.fc = nn.Linear(fake_model.fc.in_features, 2)
fake_model.load_state_dict(torch.load(FAKE_MODEL_PATH, map_location=DEVICE))
fake_model = fake_model.to(DEVICE)
fake_model.eval()

@st.cache_resource
def load_civic_model():
    return YOLO(CIVIC_MODEL_PATH)

civic_model = load_civic_model()

# =====================
# PREDICT FUNCTIONS
# =====================
def predict_fake_real(img):
    img = img.convert("RGB")
    img_t = transform(img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        outputs = fake_model(img_t)
        _, pred = torch.max(outputs, 1)
        return "Fake" if pred.item() == 0 else "Real"

def predict_civic_issue(img):
    results = civic_model(img)
    top_class = int(results[0].probs.top1)
    issue = results[0].names[top_class]
    department_map = {
        "garbage": "Ministry of Housing & Urban Affairs",
        "pothole": "Roads & Transport Department",
        "streetlight": "Electricity Department",
        "waterlogging": "Municipal Water Management",
        "flood": "Disaster Management Authority / Water Resources Dept",
        "signal broken": "Traffic Management Department"
    }
    assigned_department = department_map.get(issue.lower(), "General Civic Department")
    return issue, assigned_department

# =====================
# STREAMLIT UI STYLE
# =====================
st.set_page_config(page_title="AI Civic + Fake Detector", page_icon="🤖", layout="wide")

st.markdown("""
    <style>
    .stApp {
        background: linear-gradient(135deg, #f9fbfd, #e3f2fd);
        font-family: "Segoe UI", sans-serif;
    }
    h1 {
        font-size: 42px !important;
        font-weight: 900 !important;
        text-align: center;
        color: #0d47a1;
    }
    .section-card {
        background: #ffffff;
        padding: 30px;
        border-radius: 16px;
        box-shadow: 0px 6px 18px rgba(0,0,0,0.1);
        margin-top: 25px;
        border: 1px solid #e0e0e0;
    }
    .stButton>button {
        background: linear-gradient(90deg,#42a5f5,#26c6da);
        color: white !important;
        border-radius: 12px;
        padding: 16px 30px;
        font-size: 20px;
        font-weight: 700;
        border: none;
        transition: 0.3s;
    }
    .stButton>button:hover {
        background: linear-gradient(90deg,#1e88e5,#00acc1);
        transform: scale(1.05);
    }
    </style>
""", unsafe_allow_html=True)

# =====================
# TITLE
# =====================
st.title("🤖 AI-Powered Fake Image Detector + Civic Issue Classifier")

# =====================
# UPLOAD IMAGE
# =====================
st.markdown("<div class='section-card'>", unsafe_allow_html=True)
uploaded_file = st.file_uploader("📷 Upload an Image", type=["jpg", "jpeg", "png"])
st.markdown("</div>", unsafe_allow_html=True)

if uploaded_file:
    img = Image.open(uploaded_file).convert("RGB")
    st.image(img, caption="Uploaded Image", use_container_width=True)

    # Fake/Real Detection
    st.markdown("<div class='section-card'>", unsafe_allow_html=True)
    result = predict_fake_real(img)
    st.subheader("🖼️ Fake Image Detection Result")
    if result == "Real":
        st.success("✅ This image looks Real.")
    else:
        st.error("⚠️ This image looks AI-generated (Fake).")
    st.markdown("</div>", unsafe_allow_html=True)

    # Civic Issue Classification
    st.markdown("<div class='section-card'>", unsafe_allow_html=True)
    issue, dept = predict_civic_issue(img)
    st.subheader("🏙️ Civic Issue Classification Result")
    st.info(f"Issue: **{issue}**")
    st.warning(f"📌 Assigned Department: {dept}")
    st.markdown("</div>", unsafe_allow_html=True)

    # Description / Voice Input
    st.markdown("<div class='section-card'>", unsafe_allow_html=True)
    st.subheader("✍️ Add Description or Upload Voice")

    if "voice_text" not in st.session_state:
        st.session_state.voice_text = ""

    audio_file = st.file_uploader("🎙️ Upload an audio file (wav, flac, mp3)", type=["wav", "flac", "mp3"])
    if audio_file:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            tmp_file.write(audio_file.read())
            audio_path = tmp_file.name

        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)
            try:
                text = recognizer.recognize_google(audio_data, language="hi-IN")
                translated = GoogleTranslator(source="auto", target="en").translate(text)
                st.session_state.voice_text = translated
                st.success(f"🗣️ Transcribed & Translated: {translated}")
            except Exception as e:
                st.error(f"Speech Recognition Failed: {e}")

    description = st.text_area(
        "Describe the issue in your words",
        height=150,
        value=st.session_state.get("voice_text", "")
    )

    # ✅ SUBMIT BUTTON – Save to Firebase via Backend
    if st.button("✅ Submit"):
        payload = {
            "reportId": "R" + str(int(torch.randint(1000, 9999, (1,)).item())),
            "userId": "U123",
            "summary": description,
            "location": "Ranchi, Jharkhand",
            "status": "Pending",
            "issueType": issue,
            "department": dept,
            "imageUrl": uploaded_file.name,
            "fakeStatus": result
        }

        try:
            res = requests.post("http://localhost:5000/report", json=payload)
            if res.status_code == 200:
                st.success("🎉 Report submitted successfully and saved in Firebase!")
            else:
                st.error(f"Failed to save report: {res.text}")
        except Exception as e:
            st.error(f"Error connecting to backend: {e}")

    st.markdown("</div>", unsafe_allow_html=True)

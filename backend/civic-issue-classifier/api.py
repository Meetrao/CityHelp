from flask import Flask, request, jsonify
from PIL import Image
import torch
import io
from torchvision import transforms
from torchvision.models import resnet18, ResNet18_Weights
from ultralytics import YOLO
import torch.nn as nn

app = Flask(__name__)
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load fake detector
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])
weights = ResNet18_Weights.DEFAULT
fake_model = resnet18(weights=weights)
fake_model.fc = nn.Linear(fake_model.fc.in_features, 2)
fake_model.load_state_dict(torch.load("fake_detector_model.pth", map_location=DEVICE))
fake_model = fake_model.to(DEVICE)
fake_model.eval()

# Load civic issue classifier
civic_model = YOLO("best.pt")

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
    dept = department_map.get(issue.lower(), "General Civic Department")
    return issue, dept

@app.route('/classify', methods=['POST'])
def classify_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image_file = request.files['image']
    img = Image.open(image_file.stream).convert("RGB")

    fake_status = predict_fake_real(img)
    issue, dept = predict_civic_issue(img)

    return jsonify({
        'category': issue,
        'department': dept,
        'fakeStatus': fake_status
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)

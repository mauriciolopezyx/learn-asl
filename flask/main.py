from flask import Flask, render_template, request
from flask_cors import CORS

import string

# for serving the actual ASL model
import torch
import torch.nn as nn
from PIL import Image
import torchvision.transforms as transforms
import os

api = Flask(__name__)
CORS(api, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:8080", "http://localhost:5000"]}})

# ----------

class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, 3)
        self.pool1 = nn.MaxPool2d(2)
        self.dropout1 = nn.Dropout()
        self.conv2 = nn.Conv2d(32, 64, 3)
        self.pool2 = nn.MaxPool2d(2)
        self.dropout2 = nn.Dropout(0.36)
        self.flatten = nn.Flatten()
        self.fc1 = nn.Linear(64*5*5, 128)
        self.dropout3 = nn.Dropout(0.5)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(128, 24)

    def forward(self, x):
        x = self.relu(self.conv1(x))
        x = self.pool1(x)
        x = self.dropout1(x)
        x = self.relu(self.conv2(x))
        x = self.pool2(x)
        x = self.dropout2(x)
        x = self.flatten(x)
        x = self.fc1(x)
        x = self.dropout3(x)
        x = self.relu(x)
        x = self.fc2(x)
        return x

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
cnn_model = CNN().to(device)
cnn_model.load_state_dict(torch.load(os.path.join("models", "cnn_model.pth"), map_location=device))
cnn_model.eval()

# ----------

letters = [ch for ch in string.ascii_uppercase if ch not in ['J', 'Z']]
label_to_letter = {i: ch for i, ch in enumerate(letters)}

@api.route("/", methods=["GET"])
def default_page():
    return render_template("index.html")

@api.route("/", methods=["POST"])
def predict():
    image = request.files["imagefile"]
    image_path = os.path.join("images", image.filename)
    
    # preprocess image
    img = Image.open(image_path).convert("L")
    transform = transforms.Compose([
        transforms.Resize((28, 28)),
        transforms.ToTensor(),
    ])
    img_tensor = transform(img).unsqueeze(0).to(device)

    # Model inference
    with torch.no_grad():
        output = cnn_model(img_tensor)
        predicted_class = torch.argmax(output, dim=1).item()
        predicted_class = label_to_letter[predicted_class]

    return render_template("index.html", prediction=predicted_class)

if __name__ == "__main__":
    api.run(port=5000)
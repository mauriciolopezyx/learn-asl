from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

import string

# for serving the actual ASL model
import torch
import torch.nn as nn
from PIL import Image
import torchvision.transforms as transforms
import os

# for receiving and processing the video frame from Spring Boot
import cv2 as cv
import mediapipe as mp
import numpy as np
import base64

api = Flask(__name__)
CORS(api, resources={r"/api/*": {"origins": ["http://localhost:8080", "http://localhost:5000"]}})

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

# @api.route("/", methods=["GET"])
# def root():
#     return render_template("index.html")

# @api.route("/", methods=["POST"])
# def root_upload():
#     image = request.files["imagefile"]
#     image_path = os.path.join("images", image.filename)
    
#     # preprocess image
#     img = Image.open(image_path).convert("L")
#     transform = transforms.Compose([
#         transforms.Resize((28, 28)),
#         transforms.ToTensor(),
#     ])
#     img_tensor = transform(img).unsqueeze(0).to(device)

#     # Model inference
#     with torch.no_grad():
#         output = cnn_model(img_tensor)
#         predicted_class = torch.argmax(output, dim=1).item()
#         predicted_class = label_to_letter[predicted_class]

#     return render_template("index.html", prediction=predicted_class)

# @api.route("/predict", methods=["POST"])
# def predict():
#     try:
#         data = request.get_json()
#         base64_string = data["frameUrl"]

#         # converting base64 -> openCV image
#         image_data = base64.b64decode(base64_string)
#         nparr = np.frombuffer(image_data, np.uint8)
#         image = cv.imdecode(nparr, cv.IMREAD_COLOR)

#         # convert to RGB for MediaPipe
#         rgb_image = cv.cvtColor(image, cv.COLOR_BGR2RGB)
        
#         # process with MediaPipe
#         mp_hands = mp.solutions.hands
#         hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1)
#         results = hands.process(rgb_image)

#         if not results.multi_hand_landmarks:
#             return jsonify({"prediction": "ERROR", "confidence": 0})
        
#         # create black background (3 color channels), mimicking mnist dataset images
#         hand_image = np.zeros((*image.shape[:2], 3), dtype=np.uint8)
        
#         # draw white hand landmarks on black background
#         mp_drawing = mp.solutions.drawing_utils
#         for hand_landmarks in results.multi_hand_landmarks:
#             mp_drawing.draw_landmarks(
#                 hand_image, hand_landmarks, mp_hands.HAND_CONNECTIONS,
#                 landmark_drawing_spec=mp_drawing.DrawingSpec(color=(255,255,255), thickness=2),
#                 connection_drawing_spec=mp_drawing.DrawingSpec(color=(255,255,255), thickness=2)
#             )
        
#         # converting to grayscale
#         hand_gray = cv.cvtColor(hand_image, cv.COLOR_BGR2GRAY)
        
#         # convert to PIL and apply your same transforms
#         pil_image = Image.fromarray(hand_gray).convert("L")
        
#         transform = transforms.Compose([
#             transforms.Resize((28, 28)),
#             transforms.ToTensor(),
#         ])
#         img_tensor = transform(pil_image).unsqueeze(0).to(device)
        
#         with torch.no_grad():
#             output = cnn_model(img_tensor)
#             predicted_class = torch.argmax(output, dim=1).item()
#             predicted_class = label_to_letter[predicted_class]
#             confidence = torch.softmax(output, dim=1).max().item()
        
#         return jsonify({
#             "prediction": predicted_class,
#             "confidence": int(confidence * 100)
#         })
#     except Exception as e:
#         return jsonify({"prediction": "ERROR", "confidence": 0})

@api.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        base64_string = data['frameUrl']

        # Decode base64 to image
        image_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv.imdecode(nparr, cv.IMREAD_COLOR)  # Should already be 350x350

        # Convert to RGB for MediaPipe
        rgb_image = cv.cvtColor(image, cv.COLOR_BGR2RGB)

        # Run MediaPipe Hands
        mp_hands = mp.solutions.hands
        hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1)
        results = hands.process(rgb_image)
        hands.close()

        # Prepare a white background
        wireframe_image = np.full((350, 350, 3), 255, dtype=np.uint8)

        mp_drawing = mp.solutions.drawing_utils

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(
                    wireframe_image,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS,
                    landmark_drawing_spec=None, # need custom behavior to draw proper green circles
                    connection_drawing_spec=mp_drawing.DrawingSpec(
                        color=(0,0,255),  # Red lines
                        thickness=2
                    )
                )

                for lm in hand_landmarks.landmark:
                    x, y = int(lm.x * 350), int(lm.y * 350)  # scale normalized coords
                    cv.circle(wireframe_image, (x, y), radius=4, color=(0,255,0), thickness=-1)

            # Encode wireframe to base64
            success, buffer = cv.imencode('.jpg', wireframe_image)
            if not success:
                raise ValueError("Could not encode wireframe image")

            wireframe_base64 = base64.b64encode(buffer).decode('utf-8')

            return jsonify({
                "prediction": "HAND_DETECTED",
                "confidence": 100,
                "wireframe": wireframe_base64
            })

        else:
            return jsonify({
                "prediction": "NO_HAND",
                "confidence": 0,
                "wireframe": None
            })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            "prediction": "ERROR",
            "confidence": 0,
            "wireframe": None
        })

if __name__ == "__main__":
    api.run(port=5000)
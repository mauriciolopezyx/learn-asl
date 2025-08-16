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
        self.relu = nn.ReLU()

        # Convolutional blocks
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)   # (3, 128, 128) -> (32, 128, 128)
        self.pool1 = nn.MaxPool2d(2, 2)                           # -> (32, 64, 64)

        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)  # (64, 64, 64)
        self.pool2 = nn.MaxPool2d(2, 2)                           # -> (64, 32, 32)

        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1) # (128, 32, 32)
        self.pool3 = nn.MaxPool2d(2, 2)                           # -> (128, 16, 16)

        # Fully connected layers
        self.flatten = nn.Flatten()
        self.fc1 = nn.Linear(128 * 43 * 43, 512)                  # 327,680 -> 512
        self.dropout = nn.Dropout(0.5)
        self.fc2 = nn.Linear(512, 26)

    def forward(self, x):
        x = self.relu(self.conv1(x))
        x = self.pool1(x)

        x = self.relu(self.conv2(x))
        x = self.pool2(x)

        x = self.relu(self.conv3(x))
        x = self.pool3(x)

        x = self.flatten(x)
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
cnn_model = CNN().to(device)
cnn_model.load_state_dict(torch.load(os.path.join("models", "landmark_cnn_model.pth"), map_location=device))
cnn_model.eval()

# ----------

letters = [ch for ch in string.ascii_uppercase]
label_to_letter = {i: ch for i, ch in enumerate(letters)}

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

            # ==================== FOR PREDICTION ==================== #
            # convert to PIL and apply the same transforms
            pil_image = Image.fromarray(wireframe_image).convert("L")
            
            transform = transforms.Compose([
                transforms.Resize((350, 350)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.5], std=[0.5])
            ])
            img_tensor = transform(pil_image).unsqueeze(0).to(device)
        
            with torch.no_grad():
                output = cnn_model(img_tensor)
                predicted_class = torch.argmax(output, dim=1).item()
                predicted_class = label_to_letter[predicted_class]
                confidence = torch.softmax(output, dim=1).max().item()    
            # ==================== FOR PREDICTION ==================== #

            # ==================== FOR WIREFRAME ==================== #
            # wireframe to base64
            success, buffer = cv.imencode('.jpg', wireframe_image)
            if not success:
                raise ValueError("Could not encode wireframe image")
            wireframe_base64 = base64.b64encode(buffer).decode('utf-8')
            # ==================== FOR WIREFRAME ==================== #
            
            print("confidence:", confidence)
            return jsonify({
                "prediction": predicted_class,
                "confidence": confidence,
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
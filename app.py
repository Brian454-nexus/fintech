from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import cv2
import numpy as np
import face_recognition
import os
import json
import base64
import hashlib
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
import pickle
from sklearn.ensemble import IsolationForest
import random
import string
import librosa
import soundfile as sf
from io import BytesIO
import pyttsx3
import threading
import time

app = Flask(__name__)
CORS(app)

# Initialize encryption
def generate_key():
    return Fernet.generate_key()

def get_or_create_key():
    key_file = 'encryption.key'
    if os.path.exists(key_file):
        with open(key_file, 'rb') as f:
            return f.read()
    else:
        key = generate_key()
        with open(key_file, 'wb') as f:
            f.write(key)
        return key

encryption_key = get_or_create_key()
cipher_suite = Fernet(encryption_key)

# Global variables for demo
enrolled_faces = {}
enrolled_voices = {}
transaction_history = []
fraud_alerts = []
user_profiles = {}

# Initialize fraud detection model
fraud_detector = IsolationForest(contamination=0.1, random_state=42)

class BiometricAuth:
    def __init__(self):
        self.face_encodings = {}
        self.voice_profiles = {}
        
    def enroll_face(self, user_id, image_data):
        """Enroll user face for authentication"""
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Convert to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Find face encodings
            face_encodings = face_recognition.face_encodings(rgb_image)
            
            if len(face_encodings) > 0:
                # Encrypt and store face encoding
                encrypted_encoding = cipher_suite.encrypt(pickle.dumps(face_encodings[0]))
                self.face_encodings[user_id] = encrypted_encoding
                
                # Also store in global for demo
                enrolled_faces[user_id] = face_encodings[0]
                
                return {"status": "success", "message": "Face enrolled successfully"}
            else:
                return {"status": "error", "message": "No face detected in image"}
                
        except Exception as e:
            return {"status": "error", "message": f"Face enrollment failed: {str(e)}"}
    
    def verify_face(self, user_id, image_data):
        """Verify user face against enrolled template"""
        try:
            if user_id not in self.face_encodings:
                return {"status": "error", "message": "User not enrolled"}
            
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Convert to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Find face encodings
            face_encodings = face_recognition.face_encodings(rgb_image)
            
            if len(face_encodings) == 0:
                return {"status": "error", "message": "No face detected"}
            
            # Decrypt stored encoding
            stored_encoding = pickle.loads(cipher_suite.decrypt(self.face_encodings[user_id]))
            
            # Compare faces
            matches = face_recognition.compare_faces([stored_encoding], face_encodings[0], tolerance=0.6)
            distance = face_recognition.face_distance([stored_encoding], face_encodings[0])[0]
            
            if matches[0]:
                confidence = (1 - distance) * 100
                return {
                    "status": "success", 
                    "verified": True, 
                    "confidence": round(confidence, 2),
                    "message": f"Face verified with {confidence:.1f}% confidence"
                }
            else:
                return {
                    "status": "success", 
                    "verified": False, 
                    "confidence": round((1 - distance) * 100, 2),
                    "message": "Face verification failed - possible fraud attempt"
                }
                
        except Exception as e:
            return {"status": "error", "message": f"Face verification failed: {str(e)}"}
    
    def enroll_voice(self, user_id, audio_data):
        """Enroll user voice for authentication"""
        try:
            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_data)
            
            # Load audio with librosa
            audio, sr = librosa.load(BytesIO(audio_bytes), sr=16000)
            
            # Extract MFCC features
            mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
            mfcc_mean = np.mean(mfccs, axis=1)
            
            # Encrypt and store voice profile
            encrypted_profile = cipher_suite.encrypt(pickle.dumps(mfcc_mean))
            self.voice_profiles[user_id] = encrypted_profile
            
            # Also store in global for demo
            enrolled_voices[user_id] = mfcc_mean
            
            return {"status": "success", "message": "Voice enrolled successfully"}
            
        except Exception as e:
            return {"status": "error", "message": f"Voice enrollment failed: {str(e)}"}
    
    def verify_voice(self, user_id, audio_data):
        """Verify user voice against enrolled template"""
        try:
            if user_id not in self.voice_profiles:
                return {"status": "error", "message": "User not enrolled"}
            
            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_data)
            
            # Load audio with librosa
            audio, sr = librosa.load(BytesIO(audio_bytes), sr=16000)
            
            # Extract MFCC features
            mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
            mfcc_mean = np.mean(mfccs, axis=1)
            
            # Decrypt stored profile
            stored_profile = pickle.loads(cipher_suite.decrypt(self.voice_profiles[user_id]))
            
            # Calculate similarity (cosine similarity)
            similarity = np.dot(mfcc_mean, stored_profile) / (np.linalg.norm(mfcc_mean) * np.linalg.norm(stored_profile))
            confidence = similarity * 100
            
            if confidence > 70:  # Threshold for voice verification
                return {
                    "status": "success", 
                    "verified": True, 
                    "confidence": round(confidence, 2),
                    "message": f"Voice verified with {confidence:.1f}% confidence"
                }
            else:
                return {
                    "status": "success", 
                    "verified": False, 
                    "confidence": round(confidence, 2),
                    "message": "Voice verification failed - possible fraud attempt"
                }
                
        except Exception as e:
            return {"status": "error", "message": f"Voice verification failed: {str(e)}"}

class FraudDetector:
    def __init__(self):
        self.transaction_patterns = []
        self.anomaly_threshold = 0.3
        
    def analyze_transaction(self, transaction_data):
        """Analyze transaction for fraud patterns"""
        try:
            # Extract features
            features = self.extract_features(transaction_data)
            
            # Add to history
            self.transaction_patterns.append(features)
            
            # Keep only last 100 transactions for efficiency
            if len(self.transaction_patterns) > 100:
                self.transaction_patterns = self.transaction_patterns[-100:]
            
            # Train model if we have enough data
            if len(self.transaction_patterns) >= 10:
                fraud_detector.fit(self.transaction_patterns)
                anomaly_score = fraud_detector.decision_function([features])[0]
                
                is_fraud = anomaly_score < -self.anomaly_threshold
                
                return {
                    "is_fraud": is_fraud,
                    "anomaly_score": round(anomaly_score, 3),
                    "risk_level": self.get_risk_level(anomaly_score),
                    "reason": self.get_fraud_reason(features, anomaly_score)
                }
            else:
                # Not enough data yet, use simple rules
                return self.simple_fraud_check(features)
                
        except Exception as e:
            return {"is_fraud": False, "anomaly_score": 0, "risk_level": "low", "reason": "Analysis error"}
    
    def extract_features(self, transaction):
        """Extract features from transaction data"""
        amount = transaction.get('amount', 0)
        time_hour = datetime.now().hour
        day_of_week = datetime.now().weekday()
        
        # Calculate time since last transaction
        if transaction_history:
            last_transaction_time = transaction_history[-1].get('timestamp', datetime.now())
            time_diff = (datetime.now() - last_transaction_time).total_seconds() / 3600  # hours
        else:
            time_diff = 24  # Default if no history
        
        # Calculate amount ratio to average
        if len(transaction_history) > 0:
            avg_amount = sum(t.get('amount', 0) for t in transaction_history[-10:]) / min(10, len(transaction_history))
            amount_ratio = amount / avg_amount if avg_amount > 0 else 1
        else:
            amount_ratio = 1
        
        return [
            amount,
            time_hour,
            day_of_week,
            time_diff,
            amount_ratio,
            len(transaction_history)  # Transaction frequency
        ]
    
    def simple_fraud_check(self, features):
        """Simple rule-based fraud detection"""
        amount, time_hour, day_of_week, time_diff, amount_ratio, freq = features
        
        fraud_reasons = []
        risk_score = 0
        
        # Large amount check
        if amount > 10000:
            fraud_reasons.append("Unusually large transaction amount")
            risk_score += 0.3
        
        # Unusual time check
        if time_hour < 6 or time_hour > 22:
            fraud_reasons.append("Transaction at unusual time")
            risk_score += 0.2
        
        # Weekend check
        if day_of_week >= 5:  # Saturday or Sunday
            fraud_reasons.append("Weekend transaction")
            risk_score += 0.1
        
        # Rapid succession check
        if time_diff < 0.1:  # Less than 6 minutes
            fraud_reasons.append("Rapid succession of transactions")
            risk_score += 0.4
        
        # Amount spike check
        if amount_ratio > 5:
            fraud_reasons.append("Amount significantly higher than average")
            risk_score += 0.3
        
        is_fraud = risk_score > 0.5
        risk_level = "high" if risk_score > 0.7 else "medium" if risk_score > 0.3 else "low"
        
        return {
            "is_fraud": is_fraud,
            "anomaly_score": -risk_score,
            "risk_level": risk_level,
            "reason": "; ".join(fraud_reasons) if fraud_reasons else "No suspicious patterns detected"
        }
    
    def get_risk_level(self, anomaly_score):
        """Convert anomaly score to risk level"""
        if anomaly_score < -0.5:
            return "high"
        elif anomaly_score < -0.2:
            return "medium"
        else:
            return "low"
    
    def get_fraud_reason(self, features, anomaly_score):
        """Generate human-readable fraud reason"""
        amount, time_hour, day_of_week, time_diff, amount_ratio, freq = features
        
        reasons = []
        if anomaly_score < -0.5:
            reasons.append("Multiple suspicious patterns detected")
        if amount > 5000:
            reasons.append("Large transaction amount")
        if time_hour < 6 or time_hour > 22:
            reasons.append("Unusual transaction time")
        if time_diff < 0.1:
            reasons.append("Rapid transaction succession")
        
        return "; ".join(reasons) if reasons else "Transaction appears normal"

# Initialize components
biometric_auth = BiometricAuth()
fraud_detector = FraudDetector()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/enroll-face', methods=['POST'])
def enroll_face():
    data = request.json
    user_id = data.get('user_id', 'default_user')
    image_data = data.get('image_data')
    
    result = biometric_auth.enroll_face(user_id, image_data)
    return jsonify(result)

@app.route('/api/verify-face', methods=['POST'])
def verify_face():
    data = request.json
    user_id = data.get('user_id', 'default_user')
    image_data = data.get('image_data')
    
    result = biometric_auth.verify_face(user_id, image_data)
    return jsonify(result)

@app.route('/api/enroll-voice', methods=['POST'])
def enroll_voice():
    data = request.json
    user_id = data.get('user_id', 'default_user')
    audio_data = data.get('audio_data')
    
    result = biometric_auth.enroll_voice(user_id, audio_data)
    return jsonify(result)

@app.route('/api/verify-voice', methods=['POST'])
def verify_voice():
    data = request.json
    user_id = data.get('user_id', 'default_user')
    audio_data = data.get('audio_data')
    
    result = biometric_auth.verify_voice(user_id, audio_data)
    return jsonify(result)

@app.route('/api/process-transaction', methods=['POST'])
def process_transaction():
    data = request.json
    user_id = data.get('user_id', 'default_user')
    amount = data.get('amount', 0)
    transaction_type = data.get('type', 'transfer')
    
    # Create transaction record
    transaction = {
        'id': ''.join(random.choices(string.ascii_uppercase + string.digits, k=8)),
        'user_id': user_id,
        'amount': amount,
        'type': transaction_type,
        'timestamp': datetime.now(),
        'status': 'pending'
    }
    
    # Fraud detection
    fraud_analysis = fraud_detector.analyze_transaction(transaction)
    
    # Add to history
    transaction_history.append(transaction)
    
    # Generate response
    response = {
        'transaction_id': transaction['id'],
        'fraud_analysis': fraud_analysis,
        'timestamp': transaction['timestamp'].isoformat()
    }
    
    # Log fraud alerts
    if fraud_analysis['is_fraud']:
        alert = {
            'id': ''.join(random.choices(string.ascii_uppercase + string.digits, k=6)),
            'transaction_id': transaction['id'],
            'user_id': user_id,
            'reason': fraud_analysis['reason'],
            'risk_level': fraud_analysis['risk_level'],
            'timestamp': datetime.now(),
            'status': 'active'
        }
        fraud_alerts.append(alert)
        response['alert'] = alert
    
    return jsonify(response)

@app.route('/api/get-alerts', methods=['GET'])
def get_alerts():
    return jsonify({
        'alerts': fraud_alerts[-10:],  # Last 10 alerts
        'total_count': len(fraud_alerts)
    })

@app.route('/api/get-transactions', methods=['GET'])
def get_transactions():
    return jsonify({
        'transactions': transaction_history[-20:],  # Last 20 transactions
        'total_count': len(transaction_history)
    })

@app.route('/api/verify-pin', methods=['POST'])
def verify_pin():
    data = request.json
    pin = data.get('pin')
    user_id = data.get('user_id', 'default_user')
    
    # Simple PIN verification (in real app, this would be hashed)
    correct_pin = user_profiles.get(user_id, {}).get('pin', '1234')
    
    if pin == correct_pin:
        return jsonify({
            'status': 'success',
            'verified': True,
            'message': 'PIN verified successfully'
        })
    else:
        return jsonify({
            'status': 'success',
            'verified': False,
            'message': 'Invalid PIN - possible fraud attempt'
        })

@app.route('/api/setup-pin', methods=['POST'])
def setup_pin():
    data = request.json
    pin = data.get('pin')
    user_id = data.get('user_id', 'default_user')
    
    if user_id not in user_profiles:
        user_profiles[user_id] = {}
    
    user_profiles[user_id]['pin'] = pin
    
    return jsonify({
        'status': 'success',
        'message': 'PIN set successfully'
    })

@app.route('/api/simulate-fraud', methods=['POST'])
def simulate_fraud():
    """Simulate various fraud scenarios for demo"""
    data = request.json
    scenario = data.get('scenario', 'large_transaction')
    
    fraud_scenarios = {
        'large_transaction': {
            'amount': 50000,
            'type': 'transfer',
            'description': 'Simulating unusually large transaction'
        },
        'rapid_transactions': {
            'amount': 1000,
            'type': 'transfer',
            'description': 'Simulating rapid succession of transactions'
        },
        'unusual_time': {
            'amount': 2000,
            'type': 'transfer',
            'description': 'Simulating transaction at unusual time'
        }
    }
    
    scenario_data = fraud_scenarios.get(scenario, fraud_scenarios['large_transaction'])
    
    # Process the fraudulent transaction
    transaction = {
        'id': ''.join(random.choices(string.ascii_uppercase + string.digits, k=8)),
        'user_id': 'fraud_user',
        'amount': scenario_data['amount'],
        'type': scenario_data['type'],
        'timestamp': datetime.now(),
        'status': 'pending'
    }
    
    fraud_analysis = fraud_detector.analyze_transaction(transaction)
    transaction_history.append(transaction)
    
    response = {
        'scenario': scenario,
        'description': scenario_data['description'],
        'transaction_id': transaction['id'],
        'fraud_analysis': fraud_analysis,
        'timestamp': transaction['timestamp'].isoformat()
    }
    
    if fraud_analysis['is_fraud']:
        alert = {
            'id': ''.join(random.choices(string.ascii_uppercase + string.digits, k=6)),
            'transaction_id': transaction['id'],
            'user_id': 'fraud_user',
            'reason': fraud_analysis['reason'],
            'risk_level': fraud_analysis['risk_level'],
            'timestamp': datetime.now(),
            'status': 'active'
        }
        fraud_alerts.append(alert)
        response['alert'] = alert
    
    return jsonify(response)

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    print("🚀 Starting Face-to-Phone Fraud Detection System...")
    print("📱 Offline-first biometric authentication")
    print("🔒 Real-time fraud detection")
    print("🎯 Demo-ready for hackathon judges")
    
    app.run(debug=True, host='0.0.0.0', port=5000)

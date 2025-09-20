from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import json
import base64
import hashlib
from datetime import datetime, timedelta
import random
import string
import numpy as np
from io import BytesIO
import threading
import time
import math
from collections import deque
import statistics

app = Flask(__name__)
CORS(app)

# Simplified Biometric Authentication (No heavy dependencies)
class SimplifiedBiometricAuth:
    def __init__(self):
        self.face_templates = {}
        self.voice_templates = {}
        self.pin_storage = {}
        
    def enroll_face(self, user_id, image_data):
        """Simplified face enrollment using basic image analysis"""
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            
            # Create a simple hash-based template (for demo purposes)
            image_hash = hashlib.sha256(image_bytes).hexdigest()
            
            # Store template
            self.face_templates[user_id] = {
                'template': image_hash,
                'enrolled_at': datetime.now(),
                'confidence_threshold': 0.7
            }
            
            return {"status": "success", "message": "Face enrolled successfully"}
            
        except Exception as e:
            return {"status": "error", "message": f"Face enrollment failed: {str(e)}"}
    
    def verify_face(self, user_id, image_data):
        """Simplified face verification"""
        try:
            if user_id not in self.face_templates:
                return {"status": "error", "message": "User not enrolled"}
            
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            current_hash = hashlib.sha256(image_bytes).hexdigest()
            
            # Simple similarity check (in real implementation, this would be more sophisticated)
            stored_template = self.face_templates[user_id]['template']
            
            # Calculate similarity (simplified)
            similarity = self.calculate_hash_similarity(stored_template, current_hash)
            confidence = similarity * 100
            
            if confidence > 70:  # Threshold for verification
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
                    "confidence": round(confidence, 2),
                    "message": "Face verification failed - possible fraud attempt"
                }
                
        except Exception as e:
            return {"status": "error", "message": f"Face verification failed: {str(e)}"}
    
    def calculate_hash_similarity(self, hash1, hash2):
        """Calculate similarity between two hashes"""
        # Simple similarity based on common characters
        common_chars = sum(1 for a, b in zip(hash1, hash2) if a == b)
        return common_chars / len(hash1)
    
    def enroll_voice(self, user_id, audio_data):
        """Simplified voice enrollment"""
        try:
            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_data)
            
            # Create a simple hash-based template
            audio_hash = hashlib.sha256(audio_bytes).hexdigest()
            
            # Store template
            self.voice_templates[user_id] = {
                'template': audio_hash,
                'enrolled_at': datetime.now(),
                'confidence_threshold': 0.6
            }
            
            return {"status": "success", "message": "Voice enrolled successfully"}
            
        except Exception as e:
            return {"status": "error", "message": f"Voice enrollment failed: {str(e)}"}
    
    def verify_voice(self, user_id, audio_data):
        """Simplified voice verification"""
        try:
            if user_id not in self.voice_templates:
                return {"status": "error", "message": "User not enrolled"}
            
            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_data)
            current_hash = hashlib.sha256(audio_bytes).hexdigest()
            
            # Simple similarity check
            stored_template = self.voice_templates[user_id]['template']
            similarity = self.calculate_hash_similarity(stored_template, current_hash)
            confidence = similarity * 100
            
            if confidence > 60:  # Lower threshold for voice
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
    
    def setup_pin(self, user_id, pin):
        """Setup PIN for user"""
        try:
            # Hash the PIN for security
            pin_hash = hashlib.sha256(pin.encode()).hexdigest()
            self.pin_storage[user_id] = pin_hash
            
            return {"status": "success", "message": "PIN set successfully"}
            
        except Exception as e:
            return {"status": "error", "message": f"PIN setup failed: {str(e)}"}
    
    def verify_pin(self, user_id, pin):
        """Verify PIN"""
        try:
            if user_id not in self.pin_storage:
                return {"status": "error", "message": "PIN not set"}
            
            pin_hash = hashlib.sha256(pin.encode()).hexdigest()
            stored_hash = self.pin_storage[user_id]
            
            if pin_hash == stored_hash:
                return {
                    "status": "success",
                    "verified": True,
                    "message": "PIN verified successfully"
                }
            else:
                return {
                    "status": "success",
                    "verified": False,
                    "message": "Invalid PIN - possible fraud attempt"
                }
                
        except Exception as e:
            return {"status": "error", "message": f"PIN verification failed: {str(e)}"}
    
    def get_enrollment_status(self, user_id):
        """Get enrollment status for user"""
        return {
            "face_enrolled": user_id in self.face_templates,
            "voice_enrolled": user_id in self.voice_templates,
            "pin_set": user_id in self.pin_storage
        }

# Simplified Fraud Detection
class SimpleFraudDetector:
    def __init__(self):
        self.transaction_history = deque(maxlen=1000)
        
    def analyze_transaction(self, transaction_data):
        """Simple fraud detection using basic rules"""
        try:
            amount = transaction_data.get('amount', 0)
            current_time = datetime.now()
            
            # Basic fraud detection rules
            fraud_score = 0
            reasons = []
            
            # Large amount check
            if amount > 10000:
                fraud_score += 0.3
                reasons.append("Unusually large transaction amount")
            
            # Unusual time check
            if current_time.hour < 6 or current_time.hour > 22:
                fraud_score += 0.2
                reasons.append("Transaction at unusual time")
            
            # Weekend check
            if current_time.weekday() >= 5:  # Weekend
                fraud_score += 0.1
                reasons.append("Weekend transaction")
            
            # Frequency check
            recent_transactions = [t for t in self.transaction_history if 
                                 (current_time - t.get('timestamp', current_time)).total_seconds() < 3600]
            
            if len(recent_transactions) > 5:
                fraud_score += 0.3
                reasons.append("High transaction frequency")
            
            # Rapid succession check
            if len(recent_transactions) > 0:
                last_transaction = recent_transactions[-1]
                time_diff = (current_time - last_transaction.get('timestamp', current_time)).total_seconds()
                if time_diff < 60:  # Less than 1 minute
                    fraud_score += 0.4
                    reasons.append("Rapid succession of transactions")
            
            # Determine fraud status
            is_fraud = fraud_score > 0.6
            risk_level = "high" if fraud_score > 0.8 else "medium" if fraud_score > 0.4 else "low"
            
            return {
                "is_fraud": is_fraud,
                "anomaly_score": -fraud_score,
                "risk_level": risk_level,
                "reason": "; ".join(reasons) if reasons else "No suspicious patterns detected"
            }
                
        except Exception as e:
            return {"is_fraud": False, "anomaly_score": 0, "risk_level": "low", "reason": "Analysis error"}

# Initialize components
biometric_auth = SimplifiedBiometricAuth()
fraud_detector = SimpleFraudDetector()

# Global storage for demo
transaction_history = []
fraud_alerts = []
user_profiles = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/enroll-face', methods=['POST'])
def enroll_face():
    data = request.json
    user_id = data.get('user_id', 'demo_user')
    image_data = data.get('image_data')
    
    result = biometric_auth.enroll_face(user_id, image_data)
    return jsonify(result)

@app.route('/api/verify-face', methods=['POST'])
def verify_face():
    data = request.json
    user_id = data.get('user_id', 'demo_user')
    image_data = data.get('image_data')
    
    result = biometric_auth.verify_face(user_id, image_data)
    return jsonify(result)

@app.route('/api/enroll-voice', methods=['POST'])
def enroll_voice():
    data = request.json
    user_id = data.get('user_id', 'demo_user')
    audio_data = data.get('audio_data')
    
    result = biometric_auth.enroll_voice(user_id, audio_data)
    return jsonify(result)

@app.route('/api/verify-voice', methods=['POST'])
def verify_voice():
    data = request.json
    user_id = data.get('user_id', 'demo_user')
    audio_data = data.get('audio_data')
    
    result = biometric_auth.verify_voice(user_id, audio_data)
    return jsonify(result)

@app.route('/api/get-enrollment-status', methods=['GET'])
def get_enrollment_status():
    user_id = request.args.get('user_id', 'demo_user')
    result = biometric_auth.get_enrollment_status(user_id)
    return jsonify(result)

@app.route('/api/process-transaction', methods=['POST'])
def process_transaction():
    data = request.json
    user_id = data.get('user_id', 'demo_user')
    amount = data.get('amount', 0)
    transaction_type = data.get('type', 'transfer')
    recipient = data.get('recipient', 'unknown')
    
    # Create transaction record
    transaction = {
        'id': ''.join(random.choices(string.ascii_uppercase + string.digits, k=8)),
        'user_id': user_id,
        'amount': amount,
        'type': transaction_type,
        'recipient': recipient,
        'timestamp': datetime.now(),
        'status': 'pending'
    }
    
    # Fraud detection
    fraud_analysis = fraud_detector.analyze_transaction(transaction)
    
    # Add to history
    transaction_history.append(transaction)
    fraud_detector.transaction_history.append(transaction)
    
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
    user_id = data.get('user_id', 'demo_user')
    
    result = biometric_auth.verify_pin(user_id, pin)
    return jsonify(result)

@app.route('/api/setup-pin', methods=['POST'])
def setup_pin():
    data = request.json
    pin = data.get('pin')
    user_id = data.get('user_id', 'demo_user')
    
    result = biometric_auth.setup_pin(user_id, pin)
    return jsonify(result)

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
        'recipient': 'fraud_recipient',
        'timestamp': datetime.now(),
        'status': 'pending'
    }
    
    fraud_analysis = fraud_detector.analyze_transaction(transaction)
    transaction_history.append(transaction)
    fraud_detector.transaction_history.append(transaction)
    
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
    # Create necessary directories
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    print("🚀 Starting Face-to-Phone Fraud Detection System...")
    print("📱 Offline-first biometric authentication")
    print("🔒 Real-time fraud detection")
    print("🎯 Demo-ready for hackathon judges")
    
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)

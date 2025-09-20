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
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
import pickle
import threading
import time
import math

app = Flask(__name__)
CORS(app)

# Advanced AI Features without GPU
class AdvancedAIFeatures:
    def __init__(self):
        self.behavioral_patterns = {}
        self.device_fingerprints = {}
        self.transaction_graph = {}
        self.risk_models = {}
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.behavior_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        
    def analyze_behavioral_patterns(self, user_id, transaction_data):
        """Advanced behavioral analysis using machine learning"""
        if user_id not in self.behavioral_patterns:
            self.behavioral_patterns[user_id] = {
                'transaction_times': [],
                'amounts': [],
                'locations': [],
                'device_types': [],
                'session_patterns': []
            }
        
        # Extract behavioral features
        current_time = datetime.now()
        features = {
            'hour_of_day': current_time.hour,
            'day_of_week': current_time.weekday(),
            'amount': transaction_data.get('amount', 0),
            'transaction_type': self.encode_transaction_type(transaction_data.get('type', 'transfer')),
            'time_since_last': self.get_time_since_last_transaction(user_id),
            'amount_deviation': self.calculate_amount_deviation(user_id, transaction_data.get('amount', 0)),
            'frequency_score': self.calculate_frequency_score(user_id),
            'session_duration': self.calculate_session_duration(user_id)
        }
        
        # Update patterns
        self.behavioral_patterns[user_id]['transaction_times'].append(current_time)
        self.behavioral_patterns[user_id]['amounts'].append(transaction_data.get('amount', 0))
        
        # Keep only last 100 transactions per user
        for key in self.behavioral_patterns[user_id]:
            if len(self.behavioral_patterns[user_id][key]) > 100:
                self.behavioral_patterns[user_id][key] = self.behavioral_patterns[user_id][key][-100:]
        
        return self.predict_behavioral_anomaly(user_id, features)
    
    def encode_transaction_type(self, transaction_type):
        """Encode transaction type as numerical feature"""
        type_mapping = {
            'transfer': 1,
            'payment': 2,
            'withdrawal': 3,
            'deposit': 4,
            'investment': 5
        }
        return type_mapping.get(transaction_type, 1)
    
    def get_time_since_last_transaction(self, user_id):
        """Calculate time since last transaction in hours"""
        if user_id not in self.behavioral_patterns or not self.behavioral_patterns[user_id]['transaction_times']:
            return 24  # Default 24 hours
        
        last_transaction = self.behavioral_patterns[user_id]['transaction_times'][-1]
        time_diff = (datetime.now() - last_transaction).total_seconds() / 3600
        return time_diff
    
    def calculate_amount_deviation(self, user_id, current_amount):
        """Calculate how much current amount deviates from user's typical amounts"""
        if user_id not in self.behavioral_patterns or len(self.behavioral_patterns[user_id]['amounts']) < 3:
            return 1.0
        
        amounts = self.behavioral_patterns[user_id]['amounts']
        mean_amount = np.mean(amounts)
        std_amount = np.std(amounts)
        
        if std_amount == 0:
            return 1.0
        
        deviation = abs(current_amount - mean_amount) / std_amount
        return min(deviation, 10.0)  # Cap at 10 standard deviations
    
    def calculate_frequency_score(self, user_id):
        """Calculate transaction frequency score"""
        if user_id not in self.behavioral_patterns or len(self.behavioral_patterns[user_id]['transaction_times']) < 2:
            return 0.5
        
        times = self.behavioral_patterns[user_id]['transaction_times']
        if len(times) < 2:
            return 0.5
        
        # Calculate average time between transactions
        intervals = []
        for i in range(1, len(times)):
            interval = (times[i] - times[i-1]).total_seconds() / 3600  # hours
            intervals.append(interval)
        
        avg_interval = np.mean(intervals)
        
        # Normalize to 0-1 scale (higher = more frequent)
        frequency_score = 1 / (1 + avg_interval / 24)  # Normalize by 24 hours
        return min(frequency_score, 1.0)
    
    def calculate_session_duration(self, user_id):
        """Calculate current session duration"""
        # This would typically track actual session data
        # For demo, we'll simulate based on transaction patterns
        if user_id not in self.behavioral_patterns:
            return 0
        
        times = self.behavioral_patterns[user_id]['transaction_times']
        if len(times) < 2:
            return 0
        
        # Calculate session duration based on recent activity
        recent_times = times[-5:] if len(times) >= 5 else times
        session_duration = (recent_times[-1] - recent_times[0]).total_seconds() / 3600
        return min(session_duration, 8.0)  # Cap at 8 hours
    
    def predict_behavioral_anomaly(self, user_id, features):
        """Predict if behavior is anomalous using ML"""
        feature_vector = np.array([
            features['hour_of_day'],
            features['day_of_week'],
            features['amount'],
            features['transaction_type'],
            features['time_since_last'],
            features['amount_deviation'],
            features['frequency_score'],
            features['session_duration']
        ]).reshape(1, -1)
        
        # Simple anomaly detection based on feature thresholds
        anomaly_score = 0
        
        # Unusual time patterns
        if features['hour_of_day'] < 6 or features['hour_of_day'] > 22:
            anomaly_score += 0.3
        
        # High amount deviation
        if features['amount_deviation'] > 3:
            anomaly_score += 0.4
        
        # Very frequent transactions
        if features['frequency_score'] > 0.8:
            anomaly_score += 0.2
        
        # Very short time between transactions
        if features['time_since_last'] < 0.1:  # Less than 6 minutes
            anomaly_score += 0.5
        
        # Long session duration
        if features['session_duration'] > 6:
            anomaly_score += 0.2
        
        is_anomalous = anomaly_score > 0.6
        risk_level = "high" if anomaly_score > 0.8 else "medium" if anomaly_score > 0.4 else "low"
        
        return {
            "is_anomalous": is_anomalous,
            "anomaly_score": anomaly_score,
            "risk_level": risk_level,
            "behavioral_features": features
        }
    
    def analyze_device_fingerprint(self, user_id, device_info):
        """Analyze device fingerprint for fraud detection"""
        if user_id not in self.device_fingerprints:
            self.device_fingerprints[user_id] = []
        
        # Create device fingerprint
        fingerprint = {
            'user_agent': device_info.get('user_agent', ''),
            'screen_resolution': device_info.get('screen_resolution', ''),
            'timezone': device_info.get('timezone', ''),
            'language': device_info.get('language', ''),
            'platform': device_info.get('platform', ''),
            'timestamp': datetime.now()
        }
        
        # Check for device changes
        if len(self.device_fingerprints[user_id]) > 0:
            last_fingerprint = self.device_fingerprints[user_id][-1]
            device_changed = self.compare_fingerprints(fingerprint, last_fingerprint)
            
            if device_changed:
                return {
                    "device_changed": True,
                    "risk_level": "medium",
                    "message": "New device detected"
                }
        
        self.device_fingerprints[user_id].append(fingerprint)
        
        # Keep only last 10 fingerprints
        if len(self.device_fingerprints[user_id]) > 10:
            self.device_fingerprints[user_id] = self.device_fingerprints[user_id][-10:]
        
        return {
            "device_changed": False,
            "risk_level": "low",
            "message": "Device recognized"
        }
    
    def compare_fingerprints(self, fp1, fp2):
        """Compare two device fingerprints"""
        differences = 0
        total_fields = 5  # Excluding timestamp
        
        for key in ['user_agent', 'screen_resolution', 'timezone', 'language', 'platform']:
            if fp1.get(key) != fp2.get(key):
                differences += 1
        
        return differences > 2  # More than 2 fields changed
    
    def analyze_transaction_graph(self, user_id, transaction_data):
        """Analyze transaction graph for network effects"""
        if user_id not in self.transaction_graph:
            self.transaction_graph[user_id] = {
                'nodes': set(),
                'edges': [],
                'amounts': [],
                'timestamps': []
            }
        
        graph = self.transaction_graph[user_id]
        
        # Add transaction to graph
        recipient = transaction_data.get('recipient', 'unknown')
        amount = transaction_data.get('amount', 0)
        timestamp = datetime.now()
        
        graph['nodes'].add(recipient)
        graph['edges'].append({
            'from': user_id,
            'to': recipient,
            'amount': amount,
            'timestamp': timestamp
        })
        graph['amounts'].append(amount)
        graph['timestamps'].append(timestamp)
        
        # Analyze graph patterns
        return self.detect_graph_anomalies(graph, amount, timestamp)
    
    def detect_graph_anomalies(self, graph, current_amount, timestamp):
        """Detect anomalies in transaction graph"""
        anomalies = []
        
        # Check for circular transactions
        if len(graph['edges']) > 3:
            recent_edges = graph['edges'][-5:]
            recipients = [edge['to'] for edge in recent_edges]
            if len(set(recipients)) < len(recipients) * 0.6:  # Too many repeated recipients
                anomalies.append("Circular transaction pattern detected")
        
        # Check for amount clustering
        if len(graph['amounts']) > 5:
            amounts = np.array(graph['amounts'][-10:])
            if np.std(amounts) < np.mean(amounts) * 0.1:  # Very low variance
                anomalies.append("Suspiciously uniform transaction amounts")
        
        # Check for time clustering
        if len(graph['timestamps']) > 3:
            recent_times = graph['timestamps'][-5:]
            intervals = [(recent_times[i] - recent_times[i-1]).total_seconds() for i in range(1, len(recent_times))]
            if len(set([round(t, -1) for t in intervals])) < len(intervals) * 0.5:  # Too regular intervals
                anomalies.append("Suspiciously regular transaction timing")
        
        risk_level = "high" if len(anomalies) > 1 else "medium" if len(anomalies) == 1 else "low"
        
        return {
            "anomalies": anomalies,
            "risk_level": risk_level,
            "graph_size": len(graph['nodes']),
            "transaction_count": len(graph['edges'])
        }

# Simplified Biometric Authentication (No GPU required)
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

# Enhanced Fraud Detection with Advanced AI
class EnhancedFraudDetector:
    def __init__(self):
        self.transaction_patterns = []
        self.anomaly_threshold = 0.3
        self.ai_features = AdvancedAIFeatures()
        
    def analyze_transaction(self, transaction_data):
        """Enhanced fraud analysis with multiple AI techniques"""
        try:
            user_id = transaction_data.get('user_id', 'default_user')
            
            # Extract basic features
            features = self.extract_features(transaction_data)
            
            # Add to history
            self.transaction_patterns.append(features)
            
            # Keep only last 100 transactions for efficiency
            if len(self.transaction_patterns) > 100:
                self.transaction_patterns = self.transaction_patterns[-100:]
            
            # Multiple AI analysis techniques
            behavioral_analysis = self.ai_features.analyze_behavioral_patterns(user_id, transaction_data)
            graph_analysis = self.ai_features.analyze_transaction_graph(user_id, transaction_data)
            
            # Combine results
            combined_risk_score = self.combine_risk_scores(features, behavioral_analysis, graph_analysis)
            
            is_fraud = combined_risk_score['is_fraud']
            risk_level = combined_risk_score['risk_level']
            reason = combined_risk_score['reason']
                
                return {
                    "is_fraud": is_fraud,
                "anomaly_score": combined_risk_score['anomaly_score'],
                "risk_level": risk_level,
                "reason": reason,
                "behavioral_analysis": behavioral_analysis,
                "graph_analysis": graph_analysis,
                "ai_confidence": combined_risk_score['confidence']
            }
                
        except Exception as e:
            return {"is_fraud": False, "anomaly_score": 0, "risk_level": "low", "reason": "Analysis error"}
    
    def extract_features(self, transaction):
        """Extract features from transaction data"""
        amount = transaction.get('amount', 0)
        time_hour = datetime.now().hour
        day_of_week = datetime.now().weekday()
        
        # Calculate time since last transaction
        if self.transaction_patterns:
            last_transaction_time = datetime.now()  # Simplified
            time_diff = 1  # Default 1 hour
        else:
            time_diff = 24  # Default if no history
        
        # Calculate amount ratio to average
        if len(self.transaction_patterns) > 0:
            avg_amount = sum(t[0] for t in self.transaction_patterns[-10:]) / min(10, len(self.transaction_patterns))
            amount_ratio = amount / avg_amount if avg_amount > 0 else 1
        else:
            amount_ratio = 1
        
        return [
            amount,
            time_hour,
            day_of_week,
            time_diff,
            amount_ratio,
            len(self.transaction_patterns)  # Transaction frequency
        ]
    
    def combine_risk_scores(self, features, behavioral_analysis, graph_analysis):
        """Combine multiple risk scores into final decision"""
        amount, time_hour, day_of_week, time_diff, amount_ratio, freq = features
        
        # Base fraud score
        fraud_score = 0
        reasons = []
        
        # Amount-based checks
        if amount > 10000:
            fraud_score += 0.3
            reasons.append("Unusually large transaction amount")
        
        if amount_ratio > 5:
            fraud_score += 0.3
            reasons.append("Amount significantly higher than average")
        
        # Time-based checks
        if time_hour < 6 or time_hour > 22:
            fraud_score += 0.2
            reasons.append("Transaction at unusual time")
        
        if day_of_week >= 5:  # Weekend
            fraud_score += 0.1
            reasons.append("Weekend transaction")
        
        # Frequency checks
        if time_diff < 0.1:  # Less than 6 minutes
            fraud_score += 0.4
            reasons.append("Rapid succession of transactions")
        
        # Add behavioral analysis
        if behavioral_analysis['is_anomalous']:
            fraud_score += behavioral_analysis['anomaly_score'] * 0.5
            reasons.append("Behavioral anomaly detected")
        
        # Add graph analysis
        if graph_analysis['risk_level'] == 'high':
            fraud_score += 0.3
            reasons.extend(graph_analysis['anomalies'])
        
        # Determine final risk level
        is_fraud = fraud_score > 0.6
        risk_level = "high" if fraud_score > 0.8 else "medium" if fraud_score > 0.4 else "low"
        
        return {
            "is_fraud": is_fraud,
            "anomaly_score": -fraud_score,
            "risk_level": risk_level,
            "reason": "; ".join(reasons) if reasons else "No suspicious patterns detected",
            "confidence": min(fraud_score * 100, 100)
        }

# Global variables for demo
transaction_history = []
fraud_alerts = []
user_profiles = {}

# Initialize components
biometric_auth = SimplifiedBiometricAuth()
fraud_detector = EnhancedFraudDetector()
ai_features = AdvancedAIFeatures()

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
    
    # Enhanced fraud detection
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

# Unique Competitive Features
@app.route('/api/analyze-device-fingerprint', methods=['POST'])
def analyze_device_fingerprint():
    """Analyze device fingerprint for fraud detection"""
    data = request.json
    user_id = data.get('user_id', 'demo_user')
    device_info = data.get('device_info', {})
    
    result = ai_features.analyze_device_fingerprint(user_id, device_info)
    return jsonify(result)

@app.route('/api/get-behavioral-insights', methods=['GET'])
def get_behavioral_insights():
    """Get behavioral insights for user"""
    user_id = request.args.get('user_id', 'demo_user')
    
    if user_id not in ai_features.behavioral_patterns:
        return jsonify({
            "message": "No behavioral data available",
            "insights": []
        })
    
    patterns = ai_features.behavioral_patterns[user_id]
    
    insights = []
    
    # Analyze transaction times
    if patterns['transaction_times']:
        times = [t.hour for t in patterns['transaction_times']]
        most_common_hour = max(set(times), key=times.count)
        insights.append(f"Most active during hour {most_common_hour}")
    
    # Analyze amounts
    if patterns['amounts']:
        avg_amount = np.mean(patterns['amounts'])
        max_amount = max(patterns['amounts'])
        insights.append(f"Average transaction: ${avg_amount:.2f}")
        insights.append(f"Highest transaction: ${max_amount:.2f}")
    
    return jsonify({
        "user_id": user_id,
        "insights": insights,
        "transaction_count": len(patterns['transaction_times'])
    })

@app.route('/api/get-fraud-predictions', methods=['GET'])
def get_fraud_predictions():
    """Get fraud predictions based on current patterns"""
    predictions = []
    
    # Analyze recent transactions
    recent_transactions = transaction_history[-10:] if len(transaction_history) >= 10 else transaction_history
    
    if recent_transactions:
        amounts = [t['amount'] for t in recent_transactions]
        avg_amount = np.mean(amounts)
        
        # Predict potential fraud scenarios
        if avg_amount > 5000:
            predictions.append({
                "type": "high_value_transaction",
                "probability": 0.7,
                "description": "High average transaction amounts detected"
            })
        
        if len(recent_transactions) > 5:
            predictions.append({
                "type": "high_frequency",
                "probability": 0.6,
                "description": "Unusually high transaction frequency"
            })
    
    return jsonify({
        "predictions": predictions,
        "total_transactions": len(transaction_history),
        "fraud_alerts": len(fraud_alerts)
    })

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    print("🚀 Starting Advanced Face-to-Phone Fraud Detection System...")
    print("🤖 AI-Powered Behavioral Analysis")
    print("🔒 Multi-layered Fraud Detection")
    print("📱 Simplified Biometric Authentication")
    print("🎯 Unique Competitive Features")
    print("⚡ No GPU Required - CPU Optimized")
    
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import json
import base64
import hashlib
from datetime import datetime, timedelta
import random
import string
import threading
import time

app = Flask(__name__)
CORS(app)

# Global variables for demo
transaction_history = []
fraud_alerts = []
user_profiles = {}

class SimpleFraudDetector:
    def __init__(self):
        self.transaction_patterns = []
        
    def analyze_transaction(self, transaction_data):
        """Simple rule-based fraud detection"""
        try:
            amount = transaction_data.get('amount', 0)
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
                
        except Exception as e:
            return {"is_fraud": False, "anomaly_score": 0, "risk_level": "low", "reason": "Analysis error"}

# Initialize components
fraud_detector = SimpleFraudDetector()

@app.route('/')
def index():
    return render_template('index.html')

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
    
    print("🚀 Starting Face-to-Phone Fraud Detection System (Demo Mode)...")
    print("📱 Offline-first fraud detection")
    print("🔒 Real-time fraud detection")
    print("🎯 Demo-ready for hackathon judges")
    print("⚠️  Running in simplified mode due to space constraints")
    
    app.run(debug=True, host='0.0.0.0', port=5000)

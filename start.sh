#!/bin/bash

echo ""
echo "========================================"
echo "  Face-to-Phone Fraud Detection System"
echo "  AI Hackathon Ready Demo"
echo "========================================"
echo ""

echo "[1/4] Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8+ from your package manager"
    exit 1
fi

echo "[2/4] Installing Python dependencies..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    echo "Please check your internet connection and try again"
    exit 1
fi

echo "[3/4] Creating necessary directories..."
mkdir -p templates static

echo "[4/4] Starting Face-to-Phone application..."
echo ""
echo "🚀 Starting server at http://localhost:5000"
echo "📱 Open in your mobile browser for best experience"
echo "🔒 Camera and microphone permissions required"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 app.py

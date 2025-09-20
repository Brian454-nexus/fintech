@echo off
echo 🚀 Starting Advanced Face-to-Phone Fraud Detection System...
echo 🤖 AI-Powered fraud detection without GPU requirements
echo 🔒 Lightweight biometric authentication
echo 📊 Advanced analytics and behavioral analysis
echo 🎯 Competitive features for hackathon demo
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Install requirements
echo 📦 Installing advanced requirements...
pip install -r requirements-advanced.txt

REM Start the advanced application
echo 🚀 Starting advanced application...
python app-advanced.py

pause

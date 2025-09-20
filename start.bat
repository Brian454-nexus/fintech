@echo off
echo.
echo ========================================
echo   Face-to-Phone Fraud Detection System
echo   AI Hackathon Ready Demo
echo ========================================
echo.

echo [1/4] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo [2/4] Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

echo [3/4] Creating necessary directories...
if not exist "templates" mkdir templates
if not exist "static" mkdir static

echo [4/4] Starting Face-to-Phone application...
echo.
echo 🚀 Starting server at http://localhost:5000
echo 📱 Open in your mobile browser for best experience
echo 🔒 Camera and microphone permissions required
echo.
echo Press Ctrl+C to stop the server
echo.

python app.py

pause

@echo off
echo.
echo ========================================
echo   Face-to-Phone Fraud Detection System
echo   AI Hackathon Ready Demo (Light Mode)
echo ========================================
echo.

echo [1/3] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo [2/3] Installing minimal dependencies...
pip install Flask Flask-CORS >nul 2>&1
if errorlevel 1 (
    echo WARNING: Could not install all dependencies
    echo Running in demo mode with limited features
)

echo [3/3] Starting Face-to-Phone application...
echo.
echo 🚀 Starting server at http://localhost:5000
echo 📱 Open in your mobile browser for best experience
echo ⚠️  Running in DEMO MODE (simplified features)
echo.
echo Press Ctrl+C to stop the server
echo.

python app-demo.py

pause

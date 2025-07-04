@echo off
echo Testing Local Setup Before Deploy
echo ===================================

echo.
echo 1. Testing Python and packages...
cd backend

python -c "import sys; print(f'Python version: {sys.version}')"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python not found
    pause
    exit /b 1
)

echo.
echo 2. Testing package imports...
python -c "import flask; print('✅ Flask OK')"
python -c "import cv2; print('✅ OpenCV OK')"
python -c "import numpy; print('✅ NumPy OK')"
python -c "import PIL; print('✅ Pillow OK')"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Some packages missing. Installing...
    pip install -r requirements.txt
)

echo.
echo 3. Testing Flask app...
python -c "from app import app; print('✅ Flask app imports OK')"

echo.
echo 4. Starting test server...
echo Backend will start at: http://localhost:5000
echo Press Ctrl+C to stop
echo.

set FLASK_ENV=development
python app.py

pause

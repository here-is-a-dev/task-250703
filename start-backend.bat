@echo off
echo Starting Image Processing Backend API...
echo.

cd backend

echo Installing dependencies (if needed)...
pip install -r requirements.txt

echo.
echo Starting Flask development server...
echo API will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

python app.py

pause

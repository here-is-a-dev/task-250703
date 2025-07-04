@echo off
echo Starting Combined Image Processing App...
echo.

echo Installing dependencies (if needed)...
pip install -r backend/requirements.txt

echo.
echo Creating static folder for combined app...
if not exist "static" mkdir static
xcopy "frontend\*" "static\" /E /Y /Q

echo.
echo Starting combined Flask server (frontend + backend)...
echo App will be available at: http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.

python serve_app.py

pause

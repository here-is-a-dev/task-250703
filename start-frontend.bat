@echo off
echo Starting Image Processing Frontend...
echo.

cd frontend

echo Starting local HTTP server...
echo Frontend will be available at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

python -m http.server 8000

pause

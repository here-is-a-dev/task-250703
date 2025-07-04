@echo off
echo Installing Face Recognition Dependencies...
echo ==========================================

cd backend

echo.
echo Installing Python packages...
pip install Flask==3.0.0
pip install Flask-CORS==4.0.0
pip install Pillow==10.4.0
pip install gunicorn==21.2.0
pip install requests==2.31.0
pip install opencv-python==4.8.1.78
pip install face-recognition==1.3.0
pip install numpy==1.24.3

echo.
echo Testing imports...
python -c "import cv2, face_recognition, numpy, flask; print('✅ All packages imported successfully!')"

echo.
echo Installation complete!
echo You can now run: python app.py
pause

# Image Processing Web Application

A modern web application for image processing with Python Flask backend and vanilla JavaScript frontend.

## 🌟 Features

- **Image Upload**: Drag & drop or click to upload images
- **Real-time Processing**: Apply filters instantly
- **Multiple Filters**: Grayscale, Blur, Sharpen, Edge Detection (4 reliable filters)
- **Download Results**: Save processed images
- **Responsive Design**: Works on desktop and mobile
- **Clean UI**: White background with orange accents, no gradients

## 📁 Project Structure

```
task-250703/
├── backend/           # Python Flask API
│   ├── app.py        # Main Flask application
│   ├── requirements.txt
│   └── test_api.py   # API testing script
├── frontend/         # Web frontend
│   ├── index.html    # Main HTML page
│   ├── script.js     # JavaScript functionality
│   └── styles.css    # CSS styling
└── README.md         # This file
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Run setup script:**
   ```bash
   python setup.py
   ```
   This will install dependencies, create demo images, and prepare the environment.

2. **Start the application:**
   ```bash
   # Combined frontend + backend (recommended)
   python run.py combined
   # Or use batch file on Windows
   start-combined.bat
   ```
   App will be available at `http://localhost:8080`

### Option 2: Manual Setup

#### Backend Setup
1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the Flask server:**
   ```bash
   python app.py
   # Or use batch file on Windows
   ..\start-backend.bat
   ```
   Server will start on `http://localhost:5000`

#### Frontend Setup
1. **Serve the frontend:**
   ```bash
   cd frontend
   python -m http.server 8000
   # Or use batch file on Windows
   ..\start-frontend.bat
   ```
   Frontend will be available at `http://localhost:8000`

### Option 3: Combined Server
Use the combined server that serves both frontend and backend:
```bash
python serve_app.py
```
Everything available at `http://localhost:8080`

## 🔧 API Endpoints

### Health Check
```
GET /
Response: {"status": "healthy", "message": "Image Processing API is running"}
```

### Process Image
```
POST /process-image
Content-Type: multipart/form-data

Parameters:
- image: Image file (JPEG, PNG, etc.)
- type: Filter type (blur, sharpen, edge, grayscale, sepia, brightness, contrast)

Response: 
{
  "success": true,
  "processed_image": "data:image/jpeg;base64,..."
}
```

## 🎨 Available Filters

- **grayscale**: Convert to grayscale (luminance-based)
- **blur**: Apply Gaussian blur effect
- **sharpen**: Enhance image sharpness using convolution
- **edge**: Edge detection filter using Sobel operator

### 🗑️ Removed Filters
The following filters were removed due to implementation issues:
- ~~**sepia**: Apply sepia tone~~ (removed - causing state pollution)
- ~~**brightness**: Increase brightness~~ (removed - producing grayscale output)
- ~~**contrast**: Enhance contrast~~ (removed - producing grayscale output)

## 🌐 Deployment Options

### Option 1: GitHub Pages + External API
1. Deploy frontend to GitHub Pages
2. Deploy backend to Heroku, Railway, or similar
3. Update API_BASE_URL in script.js

### Option 2: Single Server Deployment
1. Deploy both frontend and backend to same server
2. Configure Flask to serve static files
3. Use relative URLs for API calls

### Option 3: Docker Deployment
1. Create Dockerfile for backend
2. Use nginx to serve frontend
3. Configure reverse proxy

## 🔒 CORS Configuration

Backend includes CORS support for cross-origin requests:
```python
from flask_cors import CORS
CORS(app)  # Enable CORS for all routes
```

## 📱 Mobile Support

- Responsive design works on mobile devices
- Touch-friendly interface
- Optimized for various screen sizes

## 🧪 Testing

### Automated Testing
```bash
# Run comprehensive integration tests
python test_integration_simple.py

# Test with demo images
python test_demo_images.py

# Test backend API only
cd backend
python test_api.py
```

### Demo Images
The project includes demo images for testing:
- `colored_squares.png` - Good for filter comparison
- `gradient.png` - Good for blur/sharpen effects
- `checkerboard.png` - Good for edge detection
- `text_demo.png` - Good for text processing
- `high_contrast.png` - Good for all filters

Create additional demo images:
```bash
python create_demo_images.py
```

## 📝 Development Notes

- Frontend uses vanilla JavaScript (no frameworks)
- Backend uses Flask with Pillow for image processing
- Clean, minimalist design following specified requirements
- No external CDNs - all assets are local

## 🎯 Browser Compatibility

- Modern browsers with HTML5 support
- File API support for image upload
- Canvas API for image display

## 📄 License

This project is created for educational purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Ready for deployment to GitHub Pages and external hosting!** 🚀

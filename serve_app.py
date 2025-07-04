#!/usr/bin/env python3
"""
Combined Flask app serving both frontend and backend for task-250703
Serves frontend from static/ folder and provides API endpoints
"""
import os
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from PIL import Image, ImageFilter
import io
import base64

# Create Flask app with static folder for frontend
app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)  # Enable CORS for all routes

# Serve static files (frontend)
@app.route('/')
def serve_frontend():
    return send_from_directory('static', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    # Serve static files but avoid conflicts with API routes
    if filename.startswith('api/'):
        return jsonify({"error": "API endpoint not found"}), 404
    return send_from_directory('static', filename)

# API endpoints (from original app.py)
@app.route('/api/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Image Processing API is running"})

@app.route('/api/process-image', methods=['POST'])
def process_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No image file selected"}), 400
        
        process_type = request.form.get('type', 'grayscale')
        
        image = Image.open(file.stream)
        
        if process_type == 'grayscale':
            processed_image = image.convert('L')
        elif process_type == 'blur':
            processed_image = image.filter(ImageFilter.BLUR)
        elif process_type == 'sharpen':
            processed_image = image.filter(ImageFilter.SHARPEN)
        elif process_type == 'edge':
            processed_image = image.filter(ImageFilter.FIND_EDGES)
        elif process_type == 'sepia':
            # Convert to sepia tone
            grayscale = image.convert('L')
            sepia = Image.new('RGB', grayscale.size)
            pixels = sepia.load()
            gray_pixels = grayscale.load()

            for i in range(grayscale.width):
                for j in range(grayscale.height):
                    gray = gray_pixels[i, j]
                    # Sepia formula
                    r = min(255, int(gray * 1.0))
                    g = min(255, int(gray * 0.8))
                    b = min(255, int(gray * 0.6))
                    pixels[i, j] = (r, g, b)
            processed_image = sepia
        elif process_type == 'brightness':
            # Increase brightness
            from PIL import ImageEnhance
            enhancer = ImageEnhance.Brightness(image)
            processed_image = enhancer.enhance(1.3)
        elif process_type == 'contrast':
            # Increase contrast
            from PIL import ImageEnhance
            enhancer = ImageEnhance.Contrast(image)
            processed_image = enhancer.enhance(1.2)
        else:
            # Default to grayscale
            processed_image = image.convert('L')
        
        img_buffer = io.BytesIO()
        processed_image.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        
        return jsonify({
            "success": True,
            "processed_image": f"data:image/png;base64,{img_base64}",
            "process_type": process_type
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)

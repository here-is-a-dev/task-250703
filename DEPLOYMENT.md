# Deployment Guide

## 🌐 GitHub Pages + External Backend Deployment

### Step 1: Deploy Frontend to GitHub Pages

1. **Create GitHub Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Image Processing Web App"
   git branch -M main
   git remote add origin https://github.com/yourusername/image-processing-app.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

3. **Configure Frontend for GitHub Pages:**
   - Frontend will be available at: `https://yourusername.github.io/image-processing-app/frontend/`
   - Update `script.js` if needed for production API URL

### Step 2: Deploy Backend to Cloud Platform

#### Option A: Railway Deployment
1. **Create Railway Account:** https://railway.app
2. **Deploy from GitHub:**
   - Connect GitHub repository
   - Select backend folder
   - Railway auto-detects Python app
   - Environment variables: Set `PORT` if needed

#### Option B: Heroku Deployment
1. **Create Heroku Account:** https://heroku.com
2. **Install Heroku CLI**
3. **Deploy:**
   ```bash
   cd backend
   heroku create your-app-name
   git init
   git add .
   git commit -m "Backend deployment"
   heroku git:remote -a your-app-name
   git push heroku main
   ```

#### Option C: Render Deployment
1. **Create Render Account:** https://render.com
2. **Create Web Service:**
   - Connect GitHub repository
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `python app.py`

### Step 3: Update Frontend Configuration

Update `frontend/script.js` with your backend URL:
```javascript
const API_BASE_URL = 'https://your-backend-url.com';
```

## 🔧 Environment Variables

### Backend Environment Variables:
- `PORT`: Server port (default: 5000)
- `FLASK_ENV`: Set to 'production' for production deployment

### Example .env file for backend:
```
PORT=5000
FLASK_ENV=production
```

## 🚀 Alternative: Single Server Deployment

### Deploy Both Frontend and Backend Together

1. **Modify Flask app to serve static files:**
   ```python
   from flask import Flask, send_from_directory
   
   app = Flask(__name__, static_folder='../frontend', static_url_path='')
   
   @app.route('/')
   def index():
       return send_from_directory('../frontend', 'index.html')
   ```

2. **Deploy to single platform:**
   - Railway, Heroku, or Render
   - Include both backend and frontend folders
   - Update start command to serve both

## 📱 Mobile-Optimized Deployment

### GitHub Pages Configuration:
1. **Create `frontend/_config.yml`:**
   ```yaml
   title: Image Processing App
   description: Modern web app for image processing
   ```

2. **Add mobile meta tags** (already included in index.html):
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

## 🔒 Security Considerations

### Production Security:
1. **CORS Configuration:**
   ```python
   from flask_cors import CORS
   CORS(app, origins=['https://yourusername.github.io'])
   ```

2. **File Upload Limits:**
   ```python
   app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
   ```

3. **Input Validation:**
   - Already implemented in backend
   - File type checking
   - Size limits

## 🧪 Testing Deployment

### Test Frontend:
1. Open GitHub Pages URL
2. Test image upload
3. Verify all filters work
4. Check mobile responsiveness

### Test Backend:
1. Test health endpoint: `GET /`
2. Test image processing: `POST /process-image`
3. Check CORS headers
4. Verify error handling

### Integration Testing:
```bash
# Test API from frontend
curl -X POST https://your-backend-url.com/process-image \
  -F "image=@test-image.jpg" \
  -F "type=blur"
```

## 📊 Monitoring

### Backend Monitoring:
- Check server logs for errors
- Monitor response times
- Track API usage

### Frontend Monitoring:
- Browser console for JavaScript errors
- Network tab for API call failures
- Mobile device testing

## 🔄 CI/CD Setup (Optional)

### GitHub Actions for Auto-Deployment:
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend
```

## 🎯 Performance Optimization

### Frontend Optimization:
- Minify CSS/JS for production
- Optimize images
- Enable browser caching

### Backend Optimization:
- Use gunicorn for production
- Enable gzip compression
- Implement caching headers

---

**Your image processing app is ready for production deployment!** 🚀

Choose your preferred deployment method and follow the steps above.

# Deploy to Render.com

## Lỗi đã sửa:

### 1. **Python Version Compatibility**
- ✅ Thay đổi từ Python 3.13 → Python 3.11.9 (tương thích với numpy)
- ✅ Tạo file `runtime.txt` chỉ định Python version

### 2. **Dependencies Issues**
- ✅ Cập nhật `opencv-python` → `opencv-python-headless` (cho server)
- ✅ Cập nhật numpy version tương thích
- ✅ Thêm setuptools và wheel

### 3. **Production Configuration**
- ✅ Tạo `Procfile` cho gunicorn
- ✅ Tạo `render.yaml` config
- ✅ Cập nhật app.py cho production

## Files đã tạo/cập nhật:

### `backend/requirements.txt`
```
Flask==3.0.0
Flask-CORS==4.0.0
Pillow==10.4.0
gunicorn==21.2.0
requests==2.31.0
opencv-python-headless==4.10.0.84
numpy==1.26.4
setuptools==75.6.0
wheel==0.45.1
```

### `backend/runtime.txt`
```
python-3.11.9
```

### `backend/Procfile`
```
web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120
```

### `render.yaml`
```yaml
services:
  - type: web
    name: face-recognition-backend
    env: python
    region: singapore
    plan: free
    buildCommand: pip install -r backend/requirements.txt
    startCommand: cd backend && gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.9
      - key: FLASK_ENV
        value: production
      - key: FLASK_APP
        value: app.py
    healthCheckPath: /
```

## Cách deploy:

### Option 1: Auto Deploy từ GitHub
1. Push code lên GitHub repository
2. Connect repository với Render.com
3. Render sẽ tự động deploy theo `render.yaml`

### Option 2: Manual Deploy
1. Vào [render.com](https://render.com)
2. Tạo new Web Service
3. Connect GitHub repo: `https://github.com/here-is-a-dev/task-250703_`
4. Settings:
   - **Environment**: Python
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120`
   - **Python Version**: 3.11.9

### Option 3: Deploy từ local
```bash
# 1. Install Render CLI
npm install -g @render/cli

# 2. Login
render login

# 3. Deploy
render deploy
```

## Environment Variables cần thiết:

```
FLASK_ENV=production
FLASK_APP=app.py
PYTHON_VERSION=3.11.9
```

## Troubleshooting:

### Nếu vẫn lỗi numpy:
```
# Thử version khác
numpy==1.25.2
# hoặc
numpy>=1.24.0,<1.27.0
```

### Nếu lỗi OpenCV:
```
# Thử version khác
opencv-python-headless==4.9.0.80
# hoặc bỏ OpenCV và chỉ dùng PIL
```

### Nếu lỗi memory:
- Giảm workers: `--workers 1`
- Tăng timeout: `--timeout 180`
- Upgrade plan từ Free → Starter

## Test sau khi deploy:

```bash
# Test API health
curl https://your-app.onrender.com/

# Test face detection
curl -X POST https://your-app.onrender.com/detect-faces \
  -F "image=@test.jpg"

# Test registered faces
curl https://your-app.onrender.com/registered-faces
```

## Expected URLs:

- **Backend API**: `https://face-recognition-backend.onrender.com`
- **Frontend**: Deploy riêng trên Firebase Hosting
- **Health Check**: `https://face-recognition-backend.onrender.com/`

## Cập nhật Frontend:

Sau khi backend deploy thành công, cập nhật API_BASE_URL trong frontend:

```javascript
// frontend/script.js
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://face-recognition-backend.onrender.com'; // Thay bằng URL thực tế
```

## Notes:

- ✅ Free tier Render có giới hạn: 750 hours/month
- ✅ App sẽ sleep sau 15 phút không hoạt động
- ✅ Cold start có thể mất 30-60 giây
- ✅ Nên upgrade plan cho production use

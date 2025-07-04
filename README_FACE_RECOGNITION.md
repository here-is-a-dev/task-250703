# Image Processing & Face Recognition App

Ứng dụng xử lý ảnh và nhận diện khuôn mặt với 2 chức năng chính:
1. **Image Processing**: Xử lý ảnh với các filter cơ bản
2. **Face Recognition**: Chụp hình và nhận diện khuôn mặt

## Tính năng

### 📷 Image Processing (Tab 1)
- ✅ **File Upload**: Upload ảnh từ thiết bị (drag & drop)
- ✅ **Image Filters**: 4 filter cơ bản (Grayscale, Blur, Sharpen, Edge Detection)
- ✅ **Real-time Processing**: Xử lý ảnh tức thì
- ✅ **Download Results**: Tải ảnh đã xử lý
- ✅ **Responsive Design**: Tương thích mobile

### 👤 Face Recognition (Tab 2)
- ✅ **Real-time Detection**: Quét khuôn mặt liên tục qua camera
- ✅ **Live Overlay**: Hiển thị bounding box trực tiếp trên video
- ✅ **Auto Attendance**: Tự động chấm công khi nhận diện được
- ✅ **Face Registration**: Đăng ký khuôn mặt mới trong thời gian thực
- ✅ **Firebase Integration**: Lưu trữ dữ liệu trên Firestore
- ✅ **Attendance Log**: Theo dõi lịch sử chấm công
- ✅ **Mobile Support**: Tương thích với Android WebView
- ❌ **File Upload**: Không hỗ trợ upload ảnh (chỉ camera realtime)

### 🔧 Backend (Python Flask)
- ✅ **Image Processing API**: `/process-image` - Xử lý ảnh với filters
- ✅ **Face Detection API**: `/detect-faces` - Phát hiện khuôn mặt trong ảnh
- ✅ **Face Registration API**: `/register-face` - Đăng ký khuôn mặt mới
- ✅ **Face Database**: Lưu trữ face data trong memory
- ✅ **CORS Support**: Hỗ trợ cross-origin requests

### 🔥 Firebase Integration
- ✅ **Firestore Database**: Lưu trữ attendance và registered faces
- ✅ **Firebase Storage**: Lưu trữ ảnh khuôn mặt (future)
- ✅ **Firebase Analytics**: Theo dõi usage
- ✅ **Security Rules**: Bảo vệ dữ liệu cá nhân và chấm công
- ✅ **Real-time Updates**: Đồng bộ dữ liệu realtime

## Cài đặt và Chạy

### Backend
```bash
cd task-250703/backend
pip install -r requirements.txt
python app.py
```

Backend sẽ chạy tại: `http://localhost:5000`

### Frontend
```bash
cd task-250703/frontend
# Mở file index.html trong browser hoặc serve với HTTP server
python -m http.server 8000
```

Frontend sẽ chạy tại: `http://localhost:8000`

## Cách sử dụng

### 📷 Image Processing Tab
1. Click tab "📷 Image Processing"
2. Upload ảnh bằng cách:
   - Click vào upload area hoặc
   - Drag & drop ảnh vào area
3. Chọn filter type (Grayscale, Blur, Sharpen, Edge Detection)
4. Click "Process Image"
5. Download kết quả nếu muốn

### 👤 Face Recognition Tab
1. Click tab "👤 Face Recognition"

**Real-time Detection:**
1. Click "Start Real-time Detection" để bật camera
2. Hệ thống sẽ tự động quét và nhận diện khuôn mặt
3. Khuôn mặt được nhận diện sẽ có bounding box màu xanh (known) hoặc cam (unknown)
4. Chấm công tự động cho người đã đăng ký

**Đăng ký khuôn mặt mới:**
1. Khi có khuôn mặt chưa biết xuất hiện
2. Click "Register Current Face"
3. Nhập tên và confirm
4. Khuôn mặt sẽ được lưu vào database

**Xem attendance:**
1. Scroll xuống "Attendance Log" section
2. Xem danh sách người đã chấm công
3. Click "Clear Attendance" để xóa log

## API Endpoints

### GET `/`
Health check endpoint
```json
{
  "status": "healthy",
  "message": "Face Recognition API is running"
}
```

### POST `/detect-faces`
Phát hiện khuôn mặt trong ảnh
- **Input**: Form data với file `image`
- **Output**: JSON với thông tin các khuôn mặt được phát hiện

### POST `/register-face`
Đăng ký khuôn mặt mới
- **Input**: Form data với `image` và `name`
- **Output**: JSON confirmation

### GET `/registered-faces`
Lấy danh sách khuôn mặt đã đăng ký
- **Output**: JSON với danh sách tên

## Testing

Chạy test script để kiểm tra API:
```bash
cd task-250703
python test_face_recognition.py
```

## Kiến trúc

```
Frontend (HTML/CSS/JS)
    ↓ HTTP Requests
Backend (Flask + OpenCV + face_recognition)
    ↓ In-memory storage
Face Database (encodings + names)
```

## Dependencies

### Frontend
- Vanilla JavaScript (ES6+)
- HTML5 Camera API
- Canvas API for image processing

### Backend
- Flask 3.0.0
- OpenCV 4.8.1.78
- face_recognition 1.3.0
- numpy 1.24.3
- Pillow 10.4.0

## Đặc điểm kỹ thuật

- **Face Detection**: Sử dụng HOG + Linear SVM
- **Face Recognition**: 128-dimensional face encodings
- **Accuracy**: ~99.38% trên LFW dataset
- **Performance**: ~1-2 giây per image trên CPU
- **Storage**: In-memory (restart sẽ mất data)
- **Image Formats**: JPG, PNG, GIF, WebP
- **Camera**: Hỗ trợ getUserMedia API

## Limitations

- Face database chỉ lưu trong memory (restart sẽ mất data)
- Chỉ hỗ trợ 1 khuôn mặt per registration
- Cần lighting tốt để detection chính xác
- CPU-based processing (chậm hơn GPU)

## Future Improvements

- [ ] Persistent database (SQLite/PostgreSQL)
- [ ] Multiple faces per person
- [ ] Attendance logging
- [ ] Real-time video detection
- [ ] GPU acceleration
- [ ] Face anti-spoofing
- [ ] Age/gender detection

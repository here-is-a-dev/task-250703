// Configuration - Auto-detect API base URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://face-recognition-backend.onrender.com'; // Update with your Render.com URL

// DOM Elements - Navigation
let imageProcessingTab, faceRecognitionTab, imageProcessingSection, faceRecognitionSection;

// Initialize DOM elements safely
function initializeDOM() {
    try {
        // Navigation elements
        imageProcessingTab = document.getElementById('imageProcessingTab');
        faceRecognitionTab = document.getElementById('faceRecognitionTab');
        imageProcessingSection = document.getElementById('imageProcessingSection');
        faceRecognitionSection = document.getElementById('faceRecognitionSection');

        console.log('DOM Elements Check:');
        console.log('imageProcessingTab:', !!imageProcessingTab);
        console.log('faceRecognitionTab:', !!faceRecognitionTab);
        console.log('imageProcessingSection:', !!imageProcessingSection);
        console.log('faceRecognitionSection:', !!faceRecognitionSection);

        if (!imageProcessingTab || !faceRecognitionTab) {
            console.error('❌ Navigation elements not found!');
            return false;
        }

        // Image Processing elements
        uploadArea = document.getElementById('uploadArea');
        imageInput = document.getElementById('imageInput');
        processType = document.getElementById('processType');
        processBtn = document.getElementById('processBtn');
        originalImage = document.getElementById('originalImage');
        processedImage = document.getElementById('processedImage');
        downloadBtn = document.getElementById('downloadBtn');

        // Face Recognition elements
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        overlayCanvas = document.getElementById('overlayCanvas');
        cameraPlaceholder = document.getElementById('cameraPlaceholder');
        startCameraBtn = document.getElementById('startCameraBtn');
        stopCameraBtn = document.getElementById('stopCameraBtn');
        registerBtn = document.getElementById('registerBtn');
        capturedImage = document.getElementById('capturedImage');
        faceInfo = document.getElementById('faceInfo');
        attendanceList = document.getElementById('attendanceList');
        clearAttendanceBtn = document.getElementById('clearAttendanceBtn');

        // Common elements
        resultsSection = document.getElementById('resultsSection');
        loading = document.getElementById('loading');
        loadingText = document.getElementById('loadingText');



        console.log('All DOM elements initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Error initializing DOM:', error);
        return false;
    }
}

// DOM Elements - Image Processing (will be initialized in initializeDOM)
let uploadArea, imageInput, processType, processBtn, originalImage, processedImage, downloadBtn;

// DOM Elements - Face Recognition (will be initialized in initializeDOM)
let video, canvas, overlayCanvas, cameraPlaceholder, startCameraBtn, stopCameraBtn, registerBtn;
let capturedImage, faceInfo, attendanceList, clearAttendanceBtn;

// Common Elements (will be initialized in initializeDOM)
let resultsSection, loading, loadingText;

// State Variables
let selectedFile = null;
let processedImageData = null;
let stream = null;
let currentTab = 'imageProcessing';
let permissionGranted = false;
let isDetecting = false;
let detectionInterval = null;
let currentFaceData = null;



// Check if running in Android WebView
const isAndroidWebView = /(Android.*wv\)|ImageProcessingApp)/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);

// Event Listeners - Will be initialized after DOM is ready
function initializeEventListeners() {
    try {
        console.log('Initializing event listeners...');

        // Navigation
        if (imageProcessingTab && faceRecognitionTab) {
            imageProcessingTab.addEventListener('click', () => switchTab('imageProcessing'));
            faceRecognitionTab.addEventListener('click', () => switchTab('faceRecognition'));
            console.log('✅ Navigation listeners added');
        }

        // Image Processing
        if (uploadArea && imageInput && processBtn && downloadBtn) {
            uploadArea.addEventListener('click', handleUploadAreaClick);
            uploadArea.addEventListener('dragover', handleDragOver);
            uploadArea.addEventListener('dragleave', handleDragLeave);
            uploadArea.addEventListener('drop', handleDrop);
            imageInput.addEventListener('change', handleFileSelect);
            processBtn.addEventListener('click', processImage);
            downloadBtn.addEventListener('click', downloadProcessedImage);
            console.log('✅ Image processing listeners added');
        }

        // Face Recognition
        if (startCameraBtn && stopCameraBtn && registerBtn && clearAttendanceBtn) {
            startCameraBtn.addEventListener('click', startRealTimeDetection);
            stopCameraBtn.addEventListener('click', stopRealTimeDetection);
            registerBtn.addEventListener('click', registerCurrentFace);
            clearAttendanceBtn.addEventListener('click', clearAttendance);
            console.log('✅ Face recognition listeners added');
        }

        return true;
    } catch (error) {
        console.error('❌ Error initializing event listeners:', error);
        return false;
    }
}

// Tab Switching - Make it global for onclick access
window.switchTab = function(tabName) {
    try {
        console.log(`Switching to tab: ${tabName}`);

        // Update tab buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        if (tabName === 'imageProcessing') {
            const tab = document.getElementById('imageProcessingTab');
            const section = document.getElementById('imageProcessingSection');

            if (tab && section) {
                tab.classList.add('active');
                section.classList.add('active');
                currentTab = 'imageProcessing';

                // Reset results section for image processing
                resetResultsSection();
                const originalTitle = document.getElementById('originalImageTitle');
                const processedTitle = document.getElementById('processedImageTitle');
                if (originalTitle) originalTitle.textContent = 'Original Image';
                if (processedTitle) processedTitle.textContent = 'Processed Image';

                console.log('✅ Switched to Image Processing tab');
            } else {
                console.error('❌ Image Processing tab elements not found');
            }

        } else if (tabName === 'faceRecognition') {
            const tab = document.getElementById('faceRecognitionTab');
            const section = document.getElementById('faceRecognitionSection');

            if (tab && section) {
                tab.classList.add('active');
                section.classList.add('active');
                currentTab = 'faceRecognition';

                // Reset results section for face recognition
                resetResultsSection();
                const originalTitle = document.getElementById('originalImageTitle');
                const processedTitle = document.getElementById('processedImageTitle');
                if (originalTitle) originalTitle.textContent = 'Captured Image';
                if (processedTitle) processedTitle.textContent = 'Face Detection Result';

                console.log('✅ Switched to Face Recognition tab');
            } else {
                console.error('❌ Face Recognition tab elements not found');
            }
        }


    } catch (error) {
        console.error('❌ Error switching tabs:', error);
    }
};

function resetResultsSection() {
    try {
        if (resultsSection) resultsSection.style.display = 'none';
        if (originalImage) originalImage.style.display = 'none';
        if (processedImage) processedImage.style.display = 'none';
        if (capturedImage) capturedImage.style.display = 'none';
        if (faceInfo) faceInfo.style.display = 'none';
        if (downloadBtn) downloadBtn.style.display = 'none';
    } catch (error) {
        console.error('Error resetting results section:', error);
    }
}



// Check API Health
async function checkAPIHealth() {
    const statusElement = document.getElementById('backend-status');

    try {
        if (statusElement) statusElement.textContent = 'Checking...';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${API_BASE_URL}/`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            console.log('API is healthy:', data);
            if (statusElement) {
                statusElement.textContent = '✅ Online';
                statusElement.style.color = '#28a745';
            }
            return true;
        }
    } catch (error) {
        console.warn('API health check failed:', error);
        if (statusElement) {
            if (error.name === 'AbortError') {
                statusElement.textContent = '😴 Sleeping (will wake up when needed)';
                statusElement.style.color = '#ffc107';
            } else {
                statusElement.textContent = '❌ Offline';
                statusElement.style.color = '#dc3545';
            }
        }
    }
    return false;
}

// ===== FIREBASE FUNCTIONS =====

// Initialize Firebase functions
function initFirebase() {
    // Firebase is already initialized in HTML
    console.log('Firebase initialized successfully');
}

// Save attendance to Firestore
async function saveAttendance(name, confidence, timestamp) {
    try {
        const { addDoc, collection } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js");

        await addDoc(collection(window.firebaseDb, 'attendance'), {
            name: name,
            confidence: confidence,
            timestamp: timestamp,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            createdAt: new Date()
        });

        console.log('Attendance saved to Firestore');
    } catch (error) {
        console.error('Error saving attendance:', error);
    }
}

// Save registered face to Firestore
async function saveRegisteredFace(name, faceData) {
    try {
        const { addDoc, collection } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js");

        await addDoc(collection(window.firebaseDb, 'registered_faces'), {
            name: name,
            faceData: faceData,
            registeredAt: new Date(),
            isActive: true
        });

        console.log('Face registered to Firestore');
    } catch (error) {
        console.error('Error saving registered face:', error);
    }
}

// ===== REAL-TIME FACE DETECTION =====

// Start Real-time Detection
async function startRealTimeDetection() {
    try {
        loadingText.textContent = 'Starting camera...';
        loading.style.display = 'block';

        // Request camera permission
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }
        });

        video.srcObject = stream;
        video.style.display = 'block';
        overlayCanvas.style.display = 'block';
        cameraPlaceholder.style.display = 'none';

        // Setup overlay canvas
        video.onloadedmetadata = () => {
            overlayCanvas.width = video.videoWidth;
            overlayCanvas.height = video.videoHeight;
            overlayCanvas.style.width = video.offsetWidth + 'px';
            overlayCanvas.style.height = video.offsetHeight + 'px';
        };

        startCameraBtn.style.display = 'none';
        stopCameraBtn.style.display = 'inline-block';
        stopCameraBtn.disabled = false;

        isDetecting = true;
        startDetectionLoop();

        loading.style.display = 'none';

    } catch (error) {
        console.error('Error starting camera:', error);
        loading.style.display = 'none';
        alert('Failed to start camera. Please check permissions.');
    }
}

// Stop Real-time Detection
function stopRealTimeDetection() {
    isDetecting = false;

    if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
    }

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    video.style.display = 'none';
    overlayCanvas.style.display = 'none';
    cameraPlaceholder.style.display = 'block';

    startCameraBtn.style.display = 'inline-block';
    stopCameraBtn.style.display = 'none';
    registerBtn.disabled = true;
    currentFaceData = null;
}

// Detection Loop
function startDetectionLoop() {
    detectionInterval = setInterval(async () => {
        if (!isDetecting || !video.videoWidth) return;

        try {
            // Capture current frame
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            // Convert to blob and send to backend
            canvas.toBlob(async (blob) => {
                if (!blob) return;

                const formData = new FormData();
                formData.append('image', blob, 'frame.jpg');

                try {
                    const response = await fetch(`${API_BASE_URL}/detect-faces`, {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                            drawRealTimeDetections(result);

                            // Auto-attendance for known faces
                            result.faces.forEach(face => {
                                if (face.is_known && face.confidence > 0.7) {
                                    addAttendanceRecord(face.name, face.confidence);
                                }
                            });

                            // Enable register button if unknown face detected
                            const unknownFaces = result.faces.filter(f => !f.is_known);
                            if (unknownFaces.length > 0) {
                                currentFaceData = result;
                                registerBtn.disabled = false;
                            } else {
                                registerBtn.disabled = true;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Detection error:', error);
                }
            }, 'image/jpeg', 0.8);

        } catch (error) {
            console.error('Frame capture error:', error);
        }
    }, 1000); // Detect every 1 second
}

// Draw Real-time Detections
function drawRealTimeDetections(apiResult) {
    const overlayCtx = overlayCanvas.getContext('2d');

    // Clear previous drawings
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Draw face detections
    apiResult.faces.forEach((face) => {
        const { top, right, bottom, left } = face.location;
        const width = right - left;
        const height = bottom - top;

        // Draw bounding box
        overlayCtx.strokeStyle = face.is_known ? '#28a745' : '#ff6b35';
        overlayCtx.lineWidth = 3;
        overlayCtx.strokeRect(left, top, width, height);

        // Draw face label
        overlayCtx.fillStyle = face.is_known ? '#28a745' : '#ff6b35';
        overlayCtx.font = 'bold 16px Arial';
        const label = face.is_known ?
            `${face.name} (${(face.confidence * 100).toFixed(1)}%)` :
            `Unknown Face`;

        // Background for text
        const textMetrics = overlayCtx.measureText(label);
        overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        overlayCtx.fillRect(left, top - 25, textMetrics.width + 10, 20);

        // Text
        overlayCtx.fillStyle = 'white';
        overlayCtx.fillText(label, left + 5, top - 8);
    });
}

// Add Attendance Record
function addAttendanceRecord(name, confidence) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();

    // Check if already recorded in last 5 minutes
    const recentAttendance = document.querySelectorAll('.attendance-item');
    for (let item of recentAttendance) {
        const itemName = item.querySelector('.attendance-name').textContent;
        const itemTime = item.querySelector('.attendance-time').textContent;
        const itemDate = itemTime.split(' ')[0];

        if (itemName === name && itemDate === dateString) {
            const recordTime = new Date(itemDate + ' ' + itemTime.split(' ')[1]);
            const timeDiff = (now - recordTime) / (1000 * 60); // minutes

            if (timeDiff < 5) {
                return; // Skip if recorded within 5 minutes
            }
        }
    }

    // Create attendance item
    const attendanceItem = document.createElement('div');
    attendanceItem.className = 'attendance-item';
    attendanceItem.innerHTML = `
        <div>
            <div class="attendance-name">${name}</div>
            <div class="attendance-confidence">Confidence: ${(confidence * 100).toFixed(1)}%</div>
        </div>
        <div class="attendance-time">${dateString} ${timeString}</div>
    `;

    // Add to list
    if (attendanceList.children[0].textContent === 'No attendance records yet') {
        attendanceList.innerHTML = '';
    }

    attendanceList.insertBefore(attendanceItem, attendanceList.firstChild);

    // Save to Firebase
    saveAttendance(name, confidence, now);

    console.log(`Attendance recorded for ${name} at ${timeString}`);
}

// Register Current Face
async function registerCurrentFace() {
    if (!currentFaceData) {
        alert('No face data available for registration');
        return;
    }

    const name = prompt('Enter name for the detected face:');
    if (!name || !name.trim()) {
        return;
    }

    try {
        loadingText.textContent = 'Registering face...';
        loading.style.display = 'block';

        // Capture current frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Convert to blob
        canvas.toBlob(async (blob) => {
            if (!blob) {
                loading.style.display = 'none';
                alert('Failed to capture image for registration');
                return;
            }

            const formData = new FormData();
            formData.append('image', blob, 'register.jpg');
            formData.append('name', name.trim());

            try {
                const response = await fetch(`${API_BASE_URL}/register-face`, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        alert(`Face registered successfully for ${name}!`);

                        // Save to Firebase
                        await saveRegisteredFace(name.trim(), currentFaceData);

                        registerBtn.disabled = true;
                        currentFaceData = null;
                    } else {
                        throw new Error(result.error || 'Registration failed');
                    }
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Error registering face: ' + error.message);
            }

            loading.style.display = 'none';
        }, 'image/jpeg', 0.8);

    } catch (error) {
        console.error('Error in registration process:', error);
        loading.style.display = 'none';
        alert('Error in registration process: ' + error.message);
    }
}

// Clear Attendance
function clearAttendance() {
    if (confirm('Are you sure you want to clear all attendance records?')) {
        attendanceList.innerHTML = '<p>No attendance records yet</p>';
    }
}

// ===== IMAGE PROCESSING FUNCTIONS =====

// Handle upload area click with permission check
function handleUploadAreaClick() {
    if (isAndroidWebView) {
        requestStoragePermission().then(() => {
            if (permissionGranted) {
                imageInput.click();
            }
        });
    } else {
        imageInput.click();
    }
}

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        handleFile(files[0]);
    }
}

// File Selection Handler for Image Processing
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
}

// File Processing for Image Processing
function handleFile(file) {
    selectedFile = file;

    // Display preview
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
        originalImage.style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Update UI
    uploadArea.innerHTML = `
        <div class="upload-content">
            <div class="upload-icon">✅</div>
            <p>File selected: ${file.name}</p>
            <p style="font-size: 0.9rem; color: #666; margin-top: 5px;">
                Click to select a different image
            </p>
        </div>
    `;

    processBtn.disabled = false;
}

// Image Processing
async function processImage() {
    if (!selectedFile) {
        alert('Please select an image first');
        return;
    }

    // Show loading
    loadingText.textContent = 'Processing image...';
    loading.style.display = 'block';
    resultsSection.style.display = 'none';
    processBtn.disabled = true;

    try {
        // First, wake up the backend if it's sleeping
        loadingText.textContent = 'Connecting to server...';

        // Enhanced backend wake-up logic
        let backendReady = false;
        let attempts = 0;
        const maxAttempts = 3;

        while (!backendReady && attempts < maxAttempts) {
            attempts++;
            try {
                loadingText.textContent = `Checking server status... (${attempts}/${maxAttempts})`;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

                const healthCheck = await fetch(`${API_BASE_URL}/`, {
                    method: 'GET',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (healthCheck.ok) {
                    const response = await healthCheck.json();
                    if (response.status === 'healthy') {
                        backendReady = true;
                        loadingText.textContent = 'Server ready! Processing image...';
                        break;
                    }
                }
            } catch (healthError) {
                console.log(`Health check attempt ${attempts} failed:`, healthError);

                if (attempts < maxAttempts) {
                    loadingText.textContent = `Server sleeping, waking up... (${attempts}/${maxAttempts})`;
                    // Progressive delay: 5s, 10s, 15s
                    await new Promise(resolve => setTimeout(resolve, 5000 * attempts));
                } else {
                    loadingText.textContent = 'Server may be slow, trying anyway...';
                    // Continue with processing even if health check fails
                }
            }
        }

        loadingText.textContent = 'Processing image...';

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('type', processType.value);

        // Create abort controller for longer timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

        const response = await fetch(`${API_BASE_URL}/process-image`, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || 'Server error'}`);
        }

        const result = await response.json();

        if (result.success) {
            // Display processed image
            processedImage.src = result.processed_image;
            processedImage.style.display = 'block';
            processedImageData = result.processed_image;
            downloadBtn.style.display = 'block';

            // Show results
            resultsSection.style.display = 'block';
            loading.style.display = 'none';
        } else {
            throw new Error(result.error || 'Processing failed');
        }

    } catch (error) {
        console.error('Error processing image:', error);

        let errorMessage = 'Error processing image: ';
        if (error.name === 'AbortError') {
            errorMessage += 'Request timed out after 90 seconds. The server may be overloaded or sleeping. Please try again in a few minutes.';
        } else if (error.name === 'TimeoutError') {
            errorMessage += 'Request timed out. Server may be sleeping, please try again.';
        } else if (error.message.includes('404')) {
            errorMessage += 'API endpoint not found. Backend may be down or still starting up. Please wait 30 seconds and try again.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Cannot connect to server. Please check your internet connection or try again later.';
        } else if (error.message.includes('500')) {
            errorMessage += 'Server error occurred. The backend may be overloaded. Please try again.';
        } else {
            errorMessage += error.message + '\n\nTip: If server is sleeping, it may take 30-60 seconds to wake up.';
        }

        alert(errorMessage);
        loading.style.display = 'none';
    } finally {
        processBtn.disabled = false;
    }
}

// Download Processed Image
function downloadProcessedImage() {
    if (!processedImageData) {
        alert('No processed image to download');
        return;
    }

    // Create download link
    const link = document.createElement('a');
    link.href = processedImageData;
    link.download = `processed_${processType.value}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Show Register Dialog
function showRegisterDialog() {
    const name = prompt('Enter name for the new face:');
    if (name && name.trim()) {
        registerFace(name.trim());
    }
}

// Register Face
async function registerFace(name) {
    if (!capturedImageData && !imageInput.files[0]) {
        alert('Please capture a photo or upload an image first');
        return;
    }

    try {
        loadingText.textContent = 'Registering face...';
        loading.style.display = 'block';

        // Prepare form data
        const formData = new FormData();
        formData.append('name', name);

        if (capturedImageData) {
            // Convert base64 to blob
            const response = await fetch(capturedImageData);
            const blob = await response.blob();
            formData.append('image', blob, 'register.jpg');
        } else {
            // Use uploaded file
            formData.append('image', imageInput.files[0]);
        }

        // Send to backend
        const apiResponse = await fetch(`${API_BASE_URL}/register-face`, {
            method: 'POST',
            body: formData
        });

        if (!apiResponse.ok) {
            throw new Error(`HTTP error! status: ${apiResponse.status}`);
        }

        const result = await apiResponse.json();

        if (result.success) {
            alert(`Face registered successfully for ${name}!`);
            // Re-detect faces to update the display
            detectFaces();
        } else {
            throw new Error(result.error || 'Face registration failed');
        }

        loading.style.display = 'none';

    } catch (error) {
        console.error('Error registering face:', error);
        loading.style.display = 'none';
        alert('Error registering face: ' + error.message);
    }
}

// ===== FACE RECOGNITION FUNCTIONS =====
// Note: Face Recognition now only supports real-time camera detection
// File upload is removed as per requirements

// Storage Permission Request (for Android WebView)
async function requestStoragePermission() {
    if (!isAndroidWebView) {
        permissionGranted = true;
        return Promise.resolve();
    }

    try {
        // Check if permissions API is available
        if ('permissions' in navigator) {
            const permission = await navigator.permissions.query({name: 'camera'});
            if (permission.state === 'granted') {
                permissionGranted = true;
                return Promise.resolve();
            }
        }

        // For Android WebView, show permission request message
        showPermissionDialog();

        // Simulate permission request - in real Android app, this would trigger native permission dialog
        return new Promise((resolve) => {
            setTimeout(() => {
                permissionGranted = true;
                hidePermissionDialog();
                resolve();
            }, 1000);
        });

    } catch (error) {
        console.warn('Permission request failed:', error);
        permissionGranted = true; // Fallback to allow file selection
        return Promise.resolve();
    }
}

// Show permission dialog
function showPermissionDialog() {
    const dialog = document.createElement('div');
    dialog.id = 'permissionDialog';
    dialog.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        ">
            <div style="
                background: white;
                padding: 20px;
                border-radius: 8px;
                border: 3px solid #FF6600;
                text-align: center;
                max-width: 300px;
            ">
                <h3 style="color: #FF6600; margin-top: 0;">Storage Permission Required</h3>
                <p>This app needs access to your device storage to select and upload images.</p>
                <div style="margin-top: 15px;">
                    <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #FF6600; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Requesting permission...</p>
                </div>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(dialog);
}

// Hide permission dialog
function hidePermissionDialog() {
    const dialog = document.getElementById('permissionDialog');
    if (dialog) {
        document.body.removeChild(dialog);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Image Processing & Face Recognition App starting...');

    try {
        // Step 1: Initialize DOM elements
        console.log('Step 1: Initializing DOM elements...');
        if (!initializeDOM()) {
            console.error('❌ Failed to initialize DOM elements');
            showErrorMessage('Failed to load application. Please refresh the page.');
            return;
        }

        // Step 2: Initialize event listeners
        console.log('Step 2: Initializing event listeners...');
        if (!initializeEventListeners()) {
            console.error('❌ Failed to initialize event listeners');
            showErrorMessage('Failed to initialize controls. Please refresh the page.');
            return;
        }

        // Step 3: Initialize Firebase
        console.log('Step 3: Initializing Firebase...');
        initFirebase();

        // Step 4: Check API health
        console.log('Step 4: Checking API health...');
        await checkAPIHealth();

        // Step 4.1: Set up periodic health checks
        setInterval(async () => {
            await checkAPIHealth();
        }, 60000); // Check every minute

        // Step 5: Show Android-specific instructions if detected
        if (isAndroidWebView || isAndroid) {
            console.log('Android WebView detected - Enhanced support enabled');

            // Show permission notice for Android devices
            const permissionNotice = document.getElementById('permissionNotice');
            if (permissionNotice) {
                permissionNotice.style.display = 'block';
            }

            // Pre-request permission on Android for better UX
            requestStoragePermission();
        }

        // Step 6: Initialize with Image Processing tab
        console.log('Step 6: Setting default tab...');
        switchTab('imageProcessing');

        console.log('✅ App initialized successfully!');

    } catch (error) {
        console.error('❌ Critical error during initialization:', error);
        showErrorMessage('Critical error occurred. Please refresh the page.');
    }
});

// Show error message to user
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4444;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-family: Arial, sans-serif;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

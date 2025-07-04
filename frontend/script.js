// Configuration - Auto-detect API base URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : '/api'; // Use relative URL for production deployment

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const processType = document.getElementById('processType');
const processBtn = document.getElementById('processBtn');
const resultsSection = document.getElementById('resultsSection');
const originalImage = document.getElementById('originalImage');
const processedImage = document.getElementById('processedImage');
const downloadBtn = document.getElementById('downloadBtn');
const loading = document.getElementById('loading');

let selectedFile = null;
let processedImageData = null;
let permissionGranted = false;

// Check if running in Android WebView
const isAndroidWebView = /(Android.*wv\)|ImageProcessingApp)/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);

// Event Listeners
uploadArea.addEventListener('click', handleUploadAreaClick);
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
imageInput.addEventListener('change', handleFileSelect);
processBtn.addEventListener('click', processImage);
downloadBtn.addEventListener('click', downloadProcessedImage);

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

// File Selection Handler
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
}

// File Processing
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
    loading.style.display = 'block';
    resultsSection.style.display = 'none';
    processBtn.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('type', processType.value);
        
        const response = await fetch(`${API_BASE_URL}/process-image`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Display processed image
            processedImage.src = result.processed_image;
            processedImageData = result.processed_image;
            
            // Show results
            resultsSection.style.display = 'block';
            loading.style.display = 'none';
        } else {
            throw new Error(result.error || 'Processing failed');
        }
        
    } catch (error) {
        console.error('Error processing image:', error);
        alert(`Error processing image: ${error.message}`);
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

// API Health Check
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (response.ok) {
            console.log('API is healthy');
            return true;
        }
    } catch (error) {
        console.warn('API health check failed:', error);
    }
    return false;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAPIHealth();

    // Show Android-specific instructions if detected
    if (isAndroidWebView || isAndroid) {
        console.log('Android WebView detected - Enhanced file upload support enabled');

        // Show permission notice for Android devices
        const permissionNotice = document.getElementById('permissionNotice');
        if (permissionNotice) {
            permissionNotice.style.display = 'block';
        }

        // Add Android-specific styling or instructions if needed
        const header = document.querySelector('header p');
        if (header) {
            header.textContent = 'Upload an image and apply processing filters (Android WebView)';
        }
    }

    // Pre-request permission on Android for better UX
    if (isAndroidWebView) {
        requestStoragePermission();
    }
});

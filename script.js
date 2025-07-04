// Configuration - Auto-detect API base URL
const API_BASE_URL = (() => {
    const hostname = window.location.hostname;

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }

    // GitHub Pages deployment - use external backend
    if (hostname.includes('github.io')) {
        // TODO: Replace with your deployed backend URL
        // For now, use a demo backend or show offline message
        return 'https://task-250703.onrender.com'; // Replace this!
    }

    // Default relative URL for other deployments
    return '/api';
})();

// Fallback mode for offline/demo usage
let OFFLINE_MODE = false;

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
let originalImageData = null; // Store original image data for consistent processing
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

    // Reset previous processing results
    processedImageData = null;
    resultsSection.style.display = 'none';

    // Display preview and store original image data
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImageData = e.target.result; // Store original for consistent processing
        originalImage.src = e.target.result;
        originalImage.style.display = 'block';

        console.log('✅ Original image stored for processing');
        console.log('🔄 Previous processing results cleared');
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

// JavaScript-based image processing for offline mode
function processImageOffline(imageData, filterType) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
            try {
                // Set canvas dimensions
                canvas.width = img.width;
                canvas.height = img.height;

                // Clear canvas completely
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw fresh original image
                ctx.drawImage(img, 0, 0);

                // Get completely fresh image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                console.log(`🎨 Applying ${filterType} filter to fresh ${canvas.width}x${canvas.height} image`);
                console.log(`📊 Original pixel data length: ${data.length}`);

                // Log first pixel before processing
                console.log(`📍 First pixel BEFORE ${filterType}: R=${data[0]}, G=${data[1]}, B=${data[2]}, A=${data[3]}`);

                // Apply filter based on type
                switch(filterType) {
                    case 'grayscale':
                        console.log('🎨 Applying grayscale filter...');
                        for (let i = 0; i < data.length; i += 4) {
                            const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
                            data[i] = gray;     // Red
                            data[i + 1] = gray; // Green
                            data[i + 2] = gray; // Blue
                            // Alpha channel (data[i + 3]) remains unchanged
                        }
                        console.log('✅ Grayscale filter applied');
                        break;

                    case 'sepia':
                        console.log('🎨 Applying sepia filter...');
                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];

                            // Sepia transformation matrix
                            const newR = Math.min(255, Math.round((r * 0.393) + (g * 0.769) + (b * 0.189)));
                            const newG = Math.min(255, Math.round((r * 0.349) + (g * 0.686) + (b * 0.168)));
                            const newB = Math.min(255, Math.round((r * 0.272) + (g * 0.534) + (b * 0.131)));

                            data[i] = newR;
                            data[i + 1] = newG;
                            data[i + 2] = newB;
                        }
                        console.log('✅ Sepia filter applied');
                        break;

                    case 'brightness':
                        console.log('🎨 Applying brightness filter...');
                        const brightnessFactor = 1.5; // More noticeable brightness increase
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = Math.min(255, Math.round(data[i] * brightnessFactor));
                            data[i + 1] = Math.min(255, Math.round(data[i + 1] * brightnessFactor));
                            data[i + 2] = Math.min(255, Math.round(data[i + 2] * brightnessFactor));
                        }
                        console.log('✅ Brightness filter applied');
                        break;

                    case 'contrast':
                        console.log('🎨 Applying contrast filter...');
                        const contrastFactor = 2.0; // More noticeable contrast increase
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = Math.min(255, Math.max(0, Math.round(contrastFactor * (data[i] - 128) + 128)));
                            data[i + 1] = Math.min(255, Math.max(0, Math.round(contrastFactor * (data[i + 1] - 128) + 128)));
                            data[i + 2] = Math.min(255, Math.max(0, Math.round(contrastFactor * (data[i + 2] - 128) + 128)));
                        }
                        console.log('✅ Contrast filter applied');
                        break;

                    case 'blur':
                        // Simple box blur implementation
                        const blurRadius = 2;
                        const originalData = new Uint8ClampedArray(data);

                        for (let y = 0; y < canvas.height; y++) {
                            for (let x = 0; x < canvas.width; x++) {
                                let r = 0, g = 0, b = 0, count = 0;

                                for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                                    for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                                        const nx = x + dx;
                                        const ny = y + dy;

                                        if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                                            const idx = (ny * canvas.width + nx) * 4;
                                            r += originalData[idx];
                                            g += originalData[idx + 1];
                                            b += originalData[idx + 2];
                                            count++;
                                        }
                                    }
                                }

                                const idx = (y * canvas.width + x) * 4;
                                data[idx] = Math.round(r / count);
                                data[idx + 1] = Math.round(g / count);
                                data[idx + 2] = Math.round(b / count);
                            }
                        }
                        break;

                    case 'sharpen':
                        // Sharpen filter using convolution
                        const sharpenKernel = [
                            0, -1, 0,
                            -1, 5, -1,
                            0, -1, 0
                        ];
                        applyConvolution(data, canvas.width, canvas.height, sharpenKernel, 3);
                        break;

                    case 'edge':
                        // Edge detection using Sobel operator
                        const edgeKernel = [
                            -1, -1, -1,
                            -1, 8, -1,
                            -1, -1, -1
                        ];
                        applyConvolution(data, canvas.width, canvas.height, edgeKernel, 3);
                        break;

                    default:
                        console.warn(`Unknown filter: ${filterType}, applying grayscale`);
                        // Default to grayscale
                        for (let i = 0; i < data.length; i += 4) {
                            const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
                            data[i] = gray;
                            data[i + 1] = gray;
                            data[i + 2] = gray;
                        }
                }

                // Log first pixel after processing
                console.log(`📍 First pixel AFTER ${filterType}: R=${data[0]}, G=${data[1]}, B=${data[2]}, A=${data[3]}`);

                // Put processed data back to canvas
                ctx.putImageData(imageData, 0, 0);

                // Convert to data URL
                const result = canvas.toDataURL('image/png', 0.9);
                console.log(`✅ ${filterType} filter applied successfully`);
                resolve(result);

            } catch (error) {
                console.error(`❌ Error applying ${filterType} filter:`, error);
                reject(error);
            }
        };

        img.onerror = function() {
            reject(new Error('Failed to load image for processing'));
        };

        img.src = imageData;
    });
}

// Helper function for convolution filters
function applyConvolution(data, width, height, kernel, kernelSize) {
    const originalData = new Uint8ClampedArray(data);
    const half = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0;

            for (let ky = 0; ky < kernelSize; ky++) {
                for (let kx = 0; kx < kernelSize; kx++) {
                    const nx = x + kx - half;
                    const ny = y + ky - half;

                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const idx = (ny * width + nx) * 4;
                        const weight = kernel[ky * kernelSize + kx];

                        r += originalData[idx] * weight;
                        g += originalData[idx + 1] * weight;
                        b += originalData[idx + 2] * weight;
                    }
                }
            }

            const idx = (y * width + x) * 4;
            data[idx] = Math.min(255, Math.max(0, Math.round(r)));
            data[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
            data[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
        }
    }
}

// Image Processing with backend fallback
async function processImage() {
    if (!selectedFile || !originalImageData) {
        alert('Please select an image first');
        return;
    }

    console.log(`🔄 Processing with filter: ${processType.value}`);
    console.log(`📷 Using original image data: ${originalImageData.substring(0, 50)}...`);

    // Show loading
    loading.style.display = 'block';
    resultsSection.style.display = 'none';
    processBtn.disabled = true;

    try {
        // Try backend first (with timeout)
        if (!OFFLINE_MODE) {
            try {
                console.log(`🔄 Trying backend: ${API_BASE_URL}/process-image`);

                const formData = new FormData();
                formData.append('image', selectedFile);
                formData.append('type', processType.value);

                // Add timeout to prevent hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const response = await fetch(`${API_BASE_URL}/process-image`, {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const result = await response.json();

                    if (result.success) {
                        console.log('✅ Backend processing successful');
                        // Display processed image
                        processedImage.src = result.processed_image;
                        processedImageData = result.processed_image;

                        // Show results
                        resultsSection.style.display = 'block';
                        loading.style.display = 'none';
                        return;
                    } else {
                        throw new Error(result.error || 'Backend processing failed');
                    }
                } else {
                    throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
                }

            } catch (backendError) {
                console.warn('⚠️ Backend failed:', backendError.message);
                // Don't throw here, fall through to offline mode
            }
        }

        // Fallback to offline processing
        console.log('🔄 Using offline image processing...');
        console.log(`📷 Processing original image with ${processType.value} filter`);
        OFFLINE_MODE = true;

        // Use stored original image data instead of re-reading file
        const processedDataUrl = await processImageOffline(originalImageData, processType.value);

        // Display processed image
        processedImage.src = processedDataUrl;
        processedImageData = processedDataUrl;

        // Show results with offline notice
        resultsSection.style.display = 'block';
        loading.style.display = 'none';

        // Show offline mode notice
        showOfflineNotice();

    } catch (error) {
        console.error('Error processing image:', error);
        alert(`Error processing image: ${error.message}`);
        loading.style.display = 'none';
    } finally {
        processBtn.disabled = false;
    }
}

// Show offline mode notice
function showOfflineNotice() {
    const notice = document.createElement('div');
    notice.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #ff6b35;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    notice.textContent = '🔄 Offline Mode: Using JavaScript processing';

    document.body.appendChild(notice);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (notice.parentNode) {
            notice.remove();
        }
    }, 5000);
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

// API Health Check with status update
async function checkAPIHealth() {
    const statusElement = document.getElementById('backend-status');

    try {
        console.log(`🔍 Checking backend health: ${API_BASE_URL}/`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`${API_BASE_URL}/`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend is healthy:', data);

            if (statusElement) {
                statusElement.innerHTML = '<span style="color: #4CAF50;">✅ Online (Backend available)</span>';
            }

            OFFLINE_MODE = false;
            return true;
        } else {
            throw new Error(`Backend returned ${response.status}`);
        }
    } catch (error) {
        console.warn('⚠️ Backend health check failed:', error.message);

        if (statusElement) {
            statusElement.innerHTML = '<span style="color: #ff9800;">⚠️ Offline (JavaScript processing)</span>';
        }

        OFFLINE_MODE = true;
    }
    return false;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check backend status on load
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

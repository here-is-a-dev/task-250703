// Simplified version with only working filters
// Copy this to replace main script.js if needed

// Configuration - Auto-detect API base URL
const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }
    
    // GitHub Pages deployment - use external backend
    if (hostname.includes('github.io')) {
        return 'https://task-250703.onrender.com';
    }
    
    // Default relative URL for other deployments
    return '/api';
})();

// Fallback mode for offline/demo usage
let OFFLINE_MODE = false;

// DOM elements
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const originalImage = document.getElementById('originalImage');
const processBtn = document.getElementById('processBtn');
const processType = document.getElementById('processType');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('results');
const processedImage = document.getElementById('processedImage');
const downloadBtn = document.getElementById('downloadBtn');

// Global variables
let selectedFile = null;
let processedImageData = null;
let originalImageData = null;
let permissionGranted = false;

// Only working filters
const WORKING_FILTERS = ['grayscale', 'blur', 'sharpen', 'edge'];

// Update filter options to only show working ones
function updateFilterOptions() {
    processType.innerHTML = `
        <option value="grayscale">Grayscale</option>
        <option value="blur">Blur</option>
        <option value="sharpen">Sharpen</option>
        <option value="edge">Edge Detection</option>
    `;
}

// Simplified image processing - only working filters
function processImageOfflineSimplified(imageData, filterType) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            try {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                console.log(`🎨 Applying ${filterType} filter`);
                
                switch(filterType) {
                    case 'grayscale':
                        for (let i = 0; i < data.length; i += 4) {
                            const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
                            data[i] = gray;
                            data[i + 1] = gray;
                            data[i + 2] = gray;
                        }
                        break;
                        
                    case 'blur':
                        // Simple blur
                        const blurRadius = 1;
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
                        // Sharpen filter
                        const sharpenKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
                        applyConvolution(data, canvas.width, canvas.height, sharpenKernel, 3);
                        break;
                        
                    case 'edge':
                        // Edge detection
                        const edgeKernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
                        applyConvolution(data, canvas.width, canvas.height, edgeKernel, 3);
                        break;
                        
                    default:
                        // Default to grayscale
                        for (let i = 0; i < data.length; i += 4) {
                            const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
                            data[i] = gray;
                            data[i + 1] = gray;
                            data[i + 2] = gray;
                        }
                }
                
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png', 0.9));
                
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageData;
    });
}

// Helper function for convolution
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

// Initialize simplified version
function initializeSimplified() {
    updateFilterOptions();
    console.log('🔧 Simplified version loaded - only working filters available');
    
    // Add notice
    const notice = document.createElement('div');
    notice.style.cssText = `
        background: #fff3cd;
        border: 2px solid #ffc107;
        border-radius: 8px;
        padding: 15px;
        margin: 15px 0;
        color: #856404;
    `;
    notice.innerHTML = `
        <h4 style="margin: 0 0 10px 0;">⚠️ Simplified Mode</h4>
        <p style="margin: 0; font-size: 14px;">
            Running with only verified working filters: Grayscale, Blur, Sharpen, Edge Detection.
            Problematic filters (Sepia, Brightness, Contrast) have been removed.
        </p>
    `;
    
    const uploadSection = document.querySelector('.upload-section');
    uploadSection.insertBefore(notice, uploadSection.firstChild);
}

// Export for testing
if (typeof window !== 'undefined') {
    window.processImageOfflineSimplified = processImageOfflineSimplified;
    window.initializeSimplified = initializeSimplified;
}

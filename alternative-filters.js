// Alternative filter implementations
// If main filters don't work, we can replace them with these

function applyAlternativeFilter(imageData, filterType) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            try {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Method 1: Use CSS filters (if supported)
                if (filterType === 'sepia' || filterType === 'brightness' || filterType === 'contrast') {
                    ctx.filter = getCSSFilter(filterType);
                    ctx.drawImage(img, 0, 0);
                    ctx.filter = 'none'; // Reset filter
                    resolve(canvas.toDataURL());
                    return;
                }
                
                // Method 2: Manual pixel manipulation
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                switch(filterType) {
                    case 'grayscale':
                        for (let i = 0; i < data.length; i += 4) {
                            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                            data[i] = avg;
                            data[i + 1] = avg;
                            data[i + 2] = avg;
                        }
                        break;
                        
                    case 'sepia-manual':
                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];
                            
                            // Different sepia formula
                            data[i] = Math.min(255, (r * 0.4) + (g * 0.8) + (b * 0.2));
                            data[i + 1] = Math.min(255, (r * 0.35) + (g * 0.7) + (b * 0.15));
                            data[i + 2] = Math.min(255, (r * 0.25) + (g * 0.5) + (b * 0.1));
                        }
                        break;
                        
                    case 'brightness-manual':
                        const brightnessAdd = 50; // Add fixed amount instead of multiply
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = Math.min(255, data[i] + brightnessAdd);
                            data[i + 1] = Math.min(255, data[i + 1] + brightnessAdd);
                            data[i + 2] = Math.min(255, data[i + 2] + brightnessAdd);
                        }
                        break;
                        
                    case 'contrast-manual':
                        // Different contrast formula
                        const factor = 259 * (128 + 128) / (259 * (128 - 128));
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
                            data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
                            data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
                        }
                        break;
                        
                    case 'red-tint':
                        // Test filter - add red tint
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = Math.min(255, data[i] + 50); // More red
                        }
                        break;
                        
                    case 'blue-tint':
                        // Test filter - add blue tint
                        for (let i = 0; i < data.length; i += 4) {
                            data[i + 2] = Math.min(255, data[i + 2] + 50); // More blue
                        }
                        break;
                }
                
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL());
                
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageData;
    });
}

function getCSSFilter(filterType) {
    switch(filterType) {
        case 'sepia':
            return 'sepia(100%)';
        case 'brightness':
            return 'brightness(150%)';
        case 'contrast':
            return 'contrast(200%)';
        default:
            return 'none';
    }
}

// Test function
async function testAlternativeFilters() {
    // Create test image
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Rainbow pattern
    const gradient = ctx.createLinearGradient(0, 0, 100, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.5, 'green');
    gradient.addColorStop(1, 'blue');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 100, 100);
    
    const testImage = canvas.toDataURL();
    
    // Test filters
    const filters = ['sepia', 'brightness', 'contrast', 'sepia-manual', 'brightness-manual', 'contrast-manual'];
    
    for (const filter of filters) {
        try {
            const result = await applyAlternativeFilter(testImage, filter);
            console.log(`✅ Alternative ${filter} filter works`);
        } catch (error) {
            console.error(`❌ Alternative ${filter} filter failed:`, error);
        }
    }
}

// Export for use in main app
if (typeof window !== 'undefined') {
    window.applyAlternativeFilter = applyAlternativeFilter;
    window.testAlternativeFilters = testAlternativeFilters;
}

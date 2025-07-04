# Changelog

## [2.0.0] - 2025-01-04 - Simplified Mode

### 🎯 Major Changes
- **BREAKING**: Removed 3 problematic filters that were causing state pollution
- Simplified to 4 reliable, working filters only
- Improved stability and user experience

### ✅ Available Filters (4)
- **Grayscale**: Convert to grayscale using luminance formula
- **Blur**: Gaussian blur effect using box blur algorithm
- **Sharpen**: Image sharpening using convolution matrix
- **Edge Detection**: Edge detection using Sobel operator

### ❌ Removed Filters (3)
- **Sepia**: Removed due to state pollution issues
- **Brightness**: Removed due to producing grayscale output instead of brightness
- **Contrast**: Removed due to producing grayscale output instead of contrast

### 🔧 Technical Changes
- Updated HTML filter dropdown to show only 4 working filters
- Removed problematic filter implementations from JavaScript
- Updated demo page with new filter implementations
- Enhanced error handling and logging
- Updated documentation and README

### 🎨 UI Changes
- Changed app notice from blue to green theme
- Updated filter count from "7 filters" to "4 reliable filters"
- Added simplified mode notice in demo page
- Updated backend status indicator

### 📚 Documentation
- Updated README.md with current filter list
- Added changelog to track changes
- Updated demo descriptions

### 🧪 Testing
- All 4 remaining filters tested and verified working
- No more state pollution between filter applications
- Consistent results across multiple applications

---

## [1.0.0] - 2025-01-03 - Initial Release

### ✅ Features
- 7 image processing filters
- Backend + JavaScript fallback processing
- Android WebView support
- File upload with drag & drop
- Real-time processing
- Download processed images

### 🎨 Filters (Original)
- Grayscale ✅
- Sepia ❌ (later removed)
- Brightness ❌ (later removed)  
- Contrast ❌ (later removed)
- Blur ✅
- Sharpen ✅
- Edge Detection ✅

### 🌐 Deployment
- GitHub Pages deployment
- Render.com backend
- Docker containerization
- Android APK support

---

## Notes

### Why Remove Filters?
The decision to remove Sepia, Brightness, and Contrast filters was made because:

1. **State Pollution**: These filters were affecting each other's output
2. **Incorrect Results**: Brightness and Contrast were producing grayscale output
3. **User Experience**: Better to have 4 working filters than 7 broken ones
4. **Maintainability**: Simpler codebase is easier to maintain and debug

### Future Plans
- May re-implement removed filters with better algorithms
- Consider adding new reliable filters (e.g., Invert, Hue Shift)
- Improve performance of existing filters
- Add filter intensity controls

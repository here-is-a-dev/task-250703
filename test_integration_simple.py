#!/usr/bin/env python3
"""
Simple Integration Test Script for Image Processing App
Tests the complete workflow without browser automation
"""

import requests
import time
import json
from PIL import Image
import io
import os

# Configuration
FRONTEND_URL = "http://localhost:8000"
BACKEND_URL = "http://localhost:5000"

def check_servers():
    """Check if both frontend and backend servers are running"""
    print("🔍 Checking server status...")
    
    # Check backend
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running")
            backend_ok = True
        else:
            print("❌ Backend server returned error")
            backend_ok = False
    except Exception as e:
        print(f"❌ Backend server is not accessible: {e}")
        backend_ok = False
    
    # Check frontend
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend server is running")
            frontend_ok = True
        else:
            print("❌ Frontend server returned error")
            frontend_ok = False
    except Exception as e:
        print(f"❌ Frontend server is not accessible: {e}")
        frontend_ok = False
    
    return backend_ok and frontend_ok

def test_frontend_content():
    """Test if frontend serves the correct content"""
    print("\n🌐 Testing frontend content...")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        content = response.text
        
        # Check for key elements in HTML
        required_elements = [
            'Image Processing App',
            'uploadArea',
            'processBtn',
            'script.js',
            'styles.css'
        ]
        
        missing_elements = []
        for element in required_elements:
            if element not in content:
                missing_elements.append(element)
        
        if not missing_elements:
            print("✅ All required frontend elements found")
            return True
        else:
            print(f"❌ Missing frontend elements: {missing_elements}")
            return False
            
    except Exception as e:
        print(f"❌ Frontend content test failed: {e}")
        return False

def test_api_connectivity():
    """Test if frontend can connect to backend API"""
    print("\n🔗 Testing API connectivity...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API health check successful: {data}")
            return True
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API connectivity test failed: {e}")
        return False

def test_cors_headers():
    """Test if CORS headers are properly set"""
    print("\n🌍 Testing CORS headers...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/")
        cors_header = response.headers.get('Access-Control-Allow-Origin')
        
        if cors_header == '*':
            print("✅ CORS headers are properly configured")
            return True
        else:
            print(f"❌ CORS headers not found or incorrect: {cors_header}")
            return False
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
        return False

def create_test_image_file():
    """Create a test image file for upload testing"""
    # Create a simple test image
    img = Image.new('RGB', (200, 200), color='blue')
    
    # Add some pattern to make it more interesting
    pixels = img.load()
    for i in range(200):
        for j in range(200):
            if (i + j) % 20 < 10:
                pixels[i, j] = (255, 255, 0)  # Yellow stripes
    
    # Save to file
    test_image_path = "test_integration_image.png"
    img.save(test_image_path, 'PNG')
    
    return test_image_path

def test_all_filters():
    """Test all image processing filters"""
    print("\n🖼️ Testing all image processing filters...")
    
    filters = ['grayscale', 'blur', 'sharpen', 'edge']
    success_count = 0
    
    try:
        # Create test image
        test_image_path = create_test_image_file()
        
        for filter_type in filters:
            print(f"  Testing {filter_type} filter...")
            
            try:
                with open(test_image_path, 'rb') as f:
                    files = {'image': ('test.png', f, 'image/png')}
                    data = {'type': filter_type}
                    
                    response = requests.post(f"{BACKEND_URL}/process-image", files=files, data=data)
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get('success'):
                        print(f"    ✅ {filter_type} filter successful")
                        success_count += 1
                        
                        # Verify image data
                        image_data = result.get('processed_image', '')
                        if image_data.startswith('data:image/'):
                            print(f"    ✅ {filter_type} image data format correct")
                        else:
                            print(f"    ❌ {filter_type} image data format incorrect")
                    else:
                        print(f"    ❌ {filter_type} processing failed: {result.get('error')}")
                else:
                    print(f"    ❌ {filter_type} request failed: {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ {filter_type} test error: {e}")
        
        # Clean up test file
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
        
        print(f"✅ Filter tests completed: {success_count}/{len(filters)} successful")
        return success_count == len(filters)
        
    except Exception as e:
        print(f"❌ Filter testing failed: {e}")
        return False

def test_error_handling():
    """Test error handling scenarios"""
    print("\n🚨 Testing error handling...")
    
    tests_passed = 0
    total_tests = 2
    
    # Test 1: Missing image
    try:
        response = requests.post(f"{BACKEND_URL}/process-image", data={'type': 'grayscale'})
        if response.status_code == 400:
            print("  ✅ Missing image error handled correctly")
            tests_passed += 1
        else:
            print(f"  ❌ Missing image error not handled: {response.status_code}")
    except Exception as e:
        print(f"  ❌ Missing image test error: {e}")
    
    # Test 2: Invalid filter (should default gracefully)
    try:
        test_image_path = create_test_image_file()
        
        with open(test_image_path, 'rb') as f:
            files = {'image': ('test.png', f, 'image/png')}
            data = {'type': 'invalid_filter'}
            
            response = requests.post(f"{BACKEND_URL}/process-image", files=files, data=data)
        
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("  ✅ Invalid filter handled gracefully")
                tests_passed += 1
            else:
                print("  ❌ Invalid filter not handled properly")
        else:
            print(f"  ❌ Invalid filter test failed: {response.status_code}")
            
    except Exception as e:
        print(f"  ❌ Invalid filter test error: {e}")
    
    print(f"✅ Error handling tests: {tests_passed}/{total_tests} passed")
    return tests_passed == total_tests

def test_performance():
    """Test basic performance metrics"""
    print("\n⚡ Testing performance...")
    
    try:
        # Test API response time
        start_time = time.time()
        response = requests.get(f"{BACKEND_URL}/")
        api_time = time.time() - start_time
        
        print(f"  API response time: {api_time:.3f} seconds")
        
        if api_time < 1.0:
            print("  ✅ API response time is good")
            return True
        else:
            print("  ⚠️ API response time is slow")
            return False
            
    except Exception as e:
        print(f"  ❌ Performance test error: {e}")
        return False

def main():
    """Run all integration tests"""
    print("🧪 Starting Simple Integration Tests")
    print("=" * 60)
    
    tests = [
        ("Server Status", check_servers),
        ("Frontend Content", test_frontend_content),
        ("API Connectivity", test_api_connectivity),
        ("CORS Configuration", test_cors_headers),
        ("All Image Filters", test_all_filters),
        ("Error Handling", test_error_handling),
        ("Performance", test_performance)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running: {test_name}")
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name} PASSED")
            else:
                print(f"❌ {test_name} FAILED")
        except Exception as e:
            print(f"❌ {test_name} ERROR: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Integration Test Summary")
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("🎉 All integration tests passed!")
        print("🚀 The application is ready for production!")
        print("\n📋 Next Steps:")
        print("  1. Deploy backend to Dokploy")
        print("  2. Update frontend API URL for production")
        print("  3. Create Android WebView app")
    else:
        print("⚠️ Some tests failed. Please check the issues above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

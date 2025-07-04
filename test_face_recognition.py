#!/usr/bin/env python3
"""
Simple test script for Image Processing & Face Recognition API
Tests both image processing filters and face detection functionality
"""

import requests
import os
import sys

# Configuration
API_BASE_URL = "http://localhost:5000"

def test_api_health():
    """Test if the API is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/")
        if response.status_code == 200:
            print("✅ API Health Check: PASSED")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ API Health Check: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ API Health Check: FAILED (Error: {e})")
        return False

def test_image_processing():
    """Test image processing endpoint"""
    print("\n🖼️ Testing Image Processing...")

    # Check if demo images exist
    demo_images_dir = "demo_images"
    if not os.path.exists(demo_images_dir):
        print(f"❌ Demo images directory not found: {demo_images_dir}")
        return False

    # Try to find any image file
    image_files = [f for f in os.listdir(demo_images_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

    if not image_files:
        print("❌ No image files found in demo_images directory")
        return False

    test_image = os.path.join(demo_images_dir, image_files[0])
    print(f"   Using test image: {test_image}")

    # Test all filters
    filters = ['grayscale', 'blur', 'sharpen', 'edge']
    success_count = 0

    for filter_type in filters:
        try:
            with open(test_image, 'rb') as f:
                files = {'image': f}
                data = {'type': filter_type}
                response = requests.post(f"{API_BASE_URL}/process-image", files=files, data=data)

            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"   ✅ {filter_type} filter: PASSED")
                    success_count += 1
                else:
                    print(f"   ❌ {filter_type} filter: FAILED (API Error: {result.get('error')})")
            else:
                print(f"   ❌ {filter_type} filter: FAILED (Status: {response.status_code})")
        except Exception as e:
            print(f"   ❌ {filter_type} filter: FAILED (Error: {e})")

    print(f"✅ Image Processing: {success_count}/{len(filters)} filters passed")
    return success_count == len(filters)

def test_face_detection():
    """Test face detection endpoint"""
    print("\n🔍 Testing Face Detection...")

    # Check if demo images exist
    demo_images_dir = "demo_images"
    if not os.path.exists(demo_images_dir):
        print(f"❌ Demo images directory not found: {demo_images_dir}")
        return False

    # Try to find any image file
    image_files = [f for f in os.listdir(demo_images_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

    if not image_files:
        print("❌ No image files found in demo_images directory")
        return False

    test_image = os.path.join(demo_images_dir, image_files[0])
    print(f"   Using test image: {test_image}")

    try:
        with open(test_image, 'rb') as f:
            files = {'image': f}
            response = requests.post(f"{API_BASE_URL}/detect-faces", files=files)

        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Face Detection: PASSED")
                print(f"   Faces detected: {result.get('faces_detected', 0)}")
                for face in result.get('faces', []):
                    print(f"   - Face {face['id']}: {face['name']} (Known: {face['is_known']})")
                return True
            else:
                print(f"❌ Face Detection: FAILED (API Error: {result.get('error')})")
                return False
        else:
            print(f"❌ Face Detection: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Face Detection: FAILED (Error: {e})")
        return False

def test_registered_faces():
    """Test getting registered faces"""
    print("\n👥 Testing Registered Faces...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/registered-faces")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Get Registered Faces: PASSED")
                print(f"   Total registered: {result.get('total_registered', 0)}")
                faces = result.get('registered_faces', [])
                if faces:
                    print(f"   Registered names: {', '.join(faces)}")
                else:
                    print("   No faces registered yet")
                return True
            else:
                print(f"❌ Get Registered Faces: FAILED (API Error: {result.get('error')})")
                return False
        else:
            print(f"❌ Get Registered Faces: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Get Registered Faces: FAILED (Error: {e})")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Image Processing & Face Recognition API Tests")
    print("=" * 60)

    tests_passed = 0
    total_tests = 4

    # Test 1: API Health
    if test_api_health():
        tests_passed += 1

    # Test 2: Image Processing
    if test_image_processing():
        tests_passed += 1

    # Test 3: Face Detection
    if test_face_detection():
        tests_passed += 1

    # Test 4: Registered Faces
    if test_registered_faces():
        tests_passed += 1

    # Summary
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tests_passed}/{total_tests} tests passed")

    if tests_passed == total_tests:
        print("🎉 All tests PASSED! Both Image Processing and Face Recognition APIs are working correctly.")
        return 0
    else:
        print("⚠️  Some tests FAILED. Please check the API and try again.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

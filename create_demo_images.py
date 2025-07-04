#!/usr/bin/env python3
"""
Create demo images for testing the Image Processing App
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_demo_images():
    """Create various demo images for testing"""
    
    # Create demo directory
    demo_dir = "demo_images"
    if not os.path.exists(demo_dir):
        os.makedirs(demo_dir)
    
    print("🎨 Creating demo images...")
    
    # 1. Simple colored squares
    print("  Creating colored squares...")
    img = Image.new('RGB', (400, 400), 'white')
    draw = ImageDraw.Draw(img)
    
    # Draw colored squares
    colors = ['red', 'green', 'blue', 'yellow']
    for i, color in enumerate(colors):
        x = (i % 2) * 200
        y = (i // 2) * 200
        draw.rectangle([x, y, x+200, y+200], fill=color)
    
    img.save(f"{demo_dir}/colored_squares.png")
    
    # 2. Gradient image
    print("  Creating gradient image...")
    img = Image.new('RGB', (400, 300), 'white')
    pixels = img.load()
    
    for i in range(400):
        for j in range(300):
            r = int(255 * i / 400)
            g = int(255 * j / 300)
            b = int(255 * (i + j) / 700)
            pixels[i, j] = (r, g, b)
    
    img.save(f"{demo_dir}/gradient.png")
    
    # 3. Pattern image
    print("  Creating pattern image...")
    img = Image.new('RGB', (400, 400), 'white')
    draw = ImageDraw.Draw(img)
    
    # Draw checkerboard pattern
    for i in range(0, 400, 40):
        for j in range(0, 400, 40):
            if (i // 40 + j // 40) % 2 == 0:
                draw.rectangle([i, j, i+40, j+40], fill='black')
    
    img.save(f"{demo_dir}/checkerboard.png")
    
    # 4. Text image
    print("  Creating text image...")
    img = Image.new('RGB', (500, 200), 'white')
    draw = ImageDraw.Draw(img)
    
    try:
        # Try to use a default font
        font = ImageFont.load_default()
    except:
        font = None
    
    # Draw text
    text = "IMAGE PROCESSING DEMO"
    if font:
        draw.text((50, 80), text, fill='black', font=font)
    else:
        draw.text((50, 80), text, fill='black')
    
    # Add some shapes
    draw.circle((100, 100), 30, outline='red', width=3)
    draw.rectangle([300, 50, 450, 150], outline='blue', width=3)
    
    img.save(f"{demo_dir}/text_demo.png")
    
    # 5. High contrast image
    print("  Creating high contrast image...")
    img = Image.new('RGB', (300, 300), 'black')
    draw = ImageDraw.Draw(img)
    
    # White shapes on black background
    draw.circle((150, 150), 100, fill='white')
    draw.rectangle([50, 50, 100, 100], fill='white')
    draw.rectangle([200, 200, 250, 250], fill='white')
    
    img.save(f"{demo_dir}/high_contrast.png")
    
    print(f"✅ Demo images created in '{demo_dir}/' directory:")
    print("  - colored_squares.png (good for filter comparison)")
    print("  - gradient.png (good for blur/sharpen effects)")
    print("  - checkerboard.png (good for edge detection)")
    print("  - text_demo.png (good for text processing)")
    print("  - high_contrast.png (good for all filters)")
    
    return demo_dir

def create_test_script():
    """Create a script to test all demo images"""
    
    script_content = '''#!/usr/bin/env python3
"""
Test all demo images with all filters
"""

import requests
import os
import json

API_URL = "http://localhost:5000"
DEMO_DIR = "demo_images"
RESULTS_DIR = "demo_results"

def test_image_with_all_filters(image_path):
    """Test one image with all available filters"""
    
    if not os.path.exists(RESULTS_DIR):
        os.makedirs(RESULTS_DIR)
    
    image_name = os.path.basename(image_path).split('.')[0]
    filters = ['grayscale', 'blur', 'sharpen', 'edge']
    
    print(f"🖼️ Testing {image_name}...")
    
    for filter_type in filters:
        try:
            with open(image_path, 'rb') as f:
                files = {'image': (f'{image_name}.png', f, 'image/png')}
                data = {'type': filter_type}
                
                response = requests.post(f"{API_URL}/process-image", files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"  ✅ {filter_type} filter successful")
                    
                    # Save result info
                    result_file = f"{RESULTS_DIR}/{image_name}_{filter_type}_result.json"
                    with open(result_file, 'w') as f:
                        json.dump({
                            'image': image_name,
                            'filter': filter_type,
                            'success': True,
                            'has_processed_image': bool(result.get('processed_image'))
                        }, f, indent=2)
                else:
                    print(f"  ❌ {filter_type} processing failed")
            else:
                print(f"  ❌ {filter_type} request failed: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ {filter_type} error: {e}")

def main():
    """Test all demo images"""
    print("🧪 Testing all demo images with all filters")
    print("=" * 50)
    
    if not os.path.exists(DEMO_DIR):
        print(f"❌ Demo directory '{DEMO_DIR}' not found!")
        print("Run create_demo_images.py first!")
        return
    
    # Get all PNG files in demo directory
    demo_images = [f for f in os.listdir(DEMO_DIR) if f.endswith('.png')]
    
    if not demo_images:
        print(f"❌ No demo images found in '{DEMO_DIR}'!")
        return
    
    print(f"Found {len(demo_images)} demo images")
    
    for image_file in demo_images:
        image_path = os.path.join(DEMO_DIR, image_file)
        test_image_with_all_filters(image_path)
    
    print("\\n" + "=" * 50)
    print("🎉 Demo testing completed!")
    print(f"📁 Results saved in '{RESULTS_DIR}/' directory")

if __name__ == "__main__":
    main()
'''
    
    with open("test_demo_images.py", 'w') as f:
        f.write(script_content)
    
    print("✅ Test script created: test_demo_images.py")

if __name__ == "__main__":
    demo_dir = create_demo_images()
    create_test_script()
    
    print("\n🚀 Next steps:")
    print("1. Start the backend and frontend servers")
    print("2. Run: python test_demo_images.py")
    print("3. Or manually test images in the web interface")
    print(f"4. Demo images are in: {demo_dir}/")

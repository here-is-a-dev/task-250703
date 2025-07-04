#!/usr/bin/env python3
"""
Setup script for Image Processing Web Application
Prepares the environment and creates necessary files
"""

import os
import shutil
import subprocess
import sys

def create_static_folder():
    """Create static folder and copy frontend files for combined app"""
    print("📁 Creating static folder for combined app...")
    
    static_dir = "static"
    frontend_dir = "frontend"
    
    # Remove existing static folder
    if os.path.exists(static_dir):
        shutil.rmtree(static_dir)
    
    # Create new static folder
    os.makedirs(static_dir)
    
    # Copy frontend files to static
    if os.path.exists(frontend_dir):
        for item in os.listdir(frontend_dir):
            src = os.path.join(frontend_dir, item)
            dst = os.path.join(static_dir, item)
            
            if os.path.isfile(src):
                shutil.copy2(src, dst)
                print(f"  ✅ Copied {item}")
            elif os.path.isdir(src):
                shutil.copytree(src, dst)
                print(f"  ✅ Copied {item}/ (directory)")
    
    print("✅ Static folder created successfully")

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing Python dependencies...")
    
    requirements_file = os.path.join("backend", "requirements.txt")
    
    if os.path.exists(requirements_file):
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", requirements_file])
            print("✅ Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install dependencies: {e}")
            return False
    else:
        print("❌ requirements.txt not found in backend/")
        return False

def create_demo_images():
    """Create demo images if they don't exist"""
    print("🎨 Creating demo images...")
    
    if os.path.exists("create_demo_images.py"):
        try:
            subprocess.check_call([sys.executable, "create_demo_images.py"])
            print("✅ Demo images created successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create demo images: {e}")
            return False
    else:
        print("⚠️ create_demo_images.py not found, skipping demo image creation")
        return True

def check_environment():
    """Check if the environment is properly set up"""
    print("🔍 Checking environment...")
    
    checks = []
    
    # Check Python version
    if sys.version_info >= (3, 6):
        print(f"  ✅ Python {sys.version_info.major}.{sys.version_info.minor} (compatible)")
        checks.append(True)
    else:
        print(f"  ❌ Python {sys.version_info.major}.{sys.version_info.minor} (requires 3.6+)")
        checks.append(False)
    
    # Check required directories
    required_dirs = ["backend", "frontend"]
    for dir_name in required_dirs:
        if os.path.exists(dir_name):
            print(f"  ✅ {dir_name}/ directory found")
            checks.append(True)
        else:
            print(f"  ❌ {dir_name}/ directory missing")
            checks.append(False)
    
    # Check required files
    required_files = [
        "backend/app.py",
        "backend/requirements.txt",
        "frontend/index.html",
        "frontend/script.js",
        "frontend/styles.css"
    ]
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"  ✅ {file_path} found")
            checks.append(True)
        else:
            print(f"  ❌ {file_path} missing")
            checks.append(False)
    
    return all(checks)

def create_run_scripts():
    """Create additional run scripts for different platforms"""
    print("📝 Creating run scripts...")
    
    # Create run.py for cross-platform execution
    run_script = '''#!/usr/bin/env python3
"""
Cross-platform runner for Image Processing App
"""

import os
import sys
import subprocess
import webbrowser
import time
import threading

def run_backend():
    """Run backend server"""
    os.chdir("backend")
    subprocess.run([sys.executable, "app.py"])

def run_frontend():
    """Run frontend server"""
    os.chdir("frontend")
    subprocess.run([sys.executable, "-m", "http.server", "8000"])

def run_combined():
    """Run combined server"""
    subprocess.run([sys.executable, "serve_app.py"])

def open_browser(url, delay=2):
    """Open browser after delay"""
    time.sleep(delay)
    webbrowser.open(url)

def main():
    """Main runner"""
    if len(sys.argv) < 2:
        print("Usage: python run.py [backend|frontend|combined]")
        print("  backend  - Run backend only (port 5000)")
        print("  frontend - Run frontend only (port 8000)")
        print("  combined - Run combined app (port 8080)")
        return
    
    mode = sys.argv[1].lower()
    
    if mode == "backend":
        print("🚀 Starting backend server...")
        threading.Thread(target=lambda: open_browser("http://localhost:5000"), daemon=True).start()
        run_backend()
    elif mode == "frontend":
        print("🚀 Starting frontend server...")
        threading.Thread(target=lambda: open_browser("http://localhost:8000"), daemon=True).start()
        run_frontend()
    elif mode == "combined":
        print("🚀 Starting combined server...")
        threading.Thread(target=lambda: open_browser("http://localhost:8080"), daemon=True).start()
        run_combined()
    else:
        print(f"❌ Unknown mode: {mode}")

if __name__ == "__main__":
    main()
'''
    
    with open("run.py", "w") as f:
        f.write(run_script)
    
    print("  ✅ run.py created")

def main():
    """Main setup function"""
    print("🚀 Setting up Image Processing Web Application")
    print("=" * 60)
    
    # Check environment first
    if not check_environment():
        print("\n❌ Environment check failed. Please fix the issues above.")
        return False
    
    print("\n✅ Environment check passed")
    
    # Install dependencies
    print("\n" + "=" * 60)
    if not install_dependencies():
        print("\n❌ Dependency installation failed.")
        return False
    
    # Create static folder for combined app
    print("\n" + "=" * 60)
    create_static_folder()
    
    # Create demo images
    print("\n" + "=" * 60)
    create_demo_images()
    
    # Create run scripts
    print("\n" + "=" * 60)
    create_run_scripts()
    
    # Final summary
    print("\n" + "=" * 60)
    print("🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("  1. Run backend only:    python run.py backend")
    print("  2. Run frontend only:   python run.py frontend")
    print("  3. Run combined app:    python run.py combined")
    print("  4. Or use batch files:  start-backend.bat, start-frontend.bat, start-combined.bat")
    print("\n🧪 Testing:")
    print("  - Run integration tests: python test_integration_simple.py")
    print("  - Test with demo images: python test_demo_images.py")
    print("\n🌐 Deployment:")
    print("  - See DEPLOYMENT.md for deployment instructions")
    print("  - Frontend ready for GitHub Pages")
    print("  - Backend ready for cloud deployment")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)

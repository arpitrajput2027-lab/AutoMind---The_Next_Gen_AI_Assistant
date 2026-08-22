# tests/test_vision.py - Test Screen Awareness

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.vision import capture_screen, cleanup_screenshot
import time

def test_screenshot():
    """Test screenshot capture"""
    print("\n📸 Testing screenshot capture...")
    
    path = capture_screen()
    
    if path and os.path.exists(path):
        print(f"✅ Screenshot saved: {path}")
        
        # Check file size
        size = os.path.getsize(path)
        print(f"File size: {size / 1024:.2f} KB")
        
        # Cleanup
        cleanup_screenshot()
        print("✅ Screenshot cleaned up")
    else:
        print("❌ Screenshot failed")

def test_region_capture():
    """Test region screenshot"""
    print("\n📸 Testing region capture...")
    
    # Capture top-left corner (200x200)
    path = capture_screen(region=(0, 0, 200, 200))
    
    if path and os.path.exists(path):
        print(f"✅ Region screenshot saved: {path}")
        cleanup_screenshot()
    else:
        print("❌ Region capture failed")

if __name__ == "__main__":
    print("=" * 50)
    print("VENOM AI - Vision Tests")
    print("=" * 50)
    
    test_screenshot()
    time.sleep(1)
    test_region_capture()
    
    print("\n✅ Vision tests complete!")
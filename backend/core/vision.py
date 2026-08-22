# core/vision.py - Screen Awareness

import pyautogui
import os
import base64
from config import SCREENSHOT_PATH

def capture_screen(region=None):
    """
    Capture screenshot
    region: (x, y, width, height) or None for full screen
    """
    try:
        screenshot = pyautogui.screenshot(region=region)
        screenshot.save(SCREENSHOT_PATH)
        print(f"📸 Screenshot saved: {SCREENSHOT_PATH}")
        return SCREENSHOT_PATH
    except Exception as e:
        print(f"Screenshot error: {e}")
        return None

def encode_image_base64(image_path):
    """Convert image to base64"""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode('utf-8')

def analyze_screen_with_llm(llm_function, context=""):
    """
    Capture screen and send to LLM for analysis
    llm_function: Function that takes (image_base64, prompt) and returns text
    """
    screenshot_path = capture_screen()
    if not screenshot_path:
        return "Failed to capture screen"
    
    image_b64 = encode_image_base64(screenshot_path)
    
    prompt = f"""
You are analyzing a screenshot.
Context: {context}

Describe what you see on the screen and provide helpful insights.
"""
    
    # This would integrate with vision-capable LLM
    # For now, return placeholder
    return "Screen analysis feature - integrate with vision LLM (GPT-4V or similar)"

def cleanup_screenshot():
    """Delete temp screenshot"""
    if os.path.exists(SCREENSHOT_PATH):
        os.remove(SCREENSHOT_PATH)
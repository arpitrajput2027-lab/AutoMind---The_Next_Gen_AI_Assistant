# core/vision.py - Screen Awareness

import pyautogui
import os
import PIL.Image
from config import SCREENSHOT_PATH
from google import genai
from google.genai import types as genai_types
from core.llm import GEMINI_API_KEY, GEMINI_MODEL, _gemini_client

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

def analyze_screen_with_llm(context=""):
    """
    Capture screen and send to LLM for analysis
    """
    screenshot_path = capture_screen()
    if not screenshot_path:
        return "Failed to capture screen"
    
    if not _gemini_client:
        return "Cannot analyze screen: Gemini API Key missing."

    prompt = f"""
You are analyzing a screenshot of a user's desktop.
Context: {context}

Describe what you see on the screen and provide helpful insights based on the context.
"""
    try:
        img = PIL.Image.open(screenshot_path)

        response = _gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[prompt, img],
        )
        return response.text.strip()
    except Exception as e:
        print(f"Vision LLM Error: {e}")
        return f"Error analyzing screen: {e}"
    finally:
        cleanup_screenshot()

def cleanup_screenshot():
    """Delete temp screenshot"""
    if os.path.exists(SCREENSHOT_PATH):
        try:
            os.remove(SCREENSHOT_PATH)
        except Exception:
            pass
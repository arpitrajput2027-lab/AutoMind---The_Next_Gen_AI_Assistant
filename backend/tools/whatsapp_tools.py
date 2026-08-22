# tools/whatsapp_tools.py - FIXED & WORKING

import webbrowser
import urllib.parse
import time
import pyautogui
import os

ASSETS_PATH = os.path.join(os.getcwd(), "assets")
SEARCH_IMAGE = os.path.join(ASSETS_PATH, "wa_search.png")

def wait_and_click(image_path, timeout=15):
    """Try to find and click image on screen"""
    try:
        start = time.time()
        while time.time() - start < timeout:
            location = pyautogui.locateOnScreen(image_path, confidence=0.8)
            if location:
                center = pyautogui.center(location)
                pyautogui.click(center)
                return True
            time.sleep(1)
        return False
    except Exception as e:
        print(f"Image recognition error: {e}")
        return False

def send_message(contact: str, message: str):
    """
    Send WhatsApp message with hybrid method:
    1. Try image recognition
    2. Fallback to keyboard shortcuts
    """
    try:
        print(f"📱 Opening WhatsApp Web for: {contact}")
        
        # Open WhatsApp Web
        webbrowser.open("https://web.whatsapp.com")
        time.sleep(10)  # Wait for page load
        
        print("🔍 Searching for contact...")
        
        # METHOD 1: Try image recognition first
        if os.path.exists(SEARCH_IMAGE):
            print("Trying image recognition...")
            if wait_and_click(SEARCH_IMAGE, timeout=5):
                print("✅ Found search box via image")
            else:
                print("⚠️ Image not found, using keyboard method")
                # METHOD 2: Fallback to keyboard
                pyautogui.hotkey('ctrl', 'alt', '/')
                time.sleep(1)
        else:
            print("⚠️ Search image not found, using keyboard method")
            # METHOD 2: Use keyboard shortcut
            pyautogui.hotkey('ctrl', 'alt', '/')
            time.sleep(1)
        
        # Type contact name
        print(f"Typing contact: {contact}")
        pyautogui.write(contact, interval=0.05)
        time.sleep(2)
        
        # Select first result
        pyautogui.press("enter")
        time.sleep(3)
        
        # Type message
        print(f"Typing message: {message[:50]}...")
        pyautogui.write(message, interval=0.02)
        time.sleep(1)
        
        # Send message
        pyautogui.press("enter")
        time.sleep(1)
        
        print(f"✅ Message sent to {contact}")
        return f"Message sent to {contact}"
        
    except Exception as e:
        error_msg = f"WhatsApp error: {str(e)}"
        print(f"❌ {error_msg}")
        return error_msg

# Test function
if __name__ == "__main__":
    result = send_message("Me", "Test message")
    print(result)




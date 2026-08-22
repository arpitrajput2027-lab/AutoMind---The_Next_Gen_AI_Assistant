# import webbrowser
# import urllib.parse
# import time
# import pyautogui
import os

ASSETS_PATH = os.path.join(os.getcwd(), "assets")

SEARCH_IMAGE = os.path.join(ASSETS_PATH, "wa_search.png")
# MESSAGE_IMAGE = os.path.join(ASSETS_PATH, "wa_message_box.png")


def wait_and_click(image_path, timeout=15):
    start = time.time()
    while time.time() - start < timeout:
        location = pyautogui.locateOnScreen(image_path, confidence=0.8)
        if location:
            center = pyautogui.center(location)
            pyautogui.click(center)
            return True
        time.sleep(1)
    return False


def send_message(contact: str, message: str):

    webbrowser.open("https://web.whatsapp.com")
    time.sleep(7)  # wait for page load

    # Click search box
    if not wait_and_click(SEARCH_IMAGE):
        return "Search box not found."

    time.sleep(1)
    pyautogui.write(contact, interval=0.05)
    time.sleep(2)
    pyautogui.press("enter")

    time.sleep(3)

      # Now message box auto focused
    pyautogui.write(message, interval=0.02)
    pyautogui.press("enter")




#     return f"WhatsApp message sent to {contact}"


import webbrowser
import time
import pyautogui


# def send_message(contact: str, message: str):
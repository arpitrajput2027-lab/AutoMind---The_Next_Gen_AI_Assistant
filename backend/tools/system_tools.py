# tools/system_tools.py - System Controls with Brightness & Volume

import os
import platform
import subprocess
import pyautogui
import time
import pygetwindow as gw

# ===== BRIGHTNESS CONTROL =====
try:
    import screen_brightness_control as sbc
    BRIGHTNESS_AVAILABLE = True
except:
    BRIGHTNESS_AVAILABLE = False
    print("⚠️ screen-brightness-control not available")

def brightness_up(amount=10):
    """Increase brightness"""
    if not BRIGHTNESS_AVAILABLE:
        return "Brightness control not available"
    try:
        current = sbc.get_brightness()[0]
        new_level = min(100, current + amount)
        sbc.set_brightness(new_level)
        return f"Brightness: {new_level}%"
    except Exception as e:
        return f"Brightness error: {e}"

def brightness_down(amount=10):
    """Decrease brightness"""
    if not BRIGHTNESS_AVAILABLE:
        return "Brightness control not available"
    try:
        current = sbc.get_brightness()[0]
        new_level = max(0, current - amount)
        sbc.set_brightness(new_level)
        return f"Brightness: {new_level}%"
    except Exception as e:
        return f"Brightness error: {e}"

def set_brightness(level):
    """Set brightness to specific level (0-100)"""
    if not BRIGHTNESS_AVAILABLE:
        return "Brightness control not available"
    try:
        level = max(0, min(100, level))
        sbc.set_brightness(level)
        return f"Brightness set to {level}%"
    except Exception as e:
        return f"Brightness error: {e}"

# ===== VOLUME CONTROL =====
try:
    from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
    from comtypes import CLSCTX_ALL
    from ctypes import cast, POINTER
    
    devices = AudioUtilities.GetSpeakers()
    interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
    volume_obj = cast(interface, POINTER(IAudioEndpointVolume))
    VOLUME_AVAILABLE = True
except:
    VOLUME_AVAILABLE = False
    print("pycaw not available")

def volume_up(amount=0.1):
    """Increase volume"""
    if not VOLUME_AVAILABLE:
        return "Volume control not available"
    try:
        current = volume_obj.GetMasterVolumeLevelScalar()
        new_level = min(1.0, current + amount)
        volume_obj.SetMasterVolumeLevelScalar(new_level, None)
        return f"Volume: {int(new_level * 100)}%"
    except Exception as e:
        return f"Volume error: {e}"

def volume_down(amount=0.1):
    """Decrease volume"""
    if not VOLUME_AVAILABLE:
        return "Volume control not available"
    try:
        current = volume_obj.GetMasterVolumeLevelScalar()
        new_level = max(0.0, current - amount)
        volume_obj.SetMasterVolumeLevelScalar(new_level, None)
        return f"Volume: {int(new_level * 100)}%"
    except Exception as e:
        return f"Volume error: {e}"

def set_volume(level):
    """Set volume (0-100)"""
    if not VOLUME_AVAILABLE:
        return "Volume control not available"
    try:
        level = max(0, min(100, level)) / 100.0
        volume_obj.SetMasterVolumeLevelScalar(level, None)
        return f"Volume set to {int(level * 100)}%"
    except Exception as e:
        return f"Volume error: {e}"

def mute_volume():
    """Toggle mute"""
    if not VOLUME_AVAILABLE:
        return "Volume control not available"
    try:
        current_mute = volume_obj.GetMute()
        volume_obj.SetMute(not current_mute, None)
        return "Muted" if not current_mute else "Unmuted"
    except Exception as e:
        return f"Mute error: {e}"

# ===== POWER CONTROLS =====
def shutdown():
    """Shutdown system"""
    os_name = platform.system()
    if os_name == "Windows":
        subprocess.run(["shutdown", "/s", "/t", "5"])
    elif os_name == "Linux":
        subprocess.run(["shutdown", "now"])
    return "System shutting down in 5 seconds"

def restart():
    """Restart system"""
    os_name = platform.system()
    if os_name == "Windows":
        subprocess.run(["shutdown", "/r", "/t", "5"])
    elif os_name == "Linux":
        subprocess.run(["reboot"])
    return "System restarting in 5 seconds"

def sleep_system():
    """Put system to sleep"""
    os_name = platform.system()
    if os_name == "Windows":
        subprocess.run(["rundll32.exe", "powrprof.dll,SetSuspendState", "0,1,0"])
    return "System going to sleep"

def lock_screen():
    """Lock screen"""
    os_name = platform.system()
    if os_name == "Windows":
        subprocess.run(["rundll32.exe", "user32.dll,LockWorkStation"])
    return "Screen locked"

# ===== TYPING =====
pyautogui.FAILSAFE = False

def focus_window(title):
    """Focus window by title"""
    windows = gw.getWindowsWithTitle(title)
    if windows:
        windows[0].activate()
        time.sleep(0.5)
        return True
    return False

def _clipboard_paste(text: str):
    """Copy text to clipboard and paste with Ctrl+V — fast and Unicode-safe."""
    import ctypes, ctypes.wintypes

    # Put text on Windows clipboard as UTF-16
    CF_UNICODETEXT = 13
    encoded = (text + "\0").encode("utf-16-le")
    h_mem = ctypes.windll.kernel32.GlobalAlloc(0x0042, len(encoded))  # GMEM_MOVEABLE|GMEM_ZEROINIT
    p_mem = ctypes.windll.kernel32.GlobalLock(h_mem)
    ctypes.memmove(p_mem, encoded, len(encoded))
    ctypes.windll.kernel32.GlobalUnlock(h_mem)
    ctypes.windll.user32.OpenClipboard(0)
    ctypes.windll.user32.EmptyClipboard()
    ctypes.windll.user32.SetClipboardData(CF_UNICODETEXT, h_mem)
    ctypes.windll.user32.CloseClipboard()

    pyautogui.hotkey("ctrl", "v")
    time.sleep(0.05)


def type_text(text=None, content=None):
    """Paste text via clipboard — fast, Unicode-safe, stop/pause supported.
    Also saves to Desktop/typed_content.txt so the Editor page can open it."""
    from core import execution_control
    from core.session_state import set_last_file
    import os

    final_text = text if text else content
    if not final_text:
        return "No text provided"

    # Save for editor
    desktop = os.path.join(os.path.expanduser("~"), "Desktop")
    typed_file = os.path.join(desktop, "typed_content.txt")
    try:
        with open(typed_file, "w", encoding="utf-8") as f:
            f.write(final_text)
        set_last_file(typed_file)
    except Exception:
        pass

    time.sleep(0.5)  # small wait after app opens/focuses

    # Split on newlines and paste line-by-line (so Enter keys work correctly)
    lines = final_text.split("\n")
    for i, line in enumerate(lines):
        if execution_control.should_stop():
            return "Typing stopped by user"
        while execution_control.is_paused():
            time.sleep(0.3)
            if execution_control.should_stop():
                return "Typing stopped by user"

        if line:
            _clipboard_paste(line)

        # Press Enter after every line except the last
        if i < len(lines) - 1:
            pyautogui.press("enter")
            time.sleep(0.02)

    return "Text typed"

def press_enter(times=1):
    """Press Enter key"""
    for _ in range(times):
        pyautogui.press("enter")
        time.sleep(0.1)
    return f"Pressed Enter {times} time(s)"
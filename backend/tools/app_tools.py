import subprocess
import os
import platform
import time
import pygetwindow as gw

# =========================
# SYSTEM APPS
# =========================
import pyautogui

def _click_window_center(win, y_offset_ratio=0.5):
    """Click the center of a window to give it focus — safe, no side effects."""
    try:
        x = win.left + win.width // 2
        y = win.top + int(win.height * y_offset_ratio)
        pyautogui.click(x, y)
        time.sleep(0.4)
    except Exception:
        pass

def _wait_for_window(title_patterns, timeout=8.0):
    """Poll until a window with one of the title patterns appears, return it."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        for pattern in title_patterns:
            wins = gw.getWindowsWithTitle(pattern)
            if wins:
                return wins[0]
        time.sleep(0.4)
    return None

def open_notepad():
    subprocess.Popen("notepad")
    win = _wait_for_window(["Untitled - Notepad", "Untitled – Notepad", "Notepad"], timeout=6)
    if win:
        win.restore()
        win.activate()
        time.sleep(0.6)
        _click_window_center(win, y_offset_ratio=0.55)   # click text area
    return "Notepad opened"

def write_in_notepad(text: str):
    """Opens Notepad and types the given text smoothly with stop checking."""
    open_notepad()
    time.sleep(1) # wait a bit before starting to type
    from core import execution_control
    
    # Type chunk by chunk or character by character to allow cancellation
    for char in text:
        if execution_control.should_stop():
            return "Stopped typing in Notepad."
        while execution_control.is_paused():
            time.sleep(0.1)
            if execution_control.should_stop():
                return "Stopped typing in Notepad."
                
        pyautogui.write(char)
        time.sleep(0.02)
        
    return f"Wrote {len(text)} characters in Notepad."


# def open_word():
#     subprocess.Popen("start winword", shell=True)
#     return "MS Word opened"

# def open_word():
#     subprocess.Popen("start winword", shell=True)
#     time.sleep(5)  # wait for Word to open

#     # Bring Word to front
#     windows = gw.getWindowsWithTitle("Word")
#     if windows:
#         windows[0].activate()
#         windows[0].maximize()

#     return "Microsoft Word opened and focused."


def open_word():
    possible_paths = [
        r"C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE",
        r"C:\Program Files (x86)\Microsoft Office\root\Office16\WINWORD.EXE",
        r"C:\Program Files\Microsoft Office\Office16\WINWORD.EXE",
        r"C:\Program Files (x86)\Microsoft Office\Office16\WINWORD.EXE",
    ]

    launched = False
    for path in possible_paths:
        if os.path.exists(path):
            subprocess.Popen(path)
            launched = True
            break

    if not launched:
        return "Microsoft Word not found. Please check installation."

    # Word takes longer to load — wait generously, then click in document area
    win = _wait_for_window(
        ["Document1 - Word", "Document1 – Word", "Microsoft Word", "Word"],
        timeout=12
    )
    if win:
        win.restore()
        win.activate()
        time.sleep(1.0)                              # let Word fully render
        _click_window_center(win, y_offset_ratio=0.65)  # click below ribbon
    return "Microsoft Word opened successfully."


def open_excel():
    subprocess.Popen("start excel", shell=True)
    return "MS Excel opened"

def open_powerpoint():
    subprocess.Popen("start powerpnt", shell=True)
    return "MS PowerPoint opened"

def open_vscode():
    subprocess.Popen("start code", shell=True)
    return "VS Code opened"

def open_chrome():
    subprocess.Popen("start chrome", shell=True)
    return "Chrome opened"

def open_edge():
    subprocess.Popen("start msedge", shell=True)
    return "Microsoft Edge opened"

def open_paint():
    subprocess.Popen("start mspaint", shell=True)
    return "Paint opened"

def open_calculator():
    subprocess.Popen("start calc", shell=True)
    return "Calculator opened"

def open_file_explorer():
    subprocess.Popen("explorer")
    return "File Explorer opened"

def open_cmd():
    subprocess.Popen("start cmd", shell=True)
    return "Command Prompt opened"

def open_terminal():
    subprocess.Popen("start wt", shell=True)
    return "Windows Terminal opened"

def open_task_manager():
    subprocess.Popen("taskmgr")
    return "Task Manager opened"

def open_settings():
    subprocess.Popen("start ms-settings:", shell=True)
    return "Windows Settings opened"

def open_control_panel():
    subprocess.Popen("control")
    return "Control Panel opened"

def open_discord():
    subprocess.Popen("start discord", shell=True)
    return "Discord opened"

def open_spotify():
    subprocess.Popen("start spotify", shell=True)
    return "Spotify opened"

def open_zoom():
    subprocess.Popen("start zoom", shell=True)
    return "Zoom opened"

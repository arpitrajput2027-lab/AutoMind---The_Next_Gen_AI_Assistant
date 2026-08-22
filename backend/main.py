# main.py
import os
os.environ["PYTHONUTF8"] = "1"
import sys
import threading
from ui.gui import VenomGUI
from audio.sarvam_tts import speak_sarvam
from core.memory import load_memory
from mobile.server import start_mobile_server

def initialize():
    """Initialize Venom AI"""
    print("VENOM AI INITIALIZING...")

    # Load memory
    load_memory()
    print("[OK] Memory loaded")

    # Start mobile server in background
    mobile_thread = threading.Thread(target=start_mobile_server, daemon=True)
    mobile_thread.start()
    print("[OK] Mobile server started on port 8000")

    # Welcome message
    speak_sarvam("Venom activated. Ready for commands.")
    print("[OK] Venom activated\n")

if __name__ == "__main__":
    initialize()
    
    # Launch GUI
    app = VenomGUI()
    app.mainloop()
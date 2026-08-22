"""
run_server.py — Start ONLY the FastAPI/WebSocket server (no desktop GUI).
Use this when you're using the Next.js frontend at localhost:3000.

Usage:
    python -X utf8 run_server.py
"""
import os
os.environ["PYTHONUTF8"] = "1"

from core.memory import load_memory
from mobile.server import start_mobile_server

if __name__ == "__main__":
    print("VENOM AI - Server Mode (no GUI)")
    load_memory()
    print("[OK] Memory loaded")
    start_mobile_server()

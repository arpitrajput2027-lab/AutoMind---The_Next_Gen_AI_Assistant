# mobile/routes.py - Additional API Routes

from fastapi import APIRouter
from core.memory import get_context, clear_memory
from core.vision import capture_screen
import psutil
import platform

router = APIRouter()

@router.get("/status")
async def get_status():
    """Get system status"""
    return {
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent,
        "platform": platform.system(),
        "listening": True
    }

@router.get("/memory")
async def get_memory():
    """Get conversation memory"""
    return {
        "context": get_context()
    }

@router.post("/memory/clear")
async def clear_memory_endpoint():
    """Clear conversation memory"""
    clear_memory()
    return {"success": True, "message": "Memory cleared"}

@router.post("/screenshot")
async def take_screenshot():
    """Take screenshot"""
    path = capture_screen()
    return {"success": True, "path": path}
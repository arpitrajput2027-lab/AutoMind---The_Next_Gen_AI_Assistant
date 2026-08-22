# core/tool_registry.py - Complete Tool Mapping

from tools import (
    system_tools, 
    app_tools, 
    web_tools, 
    file_tools,
    email, 
    whatsapp_tools,
    vscode_tools,
    office_tools,
    preview_tools
)
from core.vision import capture_screen, analyze_screen_with_llm

TOOL_REGISTRY = {
    # ===== TYPING =====
    "type_text": system_tools.type_text,
    "press_enter": system_tools.press_enter,
    
    # ===== SYSTEM CONTROL =====
    "brightness_up": system_tools.brightness_up,
    "brightness_down": system_tools.brightness_down,
    "set_brightness": system_tools.set_brightness,
    "volume_up": system_tools.volume_up,
    "volume_down": system_tools.volume_down,
    "set_volume": system_tools.set_volume,
    "mute_volume": system_tools.mute_volume,
    "shutdown": system_tools.shutdown,
    "restart": system_tools.restart,
    "sleep": system_tools.sleep_system,
    "lock_screen": system_tools.lock_screen,
    
    # ===== APPLICATIONS =====
    "open_notepad": app_tools.open_notepad,
    "open_word": app_tools.open_word,
    "open_excel": app_tools.open_excel,
    "open_powerpoint": app_tools.open_powerpoint,
    "open_vscode": app_tools.open_vscode,
    "open_chrome": app_tools.open_chrome,
    "open_edge": app_tools.open_edge,
    "open_paint": app_tools.open_paint,
    "open_calculator": app_tools.open_calculator,
    "open_file_explorer": app_tools.open_file_explorer,
    "open_cmd": app_tools.open_cmd,
    "open_terminal": app_tools.open_terminal,
    "open_task_manager": app_tools.open_task_manager,
    "open_settings": app_tools.open_settings,
    "open_control_panel": app_tools.open_control_panel,
    "open_discord": app_tools.open_discord,
    "open_spotify": app_tools.open_spotify,
    "open_zoom": app_tools.open_zoom,
    
    # ===== VS CODE =====
    "generate_code": vscode_tools.generate_code,
    "open_vscode_with_file": vscode_tools.open_vscode_with_file,
    
    # ===== OFFICE =====
    "create_formatted_word": office_tools.create_formatted_word,
    "create_powerpoint": office_tools.create_powerpoint,
    
    # ===== FILE OPS =====
    "create_file": file_tools.create_file,
    "write_file": file_tools.write_file,
    "read_file": file_tools.read_file,
    "delete_file": file_tools.delete_file,
    "replace_in_file": file_tools.replace_in_file,
    "edit_file": file_tools.edit_file_with_llm,
    
    # ===== WEB =====
    "youtube_search": web_tools.youtube_search,
    "google_search": web_tools.google_search,
    "open_url": web_tools.open_url,
    
    # ===== COMMUNICATION =====
    "send_whatsapp_message": whatsapp_tools.send_message,
    "send_email_with_preview": preview_tools.preview_and_send_email,
    
    # ===== VISION =====
    "capture_screen": capture_screen,
    "analyze_screen": analyze_screen_with_llm,
}
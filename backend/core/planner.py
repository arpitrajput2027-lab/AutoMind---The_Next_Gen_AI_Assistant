# core/planner.py

VALID_ACTIONS = {
    # Typing
    "type_text", "press_enter",
    
    # System Control
    "brightness_up", "brightness_down", "set_brightness",
    "volume_up", "volume_down", "set_volume", "mute_volume",
    "shutdown", "restart", "sleep", "lock_screen",
    
    # File Operations
    "create_file", "write_file", "read_file", "delete_file",
    "replace_in_file", "edit_file",
    "create_formatted_word", "create_powerpoint",
    
    # Applications
    "open_notepad", "open_word", "open_excel", "open_powerpoint",
    "open_vscode", "open_chrome", "open_edge", "open_paint",
    "open_calculator", "open_file_explorer", "open_cmd",
    "open_terminal", "open_task_manager", "open_settings",
    "open_control_panel", "open_discord", "open_spotify", "open_zoom",
    
    # VS Code
    "generate_code", "open_vscode_with_file",
    
    # Web
    "youtube_search", "google_search", "open_url",
    
    # Communication
    "send_whatsapp_message", "send_email_with_preview",
    
    # Vision
    "analyze_screen", "capture_screen",
}

# core/planner.py - normalize_parameters function mein yeh add karo

def normalize_parameters(action, params):
    """Normalize parameter names"""
    if not isinstance(params, dict):
        return {}
    
    if action == "create_file":
        if "filename" in params:
            params["path"] = params.pop("filename")
    
    if action == "press_enter":
        if "count" in params:
            params["times"] = params.pop("count")
    
    # ✅ FIX: generate_code parameter aliases
    if action == "generate_code":
        if "file_path" in params:
            params["filename"] = params.pop("file_path")
        if "file_name" in params:
            params["filename"] = params.pop("file_name")
        if "lang" in params:
            params["language"] = params.pop("lang")
        if "code_description" in params:
            params["description"] = params.pop("code_description")
        if "task" in params:
            params["description"] = params.pop("task")
        if "prompt" in params:
            params["description"] = params.pop("prompt")
    
    return params

def plan_tasks(llm_output):
    """Convert LLM output to executable steps"""
    steps = []
    
    if "plan" in llm_output and isinstance(llm_output["plan"], list):
        for step in llm_output["plan"]:
            action = step.get("action")
            
            if action in VALID_ACTIONS:
                params = step.get("parameters", {})
                params = normalize_parameters(action, params)
                
                steps.append({
                    "action": action,
                    "parameters": params
                })
    
    return steps
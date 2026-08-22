# core/router.py - Command Routing (Optional - for modular expansion)

from core.tool_registry import TOOL_REGISTRY

def route_command(action_name: str, parameters: dict):
    """Route command to appropriate tool"""
    if action_name not in TOOL_REGISTRY:
        return f"Action '{action_name}' not found."
    
    try:
        result = TOOL_REGISTRY[action_name](**parameters)
        return result
    except Exception as e:
        return f"Error executing {action_name}: {e}"
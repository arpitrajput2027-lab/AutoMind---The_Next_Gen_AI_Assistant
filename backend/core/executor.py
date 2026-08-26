# core/executor.py

from core.tool_registry import TOOL_REGISTRY
from core import execution_control
import time


def execute_plan(steps):
    """Execute planned steps sequentially with stop/pause support."""
    results = []
    execution_control.reset()

    for i, step in enumerate(steps):
        # ── Stop check ──────────────────────────────────────────────
        if execution_control.should_stop():
            results.append("Execution stopped by user.")
            break

        # ── Pause loop ───────────────────────────────────────────────
        while execution_control.is_paused():
            time.sleep(0.3)
            if execution_control.should_stop():
                break

        if execution_control.should_stop():
            results.append("Execution stopped by user.")
            break

        action = step.get("action")
        params = step.get("parameters", {})

        if action not in TOOL_REGISTRY:
            results.append(f"Unknown action: {action}")
            continue

        try:
            print(f"Executing [{i+1}/{len(steps)}]: {action}")
            result = TOOL_REGISTRY[action](**params)
            results.append(f"{action}: {result}")
            time.sleep(1.2)

        except Exception as e:
            from tools.preview_tools import EmailPreviewException
            if isinstance(e, EmailPreviewException):
                raise  # Re-raise to be caught by the server for UI preview
            results.append(f"Error in {action}: {e}")
            time.sleep(0.5)

    return results

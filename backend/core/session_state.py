# core/session_state.py
# Tracks per-session context like last created/opened file paths

_state = {
    "last_file": None,       # last file path created or written
    "last_doc": None,        # last .docx path
    "last_html": None,       # last .html path
    "last_code": None,       # last code file path
    "last_pptx": None,       # last .pptx path
}

def set_last_file(path: str):
    """Store the most recently created/modified file."""
    _state["last_file"] = path
    ext = (path or "").lower()
    if ext.endswith(".docx"):
        _state["last_doc"] = path
    elif ext.endswith(".html") or ext.endswith(".htm"):
        _state["last_html"] = path
    elif ext.endswith(".pptx"):
        _state["last_pptx"] = path
    else:
        _state["last_code"] = path

def get_last_file() -> str | None:
    return _state["last_file"]

def get_last_doc() -> str | None:
    return _state["last_doc"]

def get_last_html() -> str | None:
    return _state["last_html"]

def get_last_code() -> str | None:
    return _state["last_code"]

def get_context_summary() -> str:
    """Returns a short string for the LLM to know what files exist in session."""
    parts = []
    if _state["last_file"]:
        parts.append(f'last_file="{_state["last_file"]}"')
    if _state["last_doc"]:
        parts.append(f'last_doc="{_state["last_doc"]}"')
    if _state["last_html"]:
        parts.append(f'last_html="{_state["last_html"]}"')
    if _state["last_code"]:
        parts.append(f'last_code="{_state["last_code"]}"')
    if _state["last_pptx"]:
        parts.append(f'last_pptx="{_state["last_pptx"]}"')
    return ", ".join(parts) if parts else "none"

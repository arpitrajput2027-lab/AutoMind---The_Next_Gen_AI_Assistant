# core/execution_control.py
# Global flags to stop / pause task execution mid-run

_state = {
    "stop": False,
    "pause": False,
}

def request_stop():
    _state["stop"] = True
    _state["pause"] = False

def request_pause():
    _state["pause"] = True

def request_resume():
    _state["pause"] = False

def reset():
    _state["stop"] = False
    _state["pause"] = False

def should_stop() -> bool:
    return _state["stop"]

def is_paused() -> bool:
    return _state["pause"]

# core/speech.py - Speech Recognition

from audio.sarvam_stt import listen_sarvam

def listen(timeout=5):
    """
    Main listen function - uses Sarvam STT
    Falls back to Whisper if needed
    """
    try:
        # Try Sarvam first (fast)
        text = listen_sarvam(duration=timeout)
        return text
    except Exception as e:
        print(f"STT Error: {e}")
        return ""
# audio/audio_player.py

import sounddevice as sd
import soundfile as sf

def play_audio_file(filepath):
    """Play audio file using sounddevice"""
    try:
        data, fs = sf.read(filepath, dtype='float32')
        sd.play(data, fs)
        sd.wait()
        return True
    except Exception as e:
        print(f"Audio playback error: {e}")
        return False
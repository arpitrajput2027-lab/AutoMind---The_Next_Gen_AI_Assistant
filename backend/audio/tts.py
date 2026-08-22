# audio/tts.py - Legacy Edge TTS (Backup)

import edge_tts
import asyncio
import tempfile
import sounddevice as sd
import soundfile as sf
import os

VOICE = "en-IN-NeerjaNeural"

async def _generate_audio(text, file_path):
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(file_path)

def speak(text):
    """Stable blocking TTS using Edge"""
    try:
        temp_path = os.path.join(tempfile.gettempdir(), "venom_tts.wav")
        asyncio.run(_generate_audio(text, temp_path))
        
        data, fs = sf.read(temp_path, dtype="float32")
        sd.play(data, fs)
        sd.wait()
        
        os.remove(temp_path)
    except Exception as e:
        print("TTS Error:", e)
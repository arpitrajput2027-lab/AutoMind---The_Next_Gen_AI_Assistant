# audio/sarvam_stt.py - CORRECTED STT

import os
import requests
import sounddevice as sd
import soundfile as sf
import tempfile
from dotenv import load_dotenv

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text"

# ✅ Valid STT models
VALID_STT_MODELS = ['saaras:v3', 'saaras:v3']

def record_audio(duration=5, samplerate=16000):
    """Record audio from microphone"""
    print(f"🎤 Recording for {duration} seconds...")
    audio = sd.rec(
        int(duration * samplerate), 
        samplerate=samplerate, 
        channels=1, 
        dtype='float32'
    )
    sd.wait()
    return audio, samplerate

def transcribe_sarvam(audio_data, samplerate):
    """Transcribe audio using Sarvam STT"""
    try:
        # Save to temp file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            sf.write(f.name, audio_data, samplerate)
            temp_path = f.name
        
        headers = {
            'API-Subscription-Key': SARVAM_API_KEY
        }
        
        # Upload audio file
        with open(temp_path, 'rb') as audio_file:
            files = {
                'file': ('audio.wav', audio_file, 'audio/wav')
            }
            
            # ✅ CORRECTED form data
            data = {
                'language_code': 'hi-IN',
                'model': 'saaras:v3'  # ✅ Latest STT model
            }
            
            response = requests.post(
                SARVAM_STT_URL,
                headers=headers,
                files=files,
                data=data,
                timeout=15
            )
        
        # Cleanup
        os.remove(temp_path)
        
        if response.status_code == 200:
            result = response.json()
            text = result.get('transcript', '')
            print(f"📝 Transcribed: {text}")
            return text.strip()
        else:
            print(f"❌ STT Error {response.status_code}: {response.text}")
            return ""
            
    except Exception as e:
        print(f"❌ STT Exception: {e}")
        return ""

def listen_sarvam(duration=5):
    """Complete listen pipeline"""
    audio, sr = record_audio(duration)
    text = transcribe_sarvam(audio, sr)
    return text
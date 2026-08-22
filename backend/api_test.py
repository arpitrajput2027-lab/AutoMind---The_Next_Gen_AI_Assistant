# test_sarvam_api.py - WORKING TEST

import requests
import os
from dotenv import load_dotenv
import base64
import tempfile
import soundfile as sf
import sounddevice as sd

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

def test_tts():
    """Test Sarvam TTS with CORRECT parameters"""
    print("\n🔊 Testing Sarvam TTS...")
    
    url = "https://api.sarvam.ai/text-to-speech"
    
    headers = {
        'API-Subscription-Key': SARVAM_API_KEY,
        'Content-Type': 'application/json'
    }
    
    # ✅ CORRECTED payload
    payload = {
        "inputs": ["Namaste, main Venom AI hoon. Aapka swagat hai!"],
        "target_language_code": "hi-IN",
        "speaker": "kavya",  # ✅ Valid speaker
        # "pitch": 0,
        "pace": 1.0,
        # "loudness": 1.5,
        "speech_sample_rate": 8000,
        "enable_preprocessing": True,
        "model": "bulbul:v3"  # ✅ Valid model
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            if 'audios' in result:
                print("✅ TTS API Working!")
                
                # Decode and play
                audio_bytes = base64.b64decode(result['audios'][0])
                
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                    f.write(audio_bytes)
                    temp_path = f.name
                
                print(f"🔊 Playing audio...")
                data, fs = sf.read(temp_path, dtype='float32')
                sd.play(data, fs)
                sd.wait()
                
                os.remove(temp_path)
                print("✅ Playback successful!")
            else:
                print(f"❌ Unexpected format: {result}")
        else:
            print(f"❌ API Error: {response.text}")
    
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_multiple_voices():
    """Test different voices"""
    print("\n🎤 Testing Multiple Voices...")
    
    url = "https://api.sarvam.ai/text-to-speech"
    
    headers = {
        'API-Subscription-Key': SARVAM_API_KEY,
        'Content-Type': 'application/json'
    }
    
    voices = [
        ("kavya", "Female - Kavya"),
        ("amit", "Male - Amit"),
        ("priya", "Female - Priya"),
        ("rahul", "Male - Rahul")
    ]
    
    for speaker, desc in voices:
        print(f"\n🔊 Testing {desc}...")
        
        payload = {
            "inputs": [f"Hello from {desc}"],
            "target_language_code": "hi-IN",
            "speaker": speaker,
            "model": "bulbul:v3"
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                audio_bytes = base64.b64decode(result['audios'][0])
                
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                    f.write(audio_bytes)
                    temp_path = f.name
                
                data, fs = sf.read(temp_path, dtype='float32')
                sd.play(data, fs)
                sd.wait()
                os.remove(temp_path)
                
                print(f"✅ {desc} working!")
            else:
                print(f"❌ {desc} failed: {response.text}")
        
        except Exception as e:
            print(f"❌ Error: {e}")
        
        import time
        time.sleep(0.5)

if __name__ == "__main__":
    print("=" * 60)
    print("SARVAM API TEST - CORRECTED VERSION")
    print("=" * 60)
    
    test_tts()
    test_multiple_voices()
    
    print("\n" + "=" * 60)
    print("✅ All tests complete!")
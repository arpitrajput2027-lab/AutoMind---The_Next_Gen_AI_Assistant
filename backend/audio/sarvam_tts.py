# # audio/sarvam_tts.py - FINAL WORKING VERSION

# import os
# import requests
# import tempfile
# import sounddevice as sd
# import soundfile as sf
# from dotenv import load_dotenv
# import base64

# load_dotenv()

# SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
# SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech"

# # ✅ Valid speaker names (from API error message)
# VALID_SPEAKERS = [
#     'anushka', 'abhilash', 'manisha', 'vidya', 'arya', 'karun', 
#     'hitesh', 'aditya', 'ritu', 'priya', 'neha', 'rahul', 
#     'pooja', 'rohan', 'simran', 'kavya', 'amit', 'dev', 
#     'ishita', 'shreya', 'ratan', 'varun', 'manan', 'sumit'
# ]

# # ✅ Valid models (from API error message)
# VALID_MODELS = ['bulbul:v2', 'bulbul:v3-beta', 'bulbul:v3']

# def speak_sarvam(text, voice="meera"):
#     """
#     Sarvam AI TTS - CORRECTED VERSION
#     voice: Use 'meera' for female, 'arvind' for male (mapped to valid speakers)
#     """
#     try:
#         print(f"🔊 Speaking: {text[:50]}...")
        
#         # ✅ Map common names to valid Sarvam speakers
#         speaker_map = {
#             'meera': 'kavya',      # Female Hindi voice
#             'aman': 'amit',        # Male Hindi voice
#             'female': 'kavya',
#             'male': 'amit',
#             'hindi_female': 'priya',
#             'hindi_male': 'rahul',
#             'english_female': 'ishita',
#             'english_male': 'rohan'
#         }
        
#         # Get valid speaker name
#         speaker = speaker_map.get(voice.lower(), 'kavya')  # Default: kavya (female)
        
#         headers = {
#             'API-Subscription-Key': SARVAM_API_KEY,
#             'Content-Type': 'application/json'
#         }
        
#         # ✅ CORRECTED payload with valid speaker and model
#         payload = {
#             "inputs": [text],
#             "target_language_code": "hi-IN",
#             "speaker": speaker,  # ✅ Valid speaker name
            
#             "pace": 1.0,
            
#             "speech_sample_rate": 8000,
#             "enable_preprocessing": True,
#             "model": "bulbul:v3"  # ✅ Latest model version
#         }
        
#         response = requests.post(
#             SARVAM_TTS_URL,
#             headers=headers,
#             json=payload,
#             timeout=10
#         )
        
#         if response.status_code == 200:
#             result = response.json()
            
#             if 'audios' in result and len(result['audios']) > 0:
#                 # Decode base64 audio
#                 audio_base64 = result['audios'][0]
#                 audio_bytes = base64.b64decode(audio_base64)
                
#                 # Save to temp file
#                 with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
#                     f.write(audio_bytes)
#                     temp_path = f.name
                
#                 # Play audio
#                 data, fs = sf.read(temp_path, dtype='float32')
#                 sd.play(data, fs)
#                 sd.wait()
                
#                 # Cleanup
#                 os.remove(temp_path)
#                 print("✅ Sarvam TTS Success!")
#                 return True
#             else:
#                 print(f"❌ Unexpected response: {result}")
#                 return False
#         else:
#             print(f"❌ API Error {response.status_code}: {response.text}")
#             return False
            
#     except Exception as e:
#         print(f"❌ TTS Exception: {e}")
#         return False

# # Quick test function
# def test_voices():
#     """Test different Sarvam voices"""
#     test_phrases = [
#         ("kavya", "Namaste, main Venom AI hoon"),      # Female
#         ("amit", "Hello, I am Venom AI"),              # Male
#         ("priya", "Aapka swagat hai"),                 # Female Hindi
#         ("rahul", "System ready for commands")         # Male Hindi
#     ]
    
#     for speaker, text in test_phrases:
#         print(f"\n🎤 Testing speaker: {speaker}")
#         speak_sarvam(text, voice=speaker)
#         import time
#         time.sleep(1)

# audio/sarvam_tts.py - FIXED WITH CHUNKING

import os
import requests
import tempfile
import sounddevice as sd
import soundfile as sf
from dotenv import load_dotenv
import base64
import time
import re

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech"
MAX_CHARS = 450  # Keep below 500 for safety

def split_text_smart(text, max_length=MAX_CHARS):
    """
    Split text into chunks intelligently
    - Splits at sentence boundaries
    - Keeps chunks under max_length
    """
    if len(text) <= max_length:
        return [text]
    
    chunks = []
    
    # Split by sentences (., !, ?)
    sentences = re.split(r'([.!?]+\s+)', text)
    
    current_chunk = ""
    
    for i in range(0, len(sentences), 2):
        sentence = sentences[i]
        separator = sentences[i + 1] if i + 1 < len(sentences) else ""
        
        # If adding this sentence exceeds limit
        if len(current_chunk) + len(sentence) + len(separator) > max_length:
            if current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = sentence + separator
            else:
                # Single sentence too long - split by words
                words = sentence.split()
                temp_chunk = ""
                for word in words:
                    if len(temp_chunk) + len(word) + 1 > max_length:
                        chunks.append(temp_chunk.strip())
                        temp_chunk = word + " "
                    else:
                        temp_chunk += word + " "
                if temp_chunk:
                    current_chunk = temp_chunk + separator
        else:
            current_chunk += sentence + separator
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

def speak_single_chunk(text, voice="kavya"):
    """
    Speak a single chunk (under 500 chars)
    """
    try:
        headers = {
            'API-Subscription-Key': SARVAM_API_KEY,
            'Content-Type': 'application/json'
        }
        
        payload = {
            "inputs": [text],
            "target_language_code": "hi-IN",
            "speaker": voice,
    
            "pace": 1.0,
         
            "speech_sample_rate": 8000,
            "enable_preprocessing": True,
            "model": "bulbul:v3"
        }
        
        response = requests.post(
            SARVAM_TTS_URL,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if 'audios' in result and len(result['audios']) > 0:
                audio_base64 = result['audios'][0]
                audio_bytes = base64.b64decode(audio_base64)
                
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                    f.write(audio_bytes)
                    temp_path = f.name
                
                data, fs = sf.read(temp_path, dtype='float32')
                sd.play(data, fs)
                sd.wait()
                os.remove(temp_path)
                
                return True
            else:
                print(f"❌ Unexpected response: {result}")
                return False
        else:
            print(f"❌ API Error {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ TTS Exception: {e}")
        return False

def speak_sarvam_with_retry(text, voice="kavya", max_retries=2):
    """
    Sarvam TTS with retry logic and chunking
    """
    # Split text into chunks
    chunks = split_text_smart(text)
    
    print(f"🔊 Speaking {len(chunks)} chunk(s)...")
    
    success_count = 0
    
    for i, chunk in enumerate(chunks):
        print(f"📢 Chunk {i+1}/{len(chunks)}: {len(chunk)} chars")
        
        # Try with retry
        for attempt in range(max_retries):
            try:
                if speak_single_chunk(chunk, voice):
                    success_count += 1
                    # Small pause between chunks
                    if i < len(chunks) - 1:
                        time.sleep(0.3)
                    break
                else:
                    if attempt < max_retries - 1:
                        time.sleep(0.5)
            except Exception as e:
                print(f"⚠️ Chunk {i+1} attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(0.5)
    
    return success_count == len(chunks)

def speak_sarvam(text, voice="kavya"):
    """
    Main TTS function with fallback
    - Automatically chunks long text
    - Falls back to Edge TTS if Sarvam fails
    """
    print(f"🔊 Speaking: {text[:80]}{'...' if len(text) > 80 else ''}")
    print(f"📏 Text length: {len(text)} characters")
    
    # Try Sarvam with chunking
    if speak_sarvam_with_retry(text, voice):
        print("✅ Sarvam TTS Success")
        return True
    
    # Fallback to Edge TTS
    try:
        print("⚠️ Sarvam failed, using Edge TTS fallback...")
        from audio.tts import speak as speak_edge
        speak_edge(text)
        return True
    except Exception as e:
        print(f"❌ All TTS failed: {e}")
        return False

# Quick test
if __name__ == "__main__":
    # Test short text
    speak_sarvam("Hello, I am Venom AI!")
    
    time.sleep(1)
    
    # Test long text (>500 chars)
    long_text = """
    Venom AI is an advanced autonomous assistant that can control your computer 
    using natural language commands. It supports both Hindi and English, allowing 
    you to interact seamlessly in your preferred language. The system can open 
    applications, manage files, send messages, control system settings like 
    brightness and volume, and even generate code automatically. With screen 
    awareness capabilities, Venom can see what's on your screen and provide 
    contextual assistance. The mobile integration allows you to control your 
    desktop from anywhere on your local network. This makes Venom AI a powerful 
    productivity tool for modern users.
    """
    
    speak_sarvam(long_text.strip())
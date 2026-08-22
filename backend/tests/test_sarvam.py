# tests/test_sarvam.py - UPDATED WITH FALLBACK

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from audio.tts import speak  # Use Edge TTS for testing
import time

def test_edge_tts():
    """Test Edge TTS (Fallback)"""
    print("\n🔊 Testing Edge TTS...")
    
    test_phrases = [
        "Hello, I am Venom AI",
        "Testing voice system"
    ]
    
    for phrase in test_phrases:
        print(f"Speaking: {phrase}")
        try:
            speak(phrase)
            print("✅ TTS working")
        except Exception as e:
            print(f"❌ TTS failed: {e}")
        time.sleep(1)

def test_speed():
    """Test response speed"""
    print("\n⚡ Testing speed...")
    
    start = time.time()
    speak("Quick test")
    end = time.time()
    
    latency = end - start
    print(f"TTS Latency: {latency:.2f}s")
    
    if latency < 5:
        print("✅ Speed: ACCEPTABLE")
    else:
        print("⚠️ Speed: SLOW")

if __name__ == "__main__":
    print("=" * 50)
    print("VENOM AI - TTS Tests (Edge TTS)")
    print("=" * 50)
    
    test_edge_tts()
    test_speed()
    
    print("\n✅ All tests complete!")
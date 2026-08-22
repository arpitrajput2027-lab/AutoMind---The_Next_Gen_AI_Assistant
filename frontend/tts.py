import asyncio
import edge_tts
import sys
import base64
import io

async def text_to_speech(text: str, voice: str = "hi-IN-SwaraNeural"):
    communicate = edge_tts.Communicate(text, voice)
    
    # Audio bytes memory mein store karo
    audio_bytes = io.BytesIO()
    
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes.write(chunk["data"])
    
    # Base64 mein convert karo — JSON mein bhejne ke liye
    audio_bytes.seek(0)
    audio_b64 = base64.b64encode(audio_bytes.read()).decode("utf-8")
    return audio_b64

if __name__ == "__main__":
    # Command line se text lo
    if len(sys.argv) < 2:
        print("ERROR: No text provided")
        sys.exit(1)
    
    text = sys.argv[1]
    
    # Hindi text ke liye Hindi voice, English ke liye English
    # Hinglish ke liye Hindi voice best hai
    voice = "hi-IN-SwaraNeural"
    
    result = asyncio.run(text_to_speech(text, voice))
    
    # Base64 audio print karo — Node.js ye read karega
    print(result)
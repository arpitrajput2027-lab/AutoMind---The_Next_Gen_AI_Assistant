# config.py

# ============== WINDOW ==============
WINDOW_TITLE = "VENOM AI Assistant"
WINDOW_WIDTH = 1300
WINDOW_HEIGHT = 800

# ============== MEMORY ==============
MAX_MEMORY = 10
MEMORY_FILE = "memory.json"

# ============== SARVAM AI ==============
# ============== SARVAM AI ==============
SARVAM_API_URL = "https://api.sarvam.ai"
SARVAM_TTS_VOICE = "kavya"  # ✅ Valid speaker (female)
# Other options: amit (male), priya (female), rahul (male)
SARVAM_TTS_MODEL = "bulbul:v3"  # ✅ Latest model
SARVAM_STT_MODEL = "saaras:v2"  # ✅ Latest STT model
SARVAM_STT_LANGUAGE = "hi-IN"

# ============== SPEECH ==============
LANGUAGE = "en-IN"
WAKE_WORD = "hello venom"

# ============== LEGACY TTS (Backup) ==============
EDGE_VOICE = "en-IN-NeerjaNeural"

# ============== MOBILE SERVER ==============
MOBILE_SERVER_HOST = "0.0.0.0"
MOBILE_SERVER_PORT = 8000

# ============== LLM ==============
LLM_TIMEOUT = 300
MAX_TOKENS = 3000

# ============== VISION ==============
SCREENSHOT_PATH = "temp_screenshot.png"
VISION_ENABLED = True

# ============== INTERACTION ==============
INTERACTIVE_MODE = True  # Ask clarifying questions
MAX_INTERACTION_DEPTH = 3  # Max follow-up questions
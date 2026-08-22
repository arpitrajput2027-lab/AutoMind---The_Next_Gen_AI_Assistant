# VENOM AI — Autonomous Desktop Control Agent

> Powered by Sarvam AI (sarvam-105b) | Hindi & English | Desktop + Mobile + Voice

VENOM AI is an autonomous desktop control agent that understands natural language (Hindi & English), plans multi-step tasks, and executes them on a Windows PC — controlling apps, writing documents, sending messages, generating code, and much more.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Architecture](#core-architecture)
- [Available Actions (50+)](#available-actions)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Setup & Run](#setup--run)
- [Environment Variables](#environment-variables)
- [Sample Workflows](#sample-workflows)
- [Known Limitations](#known-limitations)

---

## Overview

VENOM AI is a multi-interface AI assistant with three modes of interaction:

| Interface | Description |
|-----------|-------------|
| **Desktop GUI** | CustomTkinter window (currently commented out) |
| **Mobile Web App** | PWA served at `localhost:8000` — accessible on phone |
| **Voice** | Hindi/English input via Sarvam STT, responses via TTS |

### Key Capabilities

- Execute 50+ desktop actions from plain language commands
- Control system hardware (brightness, volume, shutdown, sleep)
- Launch and interact with applications (Notepad, Word, VS Code, Chrome, etc.)
- Send WhatsApp messages and emails
- Generate and open code files in VS Code
- Create formatted Word documents and PowerPoint presentations
- Search Google/YouTube, open URLs, summarize webpages
- Capture screenshots and analyze screen content
- Maintain rolling conversation memory (10 exchanges)
- Ask clarifying questions for ambiguous commands (interactive mode)
- Multilingual: Hindi (`hi-IN`) and English (`en-US`)

---

## Tech Stack

### Backend
| Component | Technology |
|-----------|-----------|
| Language | Python 3.10+ |
| LLM | Sarvam AI — `sarvam-105b` |
| TTS | Sarvam AI — `bulbul:v3` (kavya / amit) |
| STT | Sarvam AI — `saaras:v3` |
| Web Framework | FastAPI + Uvicorn |
| Real-time | WebSockets |

### Desktop Automation
| Component | Library |
|-----------|---------|
| Input simulation | PyAutoGUI, pynput, keyboard |
| Window management | PyGetWindow |
| Volume control | pycaw, comtypes |
| Brightness | screen-brightness-control |
| GUI (disabled) | CustomTkinter |

### Document & Office
| Format | Library |
|--------|---------|
| Word (.docx) | python-docx |
| Excel (.xlsx) | openpyxl |
| PowerPoint (.pptx) | python-pptx |
| Email | smtplib (Gmail SMTP) |

### Audio & Vision
| Component | Library |
|-----------|---------|
| Audio recording | sounddevice, soundfile |
| Audio playback | pydub |
| TTS fallback | edge-tts |
| Screenshot | PyAutoGUI |
| Vision | OpenCV |

### Frontend (Mobile)
- HTML5 + CSS3 + JavaScript (ES6+)
- WebSocket client
- PWA manifest (installable)
- Canvas-based voice visualizer
- Dark theme (`#0a0e1a` background)

---

## Project Structure

```
venom-ai-startup_pitch/
│
├── core/                          # AI reasoning pipeline
│   ├── assistant.py               # Main query processor & 380-line system prompt
│   ├── llm.py                     # Sarvam AI LLM + code generation (5-chunk continuation)
│   ├── planner.py                 # Action validation & parameter normalization
│   ├── executor.py                # Sequential step execution (1.2s delay between steps)
│   ├── memory.py                  # Persistent conversation (memory.json, max 10 exchanges)
│   ├── speech.py                  # STT router (Sarvam → Whisper fallback)
│   ├── interaction.py             # Clarification manager (max 3 follow-ups)
│   ├── vision.py                  # Screenshot capture & base64 encoding
│   ├── tool_registry.py           # Central map: action name → Python function
│   ├── content_generator.py       # Essay/content templates fallback
│   └── router.py                  # Additional routing logic
│
├── tools/                         # Executable action modules
│   ├── system_tools.py            # Brightness, volume, shutdown, restart, sleep, lock
│   ├── app_tools.py               # Launch 15+ Windows applications
│   ├── web_tools.py               # Google, YouTube, URL open, webpage summarize
│   ├── file_tools.py              # Create, read, write, delete files
│   ├── email.py                   # Gmail SMTP sending
│   ├── whatsapp_tools.py          # WhatsApp Web automation (image recognition + keyboard)
│   ├── vscode_tools.py            # Code generation → save → open in VS Code
│   ├── office_tools.py            # Word (formatted) + PowerPoint creation
│   └── preview_tools.py           # Email preview before sending
│
├── audio/                         # Speech I/O
│   ├── sarvam_tts.py              # TTS via Sarvam API (kavya, amit, priya, rahul)
│   ├── sarvam_stt.py              # STT: 5s recording at 16kHz → Sarvam API
│   ├── tts.py                     # Fallback TTS (Edge TTS — NeerjaNeural)
│   └── audio_player.py            # Playback utilities
│
├── mobile/                        # Mobile interface
│   ├── server.py                  # FastAPI server (port 8000, CORS open)
│   ├── routes.py                  # Route definitions
│   └── web_app/
│       ├── index.html             # Mobile UI structure
│       ├── app.js                 # WebSocket client + voice visualizer
│       ├── styles.css             # Dark theme, CSS Grid, animations
│       └── manifest.json          # PWA config
│
├── ui/                            # Desktop GUI (disabled)
│   ├── gui.py                     # CustomTkinter window (commented out)
│   └── preview_window.py          # Preview component
│
├── tests/
│   ├── run_all_tests.py
│   ├── test_sarvam.py
│   ├── test_vision.py
│   ├── test_tools.py
│   └── test_mobile.py
│
├── assets/                        # UI images (WhatsApp automation)
├── main.py                        # Entry point
├── config.py                      # All constants & settings
├── requirements.txt               # Python dependencies
├── .env                           # API keys & credentials
├── memory.json                    # Persistent conversation history
└── api_test.py                    # API testing utility
```

---

## Core Architecture

### Query Processing Pipeline

```
User Input (text / voice)
        │
        ▼
[Interaction Check]     ← Is this a clarification response?
        │
        ▼
[Load Memory]           ← Last 10 exchanges from memory.json
        │
        ▼
[Build Prompt]          ← System prompt (380 lines) + context + input
        │
        ▼
[Sarvam LLM Call]       ← sarvam-105b, max 3000 tokens, 300s timeout
        │
        ▼
[Parse JSON]            ← Strict JSON extraction from response
        │
        ▼
[Validate Actions]      ← Check against VALID_ACTIONS (30+ types)
        │
        ▼
[Execute Sequentially]  ← tool_registry maps action → function, 1.2s delay
        │
        ▼
[Speak + Display]       ← Sarvam TTS response
        │
        ▼
[Save to Memory]        ← Append exchange to memory.json
```

### LLM Response Format

The LLM always returns structured JSON:

```json
{
  "thought": "What the AI is trying to do",
  "plan": [
    { "action": "open_notepad", "parameters": {} },
    { "action": "type_text", "parameters": { "text": "Hello World" } }
  ],
  "final_response": "Opened Notepad and typed the text."
}
```

For clarification needed:
```json
{
  "needs_clarification": true,
  "clarification_question": "What message should I send to John?"
}
```

---

## Available Actions

### System Control
| Action | Parameters |
|--------|-----------|
| `brightness_up` / `brightness_down` | — |
| `set_brightness` | `level` (0–100) |
| `volume_up` / `volume_down` / `mute_volume` | — |
| `set_volume` | `level` (0–100) |
| `shutdown` / `restart` / `sleep` / `lock_screen` | — |

### Application Launch
`open_notepad`, `open_word`, `open_excel`, `open_powerpoint`, `open_vscode`, `open_chrome`, `open_edge`, `open_paint`, `open_calculator`, `open_file_explorer`, `open_cmd`, `open_terminal`, `open_task_manager`, `open_settings`, `open_control_panel`, `open_discord`, `open_spotify`, `open_zoom`

### Development
| Action | Parameters |
|--------|-----------|
| `generate_code` | `language`, `description`, `file_path` |
| `open_vscode_with_file` | `file_path` |

### Office Documents
| Action | Parameters |
|--------|-----------|
| `create_formatted_word` | `file_path`, `content`, `style` |
| `create_powerpoint` | `file_path`, `slides_data` (array) |

### File Operations
`create_file`, `write_file`, `read_file`, `delete_file` — all take `file_path`

### Web & Search
| Action | Parameters |
|--------|-----------|
| `google_search` | `query` |
| `youtube_search` | `query` |
| `open_url` | `url` |

### Communication
| Action | Parameters |
|--------|-----------|
| `send_whatsapp_message` | `contact`, `message` |
| `send_email_with_preview` | `to`, `subject`, `body` |

### Vision & Input
| Action | Parameters |
|--------|-----------|
| `capture_screen` | — |
| `analyze_screen` | — |
| `type_text` | `text` |
| `press_enter` | `times` |

---

## API Endpoints

The mobile server runs at `http://localhost:8000`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Serve mobile web app (index.html) |
| `GET` | `/health` | Health check — returns status, version, active connections |
| `POST` | `/execute` | REST: `{ "command": "..." }` → `{ "success": bool, "response": str, "logs": [] }` |
| `WS` | `/ws` | WebSocket: send `{ "type": "command", "command": "..." }`, receive `{ "type": "response", "response": "..." }` |

---

## Configuration

All constants live in `config.py`:

```python
# Window
WINDOW_TITLE = "VENOM AI Assistant"
WINDOW_WIDTH, WINDOW_HEIGHT = 1300, 800

# Memory
MAX_MEMORY = 10                    # rolling conversation window

# Sarvam AI
SARVAM_LLM_MODEL = "sarvam-105b"
SARVAM_TTS_VOICE = "kavya"         # female Hindi voice
SARVAM_STT_MODEL = "saaras:v2"
SARVAM_STT_LANGUAGE = "hi-IN"

# Speech
WAKE_WORD = "hello venom"
FALLBACK_VOICE = "en-IN-NeerjaNeural"

# Mobile Server
MOBILE_HOST = "0.0.0.0"
MOBILE_PORT = 8000

# LLM
LLM_TIMEOUT = 300                  # seconds
LLM_MAX_TOKENS = 3000

# Vision
SCREENSHOT_PATH = "temp_screenshot.png"
VISION_ENABLED = True

# Interaction
INTERACTIVE_MODE = True
MAX_CLARIFICATION_DEPTH = 3
```

---

## Setup & Run

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file (see [Environment Variables](#environment-variables)).

### 3. Run the Application

```bash
python main.py
```

This starts:
- Mobile web server on `http://localhost:8000`
- Desktop GUI (currently commented — mobile-only mode)
- Speaks: *"Venom activated. Ready for commands."*

### 4. Access Mobile Interface

Open `http://localhost:8000` in a browser (or on your phone if on the same network).

### 5. Run Tests

```bash
python tests/run_all_tests.py

# Individual tests
python tests/test_sarvam.py     # LLM & speech API
python tests/test_vision.py     # Screenshot capture
python tests/test_tools.py      # Action execution
python tests/test_mobile.py     # Mobile server (requires server running)
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
SARVAM_API_KEY=your_sarvam_api_key_here
EMAIL_ADDRESS=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password   # Not your regular password — use App Password
MOBILE_AUTH_TOKEN=venom_secure_token_12345
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords

---

## Sample Workflows

### Open Notepad and write about AI
```
Input: "Notepad mein AI ke baare mein likho"

Plan:
  1. open_notepad → {}
  2. type_text → { "text": "Artificial Intelligence: ... [300 words]" }

Response: "Notepad mein AI essay likh diya"
```

### Send WhatsApp message (with clarification)
```
Input: "John ko WhatsApp karo"

Clarification: "John ko kya message bhejna hai?"
User: "Kal meeting 3 baje hai"

Plan:
  1. send_whatsapp_message → { "contact": "John", "message": "Kal meeting 3 baje hai" }
```

### Set brightness and volume together
```
Input: "Brightness 70 karo aur volume 50 pe set karo"

Plan:
  1. set_brightness → { "level": 70 }
  2. set_volume → { "level": 50 }

Response: "Brightness 70% aur Volume 50% set ho gaya"
```

### Generate Python code
```
Input: "Python mein calculator banao"

Plan:
  1. generate_code → { "language": "python", "description": "calculator program", "file_path": "~/Desktop/calculator.py" }
  2. open_vscode_with_file → { "file_path": "~/Desktop/calculator.py" }
```

---

## Known Limitations

| Limitation | Detail |
|------------|--------|
| **Windows only** | Uses Windows-specific APIs (pycaw, pygetwindow, brightness control) |
| **Desktop GUI disabled** | `ui/gui.py` is commented out; runs mobile-only mode |
| **Sequential execution** | Tasks run one at a time — no parallelism |
| **Sarvam API required** | Needs valid `SARVAM_API_KEY` — no offline fallback for LLM |
| **WhatsApp dependency** | Requires WhatsApp Web open in Chrome |
| **Email requires App Password** | Regular Gmail password won't work |
| **STT 5s limit** | Voice recording is fixed at 5 seconds per utterance |
| **Vision LLM placeholder** | `analyze_screen` captures screenshot but LLM vision integration is stubbed |

---

## Project Context

This is the **Core Module** of the AutoMind ProjectX. It handles:
- AI reasoning and task planning
- Tool execution (50+ desktop actions)
- Voice I/O (Sarvam TTS/STT)
- Mobile web interface

**Related modules (to be integrated):**
- `landing-page/` — Entry point web page with "Start Try" CTA
- `avatar/` — Visual avatar interface

---

*VENOM AI — AutoMind ProjectX*

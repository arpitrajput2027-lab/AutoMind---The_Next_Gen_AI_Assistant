# AutoMind VENOM X

### AI-Powered Autonomous Desktop Control Agent

> Talk to your computer. It listens. It acts.

AutoMind VENOM X is a full-stack AI assistant that understands natural language commands and autonomously controls your Windows desktop — opening apps, writing documents, searching the web, managing files, sending emails, and much more. It features a real-time 3D avatar with lip sync, voice input/output, and a modern dashboard UI.

Built for the hackathon using **Sarvam AI** as the core LLM + STT + TTS engine.

---

## Demo

| Landing Page | Assistant Dashboard |
|---|---|
| ![Landing](frontend/public/landing-preview.png) | ![Dashboard](frontend/public/dashboard-preview.png) |

**Wake Word:** Say `"Hello Venom"` to activate voice mode.

---

## What It Can Do (50+ Actions)

| Category | Actions |
|---|---|
| **System Control** | Brightness up/down, volume control, shutdown, restart, sleep, lock screen |
| **App Launch** | Notepad, MS Word, Excel, PowerPoint, VS Code, Chrome, Edge, Discord, Spotify, Zoom, Calculator, Paint... |
| **File Management** | Create, read, write, delete files and folders |
| **Web** | Google search, YouTube search, open any URL |
| **Office Documents** | Generate Word documents, PowerPoint presentations with content |
| **Code Generation** | Write and open code files directly in VS Code |
| **Communication** | Send WhatsApp messages, compose Gmail |
| **Vision** | Take screenshots and analyze screen content |
| **Conversation** | Rolling memory of last 10 exchanges for contextual responses |

---

## Architecture

```
User (Voice / Text)
        │
        ▼
Next.js Frontend  (localhost:3000)
  ├── Chat Panel         ← send/receive messages
  ├── Execution Log      ← live step-by-step actions
  ├── 3D Avatar          ← lip sync + emotions
  └── Voice I/O          ← STT mic → text, text → TTS audio
        │
        │  WebSocket  ws://localhost:8000/ws/{sessionId}
        │
        ▼
FastAPI Backend  (localhost:8000)
  ├── Session Manager    ← per-user session state
  ├── Memory Module      ← rolling 10-exchange history
  ├── Sarvam AI LLM      ← sarvam-105b → parse intent → build action plan
  ├── Planner            ← break command into sequential steps
  ├── Tool Executor      ← run actions one by one, stream results
  │     ├── system_tools.py    (brightness, volume, shutdown...)
  │     ├── app_tools.py       (open apps, switch windows...)
  │     ├── file_tools.py      (create, read, write, delete...)
  │     ├── web_tools.py       (search, open URLs...)
  │     ├── office_tools.py    (Word, PowerPoint generation...)
  │     ├── vscode_tools.py    (code generation + launch...)
  │     ├── email.py           (Gmail compose + send...)
  │     └── whatsapp_tools.py  (WhatsApp Web automation...)
  └── Vision Module      ← screenshot + screen analysis
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Custom CSS |
| **Animation** | Framer Motion |
| **3D Avatar** | Three.js + React Three Fiber (GLB model) |
| **Lip Sync** | Web Audio API → frequency analysis → blend shapes |
| **Avatar State** | Zustand |
| **Real-time Comms** | WebSocket |
| **Backend** | Python 3.10+ + FastAPI + Uvicorn |
| **LLM** | Sarvam AI — `sarvam-105b` |
| **TTS** | Sarvam AI — `bulbul:v3` (voice: Kavya) + Edge TTS fallback |
| **STT** | Sarvam AI — `saaras:v2` |
| **Desktop Automation** | PyAutoGUI, pynput, keyboard |
| **Audio** | pycaw (volume), sounddevice, pydub |
| **Screen** | screen-brightness-control, OpenCV |
| **Documents** | python-docx, python-pptx, openpyxl |
| **Web Automation** | Selenium, BeautifulSoup |

---

## Project Structure

```
AutoMind_VENOM_X/
│
├── backend/
│   ├── main.py                  ← Entry point (starts server + GUI)
│   ├── run_server.py            ← Server-only mode (no GUI)
│   ├── config.py                ← All config constants
│   ├── requirements.txt         ← Python dependencies
│   ├── .env                     ← API keys (NOT committed — see setup below)
│   │
│   ├── core/
│   │   ├── assistant.py         ← Main query pipeline: LLM → plan → execute
│   │   ├── llm.py               ← Sarvam AI LLM wrapper
│   │   ├── planner.py           ← Breaks commands into action steps
│   │   ├── executor.py          ← Runs actions sequentially
│   │   ├── memory.py            ← Rolling conversation history
│   │   ├── router.py            ← Routes intent to correct tool
│   │   ├── vision.py            ← Screenshot + screen analysis
│   │   ├── speech.py            ← STT/TTS wrappers
│   │   ├── session_state.py     ← Per-session state management
│   │   ├── interaction.py       ← Clarifying question handler
│   │   └── tool_registry.py     ← All 50+ actions registered here
│   │
│   ├── tools/
│   │   ├── system_tools.py      ← Brightness, volume, shutdown, restart...
│   │   ├── app_tools.py         ← Open/close applications
│   │   ├── file_tools.py        ← File CRUD operations
│   │   ├── web_tools.py         ← Google, YouTube, URL open
│   │   ├── office_tools.py      ← Word, PowerPoint, Excel
│   │   ├── vscode_tools.py      ← Code generation + VS Code launch
│   │   ├── email.py             ← Gmail integration
│   │   └── whatsapp_tools.py    ← WhatsApp Web automation
│   │
│   ├── mobile/
│   │   └── server.py            ← FastAPI WebSocket server
│   │
│   ├── audio/                   ← Runtime audio files (gitignored)
│   ├── assets/                  ← Static assets
│   └── tests/                   ← Test scripts
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             ← Landing page
│   │   └── assistant/
│   │       └── page.tsx         ← Assistant dashboard
│   │
│   ├── components/
│   │   ├── landing/
│   │   │   ├── Hero.tsx         ← Typewriter hero + orbital rings
│   │   │   ├── Features.tsx     ← 12-feature grid
│   │   │   └── Demo.tsx         ← Interactive command simulator
│   │   └── assistant/
│   │       ├── ChatPanel.tsx    ← Real-time AI chat interface
│   │       ├── ExecutionLog.tsx ← Live task execution logger
│   │       ├── Avatar3D.tsx     ← 3D GLB avatar with lip sync
│   │       ├── AvatarWindow.tsx ← Draggable avatar window
│   │       └── ModelSelector.tsx← Switch AI models
│   │
│   ├── hooks/
│   │   ├── useWebSocket.ts      ← WebSocket connection to backend
│   │   ├── useSTT.ts            ← Speech-to-text (Web Speech API)
│   │   ├── useTTS.ts            ← Text-to-speech + lip sync trigger
│   │   └── useAvatar.ts         ← Avatar expression management
│   │
│   ├── store/
│   │   └── avatarStore.ts       ← Zustand store (emotion, mouth amp)
│   │
│   ├── lib/
│   │   └── emotionMap.ts        ← Emotion → blend shape weights
│   │
│   ├── public/
│   │   └── models/
│   │       └── avatar.glb       ← 3D avatar model (6.5MB)
│   │
│   └── .env.local               ← Frontend env (NOT committed)
│
├── .gitignore
└── README.md
```

---

## Setup & Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- Windows 10/11 (desktop automation requires Windows)
- A [Sarvam AI API key](https://sarvam.ai) — free tier available
- Gmail App Password (only if you want email features)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AutoMind_VENOM_X.git
cd AutoMind_VENOM_X
```

---

### 2. Backend Setup

```bash
cd backend
```

**Create the `.env` file:**

```env
SARVAM_API_KEY=your_sarvam_api_key_here
EMAIL_ADDRESS=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
MOBILE_AUTH_TOKEN=venom_secure_token_12345
```

> Get your Sarvam AI API key at: https://sarvam.ai  
> For Gmail, use an **App Password** (not your main password): Google Account → Security → 2FA → App Passwords

**Install dependencies:**

```bash
pip install -r requirements.txt
```

**Start the backend:**

```bash
# Option 1: Server only (recommended)
python -X utf8 run_server.py

# Option 2: Server + Desktop GUI
python main.py
```

Backend runs at: `http://localhost:8000`

---

### 3. Frontend Setup

```bash
cd frontend
```

**Create the `.env.local` file:**

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

**Install dependencies and start:**

```bash
npm install
pip install edge-tts     # for avatar TTS fallback
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

### 4. Open the App

| URL | Page |
|---|---|
| `http://localhost:3000` | Landing page |
| `http://localhost:3000/assistant` | AI Assistant Dashboard |
| `http://localhost:8000/docs` | Backend API Docs (Swagger) |

---

## How to Use

1. Open `http://localhost:3000/assistant`
2. The 3D avatar will appear — click the mic icon or type a command
3. Try commands like:
   - `"Open Notepad and write a to-do list"`
   - `"Search YouTube for lo-fi music"`
   - `"Create a Word document about AI trends"`
   - `"Set brightness to 50%"`
   - `"Take a screenshot and describe it"`
   - `"Open VS Code and write a Python web scraper"`

---

## Key Features

- **Natural Language Understanding** — Powered by Sarvam AI's `sarvam-105b` model
- **Real-time Execution Streaming** — Watch every step execute live in the Execution Log
- **3D Avatar with Lip Sync** — GLB model with Web Audio API frequency-based mouth animation
- **Voice I/O** — Speak commands, hear responses (Hindi + English supported)
- **Conversation Memory** — Remembers last 10 exchanges for context
- **50+ Desktop Actions** — The most comprehensive desktop automation coverage
- **Interactive Clarification** — Asks follow-up questions when a command is ambiguous
- **Mobile-ready WebSocket API** — Connect from any device on the local network

---

## Team

**AutoMind ProjectX**

---

## License

MIT License — free to use, modify, and distribute.

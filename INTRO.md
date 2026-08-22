# AutoMind VENOM X / VENOM AI

## Short Introduction

AutoMind VENOM X ek Windows-focused, full-stack AI desktop control assistant hai. User Hindi ya English me text/voice command deta hai, Sarvam AI us command ko samajhkar structured action plan banata hai, aur Python backend desktop par actions execute karta hai.

Is project ka frontend Next.js dashboard hai, jisme chat, live execution log, voice input/output aur 3D avatar diya gaya hai. Backend FastAPI/WebSocket server hai, jo apps open karne, files edit karne, web search, office documents, email/WhatsApp automation, system controls aur screen analysis jaise tasks handle karta hai.

> Important: Ye project Windows desktop automation ke liye bana hai. Kuch actions actual computer par changes karte hain, isliye commands ko carefully test karein.

## Main Features

- Natural-language commands in Hindi and English
- Sarvam AI LLM (`sarvam-105b`) se command understanding aur planning
- Sequential multi-step task execution
- Windows applications launch karna: Notepad, Word, Excel, PowerPoint, VS Code, Chrome, Edge, Discord, Spotify, Zoom, etc.
- System controls: brightness, volume, mute, shutdown, restart, sleep aur lock screen
- File operations: create, read, write, delete, replace aur LLM-assisted edit
- Web actions: Google search, YouTube search aur URL open
- Code generation aur VS Code me file open karna
- Word documents aur PowerPoint presentations generate karna
- Gmail email preview/send workflow
- WhatsApp Web message automation
- Screenshot capture aur screen analysis
- Voice input: Sarvam STT (`saaras:v2`)
- Voice output: Sarvam TTS (`bulbul:v3`) ya Edge TTS fallback
- 3D avatar, lip-sync style mouth animation aur task emotions
- Last 10 exchanges ki rolling conversation memory
- Ambiguous command par clarification questions
- Pause, resume aur stop controls
- Browser-based mobile/PWA interface

## High-Level Architecture

```text
User: text or voice
          |
          v
Next.js Frontend (localhost:3000)
  Chat + Avatar + Voice + Execution Log
          |
          | WebSocket: ws://localhost:8000/ws/{session_id}
          v
FastAPI Backend (localhost:8000)
  Assistant -> LLM -> Planner -> Executor -> Tool Registry
          |
          +-- system/app/file/web/office/VS Code tools
          +-- email/WhatsApp tools
          +-- vision and speech services
          +-- memory.json
```

### Command Pipeline

1. Frontend command ko WebSocket se backend ko bhejta hai.
2. Backend conversation memory aur current session context load karta hai.
3. Sarvam LLM JSON format me thought, plan aur final response banata hai.
4. Planner actions aur parameters validate/normalize karta hai.
5. Executor actions ko ek-ek karke chalata hai.
6. Backend execution steps aur final response stream karta hai.
7. Conversation memory update hoti hai aur frontend avatar/voice response dikhata hai.

## Project Structure

```text
AutoMind_VENOM_X/
├── README.md                 Main project overview
├── INTRO.md                  Ye complete introduction
├── backend/
│   ├── main.py               Server + optional desktop GUI entry point
│   ├── run_server.py         Recommended server-only entry point
│   ├── config.py             Ports, models, memory and behavior settings
│   ├── requirements.txt      Python dependencies
│   ├── core/
│   │   ├── assistant.py      Main LLM-to-execution pipeline
│   │   ├── llm.py            Sarvam LLM wrapper
│   │   ├── planner.py        Plan validation and normalization
│   │   ├── executor.py       Sequential tool execution
│   │   ├── tool_registry.py  Action name to Python function mapping
│   │   ├── memory.py         Conversation memory
│   │   ├── session_state.py  Session/file context
│   │   ├── interaction.py    Clarification handling
│   │   ├── vision.py         Screenshot and screen analysis
│   │   └── execution_control.py Pause/resume/stop state
│   ├── tools/                Desktop, file, web, office and communication tools
│   ├── audio/                Sarvam STT/TTS and Edge TTS fallback
│   ├── mobile/               FastAPI routes and mobile web app
│   ├── ui/                   Desktop GUI components
│   └── tests/                Test scripts
└── frontend/
    ├── app/page.tsx          Landing page
    ├── app/assistant/page.tsx Assistant dashboard
    ├── app/editor/page.tsx   File preview/editor page
    ├── components/           Landing and assistant UI components
    ├── hooks/                WebSocket, STT, TTS and avatar hooks
    ├── public/models/        3D avatar model
    └── package.json           Frontend scripts and dependencies
```

## Requirements

- Windows 10/11 recommended
- Python 3.10 or newer
- Node.js 18 or newer
- npm
- Sarvam AI API key
- Microphone and speakers for voice features
- Microsoft Office applications for Word/Excel/PowerPoint actions
- Chrome/Edge and WhatsApp Web login for related automation
- Gmail App Password for email sending

Desktop automation libraries can require Windows permissions and the target application must be installed for its action to work.

## Setup

### 1. Backend

Open PowerShell in the project folder:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Create `backend/.env`:

```env
SARVAM_API_KEY=your_sarvam_api_key
EMAIL_ADDRESS=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
MOBILE_AUTH_TOKEN=your_local_token
```

`SARVAM_API_KEY` is required for LLM, STT and Sarvam TTS. Email variables are only needed for email features. Never commit this file or expose its values.

### 2. Frontend

Open another PowerShell terminal:

```powershell
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

The frontend defaults to `ws://localhost:8000` even without this file, but setting the variable is recommended. For a phone on the same network, replace `localhost` with the computer's local IP, for example `ws://192.168.1.10:8000`.

## How to Run

### Recommended: backend server + Next.js frontend

Terminal 1:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -X utf8 run_server.py
```

Terminal 2:

```powershell
cd frontend
npm run dev
```

Open:

- Landing page: `http://localhost:3000`
- Assistant dashboard: `http://localhost:3000/assistant`
- File editor: `http://localhost:3000/editor`
- Backend mobile UI: `http://localhost:8000`
- Swagger API docs: `http://localhost:8000/docs`
- Backend health check: `http://localhost:8000/health`

### Optional: backend with desktop GUI

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python main.py
```

This starts the FastAPI server in a background thread and opens the desktop GUI. Frontend dashboard use karna ho to `run_server.py` simpler option hai.

## Example Commands

Try these in `/assistant`:

- `Open Notepad and write a to-do list`
- `Set brightness to 50 percent`
- `Increase volume`
- `Open Chrome and search for latest AI news`
- `Search YouTube for relaxing music`
- `Create a Word document about artificial intelligence`
- `Create a PowerPoint presentation about climate change`
- `Generate a Python web scraper and open it in VS Code`
- `Create a file named notes.txt and write today's plan`
- `Read this file and explain it`
- `Take a screenshot and describe what is on screen`
- `Send a WhatsApp message to [contact]`
- `Prepare an email preview for [recipient]`
- `Pause`, `resume` or `stop` a long-running task

For editing an existing file, use commands such as `change X to Y`, `add a section to that file`, or `rewrite the introduction`. The assistant attempts to edit the existing file instead of creating a duplicate.

## Available Tool Categories

### System and Applications

Brightness, volume, mute, shutdown, restart, sleep, lock screen, typing, Enter key, and launching common Windows applications.

### Files and Development

Create/read/write/delete files, replace text, LLM-assisted file edits, code generation, and opening generated files in VS Code.

### Office and Web

Generate formatted `.docx` files, `.pptx` presentations, Google/YouTube search, and opening URLs.

### Communication and Vision

WhatsApp Web automation, Gmail preview/send, screenshot capture, and Sarvam-powered screen analysis.

## Backend API

The FastAPI server exposes these important endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Serves the legacy mobile web app |
| GET | `/health` | Server health and connection status |
| POST | `/execute` | Execute a command through REST |
| POST | `/api/tts` | Convert text to Sarvam WAV audio (base64) |
| POST | `/api/stt` | Convert uploaded WAV audio to transcript |
| GET | `/api/file?path=...` | Read a file for preview/editor |
| POST | `/api/edit` | Apply an edit instruction to a file |
| GET | `/docs` | FastAPI Swagger documentation |
| WS | `/ws` | WebSocket command connection |
| WS | `/ws/{session_id}` | Session-compatible WebSocket used by Next.js |

WebSocket messages support command execution, model switch, email confirmation, file editing, ping/pong, pause, resume and stop. During execution the server can send `thinking`, `execution_step`, `response`, `file_preview`, `paused`, `resumed`, `stopped` and `error` messages.

REST example:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:8000/execute `
  -ContentType 'application/json' `
  -Body '{"command":"open notepad"}'
```

## Testing

Run the bundled non-server tests:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python tests/run_all_tests.py
```

The test runner includes Sarvam, vision and tool tests. Mobile tests are commented out because they require the server to already be running. Start the backend first, then run the mobile test separately if needed:

```powershell
python tests/test_mobile.py
```

Frontend checks/build:

```powershell
cd frontend
npm run build
```

## Configuration

Most runtime settings are in `backend/config.py`:

- Backend host: `0.0.0.0`
- Backend port: `8000`
- Memory limit: last `10` exchanges
- Wake word: `hello venom`
- Sarvam TTS voice: `kavya`
- STT language: `hi-IN`
- LLM timeout: `300` seconds
- Interactive clarification depth: maximum `3`

## Limitations and Safety Notes

- This is an automation agent, not a sandbox. It can change files, control hardware, open applications, and trigger external communication.
- Shutdown, restart, delete, email and WhatsApp actions should be tested carefully.
- Sarvam API access and a working internet connection are needed for AI/STT/TTS features.
- App automation depends on installed software, current window focus, screen scaling, login state and UI layout; it may be sensitive to changes in those conditions.
- Email needs a Gmail App Password, not the normal Gmail password.
- WhatsApp automation requires WhatsApp Web to be available and logged in.
- The backend currently enables permissive CORS (`*`) and binds to all interfaces. Do not expose port 8000 to the public internet without authentication, firewall rules and stricter CORS.
- `MOBILE_AUTH_TOKEN` is present in the environment convention, but review the current routes before treating it as enforced authentication.
- `memory.json`, generated audio and environment files are runtime/local data and are ignored by Git.
- The old mobile UI and the Next.js UI coexist; the primary modern flow is Next.js `/assistant` plus the Python server.

## Troubleshooting

### Frontend says Offline

1. Confirm backend terminal is running.
2. Open `http://localhost:8000/health`.
3. Check `NEXT_PUBLIC_WS_URL` in `frontend/.env.local`.
4. Restart `npm run dev` after changing environment variables.

### Sarvam errors

Check `backend/.env`, API key validity, internet access and the API quota. The backend uses Sarvam for LLM, STT and TTS.

### A desktop action does nothing

Make sure the target app is installed, unlocked and visible. Run the backend on the same Windows user session that owns the desktop. Screen scaling and window focus can affect PyAutoGUI/Selenium actions.

### PowerShell blocks virtual environment activation

Use a Command Prompt, or allow local scripts for the current user according to your organization's policy, then activate `.venv` again.

## In One Line

**AutoMind VENOM X is a Sarvam-powered Hindi/English Windows automation agent with a Next.js 3D assistant dashboard, capable of understanding natural-language tasks and executing them across desktop apps, files, web, office documents, communication and screen vision.**

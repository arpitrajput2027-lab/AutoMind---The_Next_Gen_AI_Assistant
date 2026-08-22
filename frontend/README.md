# AutoMind Frontend

> Next.js 14 · TypeScript · Tailwind CSS · Three.js · WebSocket

Full-featured frontend for the AutoMind AI assistant — includes a marketing landing page and an interactive assistant dashboard with 3D avatar, real-time execution logs, voice input, and multi-model AI switching.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Components](#components)
- [Custom Hooks](#custom-hooks)
- [WebSocket Protocol](#websocket-protocol)
- [Design System](#design-system)
- [Build & Run](#build--run)
- [Environment Variables](#environment-variables)
- [Backend Requirements](#backend-requirements)

---

## Overview

This is a **dual-purpose application**:

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Landing Page | Product showcase, feature demos, tech stack, CTAs |
| `/assistant` | Dashboard | Real-time AI chat, task execution, voice I/O, 3D avatar |

**Design Language:** Cyberpunk/Futuristic — dark background (`#03070d`), cyan (`#00d9ff`) and neon green (`#00ff88`) accents, animated grids, orbital rings, scanlines.

**Fonts:** Syne (display headings) + IBM Plex Mono (code/terminal)

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 14.2.5 |
| UI Library | React | 18.3.0 |
| Language | TypeScript | 5.5.4 |
| Styling | Tailwind CSS + Custom CSS | 3.4.7 |
| Animation | Framer Motion | 11.3.19 |
| 3D Engine | Three.js | 0.164.1 |
| React 3D | @react-three/fiber + drei | 8.17 / 9.109 |
| VRM Avatar | @pixiv/three-vrm | 2.1.2 |
| WebSocket | socket.io-client | 4.7.5 |
| ID Generation | uuid | 10.0.0 |

---

## Project Structure

```
frontend/
│
├── app/
│   ├── layout.tsx              # Root layout — fonts, metadata, global styles
│   ├── page.tsx                # Landing page (assembles all landing sections)
│   ├── globals.css             # Design tokens (40+ CSS vars), keyframes, utility classes
│   └── assistant/
│       └── page.tsx            # Assistant dashboard — WebSocket session management
│
├── components/
│   ├── landing/                # Landing page sections
│   │   ├── Navbar.tsx          # Fixed nav with responsive menu + scroll blur
│   │   ├── Hero.tsx            # Hero with typewriter effect + orbital rings
│   │   ├── Features.tsx        # 12-feature grid with hover effects
│   │   ├── HowItWorks.tsx      # 4-step workflow with connecting gradient line
│   │   ├── TechStack.tsx       # 16 tech items + interactive 3-model selector
│   │   ├── Demo.tsx            # Interactive command simulator with animated logs
│   │   └── Footer.tsx          # Links, copyright, LIVE status badge
│   │
│   └── assistant/              # Dashboard components
│       ├── ChatPanel.tsx        # Chat UI — messages, voice input, quick commands
│       ├── ExecutionLog.tsx     # Real-time step logger with color-coded status
│       ├── ModelSelector.tsx    # Switch between Sarvam / Claude / GPT-4o
│       ├── Avatar3D.tsx         # 3D VRM avatar — expressions, lipsync, draggable
│       ├── VoiceButton.tsx      # Web Speech API push-to-talk
│       └── EmailPreview.tsx     # Review/edit email before sending modal
│
├── hooks/
│   ├── useWebSocket.ts         # WS connection, reconnect, message dispatch
│   ├── useAvatar.ts            # Avatar expression state & task-type reactions
│   └── useVoice.ts             # Speech recognition wrapper (en-IN default)
│
├── public/                     # Static assets (SVG icons, VRM model)
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── next.config.mjs
└── eslint.config.mjs
```

---

## Pages & Routes

### `/` — Landing Page

Assembled in `app/page.tsx`. Renders sections in order:

```
Navbar → Hero → Features → HowItWorks → TechStack → Demo → Footer
```

Plus a scanline overlay animation across the full page.

**Primary CTA:** "Start Trying Free" / "Launch App" → navigates to `/assistant`

---

### `/assistant` — Dashboard

Managed in `app/assistant/page.tsx`. State includes:

- **Session ID** (UUID per tab/session)
- **Messages** array (chat history)
- **Execution steps** (real-time automation log, auto-cleared after 8s idle)
- **isThinking** flag (shows animated dots in chat)
- **showLog** toggle (show/hide ExecutionLog panel)
- **emailPreview** state (triggers EmailPreview modal)
- **Avatar state** (via `useAvatar` hook)

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  Logo  |  WS Status  |  ModelSelector  |  Controls  │  ← Top bar
├─────────────────────────────┬───────────────────────┤
│                             │                       │
│       ChatPanel             │    ExecutionLog       │
│  (messages + input)         │   (toggleable)        │
│                             │                       │
└─────────────────────────────┴───────────────────────┘
                                    [Avatar3D] floating (draggable, bottom-right)
```

---

## Components

### Landing Components

#### `Navbar.tsx`
- Fixed position with scroll-triggered background blur
- Logo: gradient "A" icon + "Auto**Mind**" wordmark
- Desktop links: Features, How It Works, Tech Stack, Demo
- "LIVE" status badge (animated green dot)
- "Launch App" CTA → `/assistant`
- Mobile: hamburger menu with toggle

#### `Hero.tsx`
- Animated grid background with radial cyan/green glows
- Orbital rings with rotating dots
- Headline: **"Your PC. Your Command."**
- Typewriter cycling through 8 example commands:
  - "Open VS Code and create a React component"
  - "Send a WhatsApp message to Priya"
  - "Set brightness to 70% and play lo-fi music"
  - (+ 5 more)
- Terminal-style command/response display
- Stats: `10+ Automations` · `3 Models` · `0ms Click Needed` · `∞ Commands`
- CTA: "Start Trying Free" + "Watch Demo"

#### `Features.tsx`
12 feature cards in a responsive CSS Grid:

| Feature | Tag |
|---------|-----|
| Natural Language Control | CORE |
| VS Code Automation | CORE |
| System Control | CORE |
| Email Automation | CORE |
| WhatsApp Messaging | ENHANCED |
| MS PowerPoint | NEW |
| Notepad / MS Word | CORE |
| YouTube Search | ENHANCED |
| Voice Interaction | NEW |
| Real-Time Queries | CORE |
| Mobile PWA Control | NEW |
| Multi-Model AI | NEW |

Each card has: icon, colored tag, title, description, code example snippet.

#### `HowItWorks.tsx`
4-step process with gradient connecting line:

1. **You Give a Command** (🎤 cyan)
2. **AutoMind Understands** (🧠 purple)
3. **Task Gets Executed** (⚙️ green)
4. **Avatar Responds** (💬 orange)

Architecture diagram: `User Input → FastAPI → LLM → Automation Engine → TTS + Avatar + Log`

#### `TechStack.tsx`
- 4 categories: Frontend, Backend, AI/LLM, Automation (16 items total)
- Interactive **model switcher** with 3 options:

| Model | Flag | Latency | Note |
|-------|------|---------|------|
| Sarvam AI | 🇮🇳 | ~0.8s | DEFAULT — Hindi+English |
| Claude 3.5 | 🤖 | ~1.2s | POWERFUL — advanced reasoning |
| GPT-4o | ✨ | ~1.5s | VERSATILE — multilingual |

#### `Demo.tsx`
5 pre-built command examples (vscode, system, whatsapp, powerpoint, email). Clicking a command shows animated execution log steps and a success response. Final CTA: "Ready to Command Your PC?"

#### `Footer.tsx`
3 link columns (Product, Resources, Connect) + copyright + LIVE badge.

---

### Assistant Components

#### `ChatPanel.tsx`
- Message bubbles: user (right-aligned) vs assistant (left-aligned)
- Task-type color badges on assistant messages
- Empty state: 6 quick command suggestions
- Thinking indicator: animated bouncing dots
- Input: multiline textarea (Shift+Enter = newline, Enter = send)
- Voice mode toggle (🔊) to enable TTS responses
- Auto-scrolls to newest message

**Task type colors:**

| Type | Color |
|------|-------|
| vscode | cyan |
| email | purple |
| whatsapp | green |
| system | orange |
| web | blue |
| file | yellow |

#### `ExecutionLog.tsx`
- Header: status dot (cyan=active, green=idle) + step counter
- Each step: status icon + name + detail + timestamp
- Status icons: `⟳` running (cyan) · `✓` done (green) · `✗` error (red) · `○` pending (muted)
- Auto-scrolls to latest entry
- Idle message: "Waiting for commands..."

#### `ModelSelector.tsx`
3 compact toggle buttons: `🇮🇳 Sarvam` · `🤖 Claude` · `✨ GPT-4o`
Active model highlighted. Switching sends `model_switch` message via WebSocket.

#### `Avatar3D.tsx`
- Loads VRM model from `/models/avatar.vrm` (falls back to emoji if unavailable)
- 6 expressions: neutral, happy, thinking, excited, sad, surprised
- Idle **breathing animation** (chest rotation)
- **Lipsync** during speech (mouth open/close cycle)
- **Draggable** — fixed position, default bottom-right
- Status bar below avatar: expression emoji + label + talking/thinking indicator
- Waveform visualizer bars during speech
- Transcript preview when speaking

#### `VoiceButton.tsx`
- Uses browser-native **Web Speech API** (no external API)
- Language: `en-IN` (Indian English)
- Animated waveform bars when recording
- Disabled during processing
- Returns final transcript to `ChatPanel`

#### `EmailPreview.tsx`
- Semi-transparent overlay modal
- Editable fields: To, Subject, Body
- "Cancel" dismisses / "Send" confirms via WebSocket
- Prevents sending with empty To or Subject

---

## Custom Hooks

### `useWebSocket.ts`

Connects to `ws://localhost:8000/ws/{sessionId}`. Auto-reconnects after 3s on disconnect.

**Incoming message types handled:**

| Type | Action |
|------|--------|
| `execution_step` | Adds step to ExecutionLog |
| `email_preview` | Opens EmailPreview modal |
| `response` | Adds assistant message to chat |
| `thinking` | Sets isThinking flag |
| `error` | Displays error message |
| `model_switched` | Confirms model change in UI |

**Methods exported:**
- `sendCommand(text, model, voiceMode)` — sends user command
- `switchModel(modelId)` — switches LLM model
- `confirmEmail(to, subject, body)` — confirms email send after preview

**Status values:** `connecting` · `connected` · `disconnected` · `error`

---

### `useAvatar.ts`

Manages avatar state: expression, isTalking, isThinking, position.

**Methods:**
- `startTalking(text)` — calculates duration from word count (~150 wpm), sets talking state
- `startThinking()` / `stopThinking()` — toggles thinking expression
- `reactToTask(taskType)` — maps task type → expression:
  - `vscode` → excited
  - `email` → happy
  - `whatsapp` → happy
  - `error` → sad
  - default → neutral
- `setPosition(x, y)` — updates avatar drag position

---

### `useVoice.ts`

Wraps the Web Speech API with React state.

**States:** `idle` · `listening` · `processing` · `error`
**Method:** `toggleListening()` — push-to-talk
**Error recovery:** auto-clears error after 2 seconds

---

## WebSocket Protocol

**Connection:** `ws://localhost:8000/ws/{sessionId}`

### Client → Server

```json
// Send command
{ "type": "command", "text": "open notepad", "model": "sarvam", "voice_mode": false }

// Switch model
{ "type": "model_switch", "model": "claude" }

// Confirm email
{ "type": "confirm_email", "to": "...", "subject": "...", "body": "..." }
```

### Server → Client

```json
// Execution step
{ "type": "execution_step", "step": "Opening Notepad", "status": "running", "detail": "..." }

// Response
{ "type": "response", "message": "Done!", "task_type": "system", "success": true }

// Thinking
{ "type": "thinking" }

// Email preview
{ "type": "email_preview", "to": "...", "subject": "...", "body": "..." }

// Error
{ "type": "error", "message": "Something went wrong" }

// Model switched
{ "type": "model_switched", "model": "claude" }
```

---

## Design System

Defined in `app/globals.css` as CSS custom properties:

```css
--color-bg-primary: #03070d
--color-bg-secondary: #070d16
--color-bg-card: #0d1520
--color-accent-cyan: #00d9ff
--color-accent-green: #00ff88
--color-accent-purple: #8b5cf6
--color-accent-orange: #f59e0b
--color-text-primary: #e8f4fd
--color-text-secondary: #8baabf

--font-display: 'Syne', sans-serif
--font-mono: 'IBM Plex Mono', monospace
```

**Keyframe animations:** `fadeInUp`, `fadeInLeft`, `glow-pulse`, `float`, `scanline`, `orbit`, `waveform`, `pulse-ring`

**Utility classes:** `.text-gradient-cyan`, `.btn-primary`, `.btn-secondary`, `.card-glow`, `.terminal-box`, `.badge`

---

## Build & Run

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev
# → http://localhost:3000

# Production build
npm run build

# Run production build
npm start

# Lint
npm run lint
```

---

## Environment Variables

Create a `.env.local` in the project root:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

Default is `ws://localhost:8000` if not set. Change this for production deployments.

---

## Backend Requirements

This frontend connects to a **FastAPI WebSocket server** (see `venom-ai-startup_pitch` — the Core module).

The backend must:
- Run at `localhost:8000` (or configure `NEXT_PUBLIC_WS_URL`)
- Accept WebSocket connections at `/ws/{sessionId}`
- Handle the message protocol described in [WebSocket Protocol](#websocket-protocol)
- Implement LLM intent parsing (Sarvam AI / Claude / GPT-4o)
- Execute desktop automation actions (PyAutoGUI, OS APIs)
- Send real-time execution step updates
- Handle TTS if voice mode is enabled

---

## Project Context

This is the **Frontend Module** of the AutoMind ProjectX.

**Integration points:**
- Connects to `venom-ai-startup_pitch` (Core) via WebSocket at port 8000
- `Avatar3D` can load VRM model from `avatar/` module (place as `public/models/avatar.vrm`)
- "Launch App" / "Start Trying Free" CTAs link from landing page → `/assistant` dashboard

**Related modules:**
- `venom-ai-startup_pitch/` — Python backend (LLM + automation engine + WebSocket server)
- `avatar/` — 3D VRM avatar assets and configuration

---

*AutoMind Frontend — AutoMind ProjectX*

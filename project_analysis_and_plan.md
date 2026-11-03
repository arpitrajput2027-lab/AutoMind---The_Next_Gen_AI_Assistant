# 🔍 AutoMind VENOM X — Current State & Implementation Plan

## 📊 Current Project Status (What's Built)

Your project is **very well-built** — solid for a hackathon. Here's the summary:

### ✅ Backend (Python/FastAPI) — ~95% Complete
| Module | Status | Description |
|--------|--------|-------------|
| [assistant.py](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/backend/core/assistant.py) | ✅ Done | Main query pipeline: LLM → plan → execute |
| [llm.py](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/backend/core/llm.py) | ✅ Done | Gemini 3.6 Flash + Groq with fallback |
| [memory.py](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/backend/core/memory.py) | ⚠️ Basic | Rolling 10-exchange JSON memory (no semantic/persistent) |
| [planner.py](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/backend/core/planner.py) | ✅ Done | Breaks commands into steps |
| [executor.py](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/backend/core/executor.py) | ✅ Done | Sequential action runner with pause/stop |
| [tool_registry.py](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/backend/core/tool_registry.py) | ✅ Done | 50+ registered actions |
| [server.py](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/backend/mobile/server.py) | ✅ Done | FastAPI + WebSocket server |
| Tools (9 files) | ✅ Done | System, apps, files, web, office, vscode, email, whatsapp, IoT |

### ✅ Frontend (Next.js 14 + TypeScript) — ~90% Complete
| Component | Status | Description |
|-----------|--------|-------------|
| Landing page | ✅ Done | Hero, features, demo, how-it-works, tech stack, footer |
| [ChatPanel.tsx](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/frontend/components/assistant/ChatPanel.tsx) | ✅ Done | Chat UI with quick commands, voice controls |
| [AvatarWindow.tsx](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/frontend/components/assistant/AvatarWindow.tsx) | ✅ Done | Draggable 3D avatar with lip sync |
| [ExecutionLog.tsx](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/frontend/components/assistant/ExecutionLog.tsx) | ✅ Done | Live step-by-step execution log |
| [EmailPreview.tsx](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/frontend/components/assistant/EmailPreview.tsx) | ✅ Done | Editable email preview modal |
| [FilePreviewPanel.tsx](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/frontend/components/assistant/FilePreviewPanel.tsx) | ✅ Done | File editor with HTML preview |
| WebSocket hook | ✅ Done | Auto-reconnect, command/control messaging |
| Voice hooks (STT/TTS) | ✅ Done | Sarvam + Edge TTS, Web Speech API |

### ❌ What's NOT Built Yet (Your 4 Requested Features)
| Feature | Status |
|---------|--------|
| 🔍 Real-Time Web Search | ❌ Not implemented — current `google_search()` just opens a browser tab |
| 📄 RAG (Document Upload + Q&A) | ❌ Not implemented — no document ingestion or vector search |
| 🧠 Persistent Memory | ⚠️ Basic — only rolling 10-exchange JSON, no long-term/semantic memory |
| 🎭 Role-Based Chat UI | ❌ Not implemented — no role selection in chat interface |

---

## 🚀 Implementation Plan (4 Features for Event)

### Feature 1: 🔍 Real-Time Web Search
**What it does:** AI searches the web in real-time, gets actual results/content, and answers questions based on live data.

**Backend changes:**
- New file: `backend/tools/web_search.py` — Uses DuckDuckGo/SearXNG free API to fetch search results and snippets
- Update [tool_registry.py](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/backend/core/tool_registry.py) — Register `web_search` action
- Update [assistant.py](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/backend/core/assistant.py) — Add web search routing in system prompt

**Frontend changes:**
- Update [ChatPanel.tsx](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/frontend/components/assistant/ChatPanel.tsx) — Show web search results with source links
- New badge type for "web_search" task type

---

### Feature 2: 📄 RAG (PDF/Document Upload + Q&A)
**What it does:** Upload PDF/DOCX/TXT → extract text → chunk → embed → store → answer questions from document content.

**Backend changes:**
- New file: `backend/tools/rag_tools.py` — Document parsing (PyPDF2, python-docx), chunking, Gemini embedding, FAISS vector store
- New endpoint: `POST /api/upload` — Accept file uploads via REST
- New WebSocket command type: `rag_query` — Query uploaded documents
- Update system prompt to route document questions to RAG

**Frontend changes:**
- New component: `DocumentUpload.tsx` — Drag & drop file upload area
- Update sidebar with "Documents" section showing uploaded files
- Update chat to show source chunks in RAG responses

---

### Feature 3: 🧠 Enhanced Memory System
**What it does:** Long-term persistent memory that remembers user preferences, past interactions, and important facts across sessions.

**Backend changes:**
- Enhance [memory.py](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/backend/core/memory.py) — Add categories: `facts`, `preferences`, `conversation_summary`
- LLM-based memory extraction — After each conversation, extract key facts
- Persistent storage with summaries instead of just last 10 raw messages
- Memory search for context retrieval

**Frontend changes:**
- New sidebar section: "Memory" — View/manage stored memories
- Memory indicator in chat showing what context is being used

---

### Feature 4: 🎭 Role-Based Chat UI
**What it does:** User selects a role/persona (Developer, Teacher, Creative Writer, Data Analyst, etc.) and AI adapts its behavior.

**Backend changes:**
- New file: `backend/core/roles.py` — Define role system prompts and behaviors
- Update [assistant.py](file:///c:/Users/ASUS/Desktop/AutoMind_VENOM_X/backend/core/assistant.py) — Inject role-specific system prompts
- WebSocket command: `switch_role` — Change active role

**Frontend changes:**
- New component: `RoleSelector.tsx` — Beautiful role selection grid
- Role indicator in chat header
- Role-specific quick commands and styling

---

## 📋 Priority Order (Event Readiness)

| Priority | Feature | Impact | Effort | Why |
|----------|---------|--------|--------|-----|
| 1️⃣ | Role-Based Chat UI | 🔥 High Visual Impact | Medium | Judges love interactive UI — big wow factor |
| 2️⃣ | Real-Time Web Search | 🔥 High Functionality | Low | Shows AI capability, easy to demo |
| 3️⃣ | RAG Document Upload | 🔥 High Technical | High | Impressive technically, shows real AI pipeline |
| 4️⃣ | Enhanced Memory | 🔥 Medium | Medium | Nice to have, shows sophistication |

> [!IMPORTANT]
> **Recommended approach:** Build features in priority order. Features 1 & 2 can be done quickly, Feature 3 needs more work but is very impressive for judges, Feature 4 adds polish.

---

## 🛠 Tech Stack Additions Needed

| Package | Purpose | Install |
|---------|---------|---------|
| `duckduckgo-search` | Free web search API | `pip install duckduckgo-search` |
| `PyPDF2` | PDF text extraction | `pip install PyPDF2` |
| `faiss-cpu` | Vector similarity search | `pip install faiss-cpu` |
| `react-dropzone` | File upload UI | `npm install react-dropzone` |

Should I start building? Tell me if you want to proceed with all 4 features, or pick specific ones first.

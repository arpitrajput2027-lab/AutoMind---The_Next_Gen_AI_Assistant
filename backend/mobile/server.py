# # mobile/server.py - FastAPI WebSocket Server

# from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
# from fastapi.responses import HTMLResponse, FileResponse
# from fastapi.staticfiles import StaticFiles
# from fastapi.middleware.cors import CORSMiddleware
# import uvicorn
# import asyncio
# import os
# from pathlib import Path
# from core.assistant import process_query
# from audio.sarvam_tts import speak_sarvam
# from config import MOBILE_SERVER_HOST, MOBILE_SERVER_PORT
# from dotenv import load_dotenv

# load_dotenv()

# app = FastAPI(title="VENOM AI Mobile Server")

# # CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Serve static files
# MOBILE_DIR = Path(__file__).parent / "web_app"
# app.mount("/static", StaticFiles(directory=str(MOBILE_DIR)), name="static")

# # Active WebSocket connections
# active_connections = []

# # ==================== ROUTES ====================

# @app.get("/")
# async def get_home():
#     """Serve mobile web app"""
#     html_file = MOBILE_DIR / "index.html"
#     with open(html_file, 'r', encoding='utf-8') as f:
#         return HTMLResponse(content=f.read())

# @app.get("/health")
# async def health_check():
#     """Health check endpoint"""
#     return {
#         "status": "healthy",
#         "version": "2.0",
#         "active_connections": len(active_connections)
#     }

# @app.post("/execute")
# async def execute_command(command: dict):
#     """Execute command via REST API"""
#     try:
#         user_input = command.get("command", "")
#         if not user_input:
#             raise HTTPException(status_code=400, detail="Command is required")
        
#         # Process query
#         response, logs = process_query(user_input)
        
#         return {
#             "success": True,
#             "response": response,
#             "logs": logs
#         }
    
#     except Exception as e:
#         return {
#             "success": False,
#             "error": str(e)
#         }

# # ==================== WEBSOCKET ====================

# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     """WebSocket for real-time communication"""
#     await websocket.accept()
#     active_connections.append(websocket)
    
#     try:
#         await websocket.send_json({
#             "type": "connected",
#             "message": "Connected to VENOM AI"
#         })
        
#         while True:
#             # Receive command
#             data = await websocket.receive_json()
#             command_type = data.get("type", "command")
            
#             if command_type == "command":
#                 user_input = data.get("command", "")
                
#                 # Send processing status
#                 await websocket.send_json({
#                     "type": "status",
#                     "status": "processing",
#                     "message": "Processing your command..."
#                 })
                
#                 # Process in background
#                 try:
#                     response, logs = process_query(user_input)
                    
#                     # Send response
#                     await websocket.send_json({
#                         "type": "response",
#                         "status": "success",
#                         "response": response,
#                         "logs": logs
#                     })
                    
#                 except Exception as e:
#                     await websocket.send_json({
#                         "type": "error",
#                         "message": str(e)
#                     })
            
#             elif command_type == "ping":
#                 await websocket.send_json({
#                     "type": "pong",
#                     "timestamp": data.get("timestamp")
#                 })
    
#     except WebSocketDisconnect:
#         active_connections.remove(websocket)
#         print("Client disconnected")
    
#     except Exception as e:
#         print(f"WebSocket error: {e}")
#         if websocket in active_connections:
#             active_connections.remove(websocket)

# # ==================== BROADCAST ====================

# async def broadcast_message(message: dict):
#     """Broadcast to all connected clients"""
#     for connection in active_connections:
#         try:
#             await connection.send_json(message)
#         except:
#             pass

# # ==================== SERVER STARTUP ====================

# def start_mobile_server():
#     """Start FastAPI server"""
#     print(f"🚀 Starting mobile server on {MOBILE_SERVER_HOST}:{MOBILE_SERVER_PORT}")
#     print(f"📱 Mobile UI: http://localhost:{MOBILE_SERVER_PORT}")
#     print(f"🌐 Network access: http://<your-ip>:{MOBILE_SERVER_PORT}")
    
#     uvicorn.run(
#         app,
#         host=MOBILE_SERVER_HOST,
#         port=MOBILE_SERVER_PORT,
#         log_level="info"
#     )

# if __name__ == "__main__":
#     start_mobile_server()
# mobile/server.py - FIXED VERSION
import os
os.environ["PYTHONUTF8"] = "1"

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import os
import base64
import requests as http_requests
import tempfile
from pathlib import Path
from core.assistant import process_query, get_last_response_meta
from core.roles import list_roles, set_role, get_active_role
from core import execution_control
from config import MOBILE_SERVER_HOST, MOBILE_SERVER_PORT
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI(title="VENOM AI Mobile Server")

# CORS - Allow all origins for mobile access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
MOBILE_DIR = Path(__file__).parent / "web_app"

# Check if directory exists
if MOBILE_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(MOBILE_DIR)), name="static")
else:
    print(f"⚠️ Mobile app directory not found: {MOBILE_DIR}")

# Active WebSocket connections
active_connections = []

# ==================== ROUTES ====================

@app.get("/")
async def get_home():
    """Serve mobile web app"""
    html_file = MOBILE_DIR / "index.html"
    
    if not html_file.exists():
        return HTMLResponse(content="""
        <html>
            <body>
                <h1>⚡ VENOM AI Mobile Server</h1>
                <p>Server is running, but web app files not found!</p>
                <p>Expected location: {}</p>
            </body>
        </html>
        """.format(html_file))
    
    with open(html_file, 'r', encoding='utf-8') as f:
        return HTMLResponse(content=f.read())

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "2.0",
        "active_connections": len(active_connections),
        "mobile_dir": str(MOBILE_DIR),
        "mobile_dir_exists": MOBILE_DIR.exists()
    }

@app.get("/api/roles")
async def api_list_roles():
    """List available chat roles + currently active role"""
    return {"roles": list_roles(), "active": get_active_role()}

@app.post("/execute")
async def execute_command(command: dict):
    """Execute command via REST API"""
    try:
        user_input = command.get("command", "")
        if not user_input:
            raise HTTPException(status_code=400, detail="Command is required")
        
        print(f"📱 Mobile command received: {user_input}")
        
        # Process query
        response, logs = process_query(user_input)
        
        print(f"✅ Response: {response[:100]}...")
        
        return {
            "success": True,
            "response": response,
            "logs": logs
        }
    
    except Exception as e:
        print(f"❌ Execute error: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# ==================== SARVAM TTS API ====================

@app.post("/api/tts")
async def sarvam_tts(body: dict):
    """Sarvam TTS — returns base64 WAV audio for browser playback"""
    text = body.get("text", "").strip()
    voice = body.get("voice", "kavya")

    if not text:
        raise HTTPException(status_code=400, detail="text required")

    SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
    text = text[:480]

    try:
        response = http_requests.post(
            "https://api.sarvam.ai/text-to-speech",
            headers={
                "API-Subscription-Key": SARVAM_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "inputs": [text],
                "target_language_code": "hi-IN",
                "speaker": voice,
                "pace": 1.0,
                "speech_sample_rate": 22050,
                "enable_preprocessing": True,
                "model": "bulbul:v3",
            },
            timeout=15,
        )

        if response.status_code == 200:
            result = response.json()
            audio_b64 = result.get("audios", [""])[0]
            return {"audio": audio_b64, "format": "wav"}

        raise HTTPException(
            status_code=response.status_code,
            detail=f"Sarvam TTS error: {response.text[:200]}"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== SARVAM STT API ====================

@app.post("/api/stt")
async def sarvam_stt(audio: UploadFile = File(...)):
    """Sarvam STT — accepts WAV audio, returns transcript"""
    SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

    try:
        audio_bytes = await audio.read()

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            f.write(audio_bytes)
            temp_path = f.name

        with open(temp_path, "rb") as af:
            response = http_requests.post(
                "https://api.sarvam.ai/speech-to-text",
                headers={"API-Subscription-Key": SARVAM_API_KEY},
                files={"file": ("audio.wav", af, "audio/wav")},
                data={"language_code": "hi-IN", "model": "saaras:v2"},
                timeout=20,
            )

        os.remove(temp_path)

        if response.status_code == 200:
            result = response.json()
            transcript = result.get("transcript", "")
            return {"transcript": transcript}

        raise HTTPException(
            status_code=response.status_code,
            detail=f"Sarvam STT error: {response.text[:200]}"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== FILE API ====================

@app.get("/api/file")
async def get_file(path: str):
    """Read a file and return its content + type for the editor page."""
    try:
        if not path or not os.path.exists(path):
            raise HTTPException(status_code=404, detail=f"File not found: {path}")

        ext = path.lower()
        name = os.path.basename(path)

        if ext.endswith(".docx"):
            from docx import Document
            doc = Document(path)
            content = "\n".join(p.text for p in doc.paragraphs)
            file_type = "docx"
        else:
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            if ext.endswith((".html", ".htm")):
                file_type = "html"
            elif ext.endswith((".py", ".js", ".ts", ".css", ".json", ".tsx", ".jsx")):
                file_type = "code"
            else:
                file_type = "text"

        return {"content": content, "file_type": file_type, "name": name, "path": path}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/edit")
async def edit_file_api(body: dict):
    """Apply an edit instruction to a file and return updated content."""
    path = body.get("path", "")
    instruction = body.get("instruction", "")

    if not path or not instruction:
        raise HTTPException(status_code=400, detail="path and instruction required")

    loop = asyncio.get_event_loop()
    try:
        from tools.file_tools import edit_file_with_llm
        result = await loop.run_in_executor(None, edit_file_with_llm, path, instruction)

        # Re-read updated file locally instead of calling the API endpoint
        preview_data = await _read_file_for_preview(path)
        if not preview_data:
            raise HTTPException(status_code=404, detail=f"File not found after edit: {path}")

        return {
            "success": True,
            "message": result,
            "content": preview_data["content"],
            "file_type": preview_data["file_type"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== WEBSOCKET ====================

async def _read_file_for_preview(path: str) -> dict | None:
    """Read a file and return a file_preview message dict."""
    try:
        import os
        if not path or not os.path.exists(path):
            return None
        ext = path.lower()
        if ext.endswith(".docx"):
            from docx import Document
            doc = Document(path)
            content = "\n".join(p.text for p in doc.paragraphs)
            file_type = "docx"
        else:
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            if ext.endswith((".html", ".htm")):
                file_type = "html"
            elif ext.endswith((".py", ".js", ".ts", ".css", ".json")):
                file_type = "code"
            else:
                file_type = "text"
        return {"type": "file_preview", "path": path, "content": content, "file_type": file_type}
    except Exception as e:
        print(f"file preview read error: {e}")
        return None


async def _run_command(websocket: WebSocket, user_input: str):
    """Run process_query in thread pool and stream results — runs as background task."""
    from core.session_state import clear_last_file
    clear_last_file()
    
    loop = asyncio.get_event_loop()
    try:
        response, logs = await loop.run_in_executor(None, process_query, user_input)

        for log in logs:
            await websocket.send_json({
                "type": "execution_step",
                "step": log,
                "status": "done",
                "detail": "",
            })

        meta = get_last_response_meta()
        await websocket.send_json({
            "type": "response",
            "message": response,
            "response": response,
            "success": True,
            "task_type": meta.get("task_type") or "action",
            "sources": meta.get("sources") or [],
            "role": get_active_role(),
        })

        # Emit file preview AFTER execution (we're back in async context — no threading issues)
        from core.session_state import get_last_file
        preview_msg = await _read_file_for_preview(get_last_file())
        if preview_msg:
            await websocket.send_json(preview_msg)

    except asyncio.CancelledError:
        await websocket.send_json({"type": "stopped", "message": "Execution stopped."})
    except Exception as e:
        # Check if it's our custom EmailPreviewException by name to avoid tight coupling if needed,
        # or import it directly.
        from tools.preview_tools import EmailPreviewException
        if isinstance(e, EmailPreviewException):
            await websocket.send_json({
                "type": "email_preview",
                "preview": {
                    "to": e.to,
                    "subject": e.subject,
                    "body": e.body,
                    "from": "VENOM AI"
                }
            })
            await websocket.send_json({
                "type": "response",
                "message": "Email preview ready",
                "success": True,
                "task_type": "email"
            })
        else:
            print(f"Command error: {e}")
            await websocket.send_json({"type": "error", "message": str(e)})


async def _run_edit(websocket: WebSocket, file_path: str, instruction: str):
    """Run edit_file_with_llm in thread pool and re-emit preview — background task."""
    from tools.file_tools import edit_file_with_llm
    loop = asyncio.get_event_loop()
    try:
        result = await loop.run_in_executor(None, edit_file_with_llm, file_path, instruction)
        preview_msg = await _read_file_for_preview(file_path)
        if preview_msg:
            await websocket.send_json(preview_msg)
        await websocket.send_json({
            "type": "response",
            "message": result,
            "response": result,
            "success": True,
            "task_type": "edit",
        })
    except asyncio.CancelledError:
        pass
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})


async def _handle_websocket(websocket: WebSocket):
    """Shared WebSocket handler — non-blocking: command runs as background task
    so stop/pause messages can be received while a command is running."""
    await websocket.accept()
    active_connections.append(websocket)
    print(f"Client connected. Total: {len(active_connections)}")

    current_task: asyncio.Task | None = None

    try:
        await websocket.send_json({"type": "connected", "message": "Connected to VENOM AI Desktop"})
        await websocket.send_json({
            "type": "roles_list",
            "roles": list_roles(),
            "active": get_active_role(),
        })

        while True:
            try:
                data = await websocket.receive_text()
                try:
                    data_json = json.loads(data)
                except Exception:
                    data_json = {"type": "command", "text": data}

                command_type = data_json.get("type", "command")

                # ── New command ──────────────────────────────────────────────
                if command_type == "command":
                    user_input = data_json.get("text") or data_json.get("command", "")
                    if not user_input:
                        continue

                    # Cancel previous task if still running
                    if current_task and not current_task.done():
                        execution_control.request_stop()
                        current_task.cancel()

                    execution_control.reset()
                    print(f"Executing: {user_input}")
                    await websocket.send_json({"type": "thinking"})
                    current_task = asyncio.create_task(_run_command(websocket, user_input))

                # ── Stop ─────────────────────────────────────────────────────
                elif command_type == "stop":
                    execution_control.request_stop()
                    if current_task and not current_task.done():
                        current_task.cancel()
                    await websocket.send_json({"type": "stopped", "message": "Execution stopped."})

                # ── Pause ────────────────────────────────────────────────────
                elif command_type == "pause":
                    execution_control.request_pause()
                    await websocket.send_json({"type": "paused", "message": "Execution paused."})

                # ── Resume ───────────────────────────────────────────────────
                elif command_type == "resume":
                    execution_control.request_resume()
                    await websocket.send_json({"type": "resumed", "message": "Execution resumed."})

                # ── Edit file from preview panel ─────────────────────────────
                elif command_type == "edit_file":
                    file_path = data_json.get("path", "")
                    instruction = data_json.get("instruction", "")
                    if file_path and instruction:
                        if current_task and not current_task.done():
                            current_task.cancel()
                        current_task = asyncio.create_task(
                            _run_edit(websocket, file_path, instruction)
                        )
                
                # ── Email Confirm ─────────────────────────────────────────────
                elif command_type == "email_confirm":
                    preview_data = data_json.get("preview", {})
                    to = preview_data.get("to", data_json.get("to", ""))
                    subject = preview_data.get("subject", data_json.get("subject", ""))
                    body = preview_data.get("body", data_json.get("body", ""))
                    from tools.email import send_email_direct
                    
                    def _send_email():
                        return send_email_direct(to, subject, body)
                    
                    loop = asyncio.get_event_loop()
                    result = await loop.run_in_executor(None, _send_email)
                    await websocket.send_json({
                        "type": "response",
                        "message": result,
                        "success": "Sent successfully" in result
                    })

                # ── Model switch ─────────────────────────────────────────────
                elif command_type == "model_switch":
                    model = data_json.get("model", "gemini")
                    
                    # Update active model in llm.py
                    from core.llm import set_active_llm
                    set_active_llm(model)
                    
                    await websocket.send_json({
                        "type": "model_switched",
                        "model": model,
                        "message": f"Switched to {model}",
                    })

                # ── Role switch ──────────────────────────────────────────────
                elif command_type == "switch_role":
                    role_id = data_json.get("role_id") or data_json.get("role", "default")
                    custom_name = data_json.get("custom_name") or data_json.get("name")
                    custom_prompt = data_json.get("custom_prompt") or data_json.get("prompt")
                    try:
                        role = set_role(role_id, custom_name=custom_name, custom_prompt=custom_prompt)
                        await websocket.send_json({
                            "type": "role_switched",
                            "role": role,
                            "message": f"Switched to {role['emoji']} {role['name']}",
                        })
                    except ValueError as e:
                        await websocket.send_json({"type": "error", "message": str(e)})

                # ── List roles ───────────────────────────────────────────────
                elif command_type == "list_roles":
                    await websocket.send_json({
                        "type": "roles_list",
                        "roles": list_roles(),
                        "active": get_active_role(),
                    })

                # ── Ping ─────────────────────────────────────────────────────
                elif command_type == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": data_json.get("timestamp"),
                    })

            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Message error: {e}")
                try:
                    await websocket.send_json({"type": "error", "message": str(e)})
                except Exception:
                    break

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if current_task and not current_task.done():
            current_task.cancel()
        if websocket in active_connections:
            active_connections.remove(websocket)
        print(f"Client disconnected. Remaining: {len(active_connections)}")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await _handle_websocket(websocket)


@app.websocket("/ws/{session_id}")
async def websocket_endpoint_with_session(websocket: WebSocket, session_id: str):
    """WebSocket with session ID — used by Next.js frontend"""
    await _handle_websocket(websocket)

# ==================== SERVER STARTUP ====================

def start_mobile_server():
    """Start FastAPI server"""
    print("\n" + "=" * 60)
    print("VENOM AI - Mobile Server Starting...")
    print("=" * 60)
    print(f"Mobile UI: http://localhost:{MOBILE_SERVER_PORT}")
    print(f"Network access: http://<your-ip>:{MOBILE_SERVER_PORT}")
    print(f"Mobile app location: {MOBILE_DIR}")
    print("=" * 60 + "\n")
    
    uvicorn.run(
        app,
        host=MOBILE_SERVER_HOST,
        port=MOBILE_SERVER_PORT,
        log_level="info"
    )

if __name__ == "__main__":
    start_mobile_server()
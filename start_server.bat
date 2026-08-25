@echo off
start "Backend" cmd /k "cd backend && .\venv\Scripts\activate && python -X utf8 run_server.py"
start "Frontend" cmd /k "cd frontend && npm run dev"

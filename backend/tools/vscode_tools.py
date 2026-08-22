# tools/vscode_tools.py - VS Code Automation

import subprocess
import os
import time
from core.llm import ask_llm

def open_vscode(project_path=None):
    """Open VS Code"""
    if project_path and os.path.exists(project_path):
        subprocess.Popen(["code", project_path])
    else:
        subprocess.Popen("code", shell=True)
    return "VS Code opened"

def open_vscode_with_file(file_path):
    """Open specific file in VS Code"""
    if not os.path.exists(file_path):
        # Create file if doesn't exist
        with open(file_path, 'w') as f:
            f.write("")
    
    subprocess.Popen(["code", file_path])
    time.sleep(2)
    return f"Opened {file_path} in VS Code"
# tools/vscode_tools.py

from core.llm import ask_llm_for_code
from core.session_state import set_last_file
import os
import subprocess

def generate_code(description, filename="generated_code.py", language="python"):
    """Generate complete code and save to file"""

    print(f"Generating {language} code: {description}")

    code = ask_llm_for_code(prompt=description, language=language)

    if not code:
        return "Code generation failed"

    desktop = os.path.join(os.path.expanduser("~"), "Desktop")
    filepath = os.path.join(desktop, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(code)

    set_last_file(filepath)
    print(f"Code saved: {filepath} ({len(code)} chars)")

    try:
        subprocess.Popen(["code", filepath])
    except:
        print("VS Code open failed, file saved on Desktop")

    return f"Code generated and saved: {filename} ({len(code.splitlines())} lines)"
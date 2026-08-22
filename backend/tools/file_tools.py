# tools/file_tools.py

import os
import re
from docx import Document
from core.session_state import set_last_file, get_last_file


def create_file(path: str):
    """Create empty file"""
    open(path, "w").close()
    set_last_file(path)
    return f"File created: {path}"


def write_file(path: str, content: str):
    """Write content to file (creates or overwrites)"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    set_last_file(path)
    return f"Content written to {path}"


def read_file(path: str):
    """Read file content"""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def delete_file(path: str):
    """Delete file"""
    os.remove(path)
    return f"Deleted {path}"


def replace_in_file(path: str, old_text: str, new_text: str):
    """
    Find & replace text in an existing file.
    Works for .txt, .html, .py, .js, .css and any plain-text file.
    For .docx files it replaces paragraph text too.
    """
    if not os.path.exists(path):
        return f"File not found: {path}"

    ext = path.lower()

    if ext.endswith(".docx"):
        doc = Document(path)
        changed = 0
        for para in doc.paragraphs:
            if old_text in para.text:
                for run in para.runs:
                    if old_text in run.text:
                        run.text = run.text.replace(old_text, new_text)
                        changed += 1
        # Also check tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for para in cell.paragraphs:
                        for run in para.runs:
                            if old_text in run.text:
                                run.text = run.text.replace(old_text, new_text)
                                changed += 1
        doc.save(path)
        set_last_file(path)
        return f"Replaced '{old_text}' -> '{new_text}' ({changed} occurrence(s)) in {path}"

    else:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        if old_text not in content:
            return f"Text '{old_text}' not found in {path}"

        new_content = content.replace(old_text, new_text)
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        set_last_file(path)
        count = content.count(old_text)
        return f"Replaced '{old_text}' -> '{new_text}' ({count} occurrence(s)) in {path}"


def edit_file_with_llm(path: str, instruction: str):
    """
    Read the file, apply the edit instruction via LLM, write back.
    Uses ask_llm_for_edit which has high max_tokens + chunked continuation
    so large HTML / code files are never truncated.
    Automatically resolves 'last_file' if path is empty or 'last'.
    """
    from core.llm import ask_llm_for_edit

    # Resolve path
    if not path or path in ("last", "last_file", "current"):
        path = get_last_file()
        if not path:
            return "No file in session to edit. Please specify a file path."

    if not os.path.exists(path):
        return f"File not found: {path}"

    ext = path.lower()

    # Read current content
    if ext.endswith(".docx"):
        doc = Document(path)
        current_content = "\n".join(p.text for p in doc.paragraphs)
    else:
        with open(path, "r", encoding="utf-8") as f:
            current_content = f.read()

    # Apply edit via LLM (chunked, no truncation)
    updated_content = ask_llm_for_edit(current_content, instruction)

    if not updated_content.strip():
        return "Edit failed — LLM returned empty content."

    # Write back
    if ext.endswith(".docx"):
        doc = Document()
        for line in updated_content.split("\n"):
            doc.add_paragraph(line)
        doc.save(path)
    else:
        with open(path, "w", encoding="utf-8") as f:
            f.write(updated_content)

    set_last_file(path)
    return f"File updated: {path}"

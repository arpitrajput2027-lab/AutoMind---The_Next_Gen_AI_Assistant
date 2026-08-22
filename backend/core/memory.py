# core/memory.py

import json
import os
from config import MEMORY_FILE, MAX_MEMORY

conversation = []

def load_memory():
    """Load memory from JSON"""
    global conversation
    
    if not os.path.exists(MEMORY_FILE):
        save_memory()
        return
    
    try:
        with open(MEMORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            conversation = data.get("conversation", [])
    except:
        conversation = []

def save_memory():
    """Save memory to JSON"""
    with open(MEMORY_FILE, "w", encoding="utf-8") as f:
        json.dump({"conversation": conversation}, f, indent=2, ensure_ascii=False)

def add_memory(user, assistant):
    """Add chat to memory"""
    conversation.append({"role": "user", "content": user})
    conversation.append({"role": "assistant", "content": assistant})
    
    # Rolling window
    while len(conversation) > MAX_MEMORY * 2:
        conversation.pop(0)
    
    save_memory()

def get_context():
    """Build context string"""
    context = ""
    for msg in conversation:
        role = msg["role"].capitalize()
        context += f"{role}: {msg['content']}\n"
    return context.strip()

def clear_memory():
    """Clear all memory"""
    global conversation
    conversation = []
    save_memory()
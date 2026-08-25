# core/llm.py

import requests
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types as genai_types
import re

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")  # gsk_ prefix = Groq (groq.com) key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# New google-genai SDK -- create client once
_gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# Groq API (not xAI Grok) -- uses OpenAI-compatible endpoint
GROQ_LLM_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "openai/gpt-oss-120b"        # 120B param, available on Groq
GEMINI_MODEL = "gemini-2.5-flash"
# GROK_MODEL = "openai/gpt-oss-120b"


# Global state for the active model
ACTIVE_MODEL = "gemini" # Default

SYSTEM_PROMPT = "You are VENOM AI, a helpful autonomous agent."

def set_active_llm(model_name: str):
    global ACTIVE_MODEL
    ACTIVE_MODEL = model_name.lower()

def _strip_think_tags(text: str) -> str:
    """Remove Qwen-style <think>...</think> reasoning blocks."""
    return re.sub(r"<think>[\s\S]*?</think>\s*", "", text).strip()

def _ask_groq(messages, max_tokens, temperature):
    """Call Groq API (groq.com) -- fast inference."""
    if not GROQ_API_KEY:
        return None, "error"
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature
    }
    try:
        response = requests.post(GROQ_LLM_URL, headers=headers, json=payload, timeout=60)
        if response.status_code == 200:
            data = response.json()
            raw = data["choices"][0]["message"]["content"].strip()
            return _strip_think_tags(raw), data["choices"][0].get("finish_reason", "stop")
        else:
            print(f"[WARN] Groq Error {response.status_code}: {response.text[:200]}")
            return None, "error"
    except Exception as e:
        print(f"[WARN] Groq Request Error: {e}")
        return None, "error"


def _ask_gemini(prompt_text, max_tokens, temperature):
    if not _gemini_client:
        return '{"thought": "error", "plan": [], "final_response": "Gemini API Key missing."}', "stop"
    
    try:
        config = genai_types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        )
        response = _gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt_text,
            config=config,
        )
        
        finish_reason = "stop"
        if response.candidates and response.candidates[0].finish_reason.name not in ("STOP", "MAX_TOKENS"):
            finish_reason = "length"
        elif response.candidates and response.candidates[0].finish_reason.name == "MAX_TOKENS":
            finish_reason = "length"

        return response.text.strip(), finish_reason
    except Exception as e:
        print(f"❌ Gemini Error: {e}")
        return f'{{"thought": "exception", "plan": [], "final_response": "Error: {e}"}}', "stop"

def ask_llm(prompt):
    """Query Active LLM - general use. Falls back to Gemini if Groq fails."""
    if not prompt or not prompt.strip():
        return '{"thought": "empty input", "plan": [], "final_response": "Kuch sunai nahi diya. Dobara boliye."}'
    
    try:
        if ACTIVE_MODEL == "grok":
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt.strip()}
            ]
            content, reason = _ask_groq(messages, max_tokens=3000, temperature=0.7)
            if content is None:  # Groq failed -- fall back to Gemini
                print("[INFO] Groq unavailable, falling back to Gemini...")
                full_prompt = f"{SYSTEM_PROMPT}\n\n{prompt.strip()}"
                content, _ = _ask_gemini(full_prompt, max_tokens=3000, temperature=0.7)
            return content
        else:  # Gemini
            full_prompt = f"{SYSTEM_PROMPT}\n\n{prompt.strip()}"
            content, _ = _ask_gemini(full_prompt, max_tokens=3000, temperature=0.7)
            return content
    except Exception as e:
        print(f"[ERR] LLM Exception: {e}")
        return f'{{"thought": "exception", "plan": [], "final_response": "Error: {e}"}}'


def ask_llm_for_edit(current_content: str, instruction: str) -> str:
    """Apply an edit instruction to file content."""
    prompt = (
        f"You are a file editor. Apply the instruction below to the content.\n"
        f"Return the COMPLETE, FULLY updated content — every single line, "
        f"nothing omitted or shortened. Do NOT add any explanation.\n"
        f"Do NOT wrap in markdown code fences.\n\n"
        f"INSTRUCTION: {instruction}\n\n"
        f"CURRENT CONTENT:\n{current_content}\n\n"
        f"COMPLETE UPDATED CONTENT:"
    )

    full_result = ""
    
    if ACTIVE_MODEL == "grok":
        messages = [{"role": "user", "content": prompt}]
        for chunk_num in range(1, 6):
            chunk, finish_reason = _ask_groq(messages, max_tokens=4000, temperature=0.2)
            if chunk is None:  # Groq failed, fall back to Gemini for this task
                chunk, finish_reason = _ask_gemini(prompt, max_tokens=8000, temperature=0.2)
                full_result += (chunk or "")
                break
            full_result += chunk
            if finish_reason == "stop":
                break
            messages.append({"role": "assistant", "content": chunk})
            messages.append({"role": "user", "content": "Continue exactly from where you left off, no repetition:"})
    else: # Gemini
        current_prompt = prompt
        for chunk_num in range(1, 6):
            chunk, finish_reason = _ask_gemini(current_prompt, max_tokens=8000, temperature=0.2)
            full_result += chunk
            if finish_reason != "length":
                break
            current_prompt += f"\n{chunk}\n\nContinue exactly from where you left off, no repetition:"

    # Strip accidental markdown fences
    result = full_result.strip()
    result = re.sub(r"^```[a-z]*\n?", "", result)
    result = re.sub(r"\n?```$", "", result)
    return result.strip()


def ask_llm_for_code(prompt, language="python"):
    """Dedicated code generation with chunked continuation"""
    system_context = (
        f"You are an expert {language} developer. "
        f"Generate COMPLETE, fully working code. "
        f"Do NOT stop in the middle. "
        f"If code is long, write everything. "
        f"Return ONLY raw code, no explanation, no markdown backticks."
    )
    
    initial_prompt = f"{system_context}\n\nTask: {prompt}"
    full_code = ""

    if ACTIVE_MODEL == "grok":
        messages = [{"role": "user", "content": initial_prompt}]
        for chunk_num in range(1, 6):
            chunk_content, finish_reason = _ask_groq(messages, max_tokens=4000, temperature=0.2)
            if chunk_content is None:  # Groq failed, fall back to Gemini
                chunk_content, finish_reason = _ask_gemini(initial_prompt, max_tokens=8000, temperature=0.2)
                full_code += _clean_code_block(chunk_content or "", language)
                break
            chunk_content = _clean_code_block(chunk_content, language)
            full_code += chunk_content
            
            if finish_reason == "stop" and _is_code_complete(full_code, language):
                break
            
            messages.append({"role": "assistant", "content": chunk_content})
            messages.append({"role": "user", "content": "Continue the code EXACTLY from where you left off. Do NOT repeat any previous code. Continue directly:"})
    else: # Gemini
        current_prompt = initial_prompt
        for chunk_num in range(1, 6):
            chunk_content, finish_reason = _ask_gemini(current_prompt, max_tokens=8000, temperature=0.2)
            chunk_content = _clean_code_block(chunk_content, language)
            full_code += chunk_content
            
            if finish_reason != "length" and _is_code_complete(full_code, language):
                break
            
            current_prompt += f"\n{chunk_content}\n\nContinue the code EXACTLY from where you left off. Do NOT repeat any previous code. Continue directly:"

    return full_code.strip()


def _clean_code_block(text, language):
    """Remove markdown code fences if present"""
    lines = text.split('\n')
    cleaned = []
    
    for line in lines:
        if line.strip().startswith(f"```{language}") or line.strip() == f"```{language}":
            continue
        elif line.strip() == "```" and not cleaned:
            continue
        elif line.strip() == "```" and cleaned:
            break
        else:
            cleaned.append(line)
    
    return '\n'.join(cleaned)


def _is_code_complete(code, language):
    if not code.strip():
        return False
    
    if language in ("python",):
        lines = [l for l in code.strip().split('\n') if l.strip()]
        last_line = lines[-1] if lines else ""
        incomplete_signs = ["def ", "class ", "if ", "for ", "while ", "try:", "else:", "elif ", "except"]
        if any(last_line.strip().startswith(s) for s in incomplete_signs):
            return False
        
        open_b = code.count('(') - code.count(')')
        open_sq = code.count('[') - code.count(']')
        open_cur = code.count('{') - code.count('}')
        
        if open_b > 0 or open_sq > 0 or open_cur > 0:
            return False
            
    elif language in ("javascript", "typescript", "java", "c", "cpp"):
        open_cur = code.count('{') - code.count('}')
        if open_cur > 0:
            return False
            
    return True
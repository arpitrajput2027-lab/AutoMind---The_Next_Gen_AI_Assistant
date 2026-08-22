# core/llm.py

import requests
import os
from dotenv import load_dotenv

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SARVAM_LLM_URL = "https://api.sarvam.ai/v1/chat/completions"
SARVAM_MODEL = "sarvam-105b"  # ✅ Updated model

SYSTEM_PROMPT = "You are VENOM AI, a helpful autonomous agent."

def ask_llm(prompt):
    """Query Sarvam LLM - general use"""
    if not prompt or not prompt.strip():
        return '{"thought": "empty input", "plan": [], "final_response": "Kuch sunai nahi diya. Dobara boliye."}'
    
    try:
        headers = {
            "Authorization": f"Bearer {SARVAM_API_KEY}",
            "Content-Type": "application/json"
        }

        full_prompt = f"{SYSTEM_PROMPT}\n\n{prompt.strip()}"

        payload = {
            "model": SARVAM_MODEL,
            "messages": [{"role": "user", "content": full_prompt}],
            "max_tokens": 3000,
            "temperature": 0.7
        }

        response = requests.post(SARVAM_LLM_URL, headers=headers, json=payload, timeout=300)

        if response.status_code == 200:
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
        else:
            print(f"❌ LLM Error {response.status_code}: {response.text[:300]}")
            return f'{{"thought": "api error", "plan": [], "final_response": "API Error {response.status_code}"}}'

    except Exception as e:
        print(f"LLM Exception: {e}")
        return f'{{"thought": "exception", "plan": [], "final_response": "Error: {e}"}}'


def ask_llm_for_edit(current_content: str, instruction: str) -> str:
    """
    Apply an edit instruction to file content.
    Uses high max_tokens + chunked continuation so large HTML/code files
    are never truncated in the response.
    """
    import re as _re

    prompt = (
        f"You are a file editor. Apply the instruction below to the content.\n"
        f"Return the COMPLETE, FULLY updated content — every single line, "
        f"nothing omitted or shortened. Do NOT add any explanation.\n"
        f"Do NOT wrap in markdown code fences.\n\n"
        f"INSTRUCTION: {instruction}\n\n"
        f"CURRENT CONTENT:\n{current_content}\n\n"
        f"COMPLETE UPDATED CONTENT:"
    )

    messages = [{"role": "user", "content": prompt}]
    full_result = ""
    headers = {
        "Authorization": f"Bearer {SARVAM_API_KEY}",
        "Content-Type": "application/json",
    }

    for chunk_num in range(1, 6):
        payload = {
            "model": SARVAM_MODEL,
            "messages": messages,
            "max_tokens": 100000,
            "temperature": 0.2,
        }
        try:
            resp = requests.post(SARVAM_LLM_URL, headers=headers, json=payload, timeout=300)
            if resp.status_code != 200:
                print(f"edit llm error {resp.status_code}: {resp.text[:200]}")
                break
            data = resp.json()
            chunk = data["choices"][0]["message"]["content"]
            finish_reason = data["choices"][0].get("finish_reason", "stop")
            full_result += chunk
            print(f"edit chunk {chunk_num}: {len(chunk)} chars, finish={finish_reason}")
            if finish_reason == "stop":
                break
            # Truncated — ask to continue
            messages.append({"role": "assistant", "content": chunk})
            messages.append({"role": "user", "content": "Continue exactly from where you left off, no repetition:"})
        except Exception as e:
            print(f"edit llm exception: {e}")
            break

    # Strip accidental markdown fences
    result = full_result.strip()
    result = _re.sub(r"^```[a-z]*\n?", "", result)
    result = _re.sub(r"\n?```$", "", result)
    return result.strip()


def ask_llm_for_code(prompt, language="python"):
    """
    ✅ Dedicated code generation with chunked continuation
    Handles large code files without cutoff
    """
    full_code = ""
    messages = []
    
    # Step 1: Initial request
    system_context = (
        f"You are an expert {language} developer. "
        f"Generate COMPLETE, fully working code. "
        f"Do NOT stop in the middle. "
        f"If code is long, write everything. "
        f"Return ONLY raw code, no explanation, no markdown backticks."
    )
    
    initial_prompt = f"{system_context}\n\nTask: {prompt}"
    messages.append({"role": "user", "content": initial_prompt})
    
    print(f"🔄 Generating code (chunk 1)...")
    
    max_chunks = 5  # Safety limit
    chunk_num = 1
    
    while chunk_num <= max_chunks:
        try:
            payload = {
                "model": SARVAM_MODEL,
                "messages": messages,
                "max_tokens": 100000,  # ✅ Higher limit for code
                "temperature": 0.2   # ✅ Lower temp = more consistent code
            }
            
            headers = {
                "Authorization": f"Bearer {SARVAM_API_KEY}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                SARVAM_LLM_URL,
                headers=headers,
                json=payload,
                timeout=300
            )
            
            if response.status_code != 200:
                print(f"❌ Code gen error: {response.status_code}")
                break
            
            data = response.json()
            chunk_content = data["choices"][0]["message"]["content"].strip()
            finish_reason = data["choices"][0].get("finish_reason", "stop")
            
            # Clean backticks if model added them
            chunk_content = _clean_code_block(chunk_content, language)
            
            full_code += chunk_content
            print(f"✅ Chunk {chunk_num} received ({len(chunk_content)} chars) | finish: {finish_reason}")
            
            # ✅ Check if code is complete
            if finish_reason == "stop" and _is_code_complete(full_code, language):
                print(f"✅ Code generation complete! Total: {len(full_code)} chars")
                break
            
            # ✅ If truncated — ask to continue
            if finish_reason == "length" or not _is_code_complete(full_code, language):
                print(f"⚠️ Code truncated, requesting continuation (chunk {chunk_num + 1})...")
                
                # Add previous response to history
                messages.append({"role": "assistant", "content": chunk_content})
                messages.append({
                    "role": "user",
                    "content": "Continue the code EXACTLY from where you left off. Do NOT repeat any previous code. Continue directly:"
                })
                chunk_num += 1
            else:
                break
                
        except Exception as e:
            print(f"❌ Code gen exception: {e}")
            break
    
    return full_code.strip()


def _clean_code_block(text, language):
    """Remove markdown code fences if present"""
    lines = text.split('\n')
    cleaned = []
    skip_fence = False
    
    for line in lines:
        if line.strip().startswith(f"```{language}") or line.strip() == f"```{language}":
            skip_fence = False  # Start capturing after this
            continue
        elif line.strip() == "```" and not cleaned:
            continue
        elif line.strip() == "```" and cleaned:
            break  # End of code block
        else:
            cleaned.append(line)
    
    return '\n'.join(cleaned)


def _is_code_complete(code, language):
    """
    Heuristic check — is code likely complete?
    """
    if not code.strip():
        return False
    
    if language in ("python",):
        # Python: check if last non-empty line looks like end of function/class/statement
        lines = [l for l in code.strip().split('\n') if l.strip()]
        last_line = lines[-1] if lines else ""
        
        # Incomplete signs
        incomplete_signs = ["def ", "class ", "if ", "for ", "while ", "try:", "else:", "elif ", "except"]
        if any(last_line.strip().startswith(s) for s in incomplete_signs):
            return False
        
        # Check open brackets
        open_b = code.count('(') - code.count(')')
        open_sq = code.count('[') - code.count(']')
        open_cur = code.count('{') - code.count('}')
        
        if open_b > 0 or open_sq > 0 or open_cur > 0:
            return False
    
    elif language in ("javascript", "typescript", "java", "c", "cpp"):
        # Bracket balance check
        open_cur = code.count('{') - code.count('}')
        if open_cur > 0:
            return False
    
    return True
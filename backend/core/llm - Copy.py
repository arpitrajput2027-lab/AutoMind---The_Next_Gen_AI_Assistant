# # core/llm.py

import requests
import os
from dotenv import load_dotenv

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SARVAM_LLM_URL = "https://api.sarvam.ai/v1/chat/completions"
SARVAM_MODEL = "sarvam-m"

def ask_llm(prompt):
    """Query Sarvam LLM"""
    try:
        headers = {
            "Authorization": f"Bearer {SARVAM_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": SARVAM_MODEL,
            "messages": [
                {"role": "system", "content": "You are VENOM AI, a helpful autonomous agent."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 3000,
            "temperature": 0.7
        }

        response = requests.post(
            SARVAM_LLM_URL,
            headers=headers,
            json=payload,
            timeout=300
        )

        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

    except Exception as e:
        print(f"LLM Error: {e}")
        return f"LLM Error: {e}"



# core/llm.py - FIXED FOR SARVAM API

# import requests
# import os
# from dotenv import load_dotenv

# load_dotenv()

# SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
# SARVAM_LLM_URL = "https://api.sarvam.ai/v1/chat/completions"
# SARVAM_MODEL = "sarvam-m"
# def ask_llm(prompt):
#     """
#     Query Sarvam LLM with proper error handling
#     FIXED: Handles 422 errors
#     """
#     try:
#         # Check if prompt is too long
#         if len(prompt) > 8000:
#             print(f"⚠️ Prompt too long ({len(prompt)} chars), truncating...")
#             prompt = prompt[:8000] + "\n\nProvide response in valid JSON format."
        
#         headers = {
#             "Authorization": f"Bearer {SARVAM_API_KEY}",
#             "Content-Type": "application/json"
#         }

#         payload = {
#             "model": SARVAM_MODEL,
#             "messages": [
#                 {"role": "system", "content": "You are VENOM AI, a helpful autonomous agent."},
#                 {"role": "user", "content": prompt}
#             ],
#             "max_tokens": 3000,
#             "temperature": 0.7
#         }

#         response = requests.post(
#             SARVAM_LLM_URL,
#             headers=headers,
#             json=payload,
#             timeout=300
#         )
        
#         # Check response status
#         if response.status_code == 200:
#             data = response.json()
#             result = data["choices"][0]["message"]["content"].strip()
#             print(f"✅ LLM Response received ({len(result)} chars)")
#             return result
        
#         elif response.status_code == 422:
#             print(f"❌ Sarvam API 422 Error")
#             print(f"   Response: {response.text[:200]}")
            
#             # Try with shorter prompt
#             if len(prompt) > 4000:
#                 print("🔄 Retrying with shorter prompt...")
#                 short_prompt = prompt[:4000] + "\n\nContinue in valid JSON."
#                 return ask_llm(short_prompt)
            
#             return '{"thought": "API error", "plan": [], "final_response": "API request failed. Try simpler command."}'
        
#         else:
#             print(f"❌ API Error {response.status_code}")
#             print(f"   Response: {response.text[:200]}")
#             return '{"thought": "API error", "plan": [], "final_response": "Could not process request."}'

#     except requests.exceptions.Timeout:
#         print("❌ API Timeout")
#         return '{"thought": "timeout", "plan": [], "final_response": "Request timed out. Try again."}'
    
#     except Exception as e:
#         print(f"❌ LLM Exception: {e}")
#         return '{"thought": "error", "plan": [], "final_response": "An error occurred."}'
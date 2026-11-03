# core/assistant.py - Main Assistant Logic

import json
import re
from core.llm import ask_llm
from core.memory import get_context, add_memory
from core.planner import plan_tasks
from core.executor import execute_plan
from core.interaction import interaction_manager
from core.session_state import get_context_summary, get_last_file
from core.roles import get_role_prompt_addon, get_active_role
from config import INTERACTIVE_MODE, MAX_INTERACTION_DEPTH
from core.content_generator import generate_essay

# Last web search sources attached to the most recent response (read by server)
_last_response_meta = {"sources": [], "task_type": "action"}


def get_last_response_meta():
    return _last_response_meta

def extract_json(text):
    """Extract JSON from LLM response"""
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None
    
    json_text = match.group()
    json_text = json_text.replace("```", "").replace("`", '"')
    json_text = re.sub(r",\s*}", "}", json_text)
    json_text = re.sub(r",\s*]", "]", json_text)
    
    return json_text

def fix_missing_parameters(data):
    """Ensure all actions have parameters dict"""
    if "plan" in data and isinstance(data["plan"], list):
        for step in data["plan"]:
            if "parameters" not in step:
                step["parameters"] = {}
    return data

def build_system_prompt():
    """Build optimized system prompt for VENOM AI"""
    return """
You are VENOM AI, an autonomous desktop control agent.
You MUST return output strictly in JSON format.
═══════════════════════════════════════════════════════════
CORE BEHAVIOR
═══════════════════════════════════════════════════════════

1. ALWAYS return ONLY valid JSON
2. NO text before or after JSON
3. NO trailing commas
4. NO markdown formatting (```)
5. Keep final_response under 400 characters for TTS

═══════════════════════════════════════════════════════════
CONTENT GENERATION RULES (CRITICAL)
═══════════════════════════════════════════════════════════

When user asks to "write", "type", or "create content":

1. GENERATE ACTUAL CONTENT, not just repeat the request
2. Minimum 150 words for essays/articles
3. Minimum 100 words for explanations
4. Proper structure with introduction, body, conclusion

EXAMPLES:

❌ WRONG:
User: "write essay on AI"
You type: "essay on AI"

✅ CORRECT:
User: "write essay on AI"
You type: "Artificial Intelligence: Transforming the Future

Artificial Intelligence (AI) has emerged as one of the most transformative technologies of the 21st century. AI refers to the simulation of human intelligence in machines that are programmed to think and learn like humans.

The field of AI encompasses various subfields including machine learning, natural language processing, computer vision, and robotics. Machine learning, a subset of AI, enables systems to learn from data and improve their performance over time without being explicitly programmed.

AI applications are revolutionizing multiple industries. In healthcare, AI assists in disease diagnosis and drug discovery. In finance, it powers fraud detection and algorithmic trading. Autonomous vehicles, virtual assistants, and recommendation systems are all products of AI advancement.

However, AI also raises important ethical questions about job displacement, privacy, and decision-making transparency. As we move forward, responsible AI development that considers these challenges will be crucial for harnessing its full potential while minimizing risks."

═══════════════════════════════════════════════════════════
WORD/NOTEPAD WRITING INSTRUCTIONS
═══════════════════════════════════════════════════════════

For "open notepad and write [topic]":
1. write_in_notepad(FULL_GENERATED_CONTENT)
   - Generate 150-300 words
   - Proper paragraphs with \n\n between them
   - Complete, well-structured content

For "open word and write [topic]":
1. open_word()
2. type_text(FULL_GENERATED_CONTENT)
   - Generate 200-500 words
   - Professional formatting
   - Include headings, body, conclusion

NEVER just type the topic name itself!
═══════════════════════════════════════════════════════════
AVAILABLE ACTIONS
═══════════════════════════════════════════════════════════

# SYSTEM CONTROL
brightness_up(), brightness_down(), set_brightness(level)
volume_up(), volume_down(), set_volume(level), mute_volume()
shutdown(), restart(), sleep(), lock_screen()

# APPLICATIONS
open_notepad(), open_word(), open_excel(), open_powerpoint()
write_in_notepad(text)
open_vscode(), open_chrome(), open_edge(), open_calculator()
open_file_explorer(), open_settings(), open_paint()
open_cmd(), open_terminal(), open_task_manager()

# DEVELOPMENT
generate_code(language, description, file_path)
open_vscode_with_file(file_path)

# OFFICE AUTOMATION
create_formatted_word(path, content, style)
create_powerpoint(path, slides_data)

# WEB & SEARCH
web_search(query)          ← REAL-TIME search: fetches live results & answers from them
youtube_search(query)      ← opens YouTube video in browser
google_search(query)       ← opens Google in browser (visual only, no answer)

# COMMUNICATION
send_whatsapp_message(contact, message)
send_email_with_preview(to, subject, body)

# FILE OPERATIONS
type_text(text), press_enter(times)
create_file(path), write_file(path, content)
read_file(path), delete_file(path)
replace_in_file(path, old_text, new_text)   ← find & replace in existing file
edit_file(path, instruction)                 ← apply free-form edit to existing file via LLM

# VISION
capture_screen(), analyze_screen(context)

# SMART HOME (IoT)
turn_light_on(), turn_light_off()
turn_fan_on(), turn_fan_off()

═══════════════════════════════════════════════════════════
EDIT / UPDATE RULES (CRITICAL)
═══════════════════════════════════════════════════════════

When user says "change", "update", "edit", "modify", "replace", "rename" about an existing file:

1. DO NOT create a new file
2. USE replace_in_file(path, old_text, new_text) for simple substitutions
   Example: user says "change my name to Arpit" in a portfolio site
   → replace_in_file("portfolio.html", "Your Name", "Arpit")

3. USE edit_file(path, instruction) for complex edits
   Example: "add a skills section to the document"
   → edit_file("resume.docx", "Add a Skills section after Education with: Python, FastAPI, React")

4. For path — use the actual file path from session context (shown below as SESSION FILES).
   If user says "that file", "the document", "the website" → use the last_file from session.
   Pass path="last" and edit_file will auto-resolve it.

5. NEVER create a duplicate file when editing is asked.

KEYWORD DETECTION:
  "change X to Y"           → replace_in_file(path, X, Y)
  "rename X to Y"           → replace_in_file(path, X, Y)
  "update the name"         → replace_in_file(path, old_name, new_name)
  "add X to the file"       → edit_file(path, "Add X")
  "remove X from the file"  → edit_file(path, "Remove X")
  "rewrite the intro"       → edit_file(path, "Rewrite the introduction paragraph")

═══════════════════════════════════════════════════════════
EXECUTION RULES (CRITICAL)
═══════════════════════════════════════════════════════════

1. SEQUENTIAL EXECUTION ONLY
   ✓ One task at a time
   ✓ Complete before starting next
   ✗ Never open multiple apps simultaneously

2. APP-SPECIFIC WRITING
   • "open notepad and write X" → open_notepad() + type_text(X)
   • "open word and write Y" → open_word() + type_text(Y)
   • DO NOT use create_file for interactive writing

3. PARAMETER INTEGRITY
   • Contact names: EXACT as user provides
   • NO additions like "phone number", "email address"
   • Example: "Aryan Deo" stays "Aryan Deo"

═══════════════════════════════════════════════════════════
INTELLIGENCE ROUTING
═══════════════════════════════════════════════════════════

ANSWER DIRECTLY (no tools):
  • Definitions, explanations, theory
  • Math, coding help, tutorials
  • General knowledge, history
  • "What is", "How to", "Explain"

USE web_search for (PREFERRED for live info):
  • Latest news, current events, "what happened"
  • Live data (stocks, weather, sports scores)
  • Real-time / "today" / "current" / "latest" questions
  • Anything that needs up-to-date facts from the internet
  → Put web_search(query) FIRST in the plan. final_response can be a short placeholder;
     the system will rewrite it using the live results.

USE google_search ONLY when user explicitly wants the browser opened:
  • "open google and search X", "show me google results"

USE youtube_search for:
  • "play song", "watch video"
  • Entertainment requests

═══════════════════════════════════════════════════════════
CODE GENERATION
═══════════════════════════════════════════════════════════

When generating code:
1. Use generate_code(language, description, file_path)
2. In final_response: provide summary only
3. DO NOT include actual code in final_response
4. NO triple backticks or markdown

Example:
{
  "plan": [{
    "action": "generate_code",
    "parameters": {
      "language": "python",
      "description": "fibonacci function",
      "file_path": "fibonacci.py"
    }
  }],
  "final_response": "Created fibonacci.py with the function"
}

═══════════════════════════════════════════════════════════
RESPONSE OPTIMIZATION
═══════════════════════════════════════════════════════════

CONCISE RESPONSES:
✓ "Calculator opened"
✓ "Email preview ready"
✓ "Brightness set to 50%"

AVOID:
✗ "I have successfully executed..."
✗ "The operation has been completed..."
✗ Long explanations

MULTI-STEP SUMMARY:
✓ "Opened Chrome and searched for AI news"
✗ "First I opened Chrome, then I performed a search..."

═══════════════════════════════════════════════════════════
INTERACTIVE MODE
═══════════════════════════════════════════════════════════

If missing information:
1. Set "needs_clarification": true
2. Ask ONE specific question in final_response
3. Keep question under 100 characters

Example:
{
  "thought": "Need recipient email",
  "plan": [],
  "final_response": "Which email should I send to?",
  "needs_clarification": true
}

═══════════════════════════════════════════════════════════
CONTEXT AWARENESS
═══════════════════════════════════════════════════════════

USE SCREEN VISION when:
- User says "read this", "what's on screen"
- "fix this error" (capture error first)
- "summarize this page"

ACTION: capture_screen() → analyze_screen(context)

═══════════════════════════════════════════════════════════
ERROR PREVENTION
═══════════════════════════════════════════════════════════

ALWAYS INCLUDE:
- "action": "exact_action_name"
- "parameters": {} (even if empty)

NEVER:
- Invent action names not in the list
- Use incomplete JSON objects
- Add comments in JSON

═══════════════════════════════════════════════════════════
RESPONSE FORMAT (MANDATORY)
═══════════════════════════════════════════════════════════

{
  "thought": "Brief reasoning (1 sentence)",
  "plan": [
    {
      "action": "action_name",
      "parameters": {
        "param1": "value1"
      }
    }
  ],
  "final_response": "Concise user response (<400 chars)",
  "needs_clarification": false
}

═══════════════════════════════════════════════════════════
EXAMPLES
═══════════════════════════════════════════════════════════

USER: "open calculator"
{
  "thought": "Simple app launch",
  "plan": [{"action": "open_calculator", "parameters": {}}],
  "final_response": "Calculator opened",
  "needs_clarification": false
}

USER: "what is AI?"
{
  "thought": "Knowledge question, answer directly",
  "plan": [],
  "final_response": "AI (Artificial Intelligence) is the simulation of human intelligence by machines, enabling them to learn, reason, and solve problems.",
  "needs_clarification": false
}

USER: "create a python script for sorting"
{
  "thought": "Code generation task",
  "plan": [{
    "action": "generate_code",
    "parameters": {
      "language": "python",
      "description": "sorting algorithm implementation",
      "file_path": "sort.py"
    }
  }],
  "final_response": "Created sort.py with sorting algorithms",
  "needs_clarification": false
}

USER: "send email"
{
  "thought": "Missing recipient info",
  "plan": [],
  "final_response": "Who should I send the email to?",
  "needs_clarification": true
}

USER: "open notepad and write hello world"
{
  "thought": "Interactive writing in notepad",
  "plan": [
    {"action": "write_in_notepad", "parameters": {"text": "hello world"}}
  ],
  "final_response": "Typed 'hello world' in Notepad",
  "needs_clarification": false
}

USER: "set brightness to 70 and volume to 50"
{
  "thought": "Sequential system controls",
  "plan": [
    {"action": "set_brightness", "parameters": {"level": 70}},
    {"action": "set_volume", "parameters": {"level": 50}}
  ],
  "final_response": "Brightness 70%, Volume 50%",
  "needs_clarification": false
}

═══════════════════════════════════════════════════════════

Remember: You are a precise, efficient assistant. Be concise, accurate, and helpful.

═══════════════════════════════════════════════════════════
EXAMPLES FOR CONTENT GENERATION
═══════════════════════════════════════════════════════════

USER: "open notepad and write about machine learning"
{
  "thought": "Generate ML essay in notepad",
  "plan": [
    {
      "action": "write_in_notepad",
      "parameters": {
        "text": "Machine Learning: A Comprehensive Overview\\n\\nMachine Learning (ML) is a subset of artificial intelligence that enables computers to learn from data without being explicitly programmed. It has become a cornerstone of modern technology, powering everything from recommendation systems to autonomous vehicles.\\n\\nThere are three main types of machine learning: supervised learning, where models learn from labeled data; unsupervised learning, which finds patterns in unlabeled data; and reinforcement learning, where agents learn through trial and error.\\n\\nApplications of ML are widespread. In healthcare, ML algorithms diagnose diseases from medical images. In finance, they detect fraudulent transactions. In e-commerce, they personalize shopping experiences. The technology continues to evolve rapidly.\\n\\nHowever, ML also presents challenges including data privacy concerns, algorithmic bias, and the need for large datasets. As the field advances, addressing these issues becomes increasingly important for responsible AI development.\\n\\nThe future of machine learning looks promising with developments in deep learning, neural networks, and edge computing bringing ML capabilities to more devices and applications."
      }
    }
  ],
  "final_response": "Generated ML essay in Notepad",
  "needs_clarification": false
}

USER: "open word and write report on climate change"
{
  "thought": "Generate climate report in Word",
  "plan": [
    {"action": "open_word", "parameters": {}},
    {
      "action": "type_text",
      "parameters": {
        "text": "CLIMATE CHANGE: A GLOBAL CRISIS\\n\\nIntroduction\\nClimate change represents one of the most pressing challenges facing humanity today. Rising global temperatures, extreme weather events, and ecosystem disruptions are clear indicators of this environmental crisis.\\n\\nCauses\\nThe primary driver of climate change is the increase in greenhouse gases, particularly carbon dioxide, methane, and nitrous oxide. Human activities such as fossil fuel combustion, deforestation, and industrial processes have significantly elevated atmospheric CO2 levels.\\n\\nImpacts\\nThe consequences are far-reaching: melting polar ice caps, rising sea levels, more frequent hurricanes, droughts, and floods. Biodiversity loss and agricultural disruptions threaten food security globally.\\n\\nSolutions\\nAddressing climate change requires urgent action. Transitioning to renewable energy, improving energy efficiency, protecting forests, and developing carbon capture technologies are essential steps. International cooperation through agreements like the Paris Accord is crucial.\\n\\nConclusion\\nWhile the challenge is immense, collective action at individual, corporate, and governmental levels can mitigate climate change impacts and secure a sustainable future for coming generations."
      }
    }
  ],
  "final_response": "Created climate change report in Word",
  "needs_clarification": false
}

Remember: ALWAYS generate full, meaningful content - never just repeat the topic!
"""


def _synthesize_from_web_search(user_input: str, search_text: str) -> str:
    """Second-pass LLM call: answer the user using live search results."""
    role = get_active_role()
    role_hint = f"Respond in the voice of: {role['name']}." if role.get("id") != "default" else ""
    prompt = f"""You are VENOM AI. {role_hint}
Answer the user's question using ONLY the web search results below.
Be concise (under 500 chars if possible), accurate, and cite key facts.
Do NOT return JSON. Plain natural language only.
If results are weak, say what you found and note uncertainty.

USER QUESTION:
{user_input}

WEB SEARCH RESULTS:
{search_text}
"""
    try:
        answer = ask_llm(prompt)
        # Strip accidental JSON wrappers
        if answer and answer.strip().startswith("{"):
            parsed = extract_json(answer)
            if parsed:
                try:
                    obj = json.loads(parsed)
                    answer = obj.get("final_response") or answer
                except Exception:
                    pass
        return (answer or "").strip()
    except Exception as e:
        print(f"[web_search synthesize] {e}")
        return ""


def process_query(user_input: str):
    """Main query processing pipeline"""
    global _last_response_meta
    _last_response_meta = {"sources": [], "task_type": "action"}

    from tools.web_search import clear_last_search, get_last_search_results, format_sources_payload
    clear_last_search()
    
    # Check if this is a response to clarifying question
    if interaction_manager.interaction_state["waiting_for_response"]:
        clarified = interaction_manager.process_user_response(user_input)
        # Append to original context
        user_input = f"{interaction_manager.interaction_state['last_question']}\nUser response: {clarified}"
    
    context = get_context()
    system_prompt = build_system_prompt() + get_role_prompt_addon()
    
    session_files = get_context_summary()
    active = get_active_role()
    role_line = f"ACTIVE ROLE: {active['emoji']} {active['name']}"
    prompt = f"{system_prompt}\n\n{role_line}\n\nSESSION FILES: {session_files}\n\nContext:\n{context}\n\nUser:\n{user_input}"
    
    raw = ask_llm(prompt)
    json_text = extract_json(raw)
    
    if not json_text:
        print("NO JSON FOUND")
        print(raw)
        return "LLM did not return JSON. : NETWORK ERROR", []
    
    try:
        data = json.loads(json_text)
        data = fix_missing_parameters(data)
        if "plan" in data:
            for step in data["plan"]:
                if step.get("action") == "type_text":
                    text = step.get("parameters", {}).get("text", "")
                    
                    # If text is suspiciously short (just the topic)
                    if len(text.split()) < 20:
                        # Extract topic from user input
                        topic = user_input.lower()
                        topic = topic.replace("write", "").replace("essay", "")
                        topic = topic.replace("about", "").replace("on", "")
                        topic = topic.strip()
                        
                        # Generate proper content
                        full_content = generate_essay(topic)
                        step["parameters"]["text"] = full_content
                        
                        print(f"⚠️ Content too short, expanded to {len(full_content.split())} words")

    except Exception as e:
        print("JSON PARSE ERROR:", e)
        print(json_text)
        return "LLM returned malformed JSON. : NETWORK ERROR", []
    
    # Check for clarification request
    if INTERACTIVE_MODE and data.get("needs_clarification"):
        question = data.get("final_response", "Can you provide more details?")
        if interaction_manager.interaction_state["depth"] < MAX_INTERACTION_DEPTH:
            interaction_manager.ask_clarifying_question(question)
            return question, []
        else:
            interaction_manager.reset()
    
    # Plan and execute
    steps = plan_tasks(data)
    execution_logs = execute_plan(steps)
    
    final_response = data.get("final_response", "")
    task_type = "action"

    # If web_search ran, synthesize a live answer + attach sources
    used_web_search = any(s.get("action") == "web_search" for s in steps)
    if used_web_search:
        search_blob = get_last_search_results()
        # Pull the raw tool output from logs as fallback context
        search_text = ""
        for log in execution_logs:
            if isinstance(log, str) and log.startswith("web_search:"):
                search_text = log[len("web_search:"):].strip()
                break
        if not search_text and search_blob.get("results"):
            search_text = json.dumps(search_blob, ensure_ascii=False)

        synthesized = _synthesize_from_web_search(user_input, search_text) if search_text else ""
        if synthesized:
            final_response = synthesized
        sources = format_sources_payload()
        _last_response_meta = {"sources": sources, "task_type": "web_search"}
        task_type = "web_search"
        if sources and "http" not in final_response.lower():
            # Append a short sources footer for TTS-friendly text
            titles = [s["title"] for s in sources[:3] if s.get("title")]
            if titles:
                final_response = final_response.rstrip() + "\n\nSources: " + " · ".join(titles)
    else:
        _last_response_meta = {"sources": [], "task_type": task_type}
    
    # Save to memory
    add_memory(user_input, final_response)
    
    # Reset interaction if completed
    interaction_manager.reset()
    
    return final_response, execution_logs

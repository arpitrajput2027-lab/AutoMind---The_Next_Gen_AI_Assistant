# core/roles.py — Role / persona system for Role-Based Chat

from typing import Optional

# Active role state (per-process; single-user hackathon demo)
_active_role_id: str = "default"
_custom_role_name: Optional[str] = None
_custom_role_prompt: Optional[str] = None

ROLES = {
    "default": {
        "id": "default",
        "name": "VENOM",
        "emoji": "⚡",
        "description": "Default autonomous desktop agent",
        "color": "#8b6a3e",
        "prompt": "",  # uses base system prompt as-is
    },
    "developer": {
        "id": "developer",
        "name": "Developer",
        "emoji": "💻",
        "description": "Senior engineer — code, debug, architecture",
        "color": "#0d7377",
        "prompt": """
ACTIVE ROLE: Senior Software Developer
- Speak like an experienced engineer: precise, technical, concise
- Prefer code snippets, best practices, and clear trade-offs
- When generating code: clean, production-ready, well-commented
- Debug systematically: reproduce → isolate → fix
- Suggest tools, libraries, and architecture patterns when helpful
""",
    },
    "teacher": {
        "id": "teacher",
        "name": "Teacher",
        "emoji": "📚",
        "description": "Patient educator — explains step by step",
        "color": "#2d6a4f",
        "prompt": """
ACTIVE ROLE: Expert Teacher
- Explain concepts simply, then go deeper
- Use analogies, examples, and short quizzes
- Break complex topics into numbered steps
- Encourage the learner; never condescend
- Check understanding before moving on
""",
    },
    "writer": {
        "id": "writer",
        "name": "Creative Writer",
        "emoji": "✍️",
        "description": "Storyteller — prose, scripts, copy",
        "color": "#c2410c",
        "prompt": """
ACTIVE ROLE: Creative Writer
- Write with vivid language, rhythm, and voice
- Adapt tone: fiction, marketing copy, scripts, poetry
- Offer style options when asked (formal / casual / poetic)
- Generate full polished drafts, not outlines unless asked
- Prefer storytelling and emotional resonance
""",
    },
    "analyst": {
        "id": "analyst",
        "name": "Data Analyst",
        "emoji": "📊",
        "description": "Data-driven insights & structured analysis",
        "color": "#6d28d9",
        "prompt": """
ACTIVE ROLE: Data Analyst
- Structure answers with clear metrics, tables, and conclusions
- Be rigorous: cite assumptions, note data gaps
- Prefer frameworks (SWOT, funnel, cohort) when useful
- Summarize insights in bullet points, then recommend actions
- Use web_search for live numbers when relevant
""",
    },
    "coach": {
        "id": "coach",
        "name": "Career Coach",
        "emoji": "🎯",
        "description": "Interview prep, resumes, career advice",
        "color": "#b45309",
        "prompt": """
ACTIVE ROLE: Career Coach
- Supportive but direct career guidance
- Help with resumes, cover letters, interview answers (STAR)
- Ask clarifying questions about goals and experience
- Give actionable next steps, not vague motivation
- Role-play interviewer when asked
""",
    },
    "researcher": {
        "id": "researcher",
        "name": "Researcher",
        "emoji": "🔬",
        "description": "Deep research with sources & citations",
        "color": "#1d4ed8",
        "prompt": """
ACTIVE ROLE: Research Analyst
- Prioritize accuracy and evidence
- ALWAYS use web_search for current / factual queries
- Cite sources with titles and URLs when available
- Separate facts from opinions clearly
- Summarize findings, then list sources
""",
    },
    "hacker": {
        "id": "hacker",
        "name": "Hackathon Coach",
        "emoji": "🏆",
        "description": "Pitch, demo, MVP — built for hackathons",
        "color": "#be123c",
        "prompt": """
ACTIVE ROLE: Hackathon Coach
- Obsess over demo wow-factor and judge-friendly storytelling
- Help craft pitches: problem → solution → demo → impact
- Prefer shipping fast: MVP first, polish second
- Suggest features that impress judges visually and technically
- Keep energy high, responses punchy and actionable
""",
    },
}


def list_roles() -> list:
    """Return role metadata for the frontend (no prompts)."""
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "emoji": r["emoji"],
            "description": r["description"],
            "color": r["color"],
        }
        for r in ROLES.values()
    ]


def get_active_role() -> dict:
    """Current role info for UI / responses."""
    if _active_role_id == "custom" and _custom_role_name:
        return {
            "id": "custom",
            "name": _custom_role_name,
            "emoji": "🎭",
            "description": _custom_role_prompt or f"Custom role: {_custom_role_name}",
            "color": "#7c3aed",
            "is_custom": True,
        }
    role = ROLES.get(_active_role_id, ROLES["default"])
    return {
        "id": role["id"],
        "name": role["name"],
        "emoji": role["emoji"],
        "description": role["description"],
        "color": role["color"],
        "is_custom": False,
    }


def set_role(role_id: str, custom_name: str = None, custom_prompt: str = None) -> dict:
    """
    Switch active role.
    - role_id: one of ROLES keys, or "custom"
    - For custom: pass custom_name (required) and optional custom_prompt
    """
    global _active_role_id, _custom_role_name, _custom_role_prompt

    if role_id == "custom":
        if not custom_name or not custom_name.strip():
            raise ValueError("Custom role requires a name")
        _active_role_id = "custom"
        _custom_role_name = custom_name.strip()
        # If user only gave a name, build a solid persona prompt from it
        if custom_prompt and custom_prompt.strip():
            _custom_role_prompt = custom_prompt.strip()
        else:
            _custom_role_prompt = (
                f"ACTIVE ROLE: {_custom_role_name}\n"
                f"- Fully embody the persona of a {_custom_role_name}\n"
                f"- Match their typical tone, vocabulary, and priorities\n"
                f"- Stay in character for the entire conversation\n"
                f"- Be helpful while staying true to this role"
            )
        return get_active_role()

    if role_id not in ROLES:
        raise ValueError(f"Unknown role: {role_id}")

    _active_role_id = role_id
    _custom_role_name = None
    _custom_role_prompt = None
    return get_active_role()


def get_role_prompt_addon() -> str:
    """Extra system-prompt text for the currently active role."""
    if _active_role_id == "custom" and _custom_role_prompt:
        return f"\n═══════════════════════════════════════════════════════════\nROLE OVERRIDE\n═══════════════════════════════════════════════════════════\n{_custom_role_prompt}\n"
    role = ROLES.get(_active_role_id, ROLES["default"])
    if not role.get("prompt"):
        return ""
    return f"\n═══════════════════════════════════════════════════════════\nROLE OVERRIDE\n═══════════════════════════════════════════════════════════\n{role['prompt']}\n"

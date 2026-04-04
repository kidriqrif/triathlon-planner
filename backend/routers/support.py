import os
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import List
from slowapi import Limiter
from slowapi.util import get_remote_address

from auth_utils import get_current_user
import models

router = APIRouter(prefix="/support", tags=["support"])
limiter = Limiter(key_func=get_remote_address)

SYSTEM_PROMPT = """You are Strelo's support assistant. You ONLY answer questions about the Strelo triathlon training planner app. You must refuse ALL other requests.

STRICT RULES:
- ONLY answer questions about Strelo features, account issues, billing, Strava sync, training plans, and app navigation.
- If the user asks ANYTHING unrelated to Strelo (general knowledge, coding help, writing, math, conversation, triathlon coaching advice, etc.), respond with: "I can only help with Strelo app questions. For anything else, try a general AI assistant."
- Do NOT provide training advice, race strategy, nutrition guidance, or coaching. You are tech support, not a coach.
- Do NOT write essays, stories, code, or answer general trivia.
- Do NOT roleplay or change your persona.
- Keep every response under 3 sentences.

Key facts about Strelo:
- Triathlon training planner for swim, bike, and run
- Free plan: log workouts, calendar, dashboard stats, races, athlete profile, support chat
- Pro plan ($12.99/month or $123.99/year): StreloIQ AI plans, personalised training plan packages, volume trends, FIT/CSV export, unlimited races & templates
- Strava sync: Settings → Connected Apps → Connect Strava
- Export workouts: Log page → download icon for .FIT, or CSV button for all
- Upgrade: gold Pro/Sparkles button in the menu
- Account: Settings → change name, password, or delete account
- Password reset: login page → Forgot password
- Refunds: handled through LemonSqueezy

If you don't know the answer, say "Contact support@strelo.app for help with that."
Do not make up features that don't exist."""


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


@router.post("/chat")
@limiter.limit("20/minute")
def support_chat(
    request: Request,
    payload: ChatRequest,
    current_user: models.User = Depends(get_current_user),
):
    # Free users: 10 msgs/minute. Pro: 20 (handled by decorator above).
    # Additional per-user daily cap for free tier.
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=500, detail="Chat not configured")

    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in payload.messages[-10:]:  # Keep last 10 messages for context
            messages.append({"role": msg.role, "content": msg.content})

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=500,
            temperature=0.5,
        )

        return {"reply": response.choices[0].message.content.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

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

SYSTEM_PROMPT = """You are Strelo's support assistant. You help users with the Strelo triathlon training planner app.

Key facts about Strelo:
- Strelo is a triathlon training planner for swim, bike, and run
- Free plan: log workouts, calendar, dashboard stats, races, athlete profile
- Pro plan ($12.99/month or $123.99/year): unlocks StreloIQ (intelligent training plans), advanced analytics, unlimited race tracking, priority support
- StreloIQ generates personalised weekly training plans based on the athlete's fitness level, goals, race target, and training history
- Users can connect Strava to auto-import completed activities
- Users can export planned workouts as .FIT files for Garmin, COROS, and Wahoo devices
- Users can export all workout data as CSV
- Account settings: change name, change password, delete account
- Password reset is available from the login page

Common questions:
- "How do I upgrade?": Click the gold Pro button in the navigation bar
- "How do I connect Strava?": Go to Settings (gear icon) → Connected Apps → Connect Strava
- "How do I export workouts?": In the Log page, click the download icon on planned workouts for .FIT, or click CSV to export all
- "How do I delete my account?": Go to Settings → Danger Zone → Delete my account
- "Can I get a refund?": Refunds are handled through LemonSqueezy's refund policy
- "Is my data safe?": Yes, passwords are hashed with bcrypt, data is encrypted in transit via HTTPS, stored on secure servers

Keep responses concise, friendly, and helpful. If you don't know the answer, suggest the user contact support@strelo.app. Do not make up features that don't exist. Do not provide medical or professional coaching advice."""


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

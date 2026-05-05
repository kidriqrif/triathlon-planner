import os
import logging
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from auth_utils import get_current_user
import models

router = APIRouter(prefix="/digest", tags=["digest"])
logger = logging.getLogger("strelo.digest")

SPORT_LABELS = {"swim": "Swim", "bike": "Bike", "run": "Run", "brick": "Brick", "gym": "Gym"}


def _build_digest_html(user, last_week_workouts, this_week_planned, active_race):
    """Build the weekly digest email HTML."""
    # Last week stats
    completed = [w for w in last_week_workouts if w.status == "completed"]
    total_min = sum(w.duration_min or 0 for w in completed)
    total_km = sum(w.distance_km or 0 for w in completed)
    sport_counts = {}
    for w in completed:
        sport_counts[w.sport] = sport_counts.get(w.sport, 0) + 1

    sport_summary = ", ".join(
        f"{SPORT_LABELS.get(s, s)} ({c}x)" for s, c in sport_counts.items()
    ) or "No sessions"

    # This week planned
    planned_lines = ""
    for w in this_week_planned:
        day = w.date.strftime("%a")
        sport = SPORT_LABELS.get(w.sport, w.sport)
        dur = f" — {w.duration_min}min" if w.duration_min else ""
        planned_lines += f"<tr><td style='padding:4px 8px;color:#64748b;font-size:13px'>{day}</td><td style='padding:4px 8px;font-size:13px;font-weight:600'>{sport}</td><td style='padding:4px 8px;color:#94a3b8;font-size:13px'>{w.workout_type}{dur}</td></tr>"

    if not planned_lines:
        planned_lines = "<tr><td colspan='3' style='padding:8px;color:#94a3b8;font-size:13px'>No workouts planned yet</td></tr>"

    # Race countdown
    race_html = ""
    if active_race:
        days_to = (active_race.date - date.today()).days
        if days_to > 0:
            race_html = f"""
            <div style="background:#f0fdf4;border-radius:8px;padding:12px 16px;margin-top:16px">
                <p style="margin:0;font-size:13px;color:#16a34a;font-weight:600">{active_race.name} — {days_to} days to go</p>
            </div>
            """

    return f"""
    <div style="font-family:'Inter',system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
            <div style="width:28px;height:28px;background:#4f46e5;border-radius:6px;display:flex;align-items:center;justify-content:center">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M5 14L8 4" stroke="white" stroke-width="2.2" stroke-linecap="round"/><path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.6)" stroke-width="2.2" stroke-linecap="round"/></svg>
            </div>
            <span style="font-weight:700;font-size:14px;color:#0f172a">Strelo Weekly Digest</span>
        </div>

        <p style="color:#0f172a;font-size:15px;font-weight:600;margin:0 0 4px">Hey {user.name},</p>
        <p style="color:#64748b;font-size:13px;margin:0 0 20px">Here's your training week at a glance.</p>

        <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:16px">
            <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;font-weight:600">Last week</p>
            <p style="margin:0;font-size:22px;font-weight:700;color:#0f172a">{len(completed)} session{'s' if len(completed) != 1 else ''}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#64748b">{round(total_min / 60, 1)}h · {round(total_km, 1)}km · {sport_summary}</p>
        </div>

        <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;font-weight:600">This week ahead</p>
        <table style="width:100%;border-collapse:collapse">
            {planned_lines}
        </table>

        {race_html}

        <p style="margin:24px 0 0;font-size:12px;color:#cbd5e1">
            <a href="{os.getenv('FRONTEND_URL', 'https://triathlon-planner-one.vercel.app')}" style="color:#4f46e5;text-decoration:none;font-weight:600">Open Strelo</a> · You're receiving this because you have a Strelo account.
        </p>
    </div>
    """


@router.post("/send")
def send_digest(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Send the weekly digest email to the current user (manual trigger)."""
    today = date.today()
    last_monday = today - timedelta(days=today.weekday() + 7)
    last_sunday = last_monday + timedelta(days=6)
    this_monday = today - timedelta(days=today.weekday())
    this_sunday = this_monday + timedelta(days=6)

    last_week = db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id,
        models.Workout.date >= last_monday,
        models.Workout.date <= last_sunday,
    ).order_by(models.Workout.date).all()

    this_week = db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id,
        models.Workout.date >= this_monday,
        models.Workout.date <= this_sunday,
        models.Workout.status == "planned",
    ).order_by(models.Workout.date).all()

    active_race = db.query(models.Race).filter(
        models.Race.user_id == current_user.id,
        models.Race.is_active,
    ).order_by(models.Race.date).first()

    html = _build_digest_html(current_user, last_week, this_week, active_race)

    resend_key = os.getenv("RESEND_API_KEY", "")
    if not resend_key:
        return {"message": "Email not configured — digest preview only", "html": html}

    try:
        import resend
        resend.api_key = resend_key
        resend.Emails.send({
            "from": os.getenv("EMAIL_FROM", "Strelo <onboarding@resend.dev>"),
            "to": [current_user.email],
            "subject": "Your Strelo Weekly Digest",
            "html": html,
        })
        return {"message": "Digest sent"}
    except Exception as e:
        logger.warning(f"Digest send failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send: {str(e)}")

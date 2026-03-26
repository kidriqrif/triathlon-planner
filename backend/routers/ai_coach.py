import os
import json
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from database import get_db
from auth_utils import get_current_user
import models

router = APIRouter(prefix="/ai", tags=["ai"])
limiter = Limiter(key_func=get_remote_address)


def _get_training_phase(days_to_race: int) -> str:
    if days_to_race > 84:
        return "Base"
    elif days_to_race > 56:
        return "Build"
    elif days_to_race > 28:
        return "Peak"
    else:
        return "Taper"


def _build_training_summary(workouts: list) -> str:
    if not workouts:
        return "No recent training data available."
    lines = []
    for w in workouts:
        parts = [f"{w.date} | {w.sport} | {w.workout_type} | {w.status}"]
        if w.duration_min:
            parts.append(f"{w.duration_min} min")
        if w.distance_km:
            parts.append(f"{w.distance_km:.1f} km")
        if w.rpe:
            parts.append(f"RPE {w.rpe}")
        lines.append(" | ".join(parts))
    return "\n".join(lines)


MOCK_RESPONSE = {
    "week_focus": "Aerobic base building",
    "rationale": (
        "No API key configured — showing demo suggestions. "
        "Focus on building your aerobic base with comfortable, conversational-effort sessions."
    ),
    "workouts": [
        {
            "day": "Monday",
            "sport": "run",
            "workout_type": "easy",
            "duration_min": 40,
            "distance_km": 7.0,
            "description": "Easy aerobic run, zone 2 heart rate. Keep it comfortable.",
        },
        {
            "day": "Tuesday",
            "sport": "swim",
            "workout_type": "easy",
            "duration_min": 45,
            "distance_km": 1.8,
            "description": "Steady swim, focus on technique and breathing rhythm.",
        },
        {
            "day": "Wednesday",
            "sport": "bike",
            "workout_type": "tempo",
            "duration_min": 60,
            "distance_km": 30.0,
            "description": "Moderate tempo ride, zone 3 effort. Maintain a steady pace.",
        },
        {
            "day": "Thursday",
            "sport": "run",
            "workout_type": "recovery",
            "duration_min": 30,
            "distance_km": 5.0,
            "description": "Very easy recovery run. Go by feel, stay light.",
        },
        {
            "day": "Saturday",
            "sport": "bike",
            "workout_type": "long",
            "duration_min": 90,
            "distance_km": 50.0,
            "description": "Long endurance ride, zone 2. Fuel and hydrate well.",
        },
        {
            "day": "Sunday",
            "sport": "run",
            "workout_type": "long",
            "duration_min": 60,
            "distance_km": 10.0,
            "description": "Long run off the bike (brick optional). Easy to moderate pace.",
        },
    ],
}


@router.post("/suggest-week")
@limiter.limit("5/hour")
def suggest_week(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.plan != "pro":
        raise HTTPException(status_code=403, detail="StreloIQ requires a Pro subscription")

    # Gather context scoped to the current user
    athlete = db.query(models.Athlete).filter(models.Athlete.user_id == current_user.id).first()
    if not athlete:
        athlete = models.Athlete(user_id=current_user.id)

    active_race = (
        db.query(models.Race)
        .filter(models.Race.user_id == current_user.id, models.Race.is_active == True)
        .order_by(models.Race.date)
        .first()
    )

    today = date.today()
    four_weeks_ago = today - timedelta(weeks=4)
    recent_workouts = (
        db.query(models.Workout)
        .filter(
            models.Workout.user_id == current_user.id,
            models.Workout.date >= four_weeks_ago,
            models.Workout.date <= today,
        )
        .order_by(models.Workout.date)
        .all()
    )

    training_summary = _build_training_summary(recent_workouts)

    race_info = "No upcoming race set."
    phase = "Base"
    days_to_race = 999
    race_distance = "unknown"
    race_date_str = "TBD"

    if active_race:
        days_to_race = (active_race.date - today).days
        phase = _get_training_phase(days_to_race)
        race_distance = active_race.distance
        race_date_str = str(active_race.date)
        race_info = f"{active_race.name} ({race_distance}) on {race_date_str} — {days_to_race} days away"

    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return MOCK_RESPONSE

    try:
        from groq import Groq

        client = Groq(api_key=api_key)

        system_prompt = (
            "You are an expert triathlon coach. "
            "Given the athlete's recent training history and upcoming race, "
            "suggest a structured training week. Respond ONLY in valid JSON (no markdown, no code fences)."
        )

        # Build athlete profile summary
        profile_parts = [f"Fitness level: {athlete.fitness_level}"]
        profile_parts.append(f"Weekly hours target: {athlete.weekly_hours_target}h")
        if athlete.age:
            profile_parts.append(f"Age: {athlete.age}")
        if athlete.weight_kg:
            profile_parts.append(f"Weight: {athlete.weight_kg} kg")
        if athlete.swim_pace_100m:
            profile_parts.append(f"Swim pace: {athlete.swim_pace_100m} per 100m")
        if athlete.bike_ftp_watts:
            profile_parts.append(f"Bike FTP: {athlete.bike_ftp_watts} W")
        if athlete.run_pace_km:
            profile_parts.append(f"Run pace: {athlete.run_pace_km} per km")
        if athlete.preferred_days:
            profile_parts.append(f"Available training days: {athlete.preferred_days}")
        if athlete.injuries_notes:
            profile_parts.append(f"Injuries / limitations: {athlete.injuries_notes}")
        if athlete.goal_description:
            profile_parts.append(f"Goal: {athlete.goal_description}")
        athlete_profile = "\n".join(profile_parts)

        user_prompt = f"""Athlete profile:
{athlete_profile}

Race target: {race_distance} on {race_date_str} ({days_to_race} days away).
Current phase: {phase}.

Last 4 weeks of training:
{training_summary}

Suggest next week's training plan as JSON with this exact structure:
{{
  "week_focus": "...",
  "rationale": "...",
  "workouts": [
    {{
      "day": "Monday",
      "sport": "run",
      "workout_type": "easy",
      "duration_min": 45,
      "distance_km": 8.0,
      "description": "Easy aerobic run, zone 2"
    }}
  ]
}}

Use sport values: swim, bike, run, brick.
Use workout_type values: easy, tempo, interval, long, recovery.
Include 5-7 workouts spread across the week."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=1500,
            temperature=0.7,
        )

        text = response.choices[0].message.content.strip()

        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        return json.loads(text)

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500, detail="AI returned invalid JSON. Please try again."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"AI suggestion failed: {str(e)}"
        )

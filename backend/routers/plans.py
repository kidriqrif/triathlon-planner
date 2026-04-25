import uuid
from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from auth_utils import get_current_user
import models

router = APIRouter(prefix="/plans", tags=["plans"])

# ─── Plan templates ────────────────────────────────────────────────────────────

PLAN_LIBRARY = [
    {
        "id": "sprint-8",
        "name": "Sprint Triathlon — 8 Weeks",
        "distance": "sprint",
        "weeks": 8,
        "level": "beginner",
        "assumed_hours": 5.0,
        "desc": "Get race-ready for a sprint tri. 4-5 sessions/week, builds from base to taper.",
        "weekly": [
            [
                {"day": 0, "sport": "swim", "type": "easy", "min": 30, "km": 1.0, "note": "Technique focus, relaxed pace"},
                {"day": 1, "sport": "run", "type": "easy", "min": 25, "km": 4.0, "note": "Easy conversational pace"},
                {"day": 3, "sport": "bike", "type": "easy", "min": 40, "km": 15.0, "note": "Steady spin, zone 2"},
                {"day": 5, "sport": "swim", "type": "easy", "min": 30, "km": 1.2, "note": "Drills + steady swim"},
                {"day": 6, "sport": "run", "type": "long", "min": 35, "km": 5.0, "note": "Long easy run"},
            ],
            [
                {"day": 0, "sport": "swim", "type": "tempo", "min": 35, "km": 1.4, "note": "4x100m tempo with rest"},
                {"day": 1, "sport": "run", "type": "tempo", "min": 30, "km": 5.0, "note": "10min warm-up, 15min tempo, cool-down"},
                {"day": 2, "sport": "bike", "type": "easy", "min": 45, "km": 20.0, "note": "Steady endurance ride"},
                {"day": 4, "sport": "swim", "type": "easy", "min": 30, "km": 1.2, "note": "Technique + easy pace"},
                {"day": 5, "sport": "bike", "type": "tempo", "min": 50, "km": 22.0, "note": "Include 3x5min at race effort"},
                {"day": 6, "sport": "run", "type": "long", "min": 40, "km": 6.0, "note": "Long run, negative split last 10min"},
            ],
            [
                {"day": 0, "sport": "swim", "type": "interval", "min": 40, "km": 1.6, "note": "8x50m fast + 200m steady"},
                {"day": 1, "sport": "run", "type": "interval", "min": 35, "km": 6.0, "note": "6x400m intervals, jog recovery"},
                {"day": 2, "sport": "bike", "type": "tempo", "min": 55, "km": 25.0, "note": "Race simulation effort"},
                {"day": 3, "sport": "run", "type": "recovery", "min": 20, "km": 3.0, "note": "Easy shake-out"},
                {"day": 5, "sport": "brick", "type": "tempo", "min": 60, "km": None, "note": "30min bike + 15min run at race pace"},
                {"day": 6, "sport": "swim", "type": "long", "min": 40, "km": 1.8, "note": "Race distance practice"},
            ],
            [
                {"day": 0, "sport": "swim", "type": "easy", "min": 25, "km": 0.8, "note": "Short and sharp, stay loose"},
                {"day": 1, "sport": "run", "type": "easy", "min": 20, "km": 3.0, "note": "Legs fresh, easy effort"},
                {"day": 3, "sport": "bike", "type": "easy", "min": 30, "km": 12.0, "note": "Spin out the legs"},
                {"day": 5, "sport": "swim", "type": "easy", "min": 20, "km": 0.6, "note": "Race prep swim, feel the water"},
            ],
        ],
    },
    {
        "id": "olympic-12",
        "name": "Olympic Triathlon — 12 Weeks",
        "distance": "olympic",
        "weeks": 12,
        "level": "intermediate",
        "assumed_hours": 7.0,
        "desc": "Structured 12-week build for Olympic distance. 5-6 sessions/week with periodisation.",
        "weekly": [
            [
                {"day": 0, "sport": "swim", "type": "easy", "min": 40, "km": 1.5, "note": "Technique drills + steady swim"},
                {"day": 1, "sport": "run", "type": "easy", "min": 35, "km": 6.0, "note": "Aerobic base, zone 2"},
                {"day": 2, "sport": "bike", "type": "easy", "min": 50, "km": 22.0, "note": "Steady endurance ride"},
                {"day": 4, "sport": "swim", "type": "easy", "min": 35, "km": 1.4, "note": "Pull buoy + steady laps"},
                {"day": 5, "sport": "run", "type": "easy", "min": 30, "km": 5.0, "note": "Easy recovery run"},
                {"day": 6, "sport": "bike", "type": "long", "min": 70, "km": 30.0, "note": "Long ride, practice nutrition"},
            ],
            [
                {"day": 0, "sport": "swim", "type": "tempo", "min": 45, "km": 1.8, "note": "6x150m at threshold pace"},
                {"day": 1, "sport": "run", "type": "tempo", "min": 40, "km": 7.0, "note": "20min tempo block"},
                {"day": 2, "sport": "bike", "type": "tempo", "min": 60, "km": 28.0, "note": "3x10min at FTP"},
                {"day": 3, "sport": "run", "type": "recovery", "min": 25, "km": 4.0, "note": "Easy shake-out"},
                {"day": 5, "sport": "swim", "type": "interval", "min": 45, "km": 2.0, "note": "10x100m on tight intervals"},
                {"day": 6, "sport": "bike", "type": "long", "min": 80, "km": 35.0, "note": "Long ride with 20min tempo finish"},
            ],
            [
                {"day": 0, "sport": "swim", "type": "interval", "min": 50, "km": 2.2, "note": "Race pace 1500m broken sets"},
                {"day": 1, "sport": "run", "type": "interval", "min": 45, "km": 8.0, "note": "5x1km at 10k pace"},
                {"day": 2, "sport": "bike", "type": "interval", "min": 65, "km": 30.0, "note": "5x5min VO2max efforts"},
                {"day": 3, "sport": "swim", "type": "easy", "min": 35, "km": 1.4, "note": "Recovery swim, easy laps"},
                {"day": 5, "sport": "brick", "type": "tempo", "min": 75, "km": None, "note": "45min ride at race effort + 20min run"},
                {"day": 6, "sport": "run", "type": "long", "min": 55, "km": 10.0, "note": "Long run with negative split"},
            ],
            [
                {"day": 0, "sport": "swim", "type": "tempo", "min": 45, "km": 2.0, "note": "Race simulation: continuous 1500m"},
                {"day": 1, "sport": "bike", "type": "interval", "min": 60, "km": 28.0, "note": "Race pace simulation 40km effort"},
                {"day": 2, "sport": "run", "type": "tempo", "min": 40, "km": 8.0, "note": "10km at target race pace"},
                {"day": 4, "sport": "swim", "type": "easy", "min": 30, "km": 1.2, "note": "Easy recovery swim"},
                {"day": 5, "sport": "brick", "type": "interval", "min": 70, "km": None, "note": "Full race rehearsal: bike 30min + run 15min hard"},
            ],
            [
                {"day": 0, "sport": "swim", "type": "easy", "min": 25, "km": 0.8, "note": "Short openers, race feel"},
                {"day": 1, "sport": "bike", "type": "easy", "min": 30, "km": 15.0, "note": "Spin, few race-pace surges"},
                {"day": 2, "sport": "run", "type": "easy", "min": 20, "km": 3.0, "note": "Shakeout run, strides"},
                {"day": 4, "sport": "swim", "type": "easy", "min": 15, "km": 0.5, "note": "Pre-race loosen up"},
            ],
        ],
    },
    {
        "id": "half-16",
        "name": "Half Ironman 70.3 — 16 Weeks",
        "distance": "70.3",
        "weeks": 16,
        "level": "intermediate",
        "assumed_hours": 8.0,
        "desc": "Comprehensive 16-week plan for 70.3. Builds volume then sharpens. 6-8 hours/week.",
        "weekly": [
            [
                {"day": 0, "sport": "swim", "type": "easy", "min": 40, "km": 1.5, "note": "CSS pace work + drills"},
                {"day": 1, "sport": "bike", "type": "easy", "min": 60, "km": 25.0, "note": "Zone 2 endurance"},
                {"day": 2, "sport": "run", "type": "easy", "min": 40, "km": 7.0, "note": "Easy aerobic run"},
                {"day": 3, "sport": "swim", "type": "easy", "min": 35, "km": 1.3, "note": "Steady laps + technique"},
                {"day": 5, "sport": "bike", "type": "long", "min": 90, "km": 40.0, "note": "Long ride, practice fueling"},
                {"day": 6, "sport": "run", "type": "long", "min": 50, "km": 9.0, "note": "Long slow run"},
            ],
            [
                {"day": 0, "sport": "swim", "type": "tempo", "min": 50, "km": 2.0, "note": "Threshold sets"},
                {"day": 1, "sport": "bike", "type": "tempo", "min": 75, "km": 35.0, "note": "Sweetspot intervals"},
                {"day": 2, "sport": "run", "type": "tempo", "min": 45, "km": 8.0, "note": "Tempo run with warm-up/cool-down"},
                {"day": 3, "sport": "swim", "type": "interval", "min": 45, "km": 1.8, "note": "Speed work"},
                {"day": 5, "sport": "brick", "type": "long", "min": 120, "km": None, "note": "75min ride + 30min run"},
                {"day": 6, "sport": "run", "type": "long", "min": 65, "km": 12.0, "note": "Progressive long run"},
            ],
            [
                {"day": 0, "sport": "swim", "type": "interval", "min": 55, "km": 2.4, "note": "Race-pace continuous sets"},
                {"day": 1, "sport": "bike", "type": "interval", "min": 80, "km": 40.0, "note": "Race simulation effort"},
                {"day": 2, "sport": "run", "type": "interval", "min": 50, "km": 9.0, "note": "Cruise intervals at HM pace"},
                {"day": 3, "sport": "swim", "type": "easy", "min": 35, "km": 1.4, "note": "Recovery swim"},
                {"day": 4, "sport": "run", "type": "recovery", "min": 25, "km": 4.0, "note": "Easy recovery"},
                {"day": 5, "sport": "bike", "type": "long", "min": 120, "km": 55.0, "note": "Long ride with race-pace block"},
                {"day": 6, "sport": "run", "type": "long", "min": 75, "km": 14.0, "note": "Longest run of the block"},
            ],
            [
                {"day": 0, "sport": "swim", "type": "tempo", "min": 40, "km": 1.6, "note": "Short race-pace work"},
                {"day": 1, "sport": "bike", "type": "tempo", "min": 60, "km": 28.0, "note": "Openers, few hard surges"},
                {"day": 2, "sport": "run", "type": "easy", "min": 30, "km": 5.0, "note": "Legs fresh"},
                {"day": 4, "sport": "swim", "type": "easy", "min": 25, "km": 0.8, "note": "Race-week loosen up"},
                {"day": 5, "sport": "bike", "type": "easy", "min": 30, "km": 12.0, "note": "Easy spin + strides"},
            ],
        ],
    },
    {
        "id": "ironman-24",
        "name": "Full Ironman — 24 Weeks",
        "distance": "ironman",
        "weeks": 24,
        "level": "advanced",
        "assumed_hours": 12.0,
        "desc": "Six-month Ironman build for experienced triathletes. Four periodised blocks (base, build, peak, taper) progressing from 10 to 15 hours/week.",
        "weekly": [
            # Block 1 — Base (weeks 1–6): aerobic foundation, lower intensity
            [
                {"day": 0, "sport": "swim", "type": "easy",     "min": 60, "km": 2.5, "note": "Long aerobic swim, drills + steady pulls"},
                {"day": 1, "sport": "bike", "type": "easy",     "min": 75, "km": 30.0, "note": "Zone 2 endurance ride"},
                {"day": 1, "sport": "run",  "type": "easy",     "min": 30, "km": 5.0,  "note": "PM easy aerobic run, conversational"},
                {"day": 2, "sport": "swim", "type": "easy",     "min": 45, "km": 1.8, "note": "Technique focus + steady laps"},
                {"day": 3, "sport": "run",  "type": "easy",     "min": 50, "km": 9.0,  "note": "Aerobic run, hold zone 2"},
                {"day": 4, "sport": "bike", "type": "tempo",    "min": 70, "km": 32.0, "note": "Sweetspot: 2x15min at 88-93% FTP"},
                {"day": 5, "sport": "bike", "type": "long",     "min": 180, "km": 80.0, "note": "Long ride, practice nutrition every 30min"},
                {"day": 6, "sport": "run",  "type": "long",     "min": 90, "km": 16.0, "note": "Long run, last 10min strong"},
            ],
            # Block 2 — Build (weeks 7–14): volume up, intensity introduced
            [
                {"day": 0, "sport": "swim", "type": "tempo",    "min": 60, "km": 2.8, "note": "10x200m at threshold, 30s rest"},
                {"day": 1, "sport": "bike", "type": "tempo",    "min": 90, "km": 40.0, "note": "3x12min at FTP with 6min recovery"},
                {"day": 1, "sport": "run",  "type": "recovery", "min": 25, "km": 4.0,  "note": "PM easy shake-out run"},
                {"day": 2, "sport": "swim", "type": "interval", "min": 60, "km": 3.0, "note": "Race-pace continuous broken sets"},
                {"day": 3, "sport": "run",  "type": "tempo",    "min": 60, "km": 11.0, "note": "20min warm-up, 25min tempo, cool-down"},
                {"day": 4, "sport": "bike", "type": "interval", "min": 75, "km": 35.0, "note": "5x5min VO2max with equal recovery"},
                {"day": 5, "sport": "brick","type": "long",     "min": 240, "km": None, "note": "3hr ride at IM effort + 30min run off the bike"},
                {"day": 6, "sport": "run",  "type": "long",     "min": 120, "km": 22.0, "note": "Long run with last 5km at marathon pace"},
            ],
            # Block 3 — Peak (weeks 15–20): race-specific volume + intensity, longest sessions
            [
                {"day": 0, "sport": "swim", "type": "interval", "min": 75, "km": 3.5, "note": "10x300m at race pace, 20s rest"},
                {"day": 1, "sport": "bike", "type": "tempo",    "min": 90, "km": 42.0, "note": "Sweetspot: 3x15min at 90% FTP"},
                {"day": 1, "sport": "run",  "type": "easy",     "min": 30, "km": 5.0,  "note": "PM easy aerobic to load the legs"},
                {"day": 2, "sport": "swim", "type": "long",     "min": 75, "km": 4.0, "note": "Continuous full IM swim distance"},
                {"day": 3, "sport": "run",  "type": "interval", "min": 75, "km": 13.0, "note": "6x1km at threshold, 90s jog recovery"},
                {"day": 4, "sport": "bike", "type": "interval", "min": 90, "km": 42.0, "note": "Race-pace simulation: 4x15min IM effort"},
                {"day": 5, "sport": "brick","type": "long",     "min": 360, "km": None, "note": "5hr ride + 45min run — biggest brick of the block"},
                {"day": 6, "sport": "run",  "type": "long",     "min": 150, "km": 28.0, "note": "Long run, focus nutrition + pacing for marathon"},
            ],
            # Block 4 — Taper (weeks 21–24): sharp reduction, maintain feel
            [
                {"day": 0, "sport": "swim", "type": "tempo",    "min": 45, "km": 2.0, "note": "Race-pace openers, short and sharp"},
                {"day": 1, "sport": "bike", "type": "tempo",    "min": 60, "km": 25.0, "note": "Few race-pace surges, mostly easy"},
                {"day": 2, "sport": "run",  "type": "tempo",    "min": 40, "km": 7.0, "note": "20min easy + 6x1min strides at race pace"},
                {"day": 3, "sport": "swim", "type": "easy",     "min": 30, "km": 1.5, "note": "Easy technique swim, feel the water"},
                {"day": 4, "sport": "bike", "type": "easy",     "min": 45, "km": 18.0, "note": "Easy spin + 4x30s race-pace surges"},
                {"day": 5, "sport": "run",  "type": "easy",     "min": 30, "km": 5.0, "note": "Race-week shake-out with 4 strides"},
                {"day": 6, "sport": "swim", "type": "easy",     "min": 20, "km": 0.8, "note": "Race-day -1 dip, very easy"},
            ],
        ],
    },
]


# ─── Personalization helpers ──────────────────────────────────────────────────

LEVEL_FACTOR = {"beginner": 0.85, "intermediate": 1.0, "advanced": 1.15}

# Run pace anchor per workout type: which of the athlete's three run paces to start from.
RUN_PACE_ANCHOR = {
    "recovery": "easy",     # multi-hour aerobic
    "easy":     "easy",
    "long":     "easy",
    "tempo":    "threshold",
    "interval": "5k",       # short hard reps
}

# Within an anchor, fine adjust by the workout's actual intensity sub-flavour.
RUN_PACE_FACTOR = {
    "easy": 1.15, "long": 1.10, "tempo": 1.0, "interval": 0.90, "recovery": 1.25,
}
SWIM_PACE_FACTOR = {
    "easy": 1.15, "long": 1.10, "tempo": 1.0, "interval": 0.90, "recovery": 1.20,
}
BIKE_POWER_FACTOR = {
    "easy": 0.65, "long": 0.70, "tempo": 0.85, "interval": 1.05, "recovery": 0.55,
}


def _parse_pace(pace_str):
    """Parse 'M:SS' pace string to float minutes. e.g. '5:30' → 5.5"""
    if not pace_str:
        return None
    try:
        parts = pace_str.strip().split(":")
        return int(parts[0]) + int(parts[1]) / 60
    except (ValueError, IndexError):
        return None


def _format_pace(minutes):
    """Float minutes → 'M:SS' string. e.g. 5.5 → '5:30'"""
    m = int(minutes)
    s = round((minutes - m) * 60)
    return f"{m}:{s:02d}"


def _parse_swim_pace(pace_str):
    """Parse 'M:SS' swim pace to seconds per 100m. e.g. '1:45' → 105"""
    if not pace_str:
        return None
    try:
        parts = pace_str.strip().split(":")
        return int(parts[0]) * 60 + int(parts[1])
    except (ValueError, IndexError):
        return None


def _format_swim_pace(seconds):
    """Seconds → 'M:SS'. e.g. 105 → '1:45'"""
    m = int(seconds // 60)
    s = round(seconds % 60)
    return f"{m}:{s:02d}"


def _personalize_session(session, athlete, volume_scale):
    """Scale a template session based on athlete profile. Returns new dict."""
    s = dict(session)

    # Scale duration by volume factor and fitness level
    fitness = LEVEL_FACTOR.get(athlete.fitness_level, 1.0)
    scale = volume_scale * fitness
    s["min"] = max(10, round(s["min"] * scale))

    # Run: pick the right anchor pace for the session, then recalc distance + note
    if s["sport"] == "run":
        threshold = _parse_pace(athlete.run_pace_km)
        easy = _parse_pace(getattr(athlete, "run_easy_pace_km", None)) or (threshold * 1.15 if threshold else None)
        five_k = _parse_pace(getattr(athlete, "run_5k_pace_km", None)) or (threshold * 0.92 if threshold else None)
        anchor = RUN_PACE_ANCHOR.get(s["type"], "threshold")
        anchor_pace = {"easy": easy, "threshold": threshold, "5k": five_k}.get(anchor)

        if anchor_pace and s.get("km"):
            # Multiplier centred on the anchor — keeps subtle variation within a zone.
            anchor_centre = {"easy": 1.10, "threshold": 1.0, "5k": 0.92}[anchor]
            factor = RUN_PACE_FACTOR.get(s["type"], 1.0)
            target_pace = anchor_pace * (factor / anchor_centre)
            s["km"] = round(s["min"] / target_pace, 1)
            s["note"] = f"Target: {_format_pace(target_pace)}/km — {s.get('note', '')}"

    # Swim: recalculate distance from actual pace
    elif s["sport"] == "swim" and athlete.swim_pace_100m:
        pace_sec = _parse_swim_pace(athlete.swim_pace_100m)
        if pace_sec and s.get("km"):
            factor = SWIM_PACE_FACTOR.get(s["type"], 1.0)
            target_pace = pace_sec * factor
            s["km"] = round((s["min"] * 60 / target_pace) * 0.1, 1)
            s["note"] = f"Target: {_format_swim_pace(round(target_pace))}/100m — {s.get('note', '')}"

    # Bike: add power target to notes
    elif s["sport"] == "bike" and athlete.bike_ftp_watts:
        factor = BIKE_POWER_FACTOR.get(s["type"], 0.75)
        target_w = round(athlete.bike_ftp_watts * factor)
        s["note"] = f"Target: ~{target_w}W — {s.get('note', '')}"

    return s


# ─── API ──────────────────────────────────────────────────────────────────────

class PlanSummary(BaseModel):
    id: str
    name: str
    distance: str
    weeks: int
    level: str
    desc: str


@router.get("", response_model=list[PlanSummary])
def list_plans():
    return [
        PlanSummary(id=p["id"], name=p["name"], distance=p["distance"],
                    weeks=p["weeks"], level=p["level"], desc=p["desc"])
        for p in PLAN_LIBRARY
    ]


@router.post("/{plan_id}/import")
def import_plan(
    plan_id: str,
    start_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    plan = next((p for p in PLAN_LIBRARY if p["id"] == plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Default start: next Monday
    if start_date:
        start = date.fromisoformat(start_date)
    else:
        today = date.today()
        start = today + timedelta(days=(7 - today.weekday()) % 7 or 7)

    # Pro users get personalized plans
    personalized = False
    athlete = None
    volume_scale = 1.0

    if current_user.plan == "pro":
        athlete = db.query(models.Athlete).filter(
            models.Athlete.user_id == current_user.id
        ).first()
        if athlete:
            personalized = True
            if athlete.weekly_hours_target and plan.get("assumed_hours"):
                volume_scale = athlete.weekly_hours_target / plan["assumed_hours"]
                volume_scale = max(0.6, min(1.4, volume_scale))

    import_id = str(uuid.uuid4())[:8]
    total_weeks = plan["weeks"]
    weekly_templates = plan["weekly"]
    created = 0

    for week_num in range(total_weeks):
        template_idx = min(week_num * len(weekly_templates) // total_weeks, len(weekly_templates) - 1)
        week_template = weekly_templates[template_idx]
        week_start = start + timedelta(weeks=week_num)

        for session in week_template:
            if personalized:
                s = _personalize_session(session, athlete, volume_scale)
            else:
                s = session

            workout_date = week_start + timedelta(days=s["day"])
            note = s.get("note", "")
            workout = models.Workout(
                user_id=current_user.id,
                date=workout_date,
                sport=s["sport"],
                workout_type=s["type"],
                status="planned",
                duration_min=s["min"],
                distance_km=s.get("km"),
                notes=f"plan:{import_id} {note}".strip(),
            )
            db.add(workout)
            created += 1

    db.commit()
    return {
        "imported": created,
        "import_id": import_id,
        "plan": plan["name"],
        "start_date": str(start),
        "end_date": str(start + timedelta(weeks=total_weeks - 1, days=6)),
        "personalized": personalized,
    }


@router.delete("/undo/{import_id}")
def undo_import(
    import_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete all workouts from a specific plan import."""
    workouts = db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id,
        models.Workout.notes.contains(f"plan:{import_id}"),
    ).all()
    if not workouts:
        raise HTTPException(status_code=404, detail="No workouts found for this import")
    count = len(workouts)
    for w in workouts:
        db.delete(w)
    db.commit()
    return {"deleted": count}

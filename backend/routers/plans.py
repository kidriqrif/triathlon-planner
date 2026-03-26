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
        "desc": "Get race-ready for a sprint tri. 4-5 sessions/week, builds from base to taper.",
        "weekly": [
            # week 1-2: base
            [
                {"day": 0, "sport": "swim", "type": "easy", "min": 30, "km": 1.0, "note": "Technique focus, relaxed pace"},
                {"day": 1, "sport": "run", "type": "easy", "min": 25, "km": 4.0, "note": "Easy conversational pace"},
                {"day": 3, "sport": "bike", "type": "easy", "min": 40, "km": 15.0, "note": "Steady spin, zone 2"},
                {"day": 5, "sport": "swim", "type": "easy", "min": 30, "km": 1.2, "note": "Drills + steady swim"},
                {"day": 6, "sport": "run", "type": "long", "min": 35, "km": 5.0, "note": "Long easy run"},
            ],
            # week 3-4: build
            [
                {"day": 0, "sport": "swim", "type": "tempo", "min": 35, "km": 1.4, "note": "4x100m tempo with rest"},
                {"day": 1, "sport": "run", "type": "tempo", "min": 30, "km": 5.0, "note": "10min warm-up, 15min tempo, cool-down"},
                {"day": 2, "sport": "bike", "type": "easy", "min": 45, "km": 20.0, "note": "Steady endurance ride"},
                {"day": 4, "sport": "swim", "type": "easy", "min": 30, "km": 1.2, "note": "Technique + easy pace"},
                {"day": 5, "sport": "bike", "type": "tempo", "min": 50, "km": 22.0, "note": "Include 3x5min at race effort"},
                {"day": 6, "sport": "run", "type": "long", "min": 40, "km": 6.0, "note": "Long run, negative split last 10min"},
            ],
            # week 5-6: peak
            [
                {"day": 0, "sport": "swim", "type": "interval", "min": 40, "km": 1.6, "note": "8x50m fast + 200m steady"},
                {"day": 1, "sport": "run", "type": "interval", "min": 35, "km": 6.0, "note": "6x400m intervals, jog recovery"},
                {"day": 2, "sport": "bike", "type": "tempo", "min": 55, "km": 25.0, "note": "Race simulation effort"},
                {"day": 3, "sport": "run", "type": "recovery", "min": 20, "km": 3.0, "note": "Easy shake-out"},
                {"day": 5, "sport": "brick", "type": "tempo", "min": 60, "km": None, "note": "30min bike + 15min run at race pace"},
                {"day": 6, "sport": "swim", "type": "long", "min": 40, "km": 1.8, "note": "Race distance practice"},
            ],
            # week 7-8: taper
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
        "desc": "Structured 12-week build for Olympic distance. 5-6 sessions/week with periodisation.",
        "weekly": [
            # base (week 1-3)
            [
                {"day": 0, "sport": "swim", "type": "easy", "min": 40, "km": 1.5, "note": "Technique drills + steady swim"},
                {"day": 1, "sport": "run", "type": "easy", "min": 35, "km": 6.0, "note": "Aerobic base, zone 2"},
                {"day": 2, "sport": "bike", "type": "easy", "min": 50, "km": 22.0, "note": "Steady endurance ride"},
                {"day": 4, "sport": "swim", "type": "easy", "min": 35, "km": 1.4, "note": "Pull buoy + steady laps"},
                {"day": 5, "sport": "run", "type": "easy", "min": 30, "km": 5.0, "note": "Easy recovery run"},
                {"day": 6, "sport": "bike", "type": "long", "min": 70, "km": 30.0, "note": "Long ride, practice nutrition"},
            ],
            # build 1 (week 4-6)
            [
                {"day": 0, "sport": "swim", "type": "tempo", "min": 45, "km": 1.8, "note": "6x150m at threshold pace"},
                {"day": 1, "sport": "run", "type": "tempo", "min": 40, "km": 7.0, "note": "20min tempo block"},
                {"day": 2, "sport": "bike", "type": "tempo", "min": 60, "km": 28.0, "note": "3x10min at FTP"},
                {"day": 3, "sport": "run", "type": "recovery", "min": 25, "km": 4.0, "note": "Easy shake-out"},
                {"day": 5, "sport": "swim", "type": "interval", "min": 45, "km": 2.0, "note": "10x100m on tight intervals"},
                {"day": 6, "sport": "bike", "type": "long", "min": 80, "km": 35.0, "note": "Long ride with 20min tempo finish"},
            ],
            # build 2 (week 7-9)
            [
                {"day": 0, "sport": "swim", "type": "interval", "min": 50, "km": 2.2, "note": "Race pace 1500m broken sets"},
                {"day": 1, "sport": "run", "type": "interval", "min": 45, "km": 8.0, "note": "5x1km at 10k pace"},
                {"day": 2, "sport": "bike", "type": "interval", "min": 65, "km": 30.0, "note": "5x5min VO2max efforts"},
                {"day": 3, "sport": "swim", "type": "easy", "min": 35, "km": 1.4, "note": "Recovery swim, easy laps"},
                {"day": 5, "sport": "brick", "type": "tempo", "min": 75, "km": None, "note": "45min ride at race effort + 20min run"},
                {"day": 6, "sport": "run", "type": "long", "min": 55, "km": 10.0, "note": "Long run with negative split"},
            ],
            # peak (week 10-11)
            [
                {"day": 0, "sport": "swim", "type": "tempo", "min": 45, "km": 2.0, "note": "Race simulation: continuous 1500m"},
                {"day": 1, "sport": "bike", "type": "interval", "min": 60, "km": 28.0, "note": "Race pace simulation 40km effort"},
                {"day": 2, "sport": "run", "type": "tempo", "min": 40, "km": 8.0, "note": "10km at target race pace"},
                {"day": 4, "sport": "swim", "type": "easy", "min": 30, "km": 1.2, "note": "Easy recovery swim"},
                {"day": 5, "sport": "brick", "type": "interval", "min": 70, "km": None, "note": "Full race rehearsal: bike 30min + run 15min hard"},
            ],
            # taper (week 12)
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
        "desc": "Comprehensive 16-week plan for 70.3. Builds volume then sharpens. 6-8 hours/week.",
        "weekly": [
            # base (week 1-4)
            [
                {"day": 0, "sport": "swim", "type": "easy", "min": 40, "km": 1.5, "note": "CSS pace work + drills"},
                {"day": 1, "sport": "bike", "type": "easy", "min": 60, "km": 25.0, "note": "Zone 2 endurance"},
                {"day": 2, "sport": "run", "type": "easy", "min": 40, "km": 7.0, "note": "Easy aerobic run"},
                {"day": 3, "sport": "swim", "type": "easy", "min": 35, "km": 1.3, "note": "Steady laps + technique"},
                {"day": 5, "sport": "bike", "type": "long", "min": 90, "km": 40.0, "note": "Long ride, practice fueling"},
                {"day": 6, "sport": "run", "type": "long", "min": 50, "km": 9.0, "note": "Long slow run"},
            ],
            # build (week 5-8)
            [
                {"day": 0, "sport": "swim", "type": "tempo", "min": 50, "km": 2.0, "note": "Threshold sets"},
                {"day": 1, "sport": "bike", "type": "tempo", "min": 75, "km": 35.0, "note": "Sweetspot intervals"},
                {"day": 2, "sport": "run", "type": "tempo", "min": 45, "km": 8.0, "note": "Tempo run with warm-up/cool-down"},
                {"day": 3, "sport": "swim", "type": "interval", "min": 45, "km": 1.8, "note": "Speed work"},
                {"day": 5, "sport": "brick", "type": "long", "min": 120, "km": None, "note": "75min ride + 30min run"},
                {"day": 6, "sport": "run", "type": "long", "min": 65, "km": 12.0, "note": "Progressive long run"},
            ],
            # peak (week 9-12)
            [
                {"day": 0, "sport": "swim", "type": "interval", "min": 55, "km": 2.4, "note": "Race-pace continuous sets"},
                {"day": 1, "sport": "bike", "type": "interval", "min": 80, "km": 40.0, "note": "Race simulation effort"},
                {"day": 2, "sport": "run", "type": "interval", "min": 50, "km": 9.0, "note": "Cruise intervals at HM pace"},
                {"day": 3, "sport": "swim", "type": "easy", "min": 35, "km": 1.4, "note": "Recovery swim"},
                {"day": 4, "sport": "run", "type": "recovery", "min": 25, "km": 4.0, "note": "Easy recovery"},
                {"day": 5, "sport": "bike", "type": "long", "min": 120, "km": 55.0, "note": "Long ride with race-pace block"},
                {"day": 6, "sport": "run", "type": "long", "min": 75, "km": 14.0, "note": "Longest run of the block"},
            ],
            # sharpen + taper (week 13-16)
            [
                {"day": 0, "sport": "swim", "type": "tempo", "min": 40, "km": 1.6, "note": "Short race-pace work"},
                {"day": 1, "sport": "bike", "type": "tempo", "min": 60, "km": 28.0, "note": "Openers, few hard surges"},
                {"day": 2, "sport": "run", "type": "easy", "min": 30, "km": 5.0, "note": "Legs fresh"},
                {"day": 4, "sport": "swim", "type": "easy", "min": 25, "km": 0.8, "note": "Race-week loosen up"},
                {"day": 5, "sport": "bike", "type": "easy", "min": 30, "km": 12.0, "note": "Easy spin + strides"},
            ],
        ],
    },
]


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

    total_weeks = plan["weeks"]
    weekly_templates = plan["weekly"]
    created = 0

    for week_num in range(total_weeks):
        # Cycle through templates (plans have fewer templates than weeks, they repeat phases)
        template_idx = min(week_num * len(weekly_templates) // total_weeks, len(weekly_templates) - 1)
        week_template = weekly_templates[template_idx]
        week_start = start + timedelta(weeks=week_num)

        for session in week_template:
            workout_date = week_start + timedelta(days=session["day"])
            workout = models.Workout(
                user_id=current_user.id,
                date=workout_date,
                sport=session["sport"],
                workout_type=session["type"],
                status="planned",
                duration_min=session["min"],
                distance_km=session.get("km"),
                notes=session.get("note", ""),
            )
            db.add(workout)
            created += 1

    db.commit()
    return {
        "imported": created,
        "plan": plan["name"],
        "start_date": str(start),
        "end_date": str(start + timedelta(weeks=total_weeks - 1, days=6)),
    }

import csv
import io
import json
import secrets
import time
import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from auth_utils import get_current_user
import models

router = APIRouter(prefix="/export", tags=["export"])

# In-memory store for download tokens (short-lived, cleaned on use)
_download_tokens = {}

WORKOUT_TYPE_LABELS = {
    "easy": "Easy",
    "tempo": "Tempo",
    "interval": "Interval",
    "long": "Long",
    "recovery": "Recovery",
}

ZONE_LABELS = {
    "Z1": "Recovery", "Z2": "Aerobic", "Z3": "Tempo",
    "Z4": "Threshold", "Z5": "VO2max",
}


def _clean_expired_tokens():
    now = time.time()
    expired = [k for k, v in _download_tokens.items() if v["expires"] < now]
    for k in expired:
        del _download_tokens[k]


def _parse_workout_blocks(notes):
    """Read structured workout blocks from the notes JSON v1/v2 format."""
    if not notes:
        return None
    try:
        p = json.loads(notes)
        if p.get("_wbv") in (1, 2) and isinstance(p.get("blocks"), list):
            return p["blocks"]
    except Exception:
        return None
    return None


def _format_target(t_type, t_value):
    if t_value in (None, ""):
        return ""
    if t_type == "zone":
        z = ZONE_LABELS.get(t_value, t_value)
        return f"{t_value} {z}"
    if t_type == "hr":    return f"{t_value} bpm"
    if t_type == "pace":  return f"{t_value}/km"
    if t_type == "power": return f"{t_value} W"
    if t_type == "rpe":   return f"RPE {t_value}"
    return str(t_value)


@router.post("/download-token")
def create_download_token(current_user: models.User = Depends(get_current_user)):
    """Generate a one-time download token valid for 60 seconds."""
    _clean_expired_tokens()
    token = secrets.token_urlsafe(32)
    _download_tokens[token] = {"user_id": current_user.id, "expires": time.time() + 60}
    return {"token": token}


def _validate_download_token(token: str) -> int:
    _clean_expired_tokens()
    entry = _download_tokens.pop(token, None)
    if not entry:
        raise HTTPException(status_code=401, detail="Invalid or expired download token")
    if entry["expires"] < time.time():
        raise HTTPException(status_code=401, detail="Download token expired")
    return entry["user_id"]


@router.get("/fit/{workout_id}")
def export_workout_fit(
    workout_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    """Export a workout as a .FIT file. Emits one step per builder block when the
    workout is structured (interval / brick), or a single step otherwise."""
    from fit_tool.fit_file_builder import FitFileBuilder
    from fit_tool.profile.messages.file_id_message import FileIdMessage
    from fit_tool.profile.messages.workout_message import WorkoutMessage
    from fit_tool.profile.messages.workout_step_message import WorkoutStepMessage
    from fit_tool.profile.profile_type import (
        Sport, Intensity, WorkoutStepDuration, WorkoutStepTarget, FileType, Manufacturer,
    )

    SPORT_MAP = {
        "swim":  Sport.SWIMMING,
        "bike":  Sport.CYCLING,
        "run":   Sport.RUNNING,
        "brick": Sport.MULTISPORT,
    }
    BLOCK_INTENSITY = {
        "warmup":   Intensity.WARMUP,
        "interval": Intensity.ACTIVE,
        "steady":   Intensity.ACTIVE,
        "recovery": Intensity.RECOVERY,
        "cooldown": Intensity.COOLDOWN,
    }
    BLOCK_NAME = {
        "warmup":   "Warm-up",
        "interval": "Work",
        "steady":   "Steady",
        "recovery": "Recovery",
        "cooldown": "Cool-down",
    }

    user_id = _validate_download_token(token)

    workout = db.query(models.Workout).filter(
        models.Workout.id == workout_id,
        models.Workout.user_id == user_id,
    ).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    builder = FitFileBuilder()
    sport = SPORT_MAP.get(workout.sport, Sport.GENERIC)
    type_label = WORKOUT_TYPE_LABELS.get(workout.workout_type, workout.workout_type)
    workout_name = f"Strelo {workout.sport.title()} — {type_label}"

    # File ID
    file_id = FileIdMessage()
    file_id.type = FileType.WORKOUT
    file_id.manufacturer = Manufacturer.DEVELOPMENT.value
    file_id.product = 1
    file_id.serial_number = workout.id
    file_id.time_created = round(datetime.now(timezone.utc).timestamp())
    builder.add(file_id)

    blocks = _parse_workout_blocks(workout.notes)
    steps = []

    def _make_step(name, intensity, duration_min=None, distance_m=None, target_label=None):
        s = WorkoutStepMessage()
        s.message_index = len(steps)
        s.wkt_step_name = (target_label and f"{name} · {target_label}" or name)[:24]
        s.intensity = intensity
        if distance_m and float(distance_m) > 0:
            s.duration_type = WorkoutStepDuration.DISTANCE
            s.duration_value = int(float(distance_m) * 100)  # cm
        elif duration_min and float(duration_min) > 0:
            s.duration_type = WorkoutStepDuration.TIME
            s.duration_value = int(float(duration_min) * 60 * 1000)  # ms
        else:
            s.duration_type = WorkoutStepDuration.OPEN
        s.target_type = WorkoutStepTarget.OPEN
        steps.append(s)
        return s

    if blocks:
        for b in blocks:
            btype = b.get("type", "steady")
            intensity = BLOCK_INTENSITY.get(btype, Intensity.ACTIVE)
            target = _format_target(b.get("target_type"), b.get("target_value"))
            name = BLOCK_NAME.get(btype, btype.title())

            if btype == "interval":
                reps = max(1, int(b.get("reps") or 1))
                # Work step
                work_idx = len(steps)
                _make_step(name, Intensity.ACTIVE,
                           duration_min=b.get("duration_min"),
                           distance_m=b.get("distance_m"),
                           target_label=target)
                # Rest step
                rest_min = float(b.get("rest_min") or 0)
                rest_sec = float(b.get("rest_sec") or 0)
                rest_total_min = rest_min + rest_sec / 60
                if rest_total_min > 0:
                    _make_step("Rest", Intensity.REST, duration_min=rest_total_min)
                # Repeat block: jump back to work step, total reps times
                repeat = WorkoutStepMessage()
                repeat.message_index = len(steps)
                repeat.duration_type = WorkoutStepDuration.REPEAT_UNTIL_STEPS_CMPLT
                repeat.duration_value = work_idx        # step index to repeat from
                repeat.target_type = WorkoutStepTarget.OPEN
                repeat.target_value = reps              # number of repetitions
                repeat.intensity = Intensity.ACTIVE
                steps.append(repeat)
            else:
                _make_step(name, intensity,
                           duration_min=b.get("duration_min"),
                           distance_m=b.get("distance_m"),
                           target_label=target)
    else:
        # Fallback: single step from workout duration
        _make_step(type_label, Intensity.ACTIVE, duration_min=workout.duration_min,
                   distance_m=(workout.distance_km * 1000) if workout.distance_km else None)

    # Workout message goes before steps
    wo_msg = WorkoutMessage()
    wo_msg.sport = sport
    wo_msg.num_valid_steps = len(steps)
    wo_msg.wkt_name = workout_name[:24]
    builder.add(wo_msg)
    for s in steps:
        builder.add(s)

    fit_bytes = builder.build()
    fit_file = io.BytesIO(fit_bytes.getvalue())
    filename = f"strelo_{workout.sport}_{workout.date}_{workout.workout_type}.fit"
    return StreamingResponse(
        fit_file,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/csv")
def export_workouts_csv(
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    """Export all user workouts as CSV."""
    user_id = _validate_download_token(token)

    workouts = db.query(models.Workout).filter(
        models.Workout.user_id == user_id,
    ).order_by(models.Workout.date).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Sport", "Type", "Status", "Duration (min)", "Distance (km)", "RPE", "Avg HR", "Avg Power", "NP", "Notes"])
    for w in workouts:
        writer.writerow([
            str(w.date), w.sport, w.workout_type, w.status,
            w.duration_min or "", w.distance_km or "", w.rpe or "",
            w.avg_hr or "", w.avg_power or "", w.np_power or "",
            (w.notes or "").replace("\n", " "),
        ])

    csv_bytes = io.BytesIO(output.getvalue().encode("utf-8"))
    return StreamingResponse(
        csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="strelo_workouts.csv"'},
    )

import csv
import io
import jwt
import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from fit_tool.fit_file_builder import FitFileBuilder
from fit_tool.profile.messages.file_id_message import FileIdMessage
from fit_tool.profile.messages.workout_message import WorkoutMessage
from fit_tool.profile.messages.workout_step_message import WorkoutStepMessage
from fit_tool.profile.profile_type import Sport, Intensity, WorkoutStepDuration, WorkoutStepTarget, FileType, Manufacturer

from database import get_db
import models

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")

router = APIRouter(prefix="/export", tags=["export"])

SPORT_MAP = {
    "swim": Sport.SWIMMING,
    "bike": Sport.CYCLING,
    "run": Sport.RUNNING,
    "brick": Sport.MULTISPORT,
}

WORKOUT_TYPE_LABELS = {
    "easy": "Easy",
    "tempo": "Tempo",
    "interval": "Interval",
    "long": "Long",
    "recovery": "Recovery",
}


@router.get("/fit/{workout_id}")
def export_workout_fit(
    workout_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    """Export a single workout as a .FIT file for Garmin/COROS/Wahoo."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    workout = db.query(models.Workout).filter(
        models.Workout.id == workout_id,
        models.Workout.user_id == user_id,
    ).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    builder = FitFileBuilder()

    # File ID
    file_id = FileIdMessage()
    file_id.type = FileType.WORKOUT
    file_id.manufacturer = Manufacturer.DEVELOPMENT.value
    file_id.product = 1
    file_id.serial_number = workout.id
    file_id.time_created = round(datetime.now(timezone.utc).timestamp())
    builder.add(file_id)

    # Workout message
    sport = SPORT_MAP.get(workout.sport, Sport.GENERIC)
    type_label = WORKOUT_TYPE_LABELS.get(workout.workout_type, workout.workout_type)
    workout_name = f"Strelo {workout.sport.title()} — {type_label}"

    wo_msg = WorkoutMessage()
    wo_msg.sport = sport
    wo_msg.num_valid_steps = 1
    wo_msg.wkt_name = workout_name[:24]  # FIT field limit
    builder.add(wo_msg)

    # Single workout step based on duration
    step = WorkoutStepMessage()
    step.message_index = 0
    step.wkt_step_name = type_label[:16]
    step.intensity = Intensity.ACTIVE

    if workout.duration_min and workout.duration_min > 0:
        step.duration_type = WorkoutStepDuration.TIME
        step.duration_value = workout.duration_min * 60 * 1000  # milliseconds
    else:
        step.duration_type = WorkoutStepDuration.OPEN

    step.target_type = WorkoutStepTarget.OPEN
    builder.add(step)

    # Build and stream
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
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    workouts = db.query(models.Workout).filter(
        models.Workout.user_id == user_id,
    ).order_by(models.Workout.date).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Sport", "Type", "Status", "Duration (min)", "Distance (km)", "RPE", "Notes"])
    for w in workouts:
        writer.writerow([
            str(w.date),
            w.sport,
            w.workout_type,
            w.status,
            w.duration_min or "",
            w.distance_km or "",
            w.rpe or "",
            (w.notes or "").replace("\n", " "),
        ])

    csv_bytes = io.BytesIO(output.getvalue().encode("utf-8"))
    return StreamingResponse(
        csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="strelo_workouts.csv"'},
    )

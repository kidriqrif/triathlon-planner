from pydantic import BaseModel
from typing import Optional
from datetime import date


# --- Workout ---

class WorkoutBase(BaseModel):
    date: date
    sport: str
    workout_type: str = "easy"
    status: str = "planned"
    distance_km: Optional[float] = None
    duration_min: Optional[int] = None
    rpe: Optional[int] = None
    notes: Optional[str] = None
    avg_hr: Optional[int] = None
    max_hr: Optional[int] = None
    avg_power: Optional[int] = None
    np_power: Optional[int] = None


class WorkoutCreate(WorkoutBase):
    pass


class WorkoutUpdate(BaseModel):
    date: Optional[date] = None
    sport: Optional[str] = None
    workout_type: Optional[str] = None
    status: Optional[str] = None
    distance_km: Optional[float] = None
    duration_min: Optional[int] = None
    rpe: Optional[int] = None
    notes: Optional[str] = None
    avg_hr: Optional[int] = None
    max_hr: Optional[int] = None
    avg_power: Optional[int] = None
    np_power: Optional[int] = None


class WorkoutOut(WorkoutBase):
    id: int

    model_config = {"from_attributes": True}


# --- Race ---

class RaceBase(BaseModel):
    name: str
    date: date
    distance: str
    is_active: bool = True


class RaceCreate(RaceBase):
    pass


class RaceUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[date] = None
    distance: Optional[str] = None
    is_active: Optional[bool] = None


class RaceOut(RaceBase):
    id: int

    model_config = {"from_attributes": True}


# --- Athlete ---

class AthleteBase(BaseModel):
    name: str = "Athlete"
    fitness_level: str = "intermediate"
    weekly_hours_target: float = 8.0
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    swim_pace_100m: Optional[str] = None
    bike_ftp_watts: Optional[int] = None
    run_pace_km: Optional[str] = None
    run_easy_pace_km: Optional[str] = None
    run_5k_pace_km: Optional[str] = None
    threshold_hr: Optional[int] = None
    preferred_days: Optional[str] = None
    injuries_notes: Optional[str] = None
    goal_description: Optional[str] = None


class AthleteUpdate(BaseModel):
    name: Optional[str] = None
    fitness_level: Optional[str] = None
    weekly_hours_target: Optional[float] = None
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    swim_pace_100m: Optional[str] = None
    bike_ftp_watts: Optional[int] = None
    run_pace_km: Optional[str] = None
    run_easy_pace_km: Optional[str] = None
    run_5k_pace_km: Optional[str] = None
    threshold_hr: Optional[int] = None
    preferred_days: Optional[str] = None
    injuries_notes: Optional[str] = None
    goal_description: Optional[str] = None


class AthleteOut(AthleteBase):
    id: int

    model_config = {"from_attributes": True}


# --- Body Log ---

class BodyLogCreate(BaseModel):
    date: date
    weight_kg: Optional[float] = None
    resting_hr: Optional[int] = None
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[int] = None
    notes: Optional[str] = None


class BodyLogOut(BodyLogCreate):
    id: int

    model_config = {"from_attributes": True}


# --- AI ---

class AISuggestRequest(BaseModel):
    pass  # All data fetched from DB server-side

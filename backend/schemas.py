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


class AthleteUpdate(BaseModel):
    name: Optional[str] = None
    fitness_level: Optional[str] = None
    weekly_hours_target: Optional[float] = None


class AthleteOut(AthleteBase):
    id: int

    model_config = {"from_attributes": True}


# --- AI ---

class AISuggestRequest(BaseModel):
    pass  # All data fetched from DB server-side

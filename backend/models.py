from sqlalchemy import Column, Integer, String, Float, Date, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone
import enum


class SportEnum(str, enum.Enum):
    swim = "swim"
    bike = "bike"
    run = "run"
    brick = "brick"


class WorkoutTypeEnum(str, enum.Enum):
    easy = "easy"
    tempo = "tempo"
    interval = "interval"
    long = "long"
    recovery = "recovery"


class StatusEnum(str, enum.Enum):
    planned = "planned"
    completed = "completed"
    skipped = "skipped"


class RaceDistanceEnum(str, enum.Enum):
    sprint = "sprint"
    olympic = "olympic"
    half = "70.3"
    ironman = "ironman"


class FitnessLevelEnum(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    plan = Column(String, nullable=False, default="free")  # "free" | "pro"
    onboarded = Column(Boolean, nullable=False, default=False)
    lemon_customer_id = Column(String, nullable=True)
    lemon_subscription_id = Column(String, nullable=True)
    strava_athlete_id = Column(String, nullable=True)
    strava_access_token = Column(String, nullable=True)
    strava_refresh_token = Column(String, nullable=True)
    strava_token_expires = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    workouts = relationship("Workout", back_populates="owner")
    races = relationship("Race", back_populates="owner")
    athlete = relationship("Athlete", back_populates="owner", uselist=False)


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)


class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    sport = Column(String, nullable=False)
    workout_type = Column(String, nullable=False, default="easy")
    duration_min = Column(Integer, nullable=True)
    distance_km = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    sport = Column(String, nullable=False)
    workout_type = Column(String, nullable=False, default="easy")
    status = Column(String, nullable=False, default="planned")
    distance_km = Column(Float, nullable=True)
    duration_min = Column(Integer, nullable=True)
    rpe = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    # Real intensity data (populated by Strava sync when available)
    avg_hr = Column(Integer, nullable=True)
    max_hr = Column(Integer, nullable=True)
    avg_power = Column(Integer, nullable=True)         # bike: avg watts
    np_power = Column(Integer, nullable=True)          # bike: normalized power (NP)

    owner = relationship("User", back_populates="workouts")


class Race(Base):
    __tablename__ = "races"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    distance = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    owner = relationship("User", back_populates="races")


class Athlete(Base):
    __tablename__ = "athletes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    name = Column(String, nullable=False, default="Athlete")
    fitness_level = Column(String, nullable=False, default="intermediate")
    weekly_hours_target = Column(Float, default=8.0)

    # Extended profile
    age = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    swim_pace_100m = Column(String, nullable=True)
    bike_ftp_watts = Column(Integer, nullable=True)
    run_pace_km = Column(String, nullable=True)        # Threshold pace (~1 hour effort)
    run_easy_pace_km = Column(String, nullable=True)   # Easy aerobic pace (multi-hour effort)
    run_5k_pace_km = Column(String, nullable=True)     # 5k race pace (short effort)
    threshold_hr = Column(Integer, nullable=True)      # bpm — for HR-based TSS
    preferred_days = Column(String, nullable=True)
    injuries_notes = Column(Text, nullable=True)
    goal_description = Column(Text, nullable=True)

    owner = relationship("User", back_populates="athlete")


class BodyLog(Base):
    __tablename__ = "body_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    weight_kg = Column(Float, nullable=True)
    resting_hr = Column(Integer, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    sleep_quality = Column(Integer, nullable=True)  # 1-5
    notes = Column(Text, nullable=True)

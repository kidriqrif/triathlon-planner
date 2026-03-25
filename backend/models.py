from sqlalchemy import Column, Integer, String, Float, Date, Boolean, Text, Enum
from database import Base
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


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    sport = Column(String, nullable=False)
    workout_type = Column(String, nullable=False, default="easy")
    status = Column(String, nullable=False, default="planned")
    distance_km = Column(Float, nullable=True)
    duration_min = Column(Integer, nullable=True)
    rpe = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)


class Race(Base):
    __tablename__ = "races"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    distance = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)


class Athlete(Base):
    __tablename__ = "athletes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, default="Athlete")
    fitness_level = Column(String, nullable=False, default="intermediate")
    weekly_hours_target = Column(Float, default=8.0)

    # Extended profile
    age = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    swim_pace_100m = Column(String, nullable=True)   # e.g. "1:45"
    bike_ftp_watts = Column(Integer, nullable=True)   # functional threshold power
    run_pace_km = Column(String, nullable=True)        # e.g. "5:30" per km
    preferred_days = Column(String, nullable=True)     # e.g. "Mon,Tue,Thu,Sat,Sun"
    injuries_notes = Column(Text, nullable=True)
    goal_description = Column(Text, nullable=True)

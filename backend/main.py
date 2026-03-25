from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401 — registers models with Base
from routers import workouts, races, athlete, ai_coach

Base.metadata.create_all(bind=engine)

# Migrate: add new athlete columns if missing (SQLite doesn't support ADD COLUMN IF NOT EXISTS)
from sqlalchemy import inspect, text
with engine.connect() as conn:
    cols = {c["name"] for c in inspect(engine).get_columns("athletes")}
    new_cols = {
        "age": "INTEGER",
        "weight_kg": "REAL",
        "swim_pace_100m": "TEXT",
        "bike_ftp_watts": "INTEGER",
        "run_pace_km": "TEXT",
        "preferred_days": "TEXT",
        "injuries_notes": "TEXT",
        "goal_description": "TEXT",
    }
    for col, dtype in new_cols.items():
        if col not in cols:
            conn.execute(text(f"ALTER TABLE athletes ADD COLUMN {col} {dtype}"))
    conn.commit()

app = FastAPI(title="Strelo API", version="1.0.0")

import os

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workouts.router)
app.include_router(races.router)
app.include_router(athlete.router)
app.include_router(ai_coach.router)


@app.get("/health")
def health():
    return {"status": "ok"}

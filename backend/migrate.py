"""
Run database migrations. Called from build.sh at deploy time,
not on every app startup.
"""
from dotenv import load_dotenv
load_dotenv()

from database import engine, Base  # noqa: E402
import models  # noqa: F401, E402 - registers models with Base
from sqlalchemy import inspect, text  # noqa: E402

print("Running migrations...")

Base.metadata.create_all(bind=engine)

with engine.connect() as conn:
    insp = inspect(engine)
    added = 0

    user_cols = {c["name"] for c in insp.get_columns("users")}
    new_user_cols = {
        "plan": "VARCHAR NOT NULL DEFAULT 'free'",
        "onboarded": "BOOLEAN NOT NULL DEFAULT FALSE",
        "lemon_customer_id": "VARCHAR",
        "lemon_subscription_id": "VARCHAR",
        "strava_athlete_id": "VARCHAR",
        "strava_access_token": "VARCHAR",
        "strava_refresh_token": "VARCHAR",
        "strava_token_expires": "INTEGER",
    }
    for col, dtype in new_user_cols.items():
        if col not in user_cols:
            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {dtype}"))
            print(f"  users.{col} added")
            added += 1

    if "athletes" in insp.get_table_names():
        athlete_cols = {c["name"] for c in insp.get_columns("athletes")}
        new_athlete_cols = {
            "run_easy_pace_km": "VARCHAR",
            "run_5k_pace_km": "VARCHAR",
            "threshold_hr": "INTEGER",
        }
        for col, dtype in new_athlete_cols.items():
            if col not in athlete_cols:
                conn.execute(text(f"ALTER TABLE athletes ADD COLUMN {col} {dtype}"))
                print(f"  athletes.{col} added")
                added += 1

    if "workouts" in insp.get_table_names():
        workout_cols = {c["name"] for c in insp.get_columns("workouts")}
        new_workout_cols = {
            "avg_hr": "INTEGER",
            "max_hr": "INTEGER",
            "avg_power": "INTEGER",
            "np_power": "INTEGER",
        }
        for col, dtype in new_workout_cols.items():
            if col not in workout_cols:
                conn.execute(text(f"ALTER TABLE workouts ADD COLUMN {col} {dtype}"))
                print(f"  workouts.{col} added")
                added += 1

    conn.commit()

print(f"Migrations done. {added} column(s) added.")

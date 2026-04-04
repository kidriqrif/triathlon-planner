"""
Run database migrations. Called from build.sh at deploy time,
not on every app startup.
"""
from dotenv import load_dotenv
load_dotenv()

from database import engine, Base
import models  # noqa: F401 — registers models with Base
from sqlalchemy import inspect, text

print("Running migrations...")

Base.metadata.create_all(bind=engine)

with engine.connect() as conn:
    user_cols = {c["name"] for c in inspect(engine).get_columns("users")}
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
    added = 0
    for col, dtype in new_user_cols.items():
        if col not in user_cols:
            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {dtype}"))
            print(f"  Added column: {col}")
            added += 1
    conn.commit()

print(f"Migrations done. {added} column(s) added.")

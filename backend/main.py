from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import engine, Base
import models  # noqa: F401 — registers models with Base
from routers import workouts, races, athlete, ai_coach, auth, billing

Base.metadata.create_all(bind=engine)

# Migrate: add new columns if missing (safe to run repeatedly)
from sqlalchemy import inspect, text
with engine.connect() as conn:
    user_cols = {c["name"] for c in inspect(engine).get_columns("users")}
    new_user_cols = {
        "plan": "VARCHAR NOT NULL DEFAULT 'free'",
        "lemon_customer_id": "VARCHAR",
        "lemon_subscription_id": "VARCHAR",
    }
    for col, dtype in new_user_cols.items():
        if col not in user_cols:
            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {dtype}"))
    conn.commit()

# Rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

app = FastAPI(title="Strelo API", version="1.0.0")
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please slow down."},
    )


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

app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(races.router)
app.include_router(athlete.router)
app.include_router(ai_coach.router)
app.include_router(billing.router)


@app.get("/health")
def health():
    return {"status": "ok"}

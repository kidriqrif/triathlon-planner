from dotenv import load_dotenv
load_dotenv()

import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import models  # noqa: F401 — registers models with Base
from routers import workouts, races, athlete, ai_coach, auth, billing, strava, export, support, templates, plans, bodylog, digest

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
app.include_router(strava.router)
app.include_router(export.router)
app.include_router(support.router)
app.include_router(templates.router)
app.include_router(plans.router)
app.include_router(bodylog.router)
app.include_router(digest.router)


@app.get("/health")
def health():
    return {"status": "ok"}

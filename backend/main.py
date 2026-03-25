from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401 — registers models with Base
from routers import workouts, races, athlete, ai_coach, auth, billing

Base.metadata.create_all(bind=engine)

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

app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(races.router)
app.include_router(athlete.router)
app.include_router(ai_coach.router)
app.include_router(billing.router)


@app.get("/health")
def health():
    return {"status": "ok"}

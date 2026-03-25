from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from database import get_db
import models
from auth_utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


class MeResponse(BaseModel):
    id: int
    email: str
    name: str

    model_config = {"from_attributes": True}


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = db.query(models.User).filter(models.User.email == payload.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = models.User(
        email=payload.email.lower().strip(),
        password_hash=hash_password(payload.password),
        name=payload.name.strip(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Auto-create athlete profile
    athlete = models.Athlete(user_id=user.id, name=user.name)
    db.add(athlete)
    db.commit()

    token = create_access_token(user.id)
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}


@router.get("/me", response_model=MeResponse)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user

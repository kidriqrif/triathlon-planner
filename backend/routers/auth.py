import os
import secrets
import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from database import get_db
import models
from auth_utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger("strelo.auth")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def _user_dict(user: models.User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "plan": user.plan,
        "onboarded": user.onboarded,
    }


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
    plan: str = "free"
    onboarded: bool = False

    model_config = {"from_attributes": True}


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UpdateNameRequest(BaseModel):
    name: str


class DeleteAccountRequest(BaseModel):
    password: str


# ─── Register / Login ───

@router.post("/register", response_model=AuthResponse, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)):
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

    athlete = models.Athlete(user_id=user.id, name=user.name)
    db.add(athlete)
    db.commit()

    token = create_access_token(user.id)
    return {"token": token, "user": _user_dict(user)}


@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    return {"token": token, "user": _user_dict(user)}


@router.get("/me", response_model=MeResponse)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/onboarded")
def mark_onboarded(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    current_user.onboarded = True
    db.commit()
    return {"ok": True}


# ─── Google OAuth ───

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token


@router.post("/google", response_model=AuthResponse)
@limiter.limit("10/minute")
def google_auth(request: Request, payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Verify Google ID token and sign in or create account."""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        idinfo = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo.get("email", "").lower().strip()
    name = idinfo.get("name", email.split("@")[0])

    if not email:
        raise HTTPException(status_code=400, detail="No email in Google token")

    # Find or create user
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        # Create new user with a random password (they'll use Google to sign in)
        user = models.User(
            email=email,
            password_hash=hash_password(secrets.token_urlsafe(32)),
            name=name,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Auto-create athlete profile
        athlete = models.Athlete(user_id=user.id, name=name)
        db.add(athlete)
        db.commit()

    token = create_access_token(user.id)
    return {"token": token, "user": _user_dict(user)}


# ─── Password Reset ───

@router.post("/forgot-password")
@limiter.limit("3/minute")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate a password reset token. Always returns success to prevent email enumeration."""
    user = db.query(models.User).filter(models.User.email == payload.email.lower().strip()).first()
    if user:
        token = secrets.token_urlsafe(32)
        reset = models.PasswordReset(
            user_id=user.id,
            token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        db.add(reset)
        db.commit()

        reset_url = f"{FRONTEND_URL}?reset={token}"

        # Send reset email
        resend_key = os.getenv("RESEND_API_KEY", "")
        if resend_key:
            try:
                import resend
                resend.api_key = resend_key
                resend.Emails.send({
                    "from": os.getenv("EMAIL_FROM", "Strelo <onboarding@resend.dev>"),
                    "to": [user.email],
                    "subject": "Reset your Strelo password",
                    "html": f"""
                        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
                            <h2 style="color:#1e1b4b;margin-bottom:8px">Password Reset</h2>
                            <p style="color:#64748b;font-size:14px">
                                You requested a password reset for your Strelo account.
                                Click the button below to set a new password. This link expires in 1 hour.
                            </p>
                            <a href="{reset_url}"
                               style="display:inline-block;margin-top:16px;padding:12px 24px;
                                      background:linear-gradient(135deg,#6366f1,#7c3aed);
                                      color:white;text-decoration:none;border-radius:12px;
                                      font-weight:bold;font-size:14px">
                                Reset Password
                            </a>
                            <p style="color:#94a3b8;font-size:12px;margin-top:24px">
                                If you didn't request this, you can safely ignore this email.
                            </p>
                        </div>
                    """,
                })
            except Exception as e:
                logger.warning(f"Failed to send reset email: {e}")
        else:
            logger.info(f"Password reset (no email configured): {reset_url}")

    return {"message": "If an account with that email exists, a reset link has been sent."}


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    reset = db.query(models.PasswordReset).filter(
        models.PasswordReset.token == payload.token,
        ~models.PasswordReset.used,
        models.PasswordReset.expires_at > datetime.now(timezone.utc),
    ).first()

    if not reset:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    user = db.get(models.User, reset.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    user.password_hash = hash_password(payload.password)
    reset.used = True
    db.commit()

    return {"message": "Password has been reset. You can now sign in."}


# ─── Account Settings ───

@router.put("/update-name")
def update_name(
    payload: UpdateNameRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be empty")
    current_user.name = payload.name.strip()
    db.commit()
    return _user_dict(current_user)


@router.put("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated"}


@router.delete("/delete-account")
def delete_account(
    payload: DeleteAccountRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not verify_password(payload.password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Password is incorrect")

    # Delete all user data
    db.query(models.Workout).filter(models.Workout.user_id == current_user.id).delete()
    db.query(models.Race).filter(models.Race.user_id == current_user.id).delete()
    db.query(models.Athlete).filter(models.Athlete.user_id == current_user.id).delete()
    db.query(models.PasswordReset).filter(models.PasswordReset.user_id == current_user.id).delete()
    db.delete(current_user)
    db.commit()

    return {"message": "Account deleted"}

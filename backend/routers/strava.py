import os
import time
import httpx
from datetime import datetime, date, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session

from database import get_db
from auth_utils import get_current_user
import models

router = APIRouter(prefix="/strava", tags=["strava"])

STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID", "")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET", "")
STRAVA_WEBHOOK_VERIFY_TOKEN = os.getenv("STRAVA_WEBHOOK_VERIFY_TOKEN", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

STRAVA_SPORT_MAP = {
    "Swim": "swim",
    "Ride": "bike",
    "VirtualRide": "bike",
    "Run": "run",
    "VirtualRun": "run",
    "TrailRun": "run",
}


def _refresh_token_if_needed(user: models.User, db: Session) -> str:
    """Refresh Strava access token if expired."""
    if not user.strava_refresh_token:
        return None
    if user.strava_token_expires and user.strava_token_expires > time.time() + 60:
        return user.strava_access_token

    resp = httpx.post("https://www.strava.com/oauth/token", data={
        "client_id": STRAVA_CLIENT_ID,
        "client_secret": STRAVA_CLIENT_SECRET,
        "grant_type": "refresh_token",
        "refresh_token": user.strava_refresh_token,
    }, timeout=10)

    if resp.status_code != 200:
        return None

    data = resp.json()
    user.strava_access_token = data["access_token"]
    user.strava_refresh_token = data["refresh_token"]
    user.strava_token_expires = data["expires_at"]
    db.commit()
    return user.strava_access_token


@router.get("/connect")
def strava_connect(current_user: models.User = Depends(get_current_user)):
    """Return Strava OAuth URL for the user to authorize."""
    if not STRAVA_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Strava not configured")

    redirect_uri = f"{BACKEND_URL}/strava/callback"
    url = (
        f"https://www.strava.com/oauth/authorize"
        f"?client_id={STRAVA_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope=activity:read_all"
        f"&state={current_user.id}"
    )
    return {"url": url}


@router.get("/callback")
def strava_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(get_db),
):
    """Handle Strava OAuth callback, exchange code for tokens."""
    resp = httpx.post("https://www.strava.com/oauth/token", data={
        "client_id": STRAVA_CLIENT_ID,
        "client_secret": STRAVA_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
    }, timeout=10)

    if resp.status_code != 200:
        return RedirectResponse(f"{FRONTEND_URL}?strava=error")

    data = resp.json()
    user_id = int(state)
    user = db.get(models.User, user_id)
    if not user:
        return RedirectResponse(f"{FRONTEND_URL}?strava=error")

    try:
        user.strava_athlete_id = str(data["athlete"]["id"])
        user.strava_access_token = data["access_token"]
        user.strava_refresh_token = data["refresh_token"]
        user.strava_token_expires = data["expires_at"]
        db.commit()
    except (KeyError, TypeError):
        return RedirectResponse(f"{FRONTEND_URL}?strava=error")

    return RedirectResponse(f"{FRONTEND_URL}?strava=connected")


@router.get("/status")
def strava_status(current_user: models.User = Depends(get_current_user)):
    """Check if Strava is connected."""
    return {
        "connected": bool(current_user.strava_athlete_id),
        "athlete_id": current_user.strava_athlete_id,
    }


@router.post("/disconnect")
def strava_disconnect(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Disconnect Strava account."""
    # Revoke access on Strava side
    if current_user.strava_access_token:
        try:
            httpx.post("https://www.strava.com/oauth/deauthorize",
                       data={"access_token": current_user.strava_access_token}, timeout=10)
        except Exception:
            pass

    current_user.strava_athlete_id = None
    current_user.strava_access_token = None
    current_user.strava_refresh_token = None
    current_user.strava_token_expires = None
    db.commit()
    return {"ok": True}


@router.post("/sync")
def sync_strava_activities(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Import recent Strava activities as workouts."""
    if not current_user.strava_athlete_id:
        raise HTTPException(status_code=400, detail="Strava not connected")

    access_token = _refresh_token_if_needed(current_user, db)
    if not access_token:
        raise HTTPException(status_code=401, detail="Strava token expired. Please reconnect.")

    # Fetch last 30 days of activities
    after = int((datetime.now(timezone.utc) - timedelta(days=30)).timestamp())
    resp = httpx.get("https://www.strava.com/api/v3/athlete/activities", params={
        "after": after,
        "per_page": 100,
    }, headers={"Authorization": f"Bearer {access_token}"}, timeout=15)

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch Strava activities")

    activities = resp.json()
    athlete = db.query(models.Athlete).filter(models.Athlete.user_id == current_user.id).first()
    imported = sum(1 for act in activities if _import_activity(db, current_user, athlete, act))
    db.commit()
    return {"imported": imported, "total_found": len(activities)}


def _import_activity(db: Session, user: models.User, athlete: models.Athlete, act: dict) -> bool:
    """Import a single Strava activity dict as a Workout. Returns True if created."""
    sport = STRAVA_SPORT_MAP.get(act.get("type"), None)
    if not sport:
        return False

    act_date = date.fromisoformat(act["start_date_local"][:10])

    existing = db.query(models.Workout).filter(
        models.Workout.user_id == user.id,
        models.Workout.notes.contains(f"strava:{act['id']}"),
    ).first()
    if existing:
        return False

    duration_min = round(act.get("moving_time", 0) / 60)
    distance_km = round(act.get("distance", 0) / 1000, 2)
    avg_hr = round(act["average_heartrate"]) if act.get("average_heartrate") else None
    max_hr = round(act["max_heartrate"]) if act.get("max_heartrate") else None
    avg_power = round(act["average_watts"]) if act.get("average_watts") else None
    np_power = round(act["weighted_average_watts"]) if act.get("weighted_average_watts") else None

    wtype = _infer_workout_type(sport, athlete, avg_hr, np_power, duration_min)

    db.add(models.Workout(
        user_id=user.id,
        date=act_date,
        sport=sport,
        workout_type=wtype,
        status="completed",
        duration_min=duration_min if duration_min > 0 else None,
        distance_km=distance_km if distance_km > 0 else None,
        avg_hr=avg_hr,
        max_hr=max_hr,
        avg_power=avg_power,
        np_power=np_power,
        notes=f"strava:{act['id']} — {act.get('name', '')}",
    ))
    return True


def _fetch_activity(access_token: str, activity_id: int) -> dict:
    """Fetch a single Strava activity by ID."""
    resp = httpx.get(
        f"https://www.strava.com/api/v3/activities/{activity_id}",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )
    if resp.status_code != 200:
        return None
    return resp.json()


# ─── Webhook ──────────────────────────────────────────────────────────────────
# Strava push subscription. To enable in production, the operator must:
#   1. Set STRAVA_WEBHOOK_VERIFY_TOKEN to any random string in the env.
#   2. POST once to /strava/webhook/subscribe (admin-only) so this backend
#      registers itself with Strava. After that, Strava will POST events here
#      on every new/updated/deleted activity for any connected athlete.

@router.get("/webhook")
def strava_webhook_verify(
    hub_mode: str = Query(..., alias="hub.mode"),
    hub_challenge: str = Query(..., alias="hub.challenge"),
    hub_verify_token: str = Query(..., alias="hub.verify_token"),
):
    """GET handler used by Strava once when registering the webhook subscription."""
    if hub_mode != "subscribe":
        raise HTTPException(status_code=400, detail="Invalid hub.mode")
    if not STRAVA_WEBHOOK_VERIFY_TOKEN or hub_verify_token != STRAVA_WEBHOOK_VERIFY_TOKEN:
        raise HTTPException(status_code=403, detail="Bad verify token")
    return {"hub.challenge": hub_challenge}


@router.post("/webhook")
async def strava_webhook_event(request: Request, db: Session = Depends(get_db)):
    """POST handler — Strava pushes activity create/update/delete events here.
    Strava expects a 200 within 2 seconds, so this stays lean: ack first, do
    the work synchronously but quickly, and ignore anything we can't handle."""
    try:
        event = await request.json()
    except Exception:
        return JSONResponse({"ok": True})

    if event.get("object_type") != "activity":
        return JSONResponse({"ok": True})

    aspect = event.get("aspect_type")
    activity_id = event.get("object_id")
    owner_id = event.get("owner_id")

    if not activity_id or not owner_id:
        return JSONResponse({"ok": True})

    user = db.query(models.User).filter(
        models.User.strava_athlete_id == str(owner_id)
    ).first()
    if not user:
        return JSONResponse({"ok": True})

    if aspect == "delete":
        target = db.query(models.Workout).filter(
            models.Workout.user_id == user.id,
            models.Workout.notes.contains(f"strava:{activity_id}"),
        ).first()
        if target:
            db.delete(target)
            db.commit()
        return JSONResponse({"ok": True})

    if aspect not in ("create", "update"):
        return JSONResponse({"ok": True})

    access_token = _refresh_token_if_needed(user, db)
    if not access_token:
        return JSONResponse({"ok": True})

    act = _fetch_activity(access_token, activity_id)
    if not act:
        return JSONResponse({"ok": True})

    athlete = db.query(models.Athlete).filter(models.Athlete.user_id == user.id).first()
    _import_activity(db, user, athlete, act)
    db.commit()
    return JSONResponse({"ok": True})


@router.post("/webhook/subscribe")
def strava_webhook_subscribe():
    """One-time admin call to register this backend's webhook with Strava."""
    if not STRAVA_CLIENT_ID or not STRAVA_CLIENT_SECRET or not STRAVA_WEBHOOK_VERIFY_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="Configure STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_WEBHOOK_VERIFY_TOKEN first",
        )
    callback_url = f"{BACKEND_URL}/strava/webhook"
    resp = httpx.post(
        "https://www.strava.com/api/v3/push_subscriptions",
        data={
            "client_id": STRAVA_CLIENT_ID,
            "client_secret": STRAVA_CLIENT_SECRET,
            "callback_url": callback_url,
            "verify_token": STRAVA_WEBHOOK_VERIFY_TOKEN,
        },
        timeout=15,
    )
    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail=f"Strava subscribe failed: {resp.text}")
    return resp.json()


@router.get("/webhook/status")
def strava_webhook_status():
    """Show current webhook subscription, if any."""
    if not STRAVA_CLIENT_ID or not STRAVA_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Strava not configured")
    resp = httpx.get(
        "https://www.strava.com/api/v3/push_subscriptions",
        params={"client_id": STRAVA_CLIENT_ID, "client_secret": STRAVA_CLIENT_SECRET},
        timeout=10,
    )
    return {"subscriptions": resp.json() if resp.status_code == 200 else None}


def _infer_workout_type(sport, athlete, avg_hr, np_power, duration_min):
    """Pick a workout_type from intensity vs the athlete's threshold anchors.

    Falls back to "easy" when there is no intensity signal or threshold reference.
    """
    if not athlete or not duration_min:
        return "easy"

    # Bike with power: classify by IF = NP/FTP
    if sport == "bike" and np_power and athlete.bike_ftp_watts:
        if_ = np_power / athlete.bike_ftp_watts
        if if_ >= 0.95:                    return "interval"
        if if_ >= 0.83:                    return "tempo"
        if if_ >= 0.65 and duration_min >= 90: return "long"
        if if_ < 0.55:                     return "recovery"
        return "easy"

    # Anything with HR: classify against threshold HR
    if avg_hr and athlete.threshold_hr:
        ratio = avg_hr / athlete.threshold_hr
        if ratio >= 0.97:                  return "interval"
        if ratio >= 0.88:                  return "tempo"
        if ratio < 0.70:                   return "recovery"
        if duration_min >= 90:             return "long"
        return "easy"

    # No intensity data: long flag based on duration alone
    if duration_min >= 120:                return "long"
    return "easy"

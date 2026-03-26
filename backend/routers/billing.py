import os
import hmac
import hashlib
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from slowapi import Limiter
from slowapi.util import get_remote_address

from database import get_db
from auth_utils import get_current_user
import models

router = APIRouter(prefix="/billing", tags=["billing"])
limiter = Limiter(key_func=get_remote_address)

LEMON_API_KEY = os.getenv("LEMONSQUEEZY_API_KEY", "").strip().replace("\n", "").replace("\r", "")
LEMON_WEBHOOK_SECRET = os.getenv("LEMONSQUEEZY_WEBHOOK_SECRET", "").strip()
STORE_ID = os.getenv("LEMONSQUEEZY_STORE_ID", "").strip()

VARIANT_IDS = {
    "monthly": "1446036",
    "yearly": "1446039",
}


@router.post("/checkout")
@limiter.limit("10/hour")
def create_checkout(
    request: Request,
    plan: str = "monthly",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Generate a LemonSqueezy checkout URL for the user."""
    if plan not in VARIANT_IDS:
        raise HTTPException(status_code=400, detail="Invalid plan. Use 'monthly' or 'yearly'.")

    if not LEMON_API_KEY:
        raise HTTPException(status_code=500, detail="Billing not configured")

    variant_id = VARIANT_IDS[plan]

    try:
        response = httpx.post(
            "https://api.lemonsqueezy.com/v1/checkouts",
            headers={
                "Authorization": f"Bearer {LEMON_API_KEY}",
                "Content-Type": "application/vnd.api+json",
                "Accept": "application/vnd.api+json",
            },
            json={
                "data": {
                    "type": "checkouts",
                    "attributes": {
                        "checkout_data": {
                            "email": current_user.email,
                            "name": current_user.name,
                            "custom": {
                                "user_id": str(current_user.id),
                            },
                        },
                    },
                    "relationships": {
                        "store": {"data": {"type": "stores", "id": STORE_ID}},
                        "variant": {"data": {"type": "variants", "id": variant_id}},
                    },
                }
            },
            timeout=15,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Checkout request failed: {str(e)}")

    if response.status_code not in (200, 201):
        raise HTTPException(
            status_code=502,
            detail=f"LemonSqueezy error {response.status_code}: {response.text[:200]}",
        )

    try:
        checkout_url = response.json()["data"]["attributes"]["url"]
    except (KeyError, TypeError):
        raise HTTPException(status_code=502, detail="Unexpected checkout response format")
    return {"checkout_url": checkout_url}


@router.get("/status")
def billing_status(
    current_user: models.User = Depends(get_current_user),
):
    """Return the user's current plan."""
    return {
        "plan": current_user.plan,
        "subscription_id": current_user.lemon_subscription_id,
    }


def _verify_signature(body: bytes, signature: str) -> bool:
    """Verify LemonSqueezy webhook HMAC signature."""
    if not LEMON_WEBHOOK_SECRET:
        return False
    digest = hmac.new(
        LEMON_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(digest, signature)


@router.post("/webhook")
async def lemon_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle LemonSqueezy webhook events."""
    body = await request.body()
    signature = request.headers.get("x-signature", "")

    if not _verify_signature(body, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    event_name = payload.get("meta", {}).get("event_name", "")
    custom_data = payload.get("meta", {}).get("custom_data", {})
    user_id = custom_data.get("user_id")

    if not user_id:
        return {"ok": True}

    user = db.get(models.User, int(user_id))
    if not user:
        return {"ok": True}

    attrs = payload.get("data", {}).get("attributes", {})
    subscription_id = str(payload.get("data", {}).get("id", ""))
    customer_id = str(attrs.get("customer_id", ""))
    status = attrs.get("status", "")

    if event_name in ("subscription_created", "subscription_updated"):
        if status in ("active", "on_trial", "paused"):
            user.plan = "pro"
        elif status in ("expired", "cancelled", "unpaid"):
            user.plan = "free"
        user.lemon_customer_id = customer_id
        user.lemon_subscription_id = subscription_id
        db.commit()

    elif event_name == "subscription_expired":
        user.plan = "free"
        db.commit()

    return {"ok": True}

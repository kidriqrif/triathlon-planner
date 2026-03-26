from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta

from database import get_db
from auth_utils import get_current_user
import models
import schemas

router = APIRouter(prefix="/bodylog", tags=["bodylog"])


@router.get("", response_model=List[schemas.BodyLogOut])
def list_body_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    cutoff = date.today() - timedelta(days=90)
    return (
        db.query(models.BodyLog)
        .filter(
            models.BodyLog.user_id == current_user.id,
            models.BodyLog.date >= cutoff,
        )
        .order_by(models.BodyLog.date.desc())
        .all()
    )


@router.post("", response_model=schemas.BodyLogOut, status_code=201)
def create_body_log(
    payload: schemas.BodyLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Upsert: if entry exists for this date, update it
    existing = (
        db.query(models.BodyLog)
        .filter(
            models.BodyLog.user_id == current_user.id,
            models.BodyLog.date == payload.date,
        )
        .first()
    )
    if existing:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing

    entry = models.BodyLog(**payload.model_dump(), user_id=current_user.id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_body_log(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    entry = db.query(models.BodyLog).filter(
        models.BodyLog.id == entry_id,
        models.BodyLog.user_id == current_user.id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Body log entry not found")
    db.delete(entry)
    db.commit()

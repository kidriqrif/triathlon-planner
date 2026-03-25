from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth_utils import get_current_user
import models
import schemas

router = APIRouter(prefix="/races", tags=["races"])


@router.get("", response_model=List[schemas.RaceOut])
def list_races(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Race).filter(
        models.Race.user_id == current_user.id
    ).order_by(models.Race.date).all()


@router.post("", response_model=schemas.RaceOut, status_code=201)
def create_race(
    payload: schemas.RaceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    race = models.Race(**payload.model_dump(), user_id=current_user.id)
    db.add(race)
    db.commit()
    db.refresh(race)
    return race


@router.put("/{race_id}", response_model=schemas.RaceOut)
def update_race(
    race_id: int,
    payload: schemas.RaceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    race = db.query(models.Race).filter(
        models.Race.id == race_id,
        models.Race.user_id == current_user.id,
    ).first()
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(race, field, value)
    db.commit()
    db.refresh(race)
    return race


@router.delete("/{race_id}", status_code=204)
def delete_race(
    race_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    race = db.query(models.Race).filter(
        models.Race.id == race_id,
        models.Race.user_id == current_user.id,
    ).first()
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    db.delete(race)
    db.commit()

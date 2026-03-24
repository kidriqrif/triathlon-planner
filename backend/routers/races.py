from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/races", tags=["races"])


@router.get("", response_model=List[schemas.RaceOut])
def list_races(db: Session = Depends(get_db)):
    return db.query(models.Race).order_by(models.Race.date).all()


@router.post("", response_model=schemas.RaceOut, status_code=201)
def create_race(payload: schemas.RaceCreate, db: Session = Depends(get_db)):
    race = models.Race(**payload.model_dump())
    db.add(race)
    db.commit()
    db.refresh(race)
    return race


@router.put("/{race_id}", response_model=schemas.RaceOut)
def update_race(
    race_id: int, payload: schemas.RaceUpdate, db: Session = Depends(get_db)
):
    race = db.get(models.Race, race_id)
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(race, field, value)
    db.commit()
    db.refresh(race)
    return race


@router.delete("/{race_id}", status_code=204)
def delete_race(race_id: int, db: Session = Depends(get_db)):
    race = db.get(models.Race, race_id)
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    db.delete(race)
    db.commit()

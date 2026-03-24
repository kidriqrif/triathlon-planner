from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import date

from database import get_db
import models
import schemas

router = APIRouter(prefix="/workouts", tags=["workouts"])


@router.get("", response_model=List[schemas.WorkoutOut])
def list_workouts(
    start: Optional[date] = None,
    end: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Workout)
    if start:
        query = query.filter(models.Workout.date >= start)
    if end:
        query = query.filter(models.Workout.date <= end)
    return query.order_by(models.Workout.date).all()


@router.post("", response_model=schemas.WorkoutOut, status_code=201)
def create_workout(payload: schemas.WorkoutCreate, db: Session = Depends(get_db)):
    workout = models.Workout(**payload.model_dump())
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout


@router.put("/{workout_id}", response_model=schemas.WorkoutOut)
def update_workout(
    workout_id: int, payload: schemas.WorkoutUpdate, db: Session = Depends(get_db)
):
    workout = db.get(models.Workout, workout_id)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(workout, field, value)
    db.commit()
    db.refresh(workout)
    return workout


@router.delete("/{workout_id}", status_code=204)
def delete_workout(workout_id: int, db: Session = Depends(get_db)):
    workout = db.get(models.Workout, workout_id)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    db.delete(workout)
    db.commit()

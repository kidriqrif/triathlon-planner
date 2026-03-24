from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/athlete", tags=["athlete"])


def get_or_create_athlete(db: Session) -> models.Athlete:
    athlete = db.query(models.Athlete).first()
    if not athlete:
        athlete = models.Athlete()
        db.add(athlete)
        db.commit()
        db.refresh(athlete)
    return athlete


@router.get("", response_model=schemas.AthleteOut)
def get_athlete(db: Session = Depends(get_db)):
    return get_or_create_athlete(db)


@router.put("", response_model=schemas.AthleteOut)
def update_athlete(payload: schemas.AthleteUpdate, db: Session = Depends(get_db)):
    athlete = get_or_create_athlete(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(athlete, field, value)
    db.commit()
    db.refresh(athlete)
    return athlete

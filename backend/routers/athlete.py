from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from auth_utils import get_current_user
import models
import schemas

router = APIRouter(prefix="/athlete", tags=["athlete"])


def get_or_create_athlete(db: Session, user: models.User) -> models.Athlete:
    athlete = db.query(models.Athlete).filter(models.Athlete.user_id == user.id).first()
    if not athlete:
        athlete = models.Athlete(user_id=user.id, name=user.name)
        db.add(athlete)
        db.commit()
        db.refresh(athlete)
    return athlete


@router.get("", response_model=schemas.AthleteOut)
def get_athlete(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return get_or_create_athlete(db, current_user)


@router.put("", response_model=schemas.AthleteOut)
def update_athlete(
    payload: schemas.AthleteUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    athlete = get_or_create_athlete(db, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(athlete, field, value)
    db.commit()
    db.refresh(athlete)
    return athlete

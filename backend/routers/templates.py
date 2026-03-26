from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from auth_utils import get_current_user
import models

router = APIRouter(prefix="/templates", tags=["templates"])

FREE_TEMPLATE_LIMIT = 3


class TemplateCreate(BaseModel):
    name: str
    sport: str
    workout_type: str = "easy"
    duration_min: Optional[int] = None
    distance_km: Optional[float] = None
    notes: Optional[str] = None


class TemplateOut(TemplateCreate):
    id: int

    model_config = {"from_attributes": True}


@router.get("", response_model=List[TemplateOut])
def list_templates(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.WorkoutTemplate).filter(
        models.WorkoutTemplate.user_id == current_user.id
    ).all()


@router.post("", response_model=TemplateOut, status_code=201)
def create_template(
    payload: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.plan != "pro":
        count = db.query(models.WorkoutTemplate).filter(
            models.WorkoutTemplate.user_id == current_user.id
        ).count()
        if count >= FREE_TEMPLATE_LIMIT:
            raise HTTPException(
                status_code=403,
                detail=f"Free plan allows {FREE_TEMPLATE_LIMIT} templates. Upgrade to Pro for unlimited.",
            )

    template = models.WorkoutTemplate(
        user_id=current_user.id,
        **payload.model_dump(),
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.delete("/{template_id}", status_code=204)
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    template = db.query(models.WorkoutTemplate).filter(
        models.WorkoutTemplate.id == template_id,
        models.WorkoutTemplate.user_id == current_user.id,
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    db.delete(template)
    db.commit()

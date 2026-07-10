from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api/recurring", tags=["recurring"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[schemas.RecurringOut])
def list_recurring(db: Session = Depends(get_db)):
    return db.query(models.Recurring).order_by(models.Recurring.day_of_month).all()


@router.post("", response_model=schemas.RecurringOut)
def create_recurring(body: schemas.RecurringIn, db: Session = Depends(get_db)):
    if not db.get(models.Category, body.category_id):
        raise HTTPException(400, "Unknown category")
    rec = models.Recurring(**body.model_dump())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.put("/{rec_id}", response_model=schemas.RecurringOut)
def update_recurring(rec_id: int, body: schemas.RecurringIn, db: Session = Depends(get_db)):
    rec = db.get(models.Recurring, rec_id)
    if not rec:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        setattr(rec, k, v)
    db.commit()
    db.refresh(rec)
    return rec


@router.delete("/{rec_id}")
def delete_recurring(rec_id: int, db: Session = Depends(get_db)):
    rec = db.get(models.Recurring, rec_id)
    if not rec:
        raise HTTPException(404, "Not found")
    db.delete(rec)
    db.commit()
    return {"ok": True}

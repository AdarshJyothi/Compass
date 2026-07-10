from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api/categories", tags=["categories"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.name).all()


@router.post("", response_model=schemas.CategoryOut)
def create_category(body: schemas.CategoryIn, db: Session = Depends(get_db)):
    cat = models.Category(**body.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{cat_id}", response_model=schemas.CategoryOut)
def update_category(cat_id: int, body: schemas.CategoryIn, db: Session = Depends(get_db)):
    cat = db.get(models.Category, cat_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    for k, v in body.model_dump().items():
        setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{cat_id}")
def delete_category(cat_id: int, db: Session = Depends(get_db)):
    cat = db.get(models.Category, cat_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    in_use = db.query(models.Expense).filter(models.Expense.category_id == cat_id).count()
    in_use += db.query(models.Recurring).filter(models.Recurring.category_id == cat_id).count()
    if in_use:
        raise HTTPException(400, "Category is in use by expenses or fixed costs")
    db.delete(cat)
    db.commit()
    return {"ok": True}

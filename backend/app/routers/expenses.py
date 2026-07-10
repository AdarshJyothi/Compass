from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["expenses"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[schemas.ExpenseOut])
def list_expenses(
    month: str | None = Query(None, description="YYYY-MM"),
    category_id: int | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.Expense)
    if month:
        try:
            y, m = (int(x) for x in month.split("-"))
        except ValueError:
            raise HTTPException(400, "month must be YYYY-MM")
        start = date(y, m, 1)
        end = date(y + (m == 12), m % 12 + 1, 1)
        q = q.filter(models.Expense.date >= start, models.Expense.date < end)
    if category_id:
        q = q.filter(models.Expense.category_id == category_id)
    return q.order_by(models.Expense.date.desc(), models.Expense.id.desc()).all()


@router.post("", response_model=schemas.ExpenseOut)
def create_expense(body: schemas.ExpenseIn, db: Session = Depends(get_db)):
    if not db.get(models.Category, body.category_id):
        raise HTTPException(400, "Unknown category")
    exp = models.Expense(**body.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.put("/{exp_id}", response_model=schemas.ExpenseOut)
def update_expense(exp_id: int, body: schemas.ExpenseIn, db: Session = Depends(get_db)):
    exp = db.get(models.Expense, exp_id)
    if not exp:
        raise HTTPException(404, "Expense not found")
    for k, v in body.model_dump().items():
        setattr(exp, k, v)
    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/{exp_id}")
def delete_expense(exp_id: int, db: Session = Depends(get_db)):
    exp = db.get(models.Expense, exp_id)
    if not exp:
        raise HTTPException(404, "Expense not found")
    db.delete(exp)
    db.commit()
    return {"ok": True}
